# 3D Campus Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Swiss Brutalist scrolling portfolio with a scroll-driven 3D campus illusion (CSS transform zoom/pan on stacked highlight renders + floating content cards), preserving all existing copy.

**Architecture:** Static site. Fixed full-viewport campus image stack; document height `800vh` drives zone progress; `campus.js` interpolates camera keyframes and toggles highlight opacities + card visibility. Mobile (`≤768px`) and `prefers-reduced-motion` abandon zoom/pan for stacked dark sections. Spec: `docs/superpowers/specs/2026-07-23-campus-portfolio-redesign-design.md`.

**Tech Stack:** Vanilla HTML/CSS/JS, Google Fonts (Inter, Inter Tight, JetBrains Mono), campus assets as **WebP-with-alpha** (transparent void) + opaque JPEG fallbacks. No frameworks, no three.js. No automated tests; verify with file-size checks, grep, and `python3 -m http.server` visual QA.

**Branch:** `redesign/3d-campus` (created off `main`).

## Global Constraints

- Zero build step; ship only `index.html`, `styles.css`, `campus.js`, `main.js`, and static assets.
- Preserve all portfolio copy from current `index.html` (About terminal text, project descriptions, experience bullets, contact copy) — do not abbreviate.
- No WebGL / three.js / model files; remove `hero3d.js` and `vendor/three*`.
- Dark singular aesthetic (`--void: #000`); not a theme toggle.
- Cyan building glow (baked in renders) + cobalt `#2440e0` UI accents.
- LCP: base campus WebP `< 150KB`; all 7 WebP total `< 1MB`; JS (`campus.js` + trimmed `main.js`) `< 15KB` combined preferred.
- Campus WebP layers use **transparent void** (corner flood-fill only; never global near-black color-key). Opaque JPEG fallbacks keep black void. Do not ship PNG in the deploy set.
- Commits: author Don Kasun Gallage only; no Co-authored-by; only commit when the task step says so and the user/agent is executing (not during planning).
- Avoid em dashes in *new* UI chrome labels; leave existing body copy as-is.
- Source renders: `3D asset/*.jpeg` (local, untracked). Do not commit raw 2MB originals.

## File map

| File | Responsibility |
|---|---|
| `images/campus/*.{webp,jpg}` | Optimized campus stack + mobile/OG variants |
| `index.html` | Markup: campus stack, scroll spacer, zone cards, nav, mobile sections |
| `styles.css` | Dark tokens, fixed campus, cards, nav, mobile, reduced-motion |
| `campus.js` | Zones, camera lerp, highlight crossfade, card classes, project sub-scroll, keyboard jumps |
| `main.js` | Cursor, progress bar, mobile menu only (strip particles / experience arc) |
| Delete: `hero3d.js`, `vendor/three.module.min.js` (and any other three vendor) | |

---

### Task 1: Optimize campus images

**Files:**
- Create: `images/campus/full_world.webp`, `full_world.jpg`, `gateway.webp|jpg`, `studio.webp|jpg`, `showcase_hall.webp|jpg`, `tower.webp|jpg`, `lab.webp|jpg`, `pavilion.webp|jpg`, `placeholder.jpg`, `mobile-hero.jpg`
- Do not commit: raw files under `3D asset/`

**Interfaces:**
- Produces: Deployable assets named exactly as above at ~1800px wide (preserve 2400×1792 aspect).

- [ ] **Step 1: Confirm sources exist**

```bash
ls -la "3D asset/full world 1.jpeg" "3D asset/gateway.jpeg" "3D asset/studio.jpeg" \
  "3D asset/showcase_hall.jpeg" "3D asset/tower.jpeg" "3D asset/lab.jpeg" "3D asset/pavilion.jpeg"
```

Expected: all seven files present, ~2.4MB each, 2400×1792.

- [ ] **Step 2: Resize + write opaque JPEG fallbacks (1600px wide, q≈72)**

