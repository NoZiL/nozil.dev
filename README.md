# nozil.dev

Personal CV and portfolio for [Nicolas Zilli](https://www.linkedin.com/in/nicolaszilli) — Lead Mobile Engineer · Freelance Software Developer · Lyon, France.

**Live site**: [nozil.dev](https://nozil.dev)

---

## Stack

| Layer           | Technology                                                            |
| --------------- | --------------------------------------------------------------------- |
| Framework       | [Astro 6](https://astro.build)                                        |
| Styling         | [Tailwind CSS 4](https://tailwindcss.com) (CSS-first, no config file) |
| Language        | TypeScript 6 (strict)                                                 |
| Package manager | pnpm 11 via [corepack](https://nodejs.org/api/corepack.html)          |
| Deployment      | [Cloudflare Workers](https://workers.cloudflare.com)                  |
| Email           | [Resend](https://resend.com)                                          |

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
pnpm preview      # preview built Worker locally (wrangler dev, port 8788)
pnpm deploy       # deploy to Cloudflare Workers (wrangler deploy)
pnpm typecheck    # astro check + tsc --noEmit
pnpm lint         # eslint .
pnpm format       # prettier --write .
pnpm format:check # prettier --check . (CI)
pnpm test         # vitest run (unit tests)
pnpm e2e          # playwright test (against production build)
```

The dev container installs the Playwright chromium browser (+ system libs) on creation.
Outside it, run `pnpm exec playwright install chromium` once before `pnpm e2e`
(on Linux, add `--with-deps` to also install the browser's system libraries).

---

## Project structure

```
src/
├── components/     # UI components — PascalCase.astro
├── layouts/        # BaseLayout.astro, PageLayout.astro
├── pages/          # file-based routes
│   ├── api/        # contact.ts — server route, prerender=false (POST)
│   └── fr/         # French locale (/fr/*)
├── content.config.ts  # Zod schemas for content collections
├── content/        # typed Markdown collections: work/, projects/
├── i18n/           # en.ts + fr.ts string maps
└── styles/
    └── global.css  # @import "tailwindcss" + @theme tokens
```

---

## Environment variables

Set in Cloudflare Workers dashboard → Settings → Variables (or `wrangler secret put`).
Never committed to the repo.

| Variable         | Example value        | Purpose                                        |
| ---------------- | -------------------- | ---------------------------------------------- |
| `RESEND_API_KEY` | `re_…`               | Resend API key for contact form email delivery |
| `EMAIL_FROM`     | `contact@nozil.dev`  | Sending address (must be verified in Resend)   |
| `EMAIL_TO`       | _(set in dashboard)_ | Destination inbox                              |

For local development with `pnpm preview`, create a `.dev.vars` file (gitignored):

```
RESEND_API_KEY=re_…
EMAIL_FROM=contact@nozil.dev
EMAIL_TO=your-inbox@example.com
```

---

## Contributing

`pnpm install` wires up a [Lefthook](https://lefthook.dev) **pre-commit** hook that runs
Prettier on staged files and re-stages the result, so a normal commit is auto-formatted with
no extra step.

You must format **manually** whenever that hook didn't run, otherwise CI's `pnpm format:check`
will fail the build:

```bash
pnpm format        # prettier --write .  — run before pushing
pnpm format:check  # prettier --check .  — what CI runs
```

The hook is skipped when you commit with `--no-verify` / `LEFTHOOK=0`, or in an environment
where `pnpm install` hasn't run (e.g. a fresh CI/agent container — the hook isn't installed
yet). In those cases run `pnpm format` before pushing. If the hook ever goes missing after an
install, re-wire it with `pnpm exec lefthook install`.

---

## Deployment

Deploys run through GitHub Actions (wrangler), not a Cloudflare git integration. The quality
gate (lint, type-check, build, Playwright e2e) must pass first:

- **Open PR** → ephemeral `pr-<n>` preview (`wrangler versions upload`)
- **Push to `main`** → fixed `nozil-dev-preview` staging Worker
- **Production** ([nozil.dev](https://nozil.dev)) → **manual, gated promotion**: the `deploy.yml`
  pipeline promotes to production behind the `production` environment's required-reviewer
  approval (the same pipeline is also runnable via `workflow_dispatch`).

Full pipeline details: [`docs/quality-ci.md`](./docs/quality-ci.md) and
[`docs/cloudflare.md`](./docs/cloudflare.md).

---

## AI assistant context

This repo uses [Claude Code](https://claude.ai/code). See [`CLAUDE.md`](./CLAUDE.md) for the agent context file — it contains coding conventions, hard constraints, and links to the planning docs in [`docs/`](./docs/).
