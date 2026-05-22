# nozil.dev

Personal CV and portfolio for [Nicolas Zilli](https://www.linkedin.com/in/nicolaszilli) — Lead Mobile Engineer · Freelance Software Developer · Lyon, France.

**Live site**: [nozil.dev](https://nozil.dev)

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Astro 6](https://astro.build) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) (CSS-first, no config file) |
| Language | TypeScript 6 (strict) |
| Package manager | pnpm 11 via [corepack](https://nodejs.org/api/corepack.html) |
| Deployment | [Cloudflare Pages](https://pages.cloudflare.com) |
| Email | [Resend](https://resend.com) |

---

## Prerequisites

- **Node.js 24 LTS** — [nodejs.org](https://nodejs.org)
- **corepack** — ships with Node.js, manages pnpm automatically

```bash
corepack enable   # once — activates pnpm shim
```

---

## Quick start

```bash
git clone https://github.com/nozil/nozil.dev
cd nozil.dev
pnpm install
pnpm dev          # → http://localhost:4321
```

---

## Commands

```bash
pnpm dev          # local dev server (Astro, port 4321)
pnpm build        # type-check + production build → dist/
pnpm preview      # preview CF Pages output locally (wrangler, port 8788)
pnpm deploy       # deploy to Cloudflare Pages
pnpm typecheck    # astro check + tsc --noEmit
pnpm lint         # eslint .
pnpm format       # prettier --write .
pnpm format:check # prettier --check . (CI)
pnpm test         # vitest run (unit tests)
pnpm e2e          # playwright test (against production build)
```

---

## Project structure

```
src/
├── components/     # UI components — PascalCase.astro
├── layouts/        # BaseLayout.astro, PageLayout.astro
├── pages/          # file-based routes
│   ├── api/        # contact.ts — Cloudflare Pages Function (POST)
│   └── fr/         # French locale (/fr/*)
├── content/        # typed MDX collections: work/, projects/
│   └── config.ts   # Zod schemas
├── i18n/           # en.ts + fr.ts string maps
└── styles/
    └── global.css  # @import "tailwindcss" + @theme tokens
```

---

## Environment variables

Set in Cloudflare Pages dashboard → Settings → Environment variables.
Never committed to the repo.

| Variable | Example value | Purpose |
|----------|--------------|---------|
| `RESEND_API_KEY` | `re_…` | Resend API key for contact form email delivery |
| `EMAIL_FROM` | `contact@nozil.dev` | Sending address (must be verified in Resend) |
| `EMAIL_TO` | _(set in dashboard)_ | Destination inbox |

For local development with `pnpm preview`, create a `.dev.vars` file (gitignored):

```
RESEND_API_KEY=re_…
EMAIL_FROM=contact@nozil.dev
EMAIL_TO=your-inbox@example.com
```

---

## Deployment

Cloudflare Pages is connected to this GitHub repo and deploys automatically:

- `main` → production ([nozil.dev](https://nozil.dev))
- Any other branch / open PR → preview (`<branch>.nozil-dev.pages.dev`)

No manual deploy step is required. GitHub Actions runs the quality gate (lint, type-check, build, Playwright e2e) before changes can merge to `main`.

---

## AI assistant context

This repo uses [Claude Code](https://claude.ai/code). See [`CLAUDE.md`](./CLAUDE.md) for the agent context file — it contains coding conventions, hard constraints, and links to the planning docs in [`docs/`](./docs/).