```bash
mkdir -p images/campus
declare -A MAP=(
  ["full world 1.jpeg"]=full_world
  [gateway.jpeg]=gateway
  [studio.jpeg]=studio
  [showcase_hall.jpeg]=showcase_hall
  [tower.jpeg]=tower
  [lab.jpeg]=lab
  [pavilion.jpeg]=pavilion
)
for src in "${!MAP[@]}"; do
  out="${MAP[$src]}"
  magick "3D asset/$src" -resize 1600x -quality 72 "images/campus/${out}.jpg"
done
ls -la images/campus/*.jpg
```

Expected: each `.jpg` ideally `< 250KB`.

- [ ] **Step 3: Corner-flood transparent WebP (q≈75, alpha_q 90)**

Do **not** run global `-transparent black` (eats dark island geology). Flood-fill only from the four corners:

```bash
for src in "${!MAP[@]}"; do
  out="${MAP[$src]}"
  magick "3D asset/$src" -resize 1600x -alpha set -channel RGBA -fuzz 2.5% -fill none \
    -draw "color 0,0 floodfill" \
    -draw "color %[fx:w-1],0 floodfill" \
    -draw "color 0,%[fx:h-1] floodfill" \
    -draw "color %[fx:w-1],%[fx:h-1] floodfill" \
    PNG32:"/tmp/${out}-alpha.png"
  cwebp -q 75 -alpha_q 90 "/tmp/${out}-alpha.png" -o "images/campus/${out}.webp"
done
# Verify corners transparent, island center opaque:
magick images/campus/full_world.webp -format "TL=%[fx:p{0,0}.a] center=%[fx:p{w/2,h/2}.a]\n" info:
```

Expected: each WebP `< 150KB`; total of 7 `< 1MB`; corner alpha `0`, center alpha `1`.

- [ ] **Step 4: Blur placeholder + mobile hero crop**

```bash
magick images/campus/full_world.jpg -resize 40x -blur 0x2 -quality 40 images/campus/placeholder.jpg
# Center-ish crop for mobile banner (~800px wide, focus on courtyard)
magick images/campus/full_world.jpg -gravity Center -crop 1600x1000+0+80 +repage -resize 800x -quality 78 images/campus/mobile-hero.jpg
base64 -i images/campus/placeholder.jpg | wc -c
```

Expected: placeholder base64 length well under ~4KB characters; `mobile-hero.jpg` exists.

- [ ] **Step 5: Commit optimized assets only**

```bash
git add images/campus/*.webp images/campus/*.jpg
git commit -m "$(cat <<'EOF'
feat: add optimized campus render stack (webp + jpeg)

EOF
)"
```

---

### Task 2: Dark design tokens + strip three.js / particles

**Files:**
- Modify: `styles.css` (`:root` and body base)
- Modify: `index.html` (remove `hero3d.js` / `heroGrid` / particle canvas hooks; swap stylesheet cache bust)
- Modify: `main.js` (delete particle canvas + experience-arc code; keep cursor, progress, mobile nav)
- Delete: `hero3d.js`, `vendor/three.module.min.js` (glob `vendor/three*`)

**Interfaces:**
- Produces: CSS custom properties used by all later tasks:
  - `--void`, `--bone`, `--ink`, `--cobalt`, `--dim`, `--glass`, `--on-accent`, `--display`, `--body`, `--mono`

- [ ] **Step 1: Replace `:root` tokens** — replace the existing `:root` block in `styles.css` with:

