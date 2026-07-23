# Design Spec: 3D Campus Portfolio Redesign

**Date:** 2026-07-23
**Branch:** `redesign/3d-campus` (new, off `main`)
**Supersedes:** `redesign/swiss-brutalist` (Swiss Brutalist redesign remains on its branch / on `main` until this merges; not deleted)

---

## Problem

The current Swiss Brutalist redesign is clean and functional, but it looks like every other developer portfolio: typographic hero, scrolling sections, card grids. It doesn't demonstrate the kind of creative engineering that makes someone stop and remember the site. For a full-stack engineer who ships product, the portfolio itself should feel like a product.

## Concept

The entire portfolio is presented as a **3D miniature campus** on a floating island. A single high-fidelity isometric render of a six-building architectural complex serves as the full-bleed visual. As the user scrolls, the viewport zooms and pans to each building in sequence, while HTML content cards animate in from the edges. Each building maps to a portfolio section.

This is **not real-time 3D**. The "camera movement" is simulated using CSS transforms (scale + translate) on the static image. No three.js, no WebGL, no model files. The 3D is an illusion built on a beautiful 2D asset, smart scroll math, and polished card choreography.

## Goals

1. Create an immediately memorable first impression that stands apart from standard portfolio layouts.
2. Give the visitor an intuitive spatial mental model of the portfolio: they can see all sections at once, then explore each one.
3. Preserve all existing portfolio content and copy unchanged.
4. Stay within the zero-framework, zero-build-step constraint (vanilla HTML + CSS + JS, static hosting).
5. Load fast: the hero state (full campus visible) should hit LCP in under 2.5s on a 4G connection.
6. Degrade gracefully on mobile and for reduced-motion preferences.

## Non-goals

