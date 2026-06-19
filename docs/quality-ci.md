# Code Quality & CI/CD

## Quality Tools

| Concern       | Tool                           | Notes                                                        |
| ------------- | ------------------------------ | ------------------------------------------------------------ |
| Type checking | `astro check` + `tsc --noEmit` | `astro check` covers `.astro` files; `tsc` covers the rest   |
| Linting       | ESLint 10 (flat config)        | `eslint.config.js` — no `.eslintrc`                          |
| Formatting    | Prettier                       | `prettier-plugin-astro` for `.astro` files                   |
| Git hooks     | Lefthook                       | `lefthook.yml` — pre-commit auto-formats staged files        |
| Unit tests    | Vitest                         | Pure logic: form validation, i18n helpers, email obfuscation |
| E2E tests     | Playwright                     | Full page tests against production build                     |

### ESLint plugins

```
eslint
@typescript-eslint/eslint-plugin
@typescript-eslint/parser
eslint-plugin-astro          # .astro-aware rules
eslint-plugin-jsx-a11y       # accessibility rules
```

### Prettier config

See [`.prettierrc`](../.prettierrc) — no semicolons, single quotes, 2-space tabs,
print width 120, `prettier-plugin-astro` for `.astro` files.

### package.json scripts

See [`package.json`](../package.json) (summarised in [CLAUDE.md](../CLAUDE.md) → Commands).
Notable: `preview`/`deploy` run `wrangler` against the build-time-generated config resolved
by `scripts/cf-config.mjs` — see [docs/cloudflare.md](./cloudflare.md).

### Local enforcement — Lefthook pre-commit

CI's `pnpm format:check` step had repeatedly failed on formatting alone. [Lefthook](https://lefthook.dev)
([`lefthook.yml`](../lefthook.yml)) closes that gap by formatting **before** the commit exists,
for both the human and any agent committing here:

- **pre-commit** runs `prettier --write --ignore-unknown` on staged files matching the config
  glob, then `stage_fixed: true` re-stages whatever Prettier rewrote — so the formatted result
  is part of the same commit, not an unstaged diff left behind.
- **Zero-setup install**: `lefthook` is allow-listed in `pnpm-workspace.yaml`, so its postinstall
  runs `lefthook install` after every `pnpm install` — the hook is wired up on clone with no
  manual step. (Re-run `pnpm exec lefthook install` if the hook ever goes missing.)
- **Escape hatches**: `LEFTHOOK=0 git commit …` skips all hooks; `git commit --no-verify` is the
  standard git bypass.

This is a local guard, not a replacement for the CI gate — CI still runs `format:check` so a
bypassed or hook-less commit is still caught.

---

## Playwright — E2E Strategy

### Why Playwright with Claude Code

Every feature PR includes Playwright tests written by Claude as part of the same PR.
CI runs them against the production build before the PR can merge.
By the time you review, the tests already passed — you're reviewing correctness, not whether it works.

### Test scope per PR

| PR               | Tests                                                               |
| ---------------- | ------------------------------------------------------------------- |
| `feat/scaffold`  | Loads home page, no console errors, correct `<title>`               |
| `feat/home`      | Hero text visible, nav links present, dark mode toggle works        |
| `feat/work`      | CV page renders roles, download button present                      |
| `feat/portfolio` | Grid renders, filter chips work, detail page loads                  |
| `feat/contact`   | Form submits (mock Resend), success state shown, email reveal works |
| `feat/i18n`      | `/fr/` loads, lang toggle switches locale, hreflang tags present    |

### Config

See [`playwright.config.ts`](../playwright.config.ts). Key points:

- `webServer` starts `pnpm preview` (`wrangler dev` on `127.0.0.1:8788`) — tests run against
  the actual built Worker, not `astro dev`. Locally it builds first; CI builds explicitly.
- Two projects: desktop Chrome + a Chromium-based mobile device, so CI only needs the
  chromium browser binary.

Tests run against `pnpm build` + `pnpm preview` — the actual Cloudflare Workers output.

---

## CI/CD

The pipeline is one reusable CI workflow plus three single-purpose deploy workflows. Each
deploy calls CI as a gate, so nothing ships on a red build; and because every event triggers
a _different_ workflow file, no job ever renders as "skipped" (full Cloudflare/wrangler
details in [docs/cloudflare.md](./cloudflare.md)):

| Workflow                                                                | Trigger                        | Result                                                                                   |
| ----------------------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------- |
| [`ci.yml`](../.github/workflows/ci.yml)                                 | `workflow_call`                | Reusable `quality` + `e2e` gate. Called by all three deploys (and so runs on every PR).  |
| [`pr-preview.yml`](../.github/workflows/pr-preview.yml)                 | PR opened/synchronize/reopened | CI → `wrangler versions upload` → **ephemeral** `pr-<n>` GitHub environment (no comment) |
| [`pr-preview-cleanup.yml`](../.github/workflows/pr-preview-cleanup.yml) | PR closed                      | Deactivates + deletes the `pr-<n>` deployments (kills the ephemeral preview)             |
| [`deploy-preview.yml`](../.github/workflows/deploy-preview.yml)         | push to `main`                 | CI → deploy the **fixed** `nozil-dev-preview` Worker → `preview` GitHub environment      |
| [`deploy-production.yml`](../.github/workflows/deploy-production.yml)   | `workflow_dispatch` (manual)   | CI → `wrangler deploy` → `production` GitHub environment (reviewer-gated)                |

Promotion chain: **CI passes → preview deployed → production promoted manually.** PR previews
and the main `preview` env appear in the repo's **Environments** tab and on the PR itself
(via GitHub Deployments) — no PR comment.

### CI gate — `ci.yml`

`ci.yml` is `workflow_call`-only (not triggered directly on `pull_request`/`push`) so it runs
exactly once per ref, invoked by whichever deploy workflow owns the event:

- **quality** job: `pnpm lint` → `format:check` → `typecheck` → `build`
- **e2e** job (needs quality — no point running Playwright if the build is broken):
  installs the chromium binary (cached, keyed on the Playwright version; ubuntu-latest
  already ships the system libs, so no slow `--with-deps` apt step), then `pnpm build` +
  `pnpm e2e`. On failure, the Playwright HTML report is uploaded as an artifact.

### GitHub Environments

Create these in repo Settings → Environments:

- **`production`** — add **required reviewers** for the manual-deploy approval gate.
- **`preview`** — the fixed staging Worker (`nozil-dev-preview.*.workers.dev`).
- **`pr-*`** — auto-created per PR, auto-removed on close by `pr-preview-cleanup.yml`. (Full
  environment deletion needs admin rights the default `GITHUB_TOKEN` may lack; the cleanup
  always clears the deployments, and best-effort deletes the environment.)

### Branch protection on `main`

Set in GitHub repo Settings → Branches:

- Require status checks: `ci / quality` + `ci / e2e` (the reusable jobs, namespaced under the
  calling `ci` job)
- Require PR before merging
- No direct pushes to `main`