```css
:root{
  color-scheme:dark;
  --void:#000000;
  --bone:#f2f0ea;
  --ink:#14140f;
  --cobalt:#2440e0;
  --cobalt-rgb:36,64,224;
  --dim:#8a8880;
  --glass:rgba(242,240,234,0.06);
  --on-accent:#ffffff;
  --bg:var(--void);
  --text:var(--bone);
  --color-base:var(--bone);
  --color-dark:var(--ink);
  --color-accent:var(--cobalt);
  --teal:var(--cobalt);
  --teal-rgb:36,64,224;
  --display:'Inter Tight',ui-sans-serif,system-ui,sans-serif;
  --body:'Inter',ui-sans-serif,system-ui,sans-serif;
  --mono:'JetBrains Mono',ui-monospace,SFMono-Regular,monospace;
  --card-pad:clamp(1.5rem,3vw,2.5rem);
  --radius:2px;
}
html,body{
  background:var(--void);
  color:var(--bone);
}
```

Keep remaining legacy variable aliases temporarily if other rules still reference `--bg2` etc., mapping them to dark-safe values, or delete dead rules in Task 3 when rewriting layout.

- [ ] **Step 2: Remove three.js and hero canvas from HTML**

In `index.html`:
- Delete `<canvas id="heroCanvas">`, orbs, `#heroGrid` / `hero-visual`, and any `<script type="module" src="hero3d.js">`.
- Keep fonts link and nav shell for now.
- Bump CSS/JS cache query to `?v=20260723a`.

- [ ] **Step 3: Slim `main.js`**

Keep only: custom cursor block, `#prog` scroll width, mobile nav toggle / overlay close-on-link.
Delete: particle network (`heroCanvas`), experience timeline (`xt-*`) logic, and any reveal observers that target removed classes (re-add card reveals in `campus.js` later).

- [ ] **Step 4: Delete unused vendor files**

```bash
rm -f hero3d.js vendor/three.module.min.js
ls vendor 2>/dev/null || true
```

- [ ] **Step 5: Smoke check**

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`. Expected: black page background, no console 404 for three.js/hero3d, fonts still load, nav still visible (layout will look broken until Task 3 — OK).

- [ ] **Step 6: Commit**

```bash
git add index.html styles.css main.js
git add -u hero3d.js vendor/
git commit -m "$(cat <<'EOF'
refactor: dark tokens and remove three.js / particle hero

EOF
)"
```

---

### Task 3: HTML skeleton — campus stack + scroll spacer + zone shells

**Files:**
- Modify: `index.html` (major restructure of `<body>` content after nav)
- Modify: `styles.css` (campus stage + spacer layout)

**Interfaces:**
- Produces DOM contracts consumed by `campus.js`:
  - `#campus-stage` — fixed transform target
  - `#campus-stage img[data-layer]` — layers: `base|gateway|studio|showcase|tower|lab|pavilion`
  - `#scroll-root` — tall spacer (`height: 800vh`)
  - `[data-zone]` panels: `hero|about|projects|history|skills|contact|outro`
  - `#skip-content` link

- [ ] **Step 1: Add preload for LCP image in `<head>`**

```html
<link rel="preload" as="image" href="images/campus/full_world.webp" type="image/webp">
```

- [ ] **Step 2: Insert campus stage + scroll root** (replace old `<section id="hero">` … footer with this structure; preserve nav + mobile menu)

```html
<a id="skip-content" href="#about" class="skip-link">Skip to content</a>

<div id="campus-stage" aria-hidden="true">
  <div class="campus-stack" id="campusStack">
    <!-- base always under highlights -->
    <picture>
      <source srcset="images/campus/full_world.webp" type="image/webp">
      <img data-layer="base" class="campus-img is-active" src="images/campus/full_world.jpg"
           alt="" width="1800" height="1344" fetchpriority="high" decoding="async">
    </picture>
    <!-- highlight layers: start opacity 0 via CSS; fetchpriority low -->
    <!-- gateway, studio, showcase_hall→data-layer="showcase", tower, lab, pavilion -->
    <!-- each: <picture><source webp><img data-layer="..." class="campus-img" fetchpriority="low"></picture> -->
  </div>
  <div class="statue-glow" id="statueGlow" hidden></div>
</div>

<div id="scroll-root" aria-hidden="true"></div>

<main id="campus-content">
  <section data-zone="hero" id="hero" class="zone zone--hero is-active">…</section>
  <section data-zone="about" id="about" class="zone">…</section>
  <section data-zone="projects" id="projects" class="zone">…</section>
  <section data-zone="history" id="experience" class="zone">…</section>
  <section data-zone="skills" id="skills" class="zone">…</section>
  <section data-zone="contact" id="contact" class="zone">…</section>
  <section data-zone="outro" id="outro" class="zone zone--outro">…</section>
</main>

<script src="main.js?v=20260723a" defer></script>
<script src="campus.js?v=20260723a" defer></script>
```

