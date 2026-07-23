/**
 * Campus scroll controller — zones, camera, breathing, crossfade.
 *
 * Camera KEYFRAMES (x/y/scale) — tuned 2026-07-23 on 1440×900 desktop against
 * current campus WebPs (island sits small in frame with void margins, so pans
 * and scales are larger than the brief’s starting estimates). Re-check once
 * Task 5 cards define the empty-card framing target.
 * Final: hero/outro 1@(0,0); about 3.1@(40,5) studio; projects 2.9@(24,34)
 * showcase; history 4.5@(-45,78) tower; skills 5@(-95,42) lab;
 * contact 4@(-55,-48) pavilion.
 */
(function () {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = () => matchMedia('(max-width: 768px)').matches;
  const stackMode = () => mobile() || reduceMotion;

  // Fractions match spec vh table over 800vh total.
  const KEYFRAMES = [
    { id: 'hero',     scale: 1.0, x: 0,   y: 0,   start: 0,     end: 0.125,  layer: null },
    { id: 'about',    scale: 3.1, x: 40,  y: 5,   start: 0.125, end: 0.25,   layer: 'studio' },
    { id: 'projects', scale: 2.9, x: 24,  y: 34,  start: 0.25,  end: 0.5,    layer: 'showcase' },
    { id: 'history',  scale: 4.5, x: -45, y: 78,  start: 0.5,   end: 0.6875, layer: 'tower' },
    { id: 'skills',   scale: 5.0, x: -95, y: 42,  start: 0.6875,end: 0.8125, layer: 'lab' },
    { id: 'contact',  scale: 4.0, x: -55, y: -48, start: 0.8125,end: 0.9375, layer: 'pavilion' },
    { id: 'outro',    scale: 1.0, x: 0,   y: 0,   start: 0.9375,end: 1,      layer: null },
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
    const midScale = Math.min(from.scale, to.scale) * 0.72;
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

  const projectCards = [...document.querySelectorAll('.project-card')];
  function updateProjects(p) {
    if (stackMode()) {
      projectCards.forEach((c) => c.classList.add('is-shown'));
      const el = document.getElementById('projectCount');
      if (el) el.textContent = `${projectCards.length} / ${projectCards.length}`;
      return;
    }
    const kf = KEYFRAMES.find((k) => k.id === 'projects');
    if (!kf || projectCards.length === 0) return;
    const hold = 0.65; // must match sampleCamera hold
    const span = kf.end - kf.start;
    const holdEnd = kf.start + span * hold;
    let local;
    if (p <= kf.start) local = 0;
    else if (p >= holdEnd) local = 0.999; // last card through breath
    else local = (p - kf.start) / (holdEnd - kf.start);
    const idx = Math.min(
      projectCards.length - 1,
      Math.max(0, Math.floor(local * projectCards.length))
    );
    projectCards.forEach((c, i) => c.classList.toggle('is-shown', i === idx));
    const el = document.getElementById('projectCount');
    if (el) el.textContent = `${idx + 1} / ${projectCards.length}`;
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
      updateProjects(0);
      return;
    }
    stopStackZoneTracking();
    const p = progress();
    const cam = sampleCamera(p);
    applyCamera(cam);
    setLayer(cam.layer);
    setZone(cam.zone);
    updateProjects(p);
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

  const order = ['hero', 'about', 'projects', 'history', 'skills', 'contact', 'outro'];
  addEventListener('keydown', (e) => {
    if (stackMode()) return;
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'PageDown' && e.key !== 'PageUp') return;
    const cur = document.body.dataset.zone || 'hero';
    let i = order.indexOf(cur);
    if (i < 0) i = 0;
    if (e.key === 'ArrowDown' || e.key === 'PageDown') i = Math.min(order.length - 1, i + 1);
    else i = Math.max(0, i - 1);
    e.preventDefault();
    window.campusJumpTo(order[i]);
  });
})();
