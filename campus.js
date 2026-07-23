/**
 * Campus scroll controller — zones, camera, breathing, crossfade.
 *
 * Camera KEYFRAMES — subtle pans/zooms so 1600px WebPs stay sharp
 * (earlier 3–5× scales upscaled too hard and looked soft).
 * With object-fit:contain, scales stay modest so tower tops / rock
 * edge remain in frame. hero/outro 1@(0,0); about/studio; projects/
 * showcase; history/tower; skills/lab; contact/pavilion.
 */
(function () {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = () => matchMedia('(max-width: 768px)').matches;
  const stackMode = () => mobile() || reduceMotion;

  // Fractions match spec vh table over 800vh total.
  const KEYFRAMES = [
    { id: 'hero',     scale: 1.0,  x: 0,   y: 0,   start: 0,     end: 0.125,  layer: null },
    { id: 'about',    scale: 1.18, x: 10,  y: 2,   start: 0.125, end: 0.25,   layer: 'studio' },
    { id: 'projects', scale: 1.14, x: 6,   y: 5,   start: 0.25,  end: 0.4375, layer: 'showcase' },
    { id: 'history',  scale: 1.2,  x: -8,  y: 12,  start: 0.4375,end: 0.625,  layer: 'tower' },
    { id: 'skills',   scale: 1.16, x: -16, y: 7,   start: 0.625, end: 0.75,   layer: 'lab' },
    { id: 'contact',  scale: 1.14, x: -10, y: -8,  start: 0.75,  end: 0.875,  layer: 'pavilion' },
    { id: 'outro',    scale: 1.0,  x: 0,   y: 0,   start: 0.875, end: 1,      layer: null },
  ];

  const stack = document.getElementById('campusStack');
  const layers = [...document.querySelectorAll('.campus-img[data-layer]')];
  const zones = [...document.querySelectorAll('.zone[data-zone]')];

  if (!stack || !layers.length || !zones.length) return;

  function progress() {
    const max = document.body.scrollHeight - innerHeight;
    return max <= 0 ? 0 : Math.min(1, Math.max(0, scrollY / max));
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  /** Two-phase breathing: zoom out mid-transition then into target */
  function breathLerp(from, to, t) {
    const midScale = Math.min(from.scale, to.scale) * 0.78;
    if (t < 0.45) {
      const u = easeInOut(t / 0.45);
      return {
        scale: lerp(from.scale, midScale, u),
        x: lerp(from.x, lerp(from.x, to.x, 0.5), u),
        y: lerp(from.y, lerp(from.y, to.y, 0.5), u),
      };
    }
    const u = easeInOut((t - 0.45) / 0.55);
    return {
      scale: lerp(midScale, to.scale, u),
      x: lerp(lerp(from.x, to.x, 0.5), to.x, u),
      y: lerp(lerp(from.y, to.y, 0.5), to.y, u),
    };
  }

  function sampleCamera(p) {
    let i = 0;
    for (let k = 0; k < KEYFRAMES.length - 1; k++) {
      if (p >= KEYFRAMES[k].start && p < KEYFRAMES[k + 1].start) { i = k; break; }
      if (p >= KEYFRAMES[KEYFRAMES.length - 1].start) i = KEYFRAMES.length - 1;
    }
    const a = KEYFRAMES[i];
    const b = KEYFRAMES[Math.min(i + 1, KEYFRAMES.length - 1)];
    if (a === b) return { scale: a.scale, x: a.x, y: a.y, zone: a.id, layer: a.layer };
    const span = b.start - a.start || 1;
    const local = (p - a.start) / span;
    const hold = 0.65;
    if (local <= hold) return { scale: a.scale, x: a.x, y: a.y, zone: a.id, layer: a.layer };
    const t = (local - hold) / (1 - hold);
    const cam = breathLerp(a, b, t);
    return { ...cam, zone: t < 0.5 ? a.id : b.id, layer: t < 0.5 ? a.layer : b.layer };
  }

  function applyCamera(cam) {
    stack.style.transform =
      `translate3d(${cam.x}%, ${cam.y}%, 0) scale(${cam.scale})`;
  }

  function setLayer(name) {
    layers.forEach((img) => {
      if (img.dataset.layer === 'base') return;
      img.classList.toggle('is-active', name && img.dataset.layer === name);
    });
  }

  function setZone(id) {
    zones.forEach((z) => z.classList.toggle('is-active', z.dataset.zone === id));
    document.body.dataset.zone = id;
  }

  /* Stack mode: zone from IntersectionObserver, not 800vh KEYFRAMES. */
  let stackObserver = null;
  function startStackZoneTracking() {
    if (stackObserver) return;
    const ratios = new Map();
    stackObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          ratios.set(e.target, e.isIntersecting ? e.intersectionRatio : 0);
        });
        let best = null;
        let bestRatio = 0;
        ratios.forEach((ratio, el) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = el;
          }
        });
        if (best && best.dataset.zone) setZone(best.dataset.zone);
      },
      { root: null, rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
    );
    zones.forEach((z) => stackObserver.observe(z));
  }

  function stopStackZoneTracking() {
    if (!stackObserver) return;
    stackObserver.disconnect();
    stackObserver = null;
  }

  let ticking = false;
  function frame() {
    ticking = false;
    if (stackMode()) {
      applyCamera({ scale: 1, x: 0, y: 0 });
      setLayer(null);
      startStackZoneTracking();
      return;
    }
    stopStackZoneTracking();
    const p = progress();
    const cam = sampleCamera(p);
    applyCamera(cam);
    setLayer(cam.layer);
    setZone(cam.zone);
  }

  function onScroll() {
    if (stackMode()) return; // zone via IntersectionObserver
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(frame);
  }

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => {
    stopStackZoneTracking();
    frame();
  }, { passive: true });
  frame();

  window.campusJumpTo = function (zoneId) {
    // Stacked mobile / reduced-motion: scroll to the zone element itself.
    if (stackMode()) {
      const el = document.querySelector(`.zone[data-zone="${zoneId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      }
      return;
    }
    const kf = KEYFRAMES.find((k) => k.id === zoneId);
    if (!kf) return;
    const max = document.body.scrollHeight - innerHeight;
    const mid = (kf.start + kf.end) / 2;
    scrollTo({ top: mid * max, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  function isScrollable(el) {
    if (!(el instanceof Element) || el === document.body || el === document.documentElement) return false;
    const style = getComputedStyle(el);
    const y = style.overflowY;
    const x = style.overflowX;
    const canY = (y === 'auto' || y === 'scroll' || y === 'overlay') && el.scrollHeight > el.clientHeight + 1;
    const canX = (x === 'auto' || x === 'scroll' || x === 'overlay') && el.scrollWidth > el.clientWidth + 1;
    return canY || canX;
  }

  function shouldSkipKeyboardJump(target) {
    if (!(target instanceof Element)) return false;
    if (target.isContentEditable || target.closest('[contenteditable="true"]')) return true;
    if (target.closest('[data-zone] .card, .roles-board, .projects-stage, textarea, input, select')) return true;
    let el = target;
    while (el && el !== document.body) {
      if (isScrollable(el)) return true;
      el = el.parentElement;
    }
    return false;
  }

  const order = ['hero', 'about', 'projects', 'history', 'skills', 'contact', 'outro'];
  addEventListener('keydown', (e) => {
    if (stackMode()) return;
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'PageDown' && e.key !== 'PageUp') return;
    if (shouldSkipKeyboardJump(e.target)) return;
    const cur = document.body.dataset.zone || 'hero';
    let i = order.indexOf(cur);
    if (i < 0) i = 0;
    if (e.key === 'ArrowDown' || e.key === 'PageDown') i = Math.min(order.length - 1, i + 1);
    else i = Math.max(0, i - 1);
    e.preventDefault();
    window.campusJumpTo(order[i]);
  });
})();