Fill each zone with placeholder empty `.card` shells in this task; paste full copy in Tasks 5–8. Keep `#experience` id for existing nav href `#experience`.

Highlight `data-layer` names must be exactly: `base`, `gateway`, `studio`, `showcase`, `tower`, `lab`, `pavilion`.

- [ ] **Step 3: Core campus CSS**

```css
#campus-stage{
  position:fixed; inset:0; z-index:0;
  overflow:hidden; pointer-events:none;
  background:var(--void);
}
.campus-stack{
  position:absolute; inset:0;
  transform-origin:50% 50%;
  will-change:transform;
}
.campus-img{
  position:absolute; inset:0;
  width:100%; height:100%;
  object-fit:cover;
  opacity:0;
  transition:opacity 400ms ease;
}
.campus-img.is-active{ opacity:1; }
.campus-img[data-layer="base"]{ opacity:1; } /* base always visible under fades */

#scroll-root{ height:800vh; pointer-events:none; }

#campus-content{
  position:relative; z-index:2;
  pointer-events:none; /* cards re-enable */
}
.zone{
  position:fixed; inset:0;
  display:flex; align-items:center;
  opacity:0; visibility:hidden;
  pointer-events:none;
  transition:opacity 300ms ease, visibility 300ms;
}
.zone.is-active{
  opacity:1; visibility:visible;
  pointer-events:none;
}
.zone .card, .zone a, .zone button{ pointer-events:auto; }

.skip-link{
  position:absolute; left:-999px; top:0; z-index:100;
  background:var(--cobalt); color:var(--on-accent); padding:.75rem 1rem;
}
.skip-link:focus{ left:0; }
```

- [ ] **Step 4: Visual check** — reload. Expected: full campus visible, black letterboxing OK, scrolling 800vh does nothing yet, no image misalignment (all layers identical framing).

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css
git commit -m "$(cat <<'EOF'
feat: campus image stack and 800vh scroll scaffold

EOF
)"
```

---

### Task 4: Scroll controller — zones, camera, breathing, crossfade

**Files:**
- Create: `campus.js`
- Modify: `index.html` (ensure script tag present from Task 3)

**Interfaces:**
- Produces:
  - `CAMERA_KEYFRAMES` / `KEYFRAMES` array `{ id, scale, x, y, start, end, layer }`
  - `applyCamera(scale, x, y)` sets `#campusStack.style.transform`
  - `setActiveLayer(name)` toggles `.is-active` on highlight imgs (base always on)
  - `setActiveZone(id)` toggles `.is-active` on `[data-zone]`
  - `window.campusJumpTo(zoneId)` for nav
  - Keep module-free IIFE (no build step)

- [ ] **Step 1: Create `campus.js` with zone math + rAF scroll loop**

