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

Astro 6.4.2 · Tailwind CSS 4 · TypeScript 6 · pnpm 11 via corepack · Cloudflare Workers

Full version table and rationale: @docs/tech-stack.md

## Source Layout

```
src/
├── components/     # PascalCase .astro files
├── layouts/        # BaseLayout.astro, PageLayout.astro
├── pages/          # file-based routes
│   ├── api/        # contact.ts → server route, prerender=false (POST only)
│   └── fr/         # French locale pages
├── content.config.ts  # Zod 4 schemas for every collection
├── content/        # typed Markdown collections: work/, projects/
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

## Keep Docs in Sync

Docs are part of the change, not an afterthought. Before finishing any task that touches code,
config, workflows, scripts, or dependencies, check whether the docs that describe that behavior
have gone stale — and update them **in the same PR**.

- **Where to look**: `README.md`, everything under `docs/`, and this `CLAUDE.md`. Grep for the
  thing you changed (a workflow/file name, env var, command, version) to find every reference.
- **Common drift sources**: deploy/CI pipeline changes (`.github/workflows/`), renamed or
  deleted files, `package.json` scripts, dependency bumps (the version table in
  `docs/tech-stack.md`), env vars, and the source-layout trees in `README.md` / `CLAUDE.md`.
- **When unsure**, flag the doc you suspect is outdated to the user rather than leaving a known
  inaccuracy in place.

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
- `https://www.malt.fr/profile/nicolaszilli`
- `https://hashnode.com/@nozil`
- `https://dev.to/nozil`
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
- `docs/cv-plan.md` — /work reference: CV source-of-truth files + how the page is built
- `docs/portfolio-plan.md` — project collection schema, showcase UX
- `docs/discoverability.md` — search/LLM indexing: IndexNow, sitemap lastmod, Search Console, Brave/Leo

<!-- rtk-instructions v2 -->

# RTK (Rust Token Killer) - Token-Optimized Commands

## Golden Rule

**Always prefix commands with `rtk`**. If RTK has a dedicated filter, it uses it. If not, it passes through unchanged. This means RTK is always safe to use.

**Important**: Even in command chains with `&&`, use `rtk`:

```bash
# ❌ Wrong
git add . && git commit -m "msg" && git push

# ✅ Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

## RTK Commands by Workflow

### Build & Compile (80-90% savings)

```bash
rtk cargo build         # Cargo build output
rtk cargo check         # Cargo check output
rtk cargo clippy        # Clippy warnings grouped by file (80%)
rtk tsc                 # TypeScript errors grouped by file/code (83%)
rtk lint                # ESLint/Biome violations grouped (84%)
rtk prettier --check    # Files needing format only (70%)
rtk next build          # Next.js build with route metrics (87%)
```

### Test (60-99% savings)

```bash
rtk cargo test          # Cargo test failures only (90%)
rtk go test             # Go test failures only (90%)
rtk jest                # Jest failures only (99.5%)
rtk vitest              # Vitest failures only (99.5%)
rtk playwright test     # Playwright failures only (94%)
rtk pytest              # Python test failures only (90%)
rtk rake test           # Ruby test failures only (90%)
rtk rspec               # RSpec test failures only (60%)
rtk test <cmd>          # Generic test wrapper - failures only
```

### Git (59-80% savings)

```bash
rtk git status          # Compact status
rtk git log             # Compact log (works with all git flags)
rtk git diff            # Compact diff (80%)
rtk git show            # Compact show (80%)
rtk git add             # Ultra-compact confirmations (59%)
rtk git commit          # Ultra-compact confirmations (59%)
rtk git push            # Ultra-compact confirmations
rtk git pull            # Ultra-compact confirmations
rtk git branch          # Compact branch list
rtk git fetch           # Compact fetch
rtk git stash           # Compact stash
rtk git worktree        # Compact worktree
```

Note: Git passthrough works for ALL subcommands, even those not explicitly listed.

### GitHub (26-87% savings)

```bash
rtk gh pr view <num>    # Compact PR view (87%)
rtk gh pr checks        # Compact PR checks (79%)
rtk gh run list         # Compact workflow runs (82%)
rtk gh issue list       # Compact issue list (80%)
rtk gh api              # Compact API responses (26%)
```

### JavaScript/TypeScript Tooling (70-90% savings)

```bash
rtk pnpm list           # Compact dependency tree (70%)
rtk pnpm outdated       # Compact outdated packages (80%)
rtk pnpm install        # Compact install output (90%)
rtk npm run <script>    # Compact npm script output
rtk npx <cmd>           # Compact npx command output
rtk prisma              # Prisma without ASCII art (88%)
```

### Files & Search (60-75% savings)

```bash
rtk ls <path>           # Tree format, compact (65%)
rtk read <file>         # Code reading with filtering (60%)
rtk grep <pattern>      # Search grouped by file (75%). Format flags (-c, -l, -L, -o, -Z) run raw.
rtk find <pattern>      # Find grouped by directory (70%)
```

### Analysis & Debug (70-90% savings)

```bash
rtk err <cmd>           # Filter errors only from any command
rtk log <file>          # Deduplicated logs with counts
rtk json <file>         # JSON structure without values
rtk deps                # Dependency overview
rtk env                 # Environment variables compact
rtk summary <cmd>       # Smart summary of command output
rtk diff                # Ultra-compact diffs
```

### Infrastructure (85% savings)

```bash
rtk docker ps           # Compact container list
rtk docker images       # Compact image list
rtk docker logs <c>     # Deduplicated logs
rtk kubectl get         # Compact resource list
rtk kubectl logs        # Deduplicated pod logs
```

### Network (65-70% savings)

```bash
rtk curl <url>          # Compact HTTP responses (70%)
rtk wget <url>          # Compact download output (65%)
```

### Meta Commands

```bash
rtk gain                # View token savings statistics
rtk gain --history      # View command history with savings
rtk discover            # Analyze Claude Code sessions for missed RTK usage
rtk proxy <cmd>         # Run command without filtering (for debugging)
rtk init                # Add RTK instructions to CLAUDE.md
rtk init --global       # Add RTK to ~/.claude/CLAUDE.md
```

## Token Savings Overview

| Category         | Commands                       | Typical Savings |
| ---------------- | ------------------------------ | --------------- |
| Tests            | vitest, playwright, cargo test | 90-99%          |
| Build            | next, tsc, lint, prettier      | 70-87%          |
| Git              | status, log, diff, add, commit | 59-80%          |
| GitHub           | gh pr, gh run, gh issue        | 26-87%          |
| Package Managers | pnpm, npm, npx                 | 70-90%          |
| Files            | ls, read, grep, find           | 60-75%          |
| Infrastructure   | docker, kubectl                | 85%             |
| Network          | curl, wget                     | 65-70%          |

Overall average: **60-90% token reduction** on common development operations.

<!-- /rtk-instructions -->
