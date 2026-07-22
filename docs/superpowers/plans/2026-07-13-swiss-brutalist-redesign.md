# Swiss Brutalist Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle donkasun.github.io from cream/orange Oswald neo-brutalism to a bone/ink/cobalt Swiss-brutalist look with Inter Tight display type, numbered sections, and a typographic hero.

**Architecture:** Static site — three files (`index.html`, `styles.css`, `main.js`), no build step. The restyle is mostly a CSS-variable remap plus targeted markup changes (hero, section headers, nav). Spec: `docs/superpowers/specs/2026-07-13-swiss-brutalist-redesign-design.md`.

**Tech Stack:** Plain HTML/CSS/JS, Google Fonts (Inter, Inter Tight, JetBrains Mono). No tests exist in this repo; verification is grep + visual checks in a browser (`python3 -m http.server`).

**Branch:** work on `redesign/swiss-brutalist` (already created).

**Key palette facts (used throughout):**
- bone bg `#f2f0ea`, ink `#14140f`, cobalt `#2440e0` (rgb `36,64,224`), soft cobalt `#4b63ec` (rgb `75,99,236`)
- Text on cobalt is **white** (`--on-accent:#ffffff`) — orange had dark text on accent; every place that puts `var(--color-dark)` on an accent background must switch to `var(--on-accent)`.
- Light theme only. No dark mode.

---

### Task 1: Fonts + design-token remap

**Files:**
- Modify: `index.html:21` (favicon), `index.html:24` (font link), `index.html:25` and `index.html:701` (cache-bust)
- Modify: `styles.css:1-42` (`:root`)

- [ ] **Step 1: Swap the Google Fonts request** — replace line 24 of `index.html` with:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@800;900&family=JetBrains+Mono:wght@400;500;700;800&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Recolor the inline SVG favicon** — on `index.html:21`, change `fill='%230f0f0f'` → `fill='%2314140f'` (rect) and `fill='%23f96328'` → `fill='%232440e0'` (text).

- [ ] **Step 3: Replace the `:root` block** in `styles.css` (lines 1–42) with:

```css
:root{
  color-scheme:light;
  --color-base:#f2f0ea;
  --color-accent:#2440e0;
  --color-dark:#14140f;

  --bg:var(--color-base);
  --bg2:#eae7df;
  --bg3:#dfdbcf;
  --surface:#faf9f4;
  --text:var(--color-dark);
  --dim:#5c5a52;
  --faint:#a3a094;
  --teal:var(--color-accent);
  --teal-rgb:36,64,224;
  --teal-soft:#4b63ec;
  --teal-soft-rgb:75,99,236;
  --on-accent:#ffffff;
  --blue:var(--color-dark);
  --blue-rgb:20,20,15;
  --border:rgba(20,20,15,0.3);
  --border2:var(--color-dark);
  --glow:rgba(0,0,0,0);
  --nav-bg:rgba(242,240,234,0.88);
  --menu-bg:rgba(242,240,234,0.98);
  --chrome-mid:rgba(20,20,15,0.3);
  --shadow-sm:4px 4px 0 0 var(--color-dark);
  --shadow-md:6px 6px 0 0 var(--color-dark);
  --shadow-lg:8px 8px 0 0 var(--color-dark);
  --hero-grad-blue:rgba(36,64,224,0.06);
  --hero-grad-teal:rgba(36,64,224,0.04);
  --hero-grad-purple:rgba(20,20,15,0.03);
  --orb-blue:rgba(36,64,224,0.10);
  --orb-teal:rgba(36,64,224,0.06);
  --orb-purple:rgba(20,20,15,0.05);
  --profile-shadow:drop-shadow(8px 8px 0 var(--color-dark));
  --float-shadow:drop-shadow(4px 4px 0 var(--color-dark));
  --deco-opacity:0.06;
  --display:'Inter Tight',ui-sans-serif,system-ui,sans-serif;
  --body:'Inter',ui-sans-serif,system-ui,sans-serif;
  --mono:'JetBrains Mono',ui-monospace,SFMono-Regular,monospace;
}
```

(Orb/gradient opacities are deliberately lower than before — spec says particles/orbs become background texture.)

- [ ] **Step 4: Bump cache-busting query strings** — in `index.html` change `styles.css?v=20260703q` → `styles.css?v=20260713a` (line 25) and `main.js?v=20260703q` → `main.js?v=20260713a` (line 701).

- [ ] **Step 5: Visual smoke check** — run `python3 -m http.server 8000` in the repo root, open `http://localhost:8000`. Expected: site renders in bone/cobalt (headings will look wrong-weight until Task 2 — fine).

- [ ] **Step 6: Commit**