```js
(function () {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = () => matchMedia('(max-width: 768px)').matches;

  const KEYFRAMES = [
    { id: 'hero',     scale: 1.0, x: 0,   y: 0,   start: 0,     end: 0.125,  layer: null },
    { id: 'about',    scale: 2.5, x: 25,  y: 15,  start: 0.125, end: 0.25,   layer: 'studio' },
    { id: 'projects', scale: 2.2, x: 10,  y: -5,  start: 0.25,  end: 0.5,    layer: 'showcase' },
    { id: 'history',  scale: 2.8, x: -25, y: -10, start: 0.5,   end: 0.6875, layer: 'tower' },
    { id: 'skills',   scale: 2.5, x: -35, y: 5,   start: 0.6875,end: 0.8125, layer: 'lab' },
    { id: 'contact',  scale: 2.5, x: -20, y: -25, start: 0.8125,end: 0.9375, layer: 'pavilion' },
    { id: 'outro',    scale: 1.0, x: 0,   y: 0,   start: 0.9375,end: 1,      layer: null },
  ];
  // Fractions match spec vh table over 800vh total.

  const stack = document.getElementById('campusStack');
  const layers = [...document.querySelectorAll('.campus-img[data-layer]')];
  const zones = [...document.querySelectorAll('[data-zone]')];

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

  let ticking = false;
  function frame() {
    ticking = false;
    if (mobile() || reduceMotion) {
      applyCamera({ scale: 1, x: 0, y: 0 });
      setLayer(null);
      return;
    }
    const cam = sampleCamera(progress());
    applyCamera(cam);
    setLayer(cam.layer);
    setZone(cam.zone);
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(frame);
  }

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  frame();

  window.campusJumpTo = function (zoneId) {
    const kf = KEYFRAMES.find((k) => k.id === zoneId);
    if (!kf) return;
    const max = document.body.scrollHeight - innerHeight;
    const mid = (kf.start + kf.end) / 2;
    scrollTo({ top: mid * max, behavior: reduceMotion ? 'auto' : 'smooth' });
  };
})();
```

- [ ] **Step 2: Manual camera tuning pass** — scroll slowly on a ≥1100px desktop window. Adjust `x`, `y`, `scale` until each building sits centered under the (still empty) card area. Document final numbers in a comment atop `KEYFRAMES`.

- [ ] **Step 3: Verify crossfade** — as zones change, only one highlight `.is-active`; base remains visible. Expected: cyan glow appears on the focused building.

- [ ] **Step 4: Commit**

```bash
git add campus.js index.html styles.css
git commit -m "$(cat <<'EOF'
feat: scroll-driven campus camera and highlight crossfade

EOF
)"
```

---

### Task 5: Hero + About content cards

**Files:**
- Modify: `index.html` (`[data-zone="hero"]`, `[data-zone="about"]`)
- Modify: `styles.css` (`.card`, `.card--solid`, `.card--glass`, hero/about layout)

**Interfaces:**
- Consumes: `.zone.is-active` visibility from Task 4
- Produces: card enter classes `.card--enter-left`, fade-in via zone active state (CSS only OK)

- [ ] **Step 1: Hero markup** — bottom-left name block + bottom-right glass stats. Copy from current hero (`hero-eyebrow`, `hero-headline`, `hero-desc`, CTAs, stats). Use `/` between name lines per spec (`DON KASUN / GALLAGE`). Wire CTA `View Work` → `href="#projects"` (and `data-jump="projects"` in Task 9).

- [ ] **Step 2: About markup** — solid bone card from left. Preserve full terminal About copy (whoami / background / philosophy) as readable paragraphs (drop terminal chrome UI; keep all sentences). Include years/apps stats and industries tags. Move detailed skill grids to Skills zone (Task 8) but **do not drop any About sentences**.

- [ ] **Step 3: Card CSS**

```css
.card{
  max-width:min(500px, 40vw);
  padding:var(--card-pad);
  border-radius:var(--radius);
}
.card--solid{
  background:var(--bone);
  color:var(--ink);
  border:1px solid var(--ink);
  box-shadow:4px 4px 0 0 rgba(0,0,0,0.45);
}
.card--glass{
  background:var(--glass);
  color:var(--bone);
  border:1px solid rgba(242,240,234,0.12);
  backdrop-filter:blur(12px);
  -webkit-backdrop-filter:blur(12px);
}
.zone--hero{
  align-items:flex-end; justify-content:space-between;
  padding:clamp(1rem,4vw,3rem);
  padding-bottom:clamp(2rem,6vh,4rem);
}
.zone[data-zone="about"]{ justify-content:flex-start; padding-left:clamp(1rem,5vw,4rem); }
.zone:not(.is-active) .card--enter-left{ transform:translateX(-40px); opacity:0; }
.zone.is-active .card--enter-left{
  transform:none; opacity:1;
  transition:transform 500ms ease, opacity 500ms ease;
}
```

