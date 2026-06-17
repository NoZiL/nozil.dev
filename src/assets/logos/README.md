# Company & school logos

Drop one logo file per company/school here, named after the content entry id
(role filename in `src/content/work/` without `.md`) or the school slug used in
`src/pages/work.astro`. `.svg`, `.jpg`/`.jpeg`, and `.png` are all supported.

| Entry                     | Logo file           |
| ------------------------- | ------------------- |
| `tennaxia.md`             | `tennaxia.jpg`      |
| `cnet.md`                 | `cnet.jpg`          |
| `cvdesignr.md`            | `cvdesignr.jpg`     |
| `hivebrite.md`            | `hivebrite.jpg`     |
| `welo.md`                 | `welo.jpg`          |
| `mobi2go.md`              | `mobi2go.jpg`       |
| Polytech Lyon (education) | `polytech-lyon.jpg` |
| IUT Lyon 1 (education)    | `iut-lyon-1.jpg`    |

`src/pages/work.astro` picks them up automatically via `import.meta.glob` and
serves fingerprinted, optimized URLs. Any entry without a matching file renders
a monogram fallback (e.g. `TE`, `C+`), so the page never shows a broken image.

Logos sit on a white rounded tile in both light and dark mode, so dark-on-transparent
marks stay legible. They're constrained to a 40×40 box with padding — square-ish art reads best.