```bash
git add index.html styles.css
git commit -m "feat: swap to Inter Tight + bone/ink/cobalt design tokens"
```

---

### Task 2: Display typography (headings, section titles)

**Files:**
- Modify: `styles.css` — `.hero-headline` (~line 225), `.section-title` (~line 662), `.brutal-card-title` (~line 749), `.ctx-headline` (~line 1302), `.nav-logo` (~line 105), `.stat-num` (~line 297), `.sc-num` (~line 807), `.proj-title` (~line 1127), `.deco-text` (~line 1484)

Inter Tight needs explicit heavy weights and negative tracking (Oswald was 500–700 with positive tracking). Every `font-family:var(--display)` rule gets `font-weight:900` (or 800 for smaller items) and tighter letter-spacing.

- [ ] **Step 1: Update heading rules** — apply these property changes (keep all other properties in each rule as-is):

```css
/* .hero-headline (line ~225) */
.hero-headline{ font-weight:900; letter-spacing:-.035em; line-height:.95; }

/* .section-title (line ~662) */
.section-title{ font-weight:900; letter-spacing:-.02em; text-transform:uppercase; }

/* .brutal-card-title (line ~749) — already uppercase */
.brutal-card-title{ font-weight:800; letter-spacing:-.01em; }

/* .ctx-headline (line ~1302) */
.ctx-headline{ font-weight:900; letter-spacing:-.03em; text-transform:uppercase; }

/* .nav-logo (line ~105) */
.nav-logo{ font-weight:900; letter-spacing:-.01em; }

/* .stat-num (line ~297) and .sc-num (line ~807) */
.stat-num{ font-weight:900; letter-spacing:-.02em; }
.sc-num{ font-weight:900; letter-spacing:-.02em; }

/* .proj-title (line ~1127) */
.proj-title{ font-weight:800; letter-spacing:-.01em; text-transform:uppercase; }

/* .deco-text (line ~1484) */
.deco-text{ font-weight:900; letter-spacing:-.03em; }
```

Also update the smaller display users: `.b-headline` (~line 567) and `.app-card-val` (~line 354) get `font-weight:800` (these blocks may be deleted in Task 3 — if already gone, skip).

- [ ] **Step 2: Visual check** — reload `http://localhost:8000`. Expected: all big headings render as heavy, tight, uppercase grotesque; nothing renders in a fallback serif/condensed face.

- [ ] **Step 3: Commit**

```bash
git add styles.css
git commit -m "feat: heavy Inter Tight display typography with Swiss tracking"
```

---

### Task 3: Hero — typographic statement

**Files:**
- Modify: `index.html:87-234` (hero section), `index.html:321` (about-accent, receives profile image)
- Modify: `styles.css` hero block (~lines 166–643)
- Modify: `main.js:218-250` (remove hero float parallax)

- [ ] **Step 1: Replace the hero markup** — replace `index.html` lines 87–234 (the whole `<section id="hero">`) with:

```html
<!-- ═══ HERO ═══ -->
<section id="hero">
  <canvas id="heroCanvas"></canvas>
  <div class="hero-bg"></div>
  <div class="orb orb1"></div>
  <div class="orb orb2"></div>
  <div class="orb orb3"></div>

  <div class="hero-inner">
    <div class="hero-eyebrow">
      AI-Native Full-Stack Engineer · Colombo, SL
    </div>

    <h1 class="hero-headline">
      <span class="line"><span>DON KASUN</span></span>
      <span class="line"><span>GALLAGE</span></span>
    </h1>

    <p class="hero-desc">
      I take product ideas and build them. Mobile, web, whatever it takes.
      Seven years of it, mostly with founders, startups and engineering teams.
    </p>

    <div class="hero-btns">
      <a href="#projects" class="btn-primary">View Work ↗</a>
      <a href="#contact" class="btn-secondary">Contact</a>
    </div>

    <div class="hero-stats">
      <div class="stat">
        <div class="stat-num">7<span>+</span></div>
        <div class="stat-label">Years Experience</div>
      </div>
      <div class="stat">
        <div class="stat-num">20<span>+</span></div>
        <div class="stat-label">Projects Shipped</div>
      </div>
      <div class="stat">
        <div class="stat-num">4</div>
        <div class="stat-label">Continents</div>
      </div>
    </div>
  </div>

  <div class="scroll-ind">
    <div class="scroll-wheel"><div class="scroll-dot"></div></div>
    Scroll
  </div>
</section>
```

(Removed: `.hero-visual` and everything inside it — profile img, browser mockups, floating shots, phone, 3 badges. Removed the SVG icons inside the buttons.)

