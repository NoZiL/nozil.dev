# nozil.dev

Personal CV and portfolio for Nicolas Zilli — Lead Mobile Engineer · Freelance Dev · Lyon, France.
Deployed on Cloudflare Workers (static assets + server routes) at https://nozil.dev.

> Human-readable setup guide, prerequisites, and deployment notes: see [README.md](./README.md).

## Commands

```bash
pnpm dev          # dev server → http://localhost:4321
pnpm build        # astro check + type-check + production build
pnpm preview      # preview built Worker locally (wrangler dev, port 8788)
pnpm deploy       # deploy to Cloudflare Workers (wrangler deploy)
pnpm typecheck    # astro check + tsc --noEmit
pnpm lint         # eslint .
pnpm format       # prettier --write .
pnpm format:check # prettier --check . (used in CI)
pnpm test         # vitest run (unit tests)
pnpm e2e          # playwright test (against production build)
```

## Task tracking

GitHub Issues #2–#8 — one per feature PR, in implementation order.
GitHub Project board: https://github.com/users/NoZiL/projects/2

Astro 6.3.7 · Tailwind CSS 4 · TypeScript 6 · pnpm 11 via corepack · Cloudflare Workers

Full version table and rationale: @docs/tech-stack.md

## Source Layout

```
src/
├── components/     # PascalCase .astro files
├── layouts/        # BaseLayout.astro, PageLayout.astro
├── pages/          # file-based routes
│   ├── api/        # contact.ts → server route, prerender=false (POST only)
│   └── fr/         # French locale pages
├── content/        # typed MDX collections: work/, projects/
│   └── config.ts   # Zod 4 schemas for every collection
├── i18n/           # en.ts + fr.ts string maps
└── styles/
    └── global.css  # @import "tailwindcss" + @theme {} — no tailwind.config.js
```

## Hard Constraints

- **Cloudflare Workers** — `@astrojs/cloudflare` adapter; server logic runs in the Worker (needs `nodejs_compat`)
- **Output mode**: `static` (Astro 6 removed `hybrid`) — pages prerender by default; opt a route into server rendering with `export const prerender = false` (only `src/pages/api/contact.ts`)
- **No CMS** — all copy in `src/content/` as typed Markdown collections (`.md` files, not `.mdx` unless JSX is needed)
- **Tailwind v4** — CSS-first; never create `tailwind.config.js` or `tailwind.config.ts`
- **i18n** — English default (`/`), French at `/fr/`; use Astro built-in i18n routing

## Coding Conventions

- TypeScript strict mode — no `any`, no unexplained non-null assertions
- Component filenames: `PascalCase.astro`; page filenames: `kebab-case.astro`
- All color tokens and font definitions go in `@theme {}` inside `global.css` — not in JS/TS
- Email address must **never appear in static HTML** — assemble via JS reveal only
- Zero client-side JS on static pages; use Astro islands (`client:load` etc.) only where interactivity is required

## Security (public repo)

This repository is **public**. Never introduce any of the following into source files or docs:

- Real email addresses (personal inboxes, internal addresses) — use env var names as placeholders
- API keys, tokens, secrets of any kind — all go in the CF Workers dashboard / `wrangler secret put` or `.dev.vars` (gitignored)
- Client names, private project details, or any information shared under NDA

If writing code that needs a secret value, reference the env var (`context.env.EMAIL_TO`).
If writing docs that explain configuration, name the variable — never its value.

## Required Backlinks

Every page's nav and footer must link to:

- `https://github.com/nozil`
- `https://www.linkedin.com/in/nicolaszilli`
- Email address via JS reveal button (no `mailto:` in HTML — see contact-plan.md)

## Contacts

- `EMAIL_FROM` env var — sending address: `contact@nozil.dev`
- `EMAIL_TO` env var — destination inbox (set in CF Workers dashboard, never in repo)

## Docs loaded into context

@docs/tech-stack.md
@docs/ux-plan.md
@docs/contact-plan.md
@docs/cloudflare.md
@docs/quality-ci.md

## Reference docs (not auto-loaded)

- `docs/concept.md` — site vision, i18n plan, SEO/LLM discoverability
- `docs/bio.md` — bio copy, skills taxonomy, GitHub README sync strategy
- `docs/cv-plan.md` — work page data model, CV PDF export plan
- `docs/portfolio-plan.md` — project collection schema, showcase UX
