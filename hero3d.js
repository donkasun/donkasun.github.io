/* Hero wireframe floor grid.
   A single displaced plane in wireframe, receding like a floor beneath the
   headline. One geometry, one shader, no lights. Loaded lazily from hero3d-boot
   in main-thread idle time; see docs/superpowers/specs/2026-07-22-hero-3d-grid-design.md */

import * as THREE from './vendor/three.module.min.js';

const SEGMENTS = 52;
const PLANE_W = 34;
const PLANE_H = 26;

const vert = `
uniform float uTime;
uniform vec2 uCursor;
varying float vDist;
varying float vDepth;

void main(){
  vec3 p = position;

  // Rolling swell across the floor.
  float w =
    sin(p.x * .32 + uTime * .55) * .55 +
    sin(p.y * .27 - uTime * .40) * .45 +
    sin((p.x + p.y) * .18 + uTime * .28) * .35;

  // Cursor dents the mesh with a smooth falloff.
  float d = distance(p.xy, uCursor);
  float dent = smoothstep(7.0, 0.0, d) * 2.4;

  p.z += w - dent;

  vDist = d;
  // 0 at the near edge, 1 at the far edge, for the fade-out.
  vDepth = (p.y + ${(PLANE_H / 2).toFixed(1)}) / ${PLANE_H.toFixed(1)};

  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

const frag = `
uniform vec3 uColor;
uniform float uOpacity;
varying float vDist;
varying float vDepth;

void main(){
  // Dissolve into the background toward the horizon so the plane has no
  // hard rectangular border.
  float fade = 1.0 - smoothstep(0.55, 1.0, vDepth);
  // Lines brighten slightly around the cursor.
  float hot = smoothstep(9.0, 0.0, vDist) * .5;
  gl_FragColor = vec4(uColor, (fade * .55 + hot) * uOpacity);
}
`;

/* A pure quad grid — rows and columns only. Deliberately not
   WireframeGeometry, which adds each triangle's diagonal and reads as a
   fishnet rather than a Swiss grid. */
function buildGrid(THREE) {
  const pts = [];
  const step = (n) => -0.5 + n / SEGMENTS;
  // Every line is chopped into SEGMENTS pieces so the vertex shader has
  // interior vertices to displace.
  for (let i = 0; i <= SEGMENTS; i++) {
    for (let j = 0; j < SEGMENTS; j++) {
      const a = step(j) * PLANE_H;
      const bEnd = step(j + 1) * PLANE_H;
      const x = step(i) * PLANE_W;
      pts.push(x, a, 0, x, bEnd, 0); // column piece

      const c = step(j) * PLANE_W;
      const dEnd = step(j + 1) * PLANE_W;
      const y = step(i) * PLANE_H;
      pts.push(c, y, 0, dEnd, y, 0); // row piece
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  return g;
}

export function initHeroGrid(canvas) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (e) {
    return null; // No WebGL. Hero stays as-is.
  }
  if (!renderer.getContext()) return null;

  renderer.setClearColor(0x000000, 0);

  const accent = getComputedStyle(document.documentElement)
    .getPropertyValue('--teal-rgb').trim().split(',').map(Number);
  // setRGB with an explicit color space; the bare constructor assumes linear.
  const color = new THREE.Color().setRGB(
    accent[0] / 255, accent[1] / 255, accent[2] / 255, THREE.SRGBColorSpace);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, .1, 100);
  camera.position.set(0, -20, 6);
  camera.lookAt(0, 0, -1);

  const uniforms = {
    uTime: { value: 0 },
    uCursor: { value: new THREE.Vector2(0, 0) },
    uColor: { value: color },
    uOpacity: { value: 0 }, // faded in on first frames
  };

  const geo = buildGrid(THREE);
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: vert,
    fragmentShader: frag,
    transparent: true,
    depthWrite: false,
  });

  const mesh = new THREE.LineSegments(geo, mat);
  // Lay it flat like a floor, with a slight turn to break the symmetry.
  mesh.rotation.z = -0.12;
  scene.add(mesh);

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Cursor target in plane space, lerped toward each frame so motion glides.
  const target = new THREE.Vector2(0, 0);
  window.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
    target.set(nx * (PLANE_W / 2), -ny * (PLANE_H / 2));
  }, { passive: true });

  // Pause when the hero is off screen.
  const hero = document.getElementById('hero');
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      entry.isIntersecting ? loop() : stop();
    }, { threshold: 0 }).observe(hero);
  }

  let rafId = 0;
  let last = performance.now();
  let elapsed = 0;

  function frame(now) {
    // Clamp both ends: the first rAF timestamp can predate `last`.
    const dt = Math.max(0, Math.min((now - last) / 1000, .05));
    last = now;
    elapsed += dt;

    uniforms.uTime.value = elapsed;
    uniforms.uCursor.value.lerp(target, 1 - Math.pow(.0015, dt));
    uniforms.uOpacity.value = Math.min(uniforms.uOpacity.value + dt * .8, 1);

    renderer.render(scene, camera);
    rafId = requestAnimationFrame(frame);
  }

  function loop() {
    if (rafId) return;
    last = performance.now(); // don't accumulate time spent paused
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }
  loop();

  return { renderer, scene, stop };
}