- [ ] **Step 2: Move the profile image into About** — in `index.html`, inside `<div class="about-accent rv d3">` (line 321), add as the FIRST child, before the first `.stat-card`:

```html
<div class="about-photo rv d2">
  <img src="images/profile.svg" alt="Don Kasun Gallage profile illustration" width="500" height="500" loading="lazy" decoding="async">
</div>
```

- [ ] **Step 3: Restyle hero CSS** — in `styles.css`:

Replace `.hero-inner` (~lines 205–213 incl. its media query) with:

```css
.hero-inner{
  position:relative;z-index:2;
  display:flex;flex-direction:column;align-items:flex-start;
  max-width:1440px;margin:0 auto;width:100%;
  padding-top:80px;
}
@media(max-width:900px){.hero-inner{padding-top:100px}}
```

Enlarge the headline — in `.hero-headline` (~line 225) set `font-size:clamp(72px,13vw,190px);` and `margin-bottom:8px` stays.

Widen the description: `.hero-desc` → `max-width:52ch;` and `font-size:clamp(15px,1.3vw,18px);`.

Give the primary button white text explicitly (it inherits `--on-accent`, which is now white — verify `.btn-primary` still reads `color:var(--on-accent)`; no change needed if so) and change its hover to keep white text: `.btn-primary:hover{background:var(--color-dark);color:#fff;…}` (replace `color:var(--color-base)`).

- [ ] **Step 4: Delete dead hero-visual CSS** — remove these `styles.css` blocks entirely (they no longer have markup):
  - `.hero-visual` + its media queries (~lines 304–313)
  - Phone mockup: `.phone` through `.app-list-val` (~lines 315–375)
  - `.hero-profile` + `profileFloat` keyframes + its media queries (~lines 377–399)
  - Parallax wrappers: `.hero-px-wrap` through the 480px media query (~lines 401–515)
  - Browser mockup: `.browser` through `.b-card-sub` (~lines 517–580)
  - Floating badges: `.badge` through the 480px badge media query (~lines 582–626)
  - In the reduced-motion block (~line 1500), drop `.hero-visual` from the selector list.

  **Keep** `.term-dots`/`.term-chrome` (About terminal card) — only delete the hero `.browser*`/`.b-dot`/`.b-*` rules. Note `.b-dot` colors are used only by the deleted hero browsers; the About terminal uses `.term-dots span`.

- [ ] **Step 5: Add `.about-photo` CSS** — place next to `.about-accent` (~line 800):

```css
.about-photo{
  background:var(--surface);
  border:3px solid var(--color-dark);
  box-shadow:var(--shadow-md);
  padding:16px;
}
.about-photo img{display:block;width:100%;height:auto}
```

- [ ] **Step 6: Remove hero parallax JS** — in `main.js`, delete the block from `// ─── HERO FLOAT PARALLAX (4 product floats) ───` (line 218) through `}` at line 250 (the `heroPxWraps`, `runHeroParallax`, `onScrollMotion` code and its listeners). The particle canvas code above it stays untouched.

- [ ] **Step 7: Visual check** — reload. Expected: hero is a single left-aligned column — eyebrow, huge name, paragraph, two buttons (cobalt with white text / outlined), stats row; faint particles behind; no photo or floating devices; About section shows the framed profile image at the top of the right column. Check ~390px width too (name must wrap without horizontal scroll — `clamp` handles it, but verify).

- [ ] **Step 8: Commit**

```bash
git add index.html styles.css main.js
git commit -m "feat: typographic-statement hero; move profile photo to About"
```

---

### Task 4: Swiss numbered sections + nav

**Files:**
- Modify: `index.html` — nav (~59–64), mobile menu (~79–83), section labels (240, 374, 482, 622)
- Modify: `styles.css` — `.section-label` (~line 656)

- [ ] **Step 1: Number the section labels** in `index.html`:
  - About (line 240): `<div class="section-label rv">01 — About</div>`
  - Projects (line 374): `<div class="section-label rv">02 — Selected Work</div>`
  - Experience (line 482): `<div class="section-label rv">03 — Work History</div>`
  - Contact (line 622): `<div class="section-label rv">04 — Get In Touch</div>` (note: remove the existing `· 04` suffix)

- [ ] **Step 2: Number the nav links** — desktop nav (lines 60–64):

```html
<a href="#about">01 About</a>
<a href="#projects">02 Projects</a>
<a href="#experience">03 Experience</a>
<a href="#contact">04 Contact</a>
<a href="docs/Don-Kasun-Gallage-Resume.pdf" target="_blank" rel="noopener">Résumé</a>
```

  Mirror the same numbering in the mobile menu (lines 79–83).

