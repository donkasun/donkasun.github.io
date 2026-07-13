# Swiss Brutalist Redesign — Design Spec

**Date:** 2026-07-13
**Repo:** donkasun/donkasun.github.io (plain HTML/CSS/JS, no framework)
**Branch:** `redesign/swiss-brutalist`
**Goal:** Make the portfolio look more professional and more creative, befitting a senior developer, while keeping the site's neo-brutalist identity.

## Decisions (made interactively with visual mockups)

1. **Direction:** Keep the neo-brutalist identity (hard borders, offset solid shadows, flat surfaces) but discipline it with Swiss typography and structure.
2. **Display font:** Inter Tight (Google Fonts, weights 800/900). Body stays Inter; small labels/eyebrows stay JetBrains Mono. **Oswald is removed.**
3. **Structure:** Swiss numbered sections across the site.
4. **Hero:** Typographic statement (no photo, no floating screenshots).
5. **Palette:** Bone + Cobalt (replaces cream + orange).
6. **Scope:** Full restyle — every section.
7. **Flourishes kept:** custom cursor, scroll progress bar, particle canvas + orbs (toned down), scroll-in animations — all recolored.

## Palette

Light (primary) theme:

| Token | Value | Role |
|---|---|---|
| Background | `#f2f0ea` | bone |
| Text / borders / shadows | `#14140f` | ink |
| Accent | `#2440e0` | cobalt — buttons, links, selection, badges, cursor, progress bar |
| Dim text | `#5c5a52` | secondary copy |

Dark theme is derived: near-black background (e.g. `#101012`), bone text, cobalt brightened enough to pass contrast on dark (tune visually, roughly `#5c73ff` range). All existing `--teal`/orange CSS variables are remapped; no orange remains anywhere.

## Typography

- Headings/display: `Inter Tight` 800/900, uppercase, letter-spacing −0.03em, large scale, line-height ~0.95–1.05.
- Body: `Inter` (unchanged). Mono labels: `JetBrains Mono` (unchanged).
- Update the Google Fonts request to add Inter Tight and drop Oswald.

## Structure

- Numbered Swiss section headers: `01 — WORK`, `02 — ABOUT`, `03 — EXPERIENCE`, `04 — CONTACT` (small mono/bold eyebrow) + oversized Inter Tight section title, strict grid alignment.
- Nav links pick up the same numbering.

## Hero (redesigned)

- Eyebrow line (`01 — AI-NATIVE FULL-STACK ENGINEER · COLOMBO, SL`).
- Massive two-line name in Inter Tight 900 uppercase.
- Existing one-paragraph pitch (copy unchanged).
- Two buttons: cobalt solid primary (`VIEW WORK ↗`), outlined secondary (`CONTACT`).
- Slim stats strip (7+ years, projects count) — replaces current stat blocks.
- Removed from hero: profile photo, floating browser/app screenshots. Profile photo moves to About; app screenshots appear only within their project cards in Projects.
- Particle canvas + orbs stay, recolored to palette and reduced opacity — background texture, not a feature.

## Other sections

Full restyle pass in the same language over Projects, About, Experience, Contact:
- Same content and copy — **no content rewrites**, no sections added/removed.
- Cards/buttons/badges keep brutalist borders + offset shadows, recolored ink/cobalt.
- Custom cursor, scroll progress bar, scroll-in animations kept and recolored.

## Constraints

- No new dependencies beyond the Inter Tight font family (same Google Fonts mechanism already in use).
- Plain HTML/CSS/JS — no build step introduced.
- Both themes (light/dark toggle) must work; light bone theme is primary.
- Responsive: verify at mobile and desktop widths.
- Preserve SEO/meta/OG tags; regenerate the OG card image only if trivial, otherwise leave for a follow-up.

## Verification

Visual: open the site locally, check hero + all four sections in both themes at mobile (~390px) and desktop (~1440px) widths; confirm no orange/Oswald remnants (grep for `Oswald`, `f96328`, `f1e7da`).
