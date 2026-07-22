# Hero 3D Grid — Design

**Date:** 2026-07-22
**Branch:** redesign/swiss-brutalist

## Problem

On wide viewports the hero is a single left-aligned column inside a 1440px
container (`styles.css:215`). The right half is empty, and the section reads as
static. The existing 2D particle canvas and blur orbs sit too far back to carry
the composition.

## Goal

Fill the right half of the hero with a moving object that belongs to the Swiss
/ brutalist language of this branch: visible structure, flat planes, no glow, no
lighting, no showreel gloss.

## Non-goals

- No new hero copy, stats, or project content. This is compositional only.
- No effect on viewports below 1100px.
- No post-processing, textures, models, or asset loading.

## Layout

`#hero` becomes a two-column grid above 1100px:

- content column and visual column share the row, weighted so the headline stays
  dominant (`1.1fr / .9fr`)
- below 1100px the grid collapses to the current single column and the 3D canvas
  is **removed entirely**, not scaled down

The existing `#heroCanvas` particle field and the three `.orb` elements remain a
full-bleed background. The 3D canvas is a separate element scoped to the right
cell, stacked above the particles and below `.hero-inner` (which holds
`z-index:2`).

## The object

A `PlaneGeometry(w, h, 80, 80)` drawn as a wireframe, oriented **flat like a
floor**: rotated roughly -55° on X so it recedes into the distance, with a slight
Z rotation to break the symmetry. The headline sits above it in the composition.

A vertex shader displaces each vertex along the plane normal using summed sine
waves driven by a time uniform. A second uniform carries the normalized cursor
position; vertices within a falloff radius receive additional displacement, so
the grid dents and trails under the pointer. The cursor uniform is lerped toward
the true pointer each frame so motion glides rather than snapping.

Lines are drawn in the cobalt accent `--teal-rgb` (36,64,224). Note that
`--blue` in this codebase is `--color-dark`, not the accent. Line opacity falls
off toward the far edge of the plane so the grid dissolves into the background
instead of terminating on a hard rectangular border.

The entire scene is one geometry and one `ShaderMaterial`. No lights, no
materials beyond that, no render targets.

## Loading

`three.module.js` is **vendored into the repo** (`vendor/three.module.js`) so the
site stays self-contained and offline-capable with no third-party runtime
dependency.

The module is dynamically imported after `window.load`, so it never blocks LCP.
`WebGLRenderer` is created with `antialias: true` and device pixel ratio capped
at 2, matching the existing `resize()` in `main.js:43`.

## Failure and degradation

- WebGL context creation fails → the import result is discarded and the hero
  renders exactly as it does today.
- `prefers-reduced-motion: reduce` → the module is never imported and the hero
  grid reverts to a single column, so no empty cell is left behind. This extends
  the existing reduced-motion block at `styles.css:1216`.
- Viewport below 1100px → module never imported.

## Performance

- `requestAnimationFrame` is paused via `IntersectionObserver` when the hero
  leaves the viewport.
- Resize is debounced and passive, consistent with `main.js:50`.
- One draw call, no textures, no per-frame allocation.

## Files

| File | Change |
| --- | --- |
| `vendor/three.module.js` | new, vendored library |
| `hero3d.js` | new: scene, shader, lifecycle, cursor handling |
| `index.html` | one canvas element in the hero, one module script tag |
| `styles.css` | hero two-column grid, canvas positioning, breakpoint and reduced-motion rules |

`main.js` is left alone; it already carries the rest of the site.
