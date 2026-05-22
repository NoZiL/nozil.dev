# Code Quality & CI/CD

## Quality Tools

| Concern | Tool | Notes |
|---------|------|-------|
| Type checking | `astro check` + `tsc --noEmit` | `astro check` covers `.astro` files; `tsc` covers the rest |
| Linting | ESLint 9 (flat config) | `eslint.config.js` — no `.eslintrc` |
| Formatting | Prettier | `prettier-plugin-astro` for `.astro` files |
| Unit tests | Vitest | Pure logic: form validation, i18n helpers, email obfuscation |
| E2E tests | Playwright | Full page tests against production build |

### ESLint plugins

```
eslint
@typescript-eslint/eslint-plugin
@typescript-eslint/parser
eslint-plugin-astro          # .astro-aware rules
eslint-plugin-jsx-a11y       # accessibility rules
```

### Prettier config

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "plugins": ["prettier-plugin-astro"]
}
```

### package.json scripts

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro check && astro build",
    "preview": "wrangler pages dev ./dist",
    "deploy": "wrangler pages deploy ./dist",
    "typecheck": "astro check && tsc --noEmit",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui"
  }
}
```

---

## Playwright — E2E Strategy

### Why Playwright with Claude Code

Every feature PR includes Playwright tests written by Claude as part of the same PR.
CI runs them against the production build before the PR can merge.
By the time you review, the tests already passed — you're reviewing correctness, not whether it works.

### Test scope per PR

| PR | Tests |
|----|-------|
| `feat/scaffold` | Loads home page, no console errors, correct `<title>` |
| `feat/home` | Hero text visible, nav links present, dark mode toggle works |
| `feat/work` | CV page renders roles, download button present |
| `feat/portfolio` | Grid renders, filter chips work, detail page loads |
| `feat/contact` | Form submits (mock Resend), success state shown, email reveal works |
| `feat/i18n` | `/fr/` loads, lang toggle switches locale, hreflang tags present |

### Config

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  webServer: {
    command: 'pnpm preview',
    port: 8788,       // wrangler pages dev port
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 15'] } },
  ],
})
```

Tests run against `pnpm build` + `pnpm preview` in CI — the actual CF Pages output.

---

## CI/CD

### Deployment — Cloudflare Pages native

Connect the GitHub repo to CF Pages in the dashboard. CF Pages handles deployments automatically:

- Push to `main` → production deploy (nozil.dev)
- Push to any other branch / open PR → preview deploy (`<branch>.nozil-dev.pages.dev`)

**No deploy step needed in GitHub Actions.** GH Actions is a quality gate only.

### GitHub Actions — quality gate

File: `.github/workflows/ci.yml`

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
      - run: corepack enable
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm format:check
      - run: pnpm typecheck
      - run: pnpm build

  e2e:
    runs-on: ubuntu-latest
    needs: quality          # only run if build passes
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
      - run: corepack enable
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm build
      - run: pnpm e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

The `e2e` job only runs after `quality` passes — no point running Playwright if the build is broken.
On failure, the Playwright HTML report is uploaded as an artifact so you can inspect what failed.

### Branch protection on `main`

Set in GitHub repo Settings → Branches:
- Require status checks: `quality` + `e2e`
- Require PR before merging
- No direct pushes to `main`