- [ ] **Step 4: Visual check** — hero readable on campus; about card slides in when Studio glows.

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css
git commit -m "$(cat <<'EOF'
feat: hero and about floating cards on campus

EOF
)"
```

---

### Task 6: Projects zone (sub-scroll carousel)

**Files:**
- Modify: `index.html` (`[data-zone="projects"]`)
- Modify: `styles.css`
- Modify: `campus.js` (project index from local progress within projects range)

**Interfaces:**
- Consumes: `KEYFRAMES` projects `start`/`end`
- Produces: cards `.project-card.is-shown`; `#projectCount` text

- [ ] **Step 1: Markup** — three project cards (PDF Intelligence, Golazo AI, BYOB Sri Lanka) with existing descriptions, pills, and links. Add counter `span#projectCount` (`1 / 3`).

- [ ] **Step 2: In `campus.js`, after `setZone`**, when zone is `projects`:

```js
  const projectCards = [...document.querySelectorAll('.project-card')];
  function updateProjects(p) {
    const kf = KEYFRAMES.find((k) => k.id === 'projects');
    if (!kf || projectCards.length === 0) return;
    const local = (p - kf.start) / (kf.end - kf.start);
    const idx = Math.min(
      projectCards.length - 1,
      Math.max(0, Math.floor(local * projectCards.length))
    );
    projectCards.forEach((c, i) => c.classList.toggle('is-shown', i === idx));
    const el = document.getElementById('projectCount');
    if (el) el.textContent = `${idx + 1} / ${projectCards.length}`;
  }
```

Call `updateProjects(progress())` from `frame()`.

- [ ] **Step 3: CSS** — cards enter from right; only `.is-shown` visible; max-width ~40vw.

- [ ] **Step 4: Verify** — scrolling through the 200vh projects band cycles 1→2→3 without camera leaving Showcase Hall until band ends.

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css campus.js
git commit -m "$(cat <<'EOF'
feat: projects zone with scroll-linked card carousel

EOF
)"
```

---

### Task 7: Work history cards

**Files:**
- Modify: `index.html` (`[data-zone="history"]` / `#experience`)
- Modify: `styles.css`

**Interfaces:**
- Produces: stacked `.role-card` list with all five roles' periods, titles, companies, locations, bullets, tech pills from current `xt-card` content (no arc timeline).

- [ ] **Step 1: Convert each `xt-card` into a compact `.role-card`** inside a scrollable column (`max-height: 70vh; overflow:auto`) entering from top. Preserve every bullet and tech tag. Company names can be plain text (Speer etc. had no public URLs).

- [ ] **Step 2: CSS** — `.role-card` solid; stack with `gap` and slight `translateY` offset; date in `--mono`.

- [ ] **Step 3: Visual check** — Tower highlight + role stack readable; no leftover `xt-*` dependencies in JS.

- [ ] **Step 4: Commit**

```bash
git add index.html styles.css campus.js main.js
git commit -m "$(cat <<'EOF'
feat: work history role cards for tower zone

EOF
)"
```

---

### Task 8: Skills + Contact + Outro

**Files:**
- Modify: `index.html` (`#skills`, `#contact`, `#outro`)
- Modify: `styles.css`
- Modify: `campus.js` (statue glow show/hide optional)

**Interfaces:**
- Skills card uses same category lists as current About skill-grid + clients/countries tags.
- Contact reuses current ctx copy/rows/status bar.
- Outro = minimal footer fade.

