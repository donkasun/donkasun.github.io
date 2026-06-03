# donkasun.github.io

Personal portfolio of **Don Kasun Gallage** — AI-native full-stack engineer.

🔗 **Live:** https://donkasun.github.io/

A single-page site built from scratch with no framework or build step — just hand-written HTML, CSS, and vanilla JavaScript.

## Highlights

- **Zero dependencies** — no bundler, no npm install, no build pipeline
- **Particle-network hero** rendered on `<canvas>`, paused when off-screen via `IntersectionObserver`
- **Scroll-driven parallax** and reveal animations, throttled with `requestAnimationFrame`
- **Fully respects `prefers-reduced-motion`** — all motion is disabled for users who opt out
- **SEO-ready** — canonical URL, Open Graph / Twitter cards, JSON-LD `Person` schema, sitemap, and robots.txt
- **Optimized assets** — imagery served as WebP

## Tech

| Layer | Details |
|-------|---------|
| Markup | Semantic HTML5 |
| Styling | Hand-written CSS (custom properties, `clamp()` fluid type) |
| Behavior | Vanilla JS (`IntersectionObserver`, Canvas API, `requestAnimationFrame`) |
| Hosting | GitHub Pages |

## Project structure

```
index.html      Markup and content
styles.css      All styling
main.js         Cursor, canvas, parallax, scroll reveal, nav
images/         WebP / SVG assets + social card
docs/           Résumé (PDF)
sitemap.xml     SEO sitemap
robots.txt      Crawler directives
```

## Run locally

No build step. Serve the folder with any static server:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Prototypes (local dev)

This repo is intentionally framework-free, but some isolated experiments live under `prototypes/`.

- `prototypes/card-reveal-test/`: React Three Fiber + Drei + GSAP ScrollTrigger hinge-fold prototype.
  - Run: `cd prototypes/card-reveal-test && pnpm install && pnpm dev`

## License

[MIT](LICENSE) © Don Kasun Gallage