- Real-time 3D rendering or WebGL.
- User-controlled free camera rotation (orbit controls, drag-to-rotate).
- Animations on the 3D image itself (no moving parts within the render).
- Dark mode toggle (dark background is inherent to the campus render's aesthetic).

---

## The Campus Map

### Buildings and section mapping

| # | Building | Visual description | Portfolio section | Content |
|---|---|---|---|---|
| 1 | **The Gateway** | Entrance canopy with two dark signage pylons, sweeping concrete arch | Hero / Intro | Name, title, tagline, two CTAs (View Work, Contact), stats strip |
| 2 | **The Studio** | 3-4 story glass-fronted mid-rise, transparent facade | About / What I Do | Pitch paragraph, years of experience, apps shipped, industries, skill-category badges |
| 3 | **The Showcase Hall** | Long, low building with saw-tooth roofline, large display windows | Selected Projects | Project cards with thumbnails, descriptions, tech stacks, links |
| 4 | **The Tower** | 7-8 story modern corporate tower, blue LED strip on corner edge | Work History | Timeline of roles: company, title, dates, responsibilities, tech tags |
| 5 | **The Lab** | Compact industrial building with exposed steel, rooftop antennas/dishes | Skills & Technologies | Languages, frameworks, mobile/web, cloud/AI, databases grids |
| 6 | **The Pavilion** | Open-air roofed structure by the water, no walls, bench seating | Contact | Heading, subtext, email, LinkedIn, GitHub, resume download, availability status |

### Center statue: "The Builder"

A small figurine of a person sitting at a desk working on a laptop, placed on a circular platform in the central courtyard. The laptop screen glows cobalt blue. This figure is always visible (or partially visible) across most scroll positions, grounding the campus with a human presence. A subtle CSS radial-gradient overlay positioned over the laptop creates a soft pulsing glow animation.

### Campus environment

The island platform has organic irregular edges with visible geological cross-section layers (soil, rock, dark stone) at the carved edges, falling into a pure black background. The grounds include: a winding water channel with a wooden footbridge, curved concrete walking paths, dense clusters of low-poly geometric trees around the perimeter, manicured garden beds, and a gravel courtyard in the center.

---

## Visual System

### Color palette

This redesign moves to a **dark theme** (inherent to the campus render sitting on black), which is a departure from the current light-only constraint. The dark background is not a "dark mode toggle" but the singular aesthetic of this design.

| Token | Value | Role |
|---|---|---|
| Void | `#000000` | Page background, matches the render's black surroundings |
| Bone | `#f2f0ea` | Card backgrounds, primary text on dark surfaces |
| Ink | `#14140f` | Text on light cards, card borders |
| Cobalt | `#2440e0` | Accent: CTA buttons, active nav, building highlights, statue laptop glow |
| Dim | `#8a8880` | Secondary text, muted labels (lightened from `#5c5a52` for dark-bg contrast) |
| Glass | `rgba(242, 240, 234, 0.06)` | Frosted card variant for overlays that sit on the image |

### Typography

Unchanged from Swiss Brutalist:
- **Headings:** Inter Tight, 800/900 weight, uppercase, tight tracking
- **Body:** Inter, 400/500
- **Labels/eyebrows:** JetBrains Mono, 400, uppercase, letter-spaced
- Fluid sizing via `clamp()` as before

### Cards

Content is presented in floating cards that animate in from screen edges. Two card styles:

1. **Solid card:** Bone background, ink text, 1px ink border, subtle box-shadow. Used for primary content (project details, role descriptions, contact info).
2. **Glass card:** Semi-transparent (`Glass` token), backdrop-filter blur, bone text. Used for lightweight overlays (stats strip, section labels, nav indicators).

All cards use consistent padding (`clamp(1.5rem, 3vw, 2.5rem)`), border-radius of 2px (keeping the brutalist sharpness), and `max-width` constraints so they never obscure more than ~40% of the viewport width.

---

## Scroll Choreography

The page height is set to **800vh** (8 viewport-heights), creating 7 scroll "zones." The campus image is `position: fixed` and fills the viewport at all times. CSS `transform: scale() translate()` values are interpolated based on scroll progress.

### Scroll zones

| Zone | Scroll range | Camera state | Cards | Card entry direction |
|---|---|---|---|---|
| **Hero** | 0 - 100vh | Full campus, centered, scale 1.0 | Name/title overlay (bottom-left), stats strip (bottom-right) | Fade in |
| **About** | 100 - 200vh | Zoom to Studio (left), scale ~2.5x | "01 - About" eyebrow + pitch paragraph + stat counters | Slide from left |
| **Projects** | 200 - 400vh | Zoom to Showcase Hall (center-left), scale ~2.2x | Project cards (2-3 visible at a time, scrollable within zone) | Slide from right |
| **Work History** | 400 - 550vh | Zoom to Tower (right), scale ~2.8x | Role cards stacked vertically | Slide from top |
| **Skills** | 550 - 650vh | Zoom to Lab (far right), scale ~2.5x | Technology grid as badge groups | Slide from right |
| **Contact** | 650 - 750vh | Zoom to Pavilion (bottom-right, by water), scale ~2.5x | Contact card with links and availability | Slide from bottom |
| **Outro** | 750 - 800vh | Zoom out to full campus, scale 1.0 | Footer overlay with copyright, social links | Fade in |

### Camera keyframes

Each building's "focus frame" is defined as a transform target:

```
const cameraKeyframes = [
  { id: 'hero',     scale: 1.0, x: 0,    y: 0     },
  { id: 'about',    scale: 2.5, x: 25,   y: 15    },  // Studio, left-center
  { id: 'projects', scale: 2.2, x: 10,   y: -5    },  // Showcase Hall
  { id: 'history',  scale: 2.8, x: -25,  y: -10   },  // Tower, right side
  { id: 'skills',   scale: 2.5, x: -35,  y: 5     },  // Lab, far right
  { id: 'contact',  scale: 2.5, x: -20,  y: -25   },  // Pavilion, bottom-right
  { id: 'outro',    scale: 1.0, x: 0,    y: 0     },  // Back to full view
];
```

x/y values are percentages. Positive x = pan left (showing right side), negative x = pan right. These values are estimates and will need tuning against the actual image once placed at full resolution.

### Transition easing

Between zones, the scale briefly dips (pull-back "breathing" effect) before zooming into the next building. For example, going from About (2.5x) to Projects (2.2x), the scale path is: 2.5 -> 1.8 -> 2.2 over the transition range. This prevents the camera from feeling like a flat slide and sells the illusion of a real camera move. Implemented as a custom cubic-bezier or a two-phase lerp.

### Building highlight system (image-swap approach)

Instead of transparent PNG overlays, we have **7 full-campus renders**: one base (no highlights) and six variants where each building individually glows cyan/cobalt. All seven images are the same camera angle, resolution, and framing — only the lighting on the active building changes.

**How it works:** All seven images are stacked in the same container using `position: absolute`, all receiving the same CSS `transform` (scale + translate) so they move as one. Only the active image has `opacity: 1`; all others are `opacity: 0`. Crossfading between them is a simple CSS transition (`opacity 400ms ease`).

**The image stack (bottom to top):**

| Layer | File | Visible when |
|---|---|---|
| Base | `full_world.jpg` | Hero (zone 0) and Outro (zone 6) — no building highlighted |
| 1 | `gateway.jpg` | Hero transition / not used in current scroll flow (Gateway is the hero itself) |
| 2 | `studio.jpg` | About zone active — Studio building glows |
| 3 | `showcase_hall.jpg` | Projects zone active — Showcase Hall glows |
| 4 | `tower.jpg` | Work History zone active — Tower glows |
| 5 | `lab.jpg` | Skills zone active — Lab glows |
| 6 | `pavilion.jpg` | Contact zone active — Pavilion glows |

**Crossfade choreography:** As the user scrolls from one zone to the next, the outgoing building's image fades to 0 and the incoming building's image fades to 1, with the base image always at opacity 1 underneath as the fallback. This creates a smooth "light turns on" effect on the next building while the previous one dims. During the transition between two zones (the "breathing" pull-back), both building images can briefly be at partial opacity, creating a subtle handoff glow.

**Preloading:** All seven images are preloaded via `<link rel="preload">` or loaded eagerly with `loading="eager"` since they're all needed for the scroll interaction. The base image loads first (LCP), and the six highlight variants load in the background immediately after. Since all images are the same scene with minor lighting differences, browser caching and similar-content compression will help keep effective transfer size down.

**Advantages over transparent PNG overlays:**
- No manual masking/tracing work needed — the AI-generated highlight images are ready to use as-is.
- The glow effect is baked into the render with proper lighting, reflections, and color bleed — it looks far more realistic than a CSS glow overlay ever could.
- Simpler code: just toggle opacity on image elements, no need to position overlay sprites or keep them in sync with transforms.

---

## Navigation

### Desktop nav bar

Fixed top bar, transparent background with a subtle backdrop-filter blur when scrolled. Contents:

- **Left:** `DKG // full-stack` wordmark (same as current)
- **Center:** Section links: `01 ABOUT` `02 PROJECTS` `03 EXPERIENCE` `04 CONTACT` (clicking jumps to the corresponding scroll position)
- **Right:** `Get In Touch` CTA button (cobalt solid)

The active section is indicated by the link text turning cobalt. The nav also shows a thin scroll progress bar at the very top (1-2px, cobalt, full-width).

### Section indicator (right edge)

A vertical stack of numbered dots on the right edge of the viewport (similar to the Skolkovo reference's `01 / 02 / 03` sidebar). The active section's dot is filled cobalt, others are outlined. Clicking a dot jumps to that section. Visible on desktop only.

### Mobile nav

Hamburger menu at top-right. Opens a full-screen overlay with section links. No section indicator dots on mobile.

---

## Content Sections (Detail)

### Hero (Zone 0)

Full campus visible. Overlaid content:

- **Bottom-left:** Name block
  - Eyebrow: `AI-NATIVE FULL-STACK ENGINEER . COLOMBO, SL` (JetBrains Mono, Glass card)
  - Name: `DON KASUN / GALLAGE` (Inter Tight, very large, bone color, no card background, directly on the dark image)
  - Pitch: "I take product ideas and build them. Mobile, web, whatever it takes. Seven years of it, mostly with founders, startups and engineering teams." (Inter, bone, max-width ~500px)
  - CTAs: `View Work` (cobalt solid button) + `Contact` (bone outlined button)
- **Bottom-right:** Stats strip in a Glass card
  - `7+ YEARS EXPERIENCE` | `20+ PROJECTS SHIPPED` | `4 CONTINENTS`

### About (Zone 1)

Camera zoomed to the Studio. Card from left:

- Eyebrow: `01 - ABOUT`
- Heading: `WHAT I DO AND WHY`
- Body: Full "About" copy (preserved from current site)
- Sub-cards or inline badges for: Years of shipping, apps/sites shipped, industries, skill categories (Languages, Mobile & Web, Cloud & AI, Databases) with individual tech badges
- Card max-width: ~500px, solid bone background

### Selected Projects (Zone 2)

Camera zoomed to the Showcase Hall. This zone spans 200vh to allow scrolling through multiple projects. Cards enter from the right, one project at a time, swapping on sub-scroll within the zone.

Each project card contains:
- Project thumbnail (small, top of card or left-aligned)
- Project name (Inter Tight heading)
- Description paragraph
- Tech stack badges
- Links: `Live` / `Case Study` / `GitHub` (where applicable)

Projects cycle as the user scrolls through the 200vh zone. A subtle indicator (dots or "2/5" counter) shows progress through the project list.

### Work History (Zone 3)

Camera zoomed to the Tower. Role cards slide in from the top, stacking downward.

Each role card contains:
- Date range (JetBrains Mono, e.g., `Jan 2023 - Dec 2024`)
- Job title (Inter Tight, bold)
- Company name (cobalt link)
- Location
- Bullet points of key work
- Tech tags as small outlined badges

If multiple roles exist, they stack with slight vertical offset, creating a visual "floor" metaphor matching the tower's stories.

### Skills & Technologies (Zone 4)

Camera zoomed to the Lab. Technology grid slides in from the right as a single large card or cluster of smaller cards.

Organized by category:
- Languages
- Mobile & Web
- Cloud & AI
- Databases
- Clients & Employers

Each category has a heading and a row of outlined badge pills. Same content and grouping as the current site.

### Contact (Zone 5)

Camera zoomed to the Pavilion by the water. Contact card slides up from the bottom.

- Eyebrow: `04 - GET IN TOUCH`
- Heading: `LET'S BUILD SOMETHING GOOD.`
- Subtext: "Got a real project or just a rough idea you want to talk through? Email is the quickest way to reach me, and I usually reply within a day."
- Contact rows: Email, LinkedIn, GitHub, Resume (each as a row with icon, label, value, arrow)
- Sign-off: `- DK / Colombo, SL . GMT+5:30 . Remote-friendly`
- Status bar: `STATUS: Open to new work` | `CONTRACT / FULL-TIME / REMOTE`

### Outro / Footer (Zone 6)

Camera zooms back out to full campus. A minimal footer fades in at the bottom:
- `(c) 2026 Don Kasun Gallage . Open to new work`
- Social links: GitHub, LinkedIn, Email

---

## Image Assets

### Available (already generated)

Source originals live in `3D asset/` (local, currently untracked). All images are AI-generated renders from the same scene and camera angle (2400×1792). The base shows no highlights; each variant has one building glowing cyan/cobalt with light bleed onto surrounding terrain.

| Source file | Deployed name | Content | Status |
|---|---|---|---|
| `3D asset/full world 1.jpeg` | `full_world` | Base campus, no highlights, warm ambient lighting | Ready |
| `3D asset/gateway.jpeg` | `gateway` | Gateway entrance glowing cyan, signage pylons lit up | Ready |
| `3D asset/studio.jpeg` | `studio` | Studio (glass building) glowing cyan | Ready |
| `3D asset/showcase_hall.jpeg` | `showcase_hall` | Showcase Hall glowing cyan | Ready |
| `3D asset/tower.jpeg` | `tower` | Tower glowing cyan | Ready |
| `3D asset/lab.jpeg` | `lab` | Lab glowing cyan | Ready |
| `3D asset/pavilion.jpeg` | `pavilion` | Pavilion glowing cyan | Ready |

### To be produced

| File | Format | Purpose | How |
|---|---|---|---|
| All 7 as `.webp` | WebP **with alpha**, ~1600px wide | Primary `<picture>` sources; void is transparent so CSS `--void` shows through | Corner flood-fill near-black void → alpha, then `cwebp -q 75 -alpha_q 90` (do **not** global color-key; that eats dark rock/soil) |
| All 7 as optimized `.jpg` | Opaque JPEG, same dimensions, quality ~72 | Fallback for browsers without WebP (black void intact, matches page bg) | `magick` resize from originals |
| `placeholder.jpg` | JPEG, ~40px wide, heavily blurred | Inline base64 blur-up placeholder for initial load | Downscale + gaussian blur the opaque base |
| `mobile-hero.jpg` | JPEG, cropped center, ~800px wide | Static hero banner for mobile layout | Crop from opaque base focusing on statue / courtyard |
| `og-share.jpg` | JPEG, 1200×630 | Open Graph / social share image | Crop/letterbox the opaque base |

**Why transparency:** Zoom/pan and non-cover viewports can reveal the frame around the island. Shipping opaque black in the bitmap risks seams against CSS. Transparent WebP lets `#campus-stage { background: var(--void) }` fill the surroundings cleanly. PNG-with-alpha is **not** used in the deploy set (~2MB/file); WebP alpha stays under budget.

### Image optimization targets

| Metric | Target |
|---|---|
| Each WebP file (with alpha) | < 150KB |
| Each JPEG fallback | < 250KB |
| Placeholder | < 3KB (inline base64) |
| Total image payload (all 7 WebP) | < 1MB |

---

## Mobile Strategy (below 768px)

The zoom/pan scroll interaction is **not used on mobile**. Instead:

1. **Hero:** Full campus image displayed as a static banner (aspect-ratio preserved, `object-fit: cover`, ~50vh tall) with the name/title/CTA overlaid.
2. **Sections below:** Stack vertically on a dark (`Void`) background. Each section gets:
   - A small cropped detail image of its corresponding building as a section header (~200px tall, full-width, slight parallax optional)
   - Standard card-based content layout below it
3. **Navigation:** Hamburger menu, no section indicator dots.

---

## Reduced Motion

When `prefers-reduced-motion: reduce` is active:

- The campus image stays at full-view (scale 1.0) at all times, no zoom/pan.
- Content cards appear instantly (no slide animations), stacked below the fixed campus image.
- Statue laptop glow does not pulse.
- Essentially becomes a static dark-themed portfolio with the campus as a persistent header.

---

## Performance Budget

| Metric | Target |
|---|---|
| LCP | < 2.5s on 4G (hero state: base campus image + name overlay) |
| Base campus image | < 150KB (WebP with alpha), < 250KB (JPEG fallback) |
| Each highlight variant | < 150KB (WebP with alpha), < 250KB (JPEG fallback) |
| All 7 images total | < 1MB (WebP) |
| JS bundle | < 15KB (scroll controller + card choreography, no libraries) |
| Total page weight | < 1.5MB first load |

**Loading strategy:** The base image (`full_world`) is the LCP element and loads first via a `<link rel="preload" as="image">` in `<head>`. A tiny blurred placeholder (base64-inlined, < 3KB) is shown instantly and crossfaded to the full image on load. The six highlight variants are preloaded with lower priority (`fetchpriority="low"`) or lazy-loaded just ahead of when they're needed.

---

## File Structure (Proposed)

```
index.html              All markup and content
styles.css              All styling (custom properties, clamp() fluid type)
campus.js               Scroll controller, camera keyframes, image crossfade, card choreography
main.js                 Cursor, progress bar, mobile nav (stripped of particles / experience arc)

images/
  campus/
    full_world.webp
    full_world.jpg
    gateway.webp / .jpg
    studio.webp / .jpg
    showcase_hall.webp / .jpg
    tower.webp / .jpg
    lab.webp / .jpg
    pavilion.webp / .jpg
    placeholder.jpg
    mobile-hero.jpg
    og-share.jpg

docs/
  superpowers/
    specs/
      2026-07-23-campus-portfolio-redesign-design.md
    plans/
      2026-07-23-campus-portfolio-redesign.md
```

**Files removed** from the Swiss Brutalist version: `hero3d.js`, `vendor/three.module.min.js`, particle canvas code from `main.js`. The custom cursor and scroll progress bar may be retained.

**Source originals** stay in local `3D asset/` (not deployed). Optimized outputs live under `images/campus/`.

---

## Implementation Phases

### Phase 1: Image preparation and foundation
### Phase 2: Camera and crossfade
### Phase 3: Card choreography
### Phase 4: Navigation
### Phase 5: Mobile and accessibility
### Phase 6: Polish and launch

(See implementation plan for task-level detail.)

---

## Open Questions (resolved defaults for implementation)

1. **Project thumbnails:** Keep existing screenshots (`images/golazo.webp`, `images/byobsl.webp`, CSS visual for PDF Intelligence). Revisit later if dark-matched assets are needed.
2. **Resume PDF:** Keep current `docs/Don-Kasun-Gallage-Resume.pdf` unchanged.
3. **Custom cursor:** Keep the cobalt cursor on dark background.
4. **Scroll feel:** Tune zone heights carefully; ship a skip-to-content link that jumps past the campus scrollytelling into stacked content / contact.
5. **Highlight glow color:** Option (c) — cyan for baked building glow, cobalt for UI accents.
6. **Gateway image:** Ship in the stack but unused in scroll flow initially; optional intro glow can be added during Phase 2 tuning if desired.