- [ ] **Step 1: Skills markup** — categories Languages, Mobile & Web, Cloud & AI, Databases, Clients & Employers (countries). Slide from right.

- [ ] **Step 2: Contact markup** — solid card from bottom; eyebrow `04 - GET IN TOUCH`; heading / lead / rows / sign-off / status from current contact section.

- [ ] **Step 3: Outro markup** — glass footer strip with © line + social links.

- [ ] **Step 4: Statue glow** — position `#statueGlow` approximately over courtyard laptop (tune `%` top/left). CSS:

```css
.statue-glow{
  position:absolute; width:48px; height:48px; border-radius:50%;
  background:radial-gradient(circle, rgba(36,64,224,0.55) 0%, transparent 70%);
  mix-blend-mode:screen; pointer-events:none;
  animation:glowPulse 2.4s ease-in-out infinite;
}
@keyframes glowPulse{ 50%{ opacity:0.45; transform:scale(1.15);} }
@media (prefers-reduced-motion:reduce){
  .statue-glow{ animation:none; }
}
```

Un-`hidden` once position is tuned; leave `hidden` if alignment is wrong rather than shipping a misplaced blob.

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css campus.js
git commit -m "$(cat <<'EOF'
feat: skills, contact, and outro campus zones

EOF
)"
```

---

### Task 9: Navigation, section dots, progress bar

**Files:**
- Modify: `index.html` (nav links, `#sectionDots`)
- Modify: `styles.css`
- Modify: `campus.js` / `main.js` (click → `campusJumpTo`)

**Interfaces:**
- Nav targets: about→`about`, projects→`projects`, experience→`history`, contact→`contact`
- Dots for content zones: about, projects, history, skills, contact
- `#prog` retained at top (cobalt)

- [ ] **Step 1: Wire nav `<a>` clicks**

```js
document.querySelectorAll('[data-jump]').forEach((a) => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    window.campusJumpTo(a.dataset.jump);
  });
});
```

Markup: `<a href="#about" data-jump="about">01 About</a>` etc. Get In Touch → `data-jump="contact"` (mailto remains on contact card).

- [ ] **Step 2: Section dots**

```html
<nav id="sectionDots" class="section-dots" aria-label="Sections">
  <button type="button" data-jump="about" aria-label="About">01</button>
  <!-- projects, history, skills, contact -->
</nav>
```

CSS: fixed right edge; active button filled cobalt when `document.body.dataset.zone` matches. Hide at `max-width:768px`.

- [ ] **Step 3: Active nav link styling** from `body[data-zone=...]`.

- [ ] **Step 4: Verify** — each nav/dot jump lands mid-zone with correct glow + card.

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css campus.js main.js
git commit -m "$(cat <<'EOF'
feat: campus nav jumps and section indicator dots

EOF
)"
```

---

### Task 10: Mobile layout + reduced motion + keyboard

**Files:**
- Modify: `styles.css` (`@media (max-width:768px)`, `@media (prefers-reduced-motion:reduce)`)
- Modify: `campus.js` (already early-returns camera; ensure zones become static flow)
- Modify: `index.html` (mobile hero uses `mobile-hero.jpg`; optional per-section header crops can reuse building jpgs with `object-position`)

**Interfaces:**
- Below 768px: `#scroll-root{display:none}`, `#campus-stage` becomes static ~50vh hero banner, `#campus-content .zone` → `position:relative` stacked, all visible, cards static.

- [ ] **Step 1: Mobile CSS override**

```css
@media (max-width:768px){
  #scroll-root{ display:none; height:0; }
  #campus-stage{ position:relative; height:50vh; }
  .campus-stack{ transform:none !important; }
  .campus-img:not([data-layer="base"]){ display:none; }
  #campus-content{ pointer-events:auto; }
  .zone{
    position:relative; inset:auto;
    opacity:1 !important; visibility:visible !important;
    display:block; padding:1.25rem;
  }
  .card{ max-width:none; }
  .section-dots{ display:none; }
}
@media (prefers-reduced-motion:reduce){
  #scroll-root{ display:none; }
  .campus-stack{ transform:none !important; }
  .zone{ position:relative; opacity:1 !important; visibility:visible !important; }
  .card{ transition:none !important; transform:none !important; }
}
```