- [ ] **Step 3: Sharpen `.section-label`** — replace the rule (~line 656) with:

```css
.section-label{
  display:inline-flex;align-items:center;gap:12px;
  font-family:var(--mono);font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;
  color:var(--text);margin-bottom:20px;
}
.section-label::before{content:'';display:block;width:32px;height:2px;background:var(--teal)}
```

(The `::before` rule replaces the existing one at ~line 661.)

- [ ] **Step 4: Visual check** — reload; every section shows `NN — Title` eyebrow in ink with a cobalt tick; nav shows numbered links; scroll-spy still highlights the active link (it keys off `href`, unaffected).

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css
git commit -m "feat: Swiss numbered section headers and nav"
```

---

### Task 5: Sweep remaining hard-coded orange/off-palette colors

**Files:**
- Modify: `styles.css` (various), `index.html` (none expected beyond favicon done in Task 1)

- [ ] **Step 1: Find every remnant**

```bash
grep -n '249,99,40\|f96328\|ff7a45\|f1e7da\|e9dcc8\|e0cfb4\|fbf4e8' styles.css index.html main.js
```

- [ ] **Step 2: Replace each match in `styles.css`** by category:
  - `rgba(249,99,40,X)` → `rgba(var(--teal-rgb),X)` (e.g. `.pill::before` ~line 847, `.proj-tag` ~lines 1122–1123, `.pdf-highlight` ~lines 1238–1239, `.proj-link` border ~line 1176, `.phone-main`/`.phone-photo` shadows — those are deleted in Task 3; skip anything already gone)
  - Any leftover hex `#f96328`/`#ff7a45` → `var(--teal)` / `var(--teal-soft)`
  - Old cream hexes (`#f1e7da`, `#e9dcc8`, `#e0cfb4`, `#fbf4e8`) → the corresponding vars (`var(--bg)`, `var(--bg2)`, `var(--bg3)`, `var(--surface)`)

- [ ] **Step 3: Restyle the dark-navy project visuals** — the project-card header gradients are off-palette navy. Replace (~lines 1109–1111):

```css
.pv1{background:linear-gradient(135deg,#14140f 0%,#1c2242 50%,#14140f 100%)}
.pv2{background:linear-gradient(135deg,#14140f 0%,#232323 60%,#101012 100%)}
.pv3{background:linear-gradient(135deg,#101012 0%,#1c2242 50%,#14140f 100%)}
```

  And in the PDF illustration (~lines 1218–1222): `.pdf-doc{background:linear-gradient(145deg,#1a1a20,#232336);…}` (replace the navy gradient; keep every other property).

- [ ] **Step 4: Fix dark-on-accent text** — `.skill-tag` (~line 784) currently sets `color:var(--color-dark)` on a `background:var(--teal)`; change to `color:var(--on-accent)`. Check for the same pattern anywhere else that pairs `background:var(--teal)` with dark text (`grep -n 'background:var(--teal)' styles.css`).

- [ ] **Step 5: Re-run the grep from Step 1** — expected: zero matches. Also `grep -n 'Oswald' index.html styles.css` — expected: zero matches.

- [ ] **Step 6: Visual check** — reload; scan every section: no orange anywhere, accent text on cobalt is white, project card headers look ink-toned.

- [ ] **Step 7: Commit**

```bash
git add styles.css
git commit -m "fix: sweep remaining orange/cream remnants to bone/ink/cobalt tokens"
```

---

### Task 6: Final verification pass

**Files:** none (verification only)

- [ ] **Step 1: Grep gate**

```bash
grep -rn 'Oswald\|f96328\|249,99,40\|f1e7da' index.html styles.css main.js
```

Expected: no output.

- [ ] **Step 2: Console check** — with the local server running, open DevTools console on `http://localhost:8000`. Expected: no JS errors (the parallax removal in Task 3 must leave no dangling references — `grep -n 'heroPx\|hero-px' main.js index.html styles.css` returns nothing).

- [ ] **Step 3: Full visual pass** — at ~1440px and ~390px widths, check: hero, About (terminal card, skill cards, photo, map card), Projects (featured + 2 cards, mobile see-more), Experience (desktop sticky arc timeline AND narrow-width stacked fallback), Contact rows + status bar, footer. Cursor, progress bar, scroll reveals, count-ups all working, all cobalt.

- [ ] **Step 4: Commit any fixes** found during the pass, message `fix: <what>`.

---

## Out of scope (explicitly)

- Dark mode / theme toggle (light only — spec correction).
- Copy changes, new sections, OG card image regeneration (`images/og-card.png` still shows old branding — follow-up).
- Deploy: merging to `main` publishes via GitHub Pages; do NOT merge or push without the user's go-ahead.
