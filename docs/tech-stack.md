# Tech Stack

## Decision: Astro over Next.js

### Why Astro

| Concern                   | Astro                                                       | Next.js (current)                     |
| ------------------------- | ----------------------------------------------------------- | ------------------------------------- |
| JS shipped to browser     | Zero by default (opt-in islands)                            | React runtime always present          |
| Static content (CV, bio)  | First-class — just `.astro` or `.md`                        | Needs SSG config                      |
| Content collections       | Built-in typed collections                                  | Manual MDX setup                      |
| Build output for CF Pages | `@astrojs/cloudflare` adapter                               | `@cloudflare/next-on-pages` (heavier) |
| CF Pages Functions        | Native via `src/pages/api/*.ts`                             | Via pages-plugin wrapper              |
| Bundle size               | ~0kb for static pages                                       | React + Next runtime overhead         |
| Tailwind integration      | `@tailwindcss/vite` — native Vite plugin, no wrapper needed | Same                                  |

### Why not Next.js

The existing site is essentially a static single page. Next.js adds runtime overhead
(React 18 + Next runtime) for no gain on a CV/portfolio site with one dynamic feature (contact form).
The `@cloudflare/next-on-pages` adapter also requires routing workarounds that Astro avoids natively.

### Considered: Remix, SvelteKit

Remix: great for forms but overkill for content-heavy static site.
SvelteKit: excellent alternative if React familiarity is less important. Deferred for now.

## Stack

Pinned to verified npm latest as of 2026-05-22. Run `pnpm outdated` to check for bumps.

```
Node.js 24 LTS
pnpm 11.2.2          # managed via corepack (packageManager field in package.json)

astro 6.3.7
├── @astrojs/cloudflare 13.5.4   # CF Workers adapter (output: 'static', server routes opt-in)
├── @astrojs/sitemap 3.7.2       # auto sitemap + hreflang
├── astro:content                # typed content collections (built-in)
└── astro:assets                 # optimised images + <Image> (built-in)

@tailwindcss/vite 4.3.0         # CSS-first, replaces @astrojs/tailwind
@tailwindcss/typography 0.5.19  # prose plugin
(no @tailwindcss/forms — use native CSS + minimal custom styles instead)

typescript 6.0.3
zod 4.4.3                       # content schemas + form validation (note: v4 API)

wrangler 4.95.0                 # CLI for CF Workers local dev + deploy (bumped to satisfy @cloudflare/vite-plugin peer)
resend 6.12.3                   # transactional email — form → inbox, no storage layer
```

### pnpm via corepack

Do **not** `npm install -g pnpm`. Use corepack — it reads `packageManager` from `package.json`:

```json
// package.json
{
  "packageManager": "pnpm@11.2.2"
}
```

```bash
corepack enable   # once, enables corepack shims
pnpm install      # corepack activates the right pnpm version automatically
```

### Tailwind v4 in Astro 6 — key differences

`@astrojs/tailwind` is **deprecated** in Tailwind v4. Use `@tailwindcss/vite` directly:

```js
// astro.config.mjs
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import cloudflare from '@astrojs/cloudflare'

export default defineConfig({
  output: 'static',
  adapter: cloudflare(),
  vite: { plugins: [tailwindcss()] },
})
```

```css
/* src/styles/global.css */
@import 'tailwindcss';
@plugin "@tailwindcss/typography";

/* Design tokens — replaces tailwind.config.js theme.extend */
@theme {
  --color-accent: var(--color-violet-600);
  --font-sans: 'Geist', sans-serif;
  --font-mono: 'Geist Mono', monospace;
}
```

## Content Strategy

All copy lives in `src/content/` as typed Markdown/MDX collections:

```
src/content/
├── config.ts          # Zod schemas for each collection
├── work/              # one .md per job/role
├── projects/          # one .md per portfolio project
└── skills/            # skills data (could be YAML)
```

This means the CV page and a future PDF export share the same data source.

## CV PDF Export

Options (in order of preference):

1. **Build-time PDF with `astro-pdf`** — generates `/cv.pdf` as part of `astro build`.
   Single source of truth, no sync issue.
2. **Puppeteer in CF Pages build hook** — snapshot the `/work` page to PDF.
3. **Google Drive link** (current approach) — simplest but out of sync risk.

Recommendation: option 1. Implement once the `/work` page content is finalised.

## Deployment

Cloudflare Workers (static assets + server routes). See `docs/cloudflare.md`.

- Branch `main` → production (nozil.dev)
- Workers service `nozil-dev` (fresh — not inherited from old site)
- `compatibility_flags = ["nodejs_compat"]`
- `compatibility_date = "2026-06-01"`