- [ ] **Step 2: Keyboard** — in `campus.js`:

```js
  const order = ['hero','about','projects','history','skills','contact','outro'];
  addEventListener('keydown', (e) => {
    if (mobile() || reduceMotion) return;
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'PageDown' && e.key !== 'PageUp') return;
    const cur = document.body.dataset.zone || 'hero';
    let i = order.indexOf(cur);
    if (e.key === 'ArrowDown' || e.key === 'PageDown') i = Math.min(order.length - 1, i + 1);
    else i = Math.max(0, i - 1);
    e.preventDefault();
    window.campusJumpTo(order[i]);
  });
```

- [ ] **Step 3: Test** — DevTools iPhone width: stacked sections, hamburger works, no horizontal overflow. Toggle reduced-motion: no zoom.

- [ ] **Step 4: Commit**

```bash
git add index.html styles.css campus.js
git commit -m "$(cat <<'EOF'
feat: mobile stack, reduced-motion, and keyboard zone jumps

EOF
)"
```

---

### Task 11: OG image, SEO, cleanup, performance gate

**Files:**
- Create: `images/campus/og-share.jpg` (1200×630)
- Modify: `index.html` meta `og:image` / twitter image paths
- Modify: `styles.css` / `index.html` purge unused Swiss/xt/brutal dead CSS if still present (optional sweep — remove obvious dead blocks only)
- Verify sizes

- [ ] **Step 1: Generate OG image**

```bash
magick images/campus/full_world.jpg -gravity Center -crop 1600x840+0+0 +repage \
  -resize 1200x630^ -gravity center -extent 1200x630 -quality 82 \
  images/campus/og-share.jpg
```

Update meta tags to `images/campus/og-share.jpg` (absolute URL on deploy: `https://donkasun.github.io/images/campus/og-share.jpg`).

- [ ] **Step 2: Performance checklist**

```bash
du -ch images/campus/*.webp | tail -1
wc -c campus.js main.js
```

Expected: WebP total `< 1MB`; JS lean; LCP element is base campus image.

- [ ] **Step 3: Cross-browser smoke** — Chrome, Firefox, Safari desktop; Safari iOS if available. Check highlight crossfade and nav jumps.

- [ ] **Step 4: Final commit**

```bash
git add images/campus/og-share.jpg index.html styles.css campus.js main.js
git commit -m "$(cat <<'EOF'
feat: OG share image and campus redesign polish

EOF
)"
```

Do **not** merge to `main` or deploy unless the user explicitly asks.

---

## Spec coverage checklist (self-review)

| Spec requirement | Task |
|---|---|
| Optimize 7 WebP+JPEG, placeholder, mobile hero | 1 |
| Dark tokens; remove three.js | 2 |
| Fixed image stack + 800vh spacer | 3 |
| Camera keyframes + breathing + crossfade | 4 |
| Hero + About cards + copy preserved | 5 |
| Projects sub-scroll carousel | 6 |
| Work history cards (no arc) | 7 |
| Skills + Contact + Outro + statue glow | 8 |
| Nav, dots, progress | 9 |
| Mobile / reduced-motion / keyboard / skip link | 10 (skip in 3) |
| OG + performance | 11 |
| Gateway unused but shipped | 1+3 |
| Cyan glow + cobalt UI | assets + tokens |
| No dark-mode toggle | 2 |

## Open defaults (locked for build)

1. Keep existing project thumbnails.
2. Keep current résumé PDF.
3. Keep custom cursor.
4. Skip link + mid-zone jumps for control.
5. Cyan render glow + cobalt UI.
6. Gateway layer shipped, not activated in scroll flow.
