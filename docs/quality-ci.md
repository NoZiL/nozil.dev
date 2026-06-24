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

| PR               | Tests                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------ |
| `feat/scaffold`  | Loads home page, no console errors, correct `<title>`                                            |
| `feat/home`      | Hero text visible, nav links present, dark mode toggle works                                     |
| `feat/work`      | CV page renders roles, download button present                                                   |
| `feat/portfolio` | Grid renders, filter chips work, detail page loads                                               |
| `feat/contact`   | Form submits (mock Resend), success state shown, email reveal works                              |
| `feat/i18n`      | `/fr/` loads, lang toggle switches locale, hreflang tags present                                 |
| `feat/seo`       | `robots.txt`/`llms.txt`/`llms-full.txt` served, JSON-LD + canonical present, Lighthouse SEO ≥ 95 |

### Config

See [`playwright.config.ts`](../playwright.config.ts). Key points:

- `webServer` starts `pnpm preview` (`wrangler dev` on `127.0.0.1:8788`) — tests run against
  the actual built Worker, not `astro dev`. Locally it builds first; CI builds explicitly.
- Two projects: desktop Chrome + a Chromium-based mobile device, so CI only needs the
  chromium browser binary.

#### Lighthouse SEO gate

`e2e/lighthouse.spec.ts` enforces the issue #8 Lighthouse SEO ≥ 95 bar inside the existing
Playwright run (no separate CI job). It uses [`playwright-lighthouse`](https://github.com/abhinaba-ghosh/playwright-lighthouse):
a worker-scoped fixture launches Chromium with `--remote-debugging-port`, Lighthouse connects
over CDP and audits the `seo` category only (device-independent, so it runs once on the
`chromium` project and is skipped on `mobile`). Reuses the same `chromium` binary CI already
installs — no extra system Chrome.

Tests run against `pnpm build` + `pnpm preview` — the actual Cloudflare Workers output.

---

## CI/CD

The pipeline is one reusable CI workflow plus two deploy workflows (PR previews and the main
deploy). Each deploy calls CI as a gate, so nothing ships on a red build (full
Cloudflare/wrangler details in [docs/cloudflare.md](./cloudflare.md)):

| Workflow                                                                | Trigger                              | Result                                                                                                                   |
| ----------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| [`ci.yml`](../.github/workflows/ci.yml)                                 | `workflow_call`                      | Reusable `quality` + `e2e` gate. Called by both deploys (and so runs on every PR).                                       |
| [`pr-preview.yml`](../.github/workflows/pr-preview.yml)                 | PR opened/synchronize/reopened       | CI → `wrangler versions upload` → **ephemeral** `pr-<n>` GitHub environment (no comment)                                 |
| [`pr-preview-cleanup.yml`](../.github/workflows/pr-preview-cleanup.yml) | PR closed                            | Deactivates + deletes the `pr-<n>` deployments (kills the ephemeral preview)                                             |
| [`deploy.yml`](../.github/workflows/deploy.yml)                         | push to `main` + `workflow_dispatch` | CI → deploy fixed `nozil-dev-preview` Worker → **gated** promote to production (`nozil.dev`) → post-deploy re-indexation |

`deploy.yml` chains the stages: **CI passes → preview deployed → production promoted behind
the `production` environment's reviewer gate → search engines re-indexed.** A manual
`workflow_dispatch` mirrors the push flow, with a `target` input to scope it:

| `target` (dispatch)      | preview | production        |
| ------------------------ | ------- | ----------------- |
| `all` (default, == push) | ✓       | ✓ (after preview) |
| `only-preview`           | ✓       | skip              |
| `only-production`        | skip    | ✓                 |

The reviewer gate applies on **both** triggers (push and dispatch) — see GitHub Environments
below. PR previews and the main `preview`/`production` envs appear in the repo's
**Environments** tab and on the PR itself (via GitHub Deployments) — no PR comment.

**Post-deploy re-indexation.** Two jobs — `reindex-indexnow` (Bing + fan-out) and
`reindex-google` (Search Console sitemap submit) — `needs` `deploy-production` and run only
after it succeeds. They carry **no `environment:`**, so a failed ping shows as a red job
(reported) but does **not** mark the `production` environment deployment failed: the site is
already live. Being separate jobs, GitHub's **"Re-run failed jobs"** replays just the
indexation without redeploying, and one engine failing never blocks re-running the other. See
[docs/discoverability.md](./discoverability.md).

> **Skipped jobs are now expected.** This consolidates the former split
> `deploy-preview.yml` + `deploy-production.yml` (whose separate files avoided ever rendering a
> "skipped" job). The `deploy-production` job now shows as **skipped** on pushes/dispatches
> that don't promote to prod (e.g. `target: only-preview`) — an accepted trade-off for a
> single chained pipeline.

### CI gate — `ci.yml`

`ci.yml` is `workflow_call`-only (not triggered directly on `pull_request`/`push`) so it runs
exactly once per ref, invoked by whichever deploy workflow owns the event (`deploy.yml` for
pushes to `main` and manual dispatches, `pr-preview.yml` for PRs):

- **quality** job: `pnpm lint` → `format:check` → `typecheck` → `build`
- **e2e** job (needs quality — no point running Playwright if the build is broken):
  installs the chromium binary (cached, keyed on the Playwright version; ubuntu-latest
  already ships the system libs, so no slow `--with-deps` apt step), then `pnpm build` +
  `pnpm e2e`. On failure, the Playwright HTML report is uploaded as an artifact.

### GitHub Environments

Create these in repo Settings → Environments:

- **`production`** — add **required reviewers**. This is the **only** thing that makes the
  production promotion in `deploy.yml` a manual step: the gate is a GitHub environment
  protection rule, not workflow code, and it fires whenever the `deploy-production` job runs —
  on both `push` and `workflow_dispatch`. **Without required reviewers configured here, every
  push to `main` deploys straight to production with no approval.** (A `workflow_dispatch` is
  itself a manual action, so the extra approval is one self-approve click unless you enable
  "Prevent self-review" for a second-person check.)
- **`preview`** — the fixed staging Worker (`nozil-dev-preview.*.workers.dev`).
- **`pr-*`** — auto-created per PR, cleaned up on close by `pr-preview-cleanup.yml`. The job
  always deactivates + deletes the deployments inside the env (only needs `deployments: write`).
  Deleting the **empty environment husk** itself needs repo-administration scope, which is _not_
  a grantable workflow `permissions:` key — the default `GITHUB_TOKEN` always 403s on it
  (`Resource not accessible by integration`). To remove the husk too, set an optional
  **`ENV_CLEANUP_TOKEN`** repo secret (a PAT or GitHub App token with `administration:write`);
  the workflow falls back to `GITHUB_TOKEN` when it's unset, so the husk is simply left behind
  (harmless — no deployments, no Cloudflare resources) and the job stays green.

### Branch protection on `main`

Set in GitHub repo Settings → Branches:

- Require status checks: `ci / quality` + `ci / e2e` (the reusable jobs, namespaced under the
  calling `ci` job)
- Require PR before merging
- No direct pushes to `main`
