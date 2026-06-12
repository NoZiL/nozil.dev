# Code Quality & CI/CD

## Quality Tools

| Concern       | Tool                           | Notes                                                        |
| ------------- | ------------------------------ | ------------------------------------------------------------ |
| Type checking | `astro check` + `tsc --noEmit` | `astro check` covers `.astro` files; `tsc` covers the rest   |
| Linting       | ESLint 10 (flat config)        | `eslint.config.js` — no `.eslintrc`                          |
| Formatting    | Prettier                       | `prettier-plugin-astro` for `.astro` files                   |
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

### Deployment — Cloudflare Workers via GitHub Actions

Deploys run from [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) using
`wrangler` directly (the original CF Pages-native plan was dropped when the site moved to
Workers — full details in [docs/cloudflare.md](./cloudflare.md)):

- Pull request / push to `main` → `wrangler versions upload` — staged preview version with a
  `*.workers.dev` URL, commented on the PR. Production traffic never shifts automatically.
- Manual workflow_dispatch → `wrangler deploy` — promotes a fresh build to production
  (gated by the `production` GitHub Environment).

### GitHub Actions — quality gate

See [`.github/workflows/ci.yml`](../.github/workflows/ci.yml):

- **quality** job: `pnpm lint` → `format:check` → `typecheck` → `build`
- **e2e** job (needs quality — no point running Playwright if the build is broken):
  installs the chromium binary (cached, keyed on the Playwright version; ubuntu-latest
  already ships the system libs, so no slow `--with-deps` apt step), then `pnpm build` +
  `pnpm e2e`. On failure, the Playwright HTML report is uploaded as an artifact.

### Branch protection on `main`

Set in GitHub repo Settings → Branches:

- Require status checks: `quality` + `e2e`
- Require PR before merging
- No direct pushes to `main`
