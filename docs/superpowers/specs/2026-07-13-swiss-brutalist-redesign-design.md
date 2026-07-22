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

**Light only.** (Correction 2026-07-13: the live site has no dark mode or theme toggle — earlier drafts assumed one. The redesign ships the light bone theme only; dark mode is a possible follow-up.) All existing `--teal`/orange CSS variables are remapped; no orange remains anywhere. Note: the accent changes from orange (dark text on accent) to cobalt (white text on accent) — `--on-accent` becomes white.

## Typography

- Headings/display: `Inter Tight` 800/900, uppercase, letter-spacing −0.03em, large scale, line-height ~0.95–1.05.
- Body: `Inter` (unchanged). Mono labels: `JetBrains Mono` (unchanged).
- Update the Google Fonts request to add Inter Tight and drop Oswald.

## Structure

- Numbered Swiss section headers in page order: `01 — ABOUT`, `02 — WORK`, `03 — EXPERIENCE`, `04 — CONTACT` (small mono/bold eyebrow) + oversized Inter Tight section title, strict grid alignment.
- Nav links pick up the same numbering.

## Hero (redesigned)

- Eyebrow line (`01 — AI-NATIVE FULL-STACK ENGINEER · COLOMBO, SL`).
- Massive two-line name in Inter Tight 900 uppercase.
- Existing one-paragraph pitch (copy unchanged).
- Two buttons: cobalt solid primary (`VIEW WORK ↗`), outlined secondary (`CONTACT`).
- Slim stats strip (7+ years, projects count) — replaces current stat blocks.
- Removed from hero: profile photo, floating browser/app screenshots. App screenshots appear only within their project cards in Projects.

**Correction (2026-07-21):** The profile photo was initially moved to About per the original plan, but was later removed from About too — the site now ships with no profile photo anywhere.
- Particle canvas + orbs stay, recolored to palette and reduced opacity — background texture, not a feature.

## Other sections

Full restyle pass in the same language over Projects, About, Experience, Contact:
- Same content and copy — **no content rewrites**, no sections added/removed.
- Cards/buttons/badges keep brutalist borders + offset shadows, recolored ink/cobalt.
- Custom cursor, scroll progress bar, scroll-in animations kept and recolored.

## Constraints

- No new dependencies beyond the Inter Tight font family (same Google Fonts mechanism already in use).
- Plain HTML/CSS/JS — no build step introduced.
- Light theme only (see Palette correction above).
- Responsive: verify at mobile and desktop widths.
- Preserve SEO/meta/OG tags; regenerate the OG card image only if trivial, otherwise leave for a follow-up.

## Verification

Visual: open the site locally, check hero + all four sections at mobile (~390px) and desktop (~1440px) widths; confirm no orange/Oswald remnants (grep for `Oswald`, `f96328`, `f1e7da`, `249,99,40`).

## Status (as of 2026-07-21)

**Done:**
- Palette fully swapped to bone/ink/cobalt; no orange (`f96328`, `f1e7da`) or `Oswald` remnants remain (verified by grep).
- Inter Tight (800/900) added via Google Fonts alongside Inter and JetBrains Mono; Oswald dropped.
- Swiss numbered section headers shipped in page order: `01 — About`, `02 — Selected Work`, `03 — Work History`, `04 — Get In Touch`.
- Hero rebuilt as a typographic statement: eyebrow, large Inter Tight headline, pitch copy, two CTA buttons — no photo, no floating screenshots.
- Particle canvas, custom cursor, and scroll progress bar all present and recolored to the cobalt palette.
- Light-only theme confirmed — no `data-theme`/`prefers-color-scheme` wiring in HTML/CSS/JS.
- Profile photo was moved to About per the original plan, then later removed from About entirely (see correction above) — site currently ships with no profile photo anywhere. This is a deviation from the original spec, not yet reconciled back into the written plan beyond this note.

**Left / unverified:**
- No responsive check recorded yet at the spec's target widths (~390px mobile, ~1440px desktop) — visual verification step hasn't been explicitly run/logged.
- OG/meta image regeneration was left as "follow-up if non-trivial" — not yet revisited.
- Two undocumented refinements shipped outside this spec's scope: removal of the Experience section's "now working at" company/logo indicator (`xt-now`), and a density pass on the context-row list (smaller type, tighter gaps). Spec doesn't cover either; worth folding in or leaving as acknowledged scope creep.
