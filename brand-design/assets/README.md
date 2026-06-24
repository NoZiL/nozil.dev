# nozil.dev — brand assets

The **Z** mark (handle + family initial) with a cyan terminal caret, set in Geist Mono. Built on the repo palette.

## Colors

| Token       | Hex                   | Use                                 |
| ----------- | --------------------- | ----------------------------------- |
| accent      | `#7C3AED`             | favicon tile, `.dev`, mark (violet) |
| accent-dark | `#A78BFA`             | `.dev` on dark                      |
| spark       | `#22D3EE`             | the caret (constant)                |
| ink         | `#18181B`             | mark + wordmark on light            |
| white       | `#FFFFFF`             | mark + favicon glyph on dark        |
| dusk        | `#12082B` / `#1E0A40` | dark backgrounds                    |

Type: **Geist Mono 500** (embedded in `brand*.svg`, so they render with no external font).

## Files

### svg/ (vector — scale freely)

- `mark.svg` · `mark-dark.svg` · `mark-violet.svg` — the Z, transparent
- `favicon.svg` · `favicon-dark.svg` — rounded tile, white Z
- `apple-touch-icon.svg` — 180 tile
- `brand.svg` · `brand-dark.svg` — Z + `nozil.dev` lockup (font embedded)

### png/ (raster — transparent unless a tile)

- `mark-{256,512,1024}.png` (+ `-dark`, `-violet`) — transparent
- `mark-on-{violet,dusk,ink,white}-{512,1024}.png` — mark on solid background (avatars / app tiles)
- `favicon-{16,32,48,64,180}.png` (+ `-dark`)
- `apple-touch-icon-180.png`
- `brand-2x.png` `brand-4x.png` (+ `-dark`)

## Drop-in for the site

The repo references `/favicon.svg` once (in `BaseLayout.astro`). Replace:

```
public/favicon.svg  ←  assets/svg/favicon.svg
```

Optional, add to `<head>`:

```html
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

(copy `assets/png/apple-touch-icon-180.png` → `public/apple-touch-icon.png`)

## Clear space & don'ts

- Keep padding ≥ ½ the Z width on all sides.
- The caret stays cyan `#22D3EE`. The Z stays ink, white, or violet. Never stretch.
