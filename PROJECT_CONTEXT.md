# Portfolio Site — Project Context

**Repo:** `donkasun/donkasun.github.io`
**Live:** https://donkasun.github.io/
**Owner:** Don Kasun Gallage (kasungallage94@gmail.com)
**Current branch:** `redesign/swiss-brutalist` (not yet merged to `main`)

## What this is

A personal portfolio site for Don Kasun Gallage, an AI-native full-stack engineer based in Colombo, Sri Lanka. It's a single-page site: hero, about, selected work, work history, contact.

Deliberately **zero framework, zero build step**: hand-written HTML, CSS, and vanilla JS, deployed as static files to GitHub Pages. No npm install, no bundler, no transpilation. This is a stated design choice, not an oversight — keep it that way.

## File map

| File | Role |
|---|---|
| `index.html` (613 lines) | All markup and content |
| `styles.css` (1241 lines) | All styling — custom properties, `clamp()` fluid type, no preprocessor |
| `main.js` (421 lines) | Custom cursor, particle canvas, parallax, scroll reveal, nav, scroll progress bar |
| `hero3d.js` (187 lines) | New: three.js wireframe floor-grid effect in the hero's right column |
| `vendor/three.module.min.js` | Vendored three.js r160 (minified ESM build), so there's no CDN/runtime dependency |
| `images/` | WebP/SVG assets, social card, map assets (`images/map/map-light.svg`) |
| `docs/` | Résumé PDF + design specs/plans (see below) |
| `sitemap.xml`, `robots.txt` | SEO |
| `prototypes/card-reveal-test/` | Isolated React Three Fiber + GSAP experiment, not part of the shipped site — uses `pnpm`, not npm |

Run locally: `python3 -m http.server 8000` — no build step needed.

## Current visual system: "Swiss Brutalist" redesign

The site is mid-redesign on `redesign/swiss-brutalist`, moving from an older cream/orange neo-brutalist look to a disciplined Swiss-brutalist system.

**Palette (light theme only — no dark mode, no toggle):**
| Token | Value | Role |
|---|---|---|
| Bone | `#f2f0ea` | background |
| Ink | `#14140f` | text/borders/shadows |
| Cobalt | `#2440e0` | accent — buttons, links, selection, badges, cursor, progress bar, white text on top of it |
| Dim | `#5c5a52` | secondary copy |

**Type:** Inter Tight (800/900, uppercase, tight tracking) for headings; Inter for body; JetBrains Mono for labels/eyebrows. Oswald was removed entirely.

**Structure:** Swiss numbered sections in page order — `01 — About`, `02 — Selected Work`, `03 — Work History`, `04 — Get In Touch` — small mono eyebrow + oversized Inter Tight title, strict grid alignment. Nav mirrors the numbering.

**Kept flourishes (all recolored to the new palette):** custom cursor, scroll progress bar, particle canvas + blur orbs (toned down, background texture only), scroll-in reveal animations, count-ups.

**Hero:** purely typographic — eyebrow line, huge two-line Inter Tight name, one pitch paragraph (copy unchanged from before), two CTAs (`VIEW WORK ↗` cobalt solid, `CONTACT` outlined), a slim stats strip. No profile photo, no floating screenshots anywhere in the hero.

**Newest addition (2026-07-22):** a 3D wireframe floor grid fills the empty right half of the hero above 1100px width (see `hero3d.js` and the design spec below) — a hand-built 34×26 grid of line segments rendered with three.js, camera positioned so it recedes like a floor, vertex-shader sine-wave displacement plus cursor-follow denting, all in cobalt with edge falloff. Vendored three.js, dynamically imported after `window.load` so it never blocks LCP; fully absent below 1100px and under `prefers-reduced-motion`.

## Where the specs/plans live

- `docs/superpowers/specs/2026-07-13-swiss-brutalist-redesign-design.md` — the master redesign spec, including a **Status** section (added 2026-07-21) tracking done vs. left:
  - **Done:** palette swap, Inter Tight rollout, numbered sections, typographic hero, recolored cursor/progress bar/particles, light-only theme confirmed, profile photo fully removed (deviation from the original plan, which had first moved it to About).
  - **Left/unverified:** no logged responsive check at 390px/1440px yet; OG/meta social image not regenerated; two undocumented scope-creep items shipped (removed the Experience section's "now playing" company indicator; tightened context-row density) that aren't folded back into the spec.
- `docs/superpowers/specs/2026-07-22-hero-3d-grid-design.md` — design spec for the hero 3D grid feature (problem, goals/non-goals, layout math, shader approach, degradation rules, performance notes).
- `docs/superpowers/plans/2026-07-13-swiss-brutalist-redesign.md` — the step-by-step implementation plan/checklist for the redesign.
- `.private/portfolio-content.md` — the canonical copy/content reference (not committed publicly; gitignored).

## Known learned preferences (from `AGENTS.md`)

- Commits: author only as Don Kasun Gallage, no co-author trailers, no AI/bot identities; never commit without being explicitly asked.
- Light-only site — do not reintroduce dark mode/theme toggle without being asked.
- No profile photo anywhere (hero or About).
- Prefer continuous fluid `clamp()`/`vw`/`em` scaling over discrete breakpoint jumps within desktop ranges.
- Nav becomes hamburger and About stacks to one column at ≤1100px.
- Avoid em dashes in portfolio copy; keep tone human/natural.
- Preserve full original copy/content when restyling — no abbreviation.

## Open items / good starting points for new work

1. Run and log the responsive verification pass (390px mobile / 1440px desktop) called out as outstanding in the redesign spec's Status section.
2. Decide whether to regenerate the OG/social share image for the new palette (left as a "follow-up if non-trivial").
3. Reconcile the two undocumented scope-creep changes (removed "now playing" indicator, tightened context-row density) back into the written spec, or explicitly note them as accepted deviations.
4. Eventually merge `redesign/swiss-brutalist` into `main` once the above is resolved.
