# Cloudflare Deployment Notes

> **Migrated to Cloudflare Workers.** The modern `@astrojs/cloudflare` adapter (v13)
> targets the Workers runtime with static-assets, not the legacy Pages model. The site
> deploys as a single Worker that serves prerendered static assets plus the `/api/contact`
> server route. The original plan targeted CF Pages; that section is preserved below the
> rule for history.

## Project

- **CF Workers project (service) name**: `nozil-dev`
- **Custom domain**: nozil.dev
- **Build command**: `pnpm build`
- **Build output**: `dist/` (`dist/client` static assets + `dist/server` Worker entry)

## Adapter

```bash
pnpm add @astrojs/cloudflare
```

`astro.config.mjs`:

```js
import cloudflare from '@astrojs/cloudflare'
import { defineConfig, sessionDrivers } from 'astro/config'

export default defineConfig({
  site: 'https://nozil.dev',
  output: 'static', // Astro 6 removed 'hybrid'; static is the default
  // No sessions on this site. Without an explicit driver the adapter
  // auto-enables KV sessions and emits an id-less SESSION binding, which
  // `wrangler versions upload` tries to (re-)provision on every CI run.
  session: { driver: sessionDrivers.null() },
  adapter: cloudflare({
    imageService: 'compile', // optimise with sharp at build time, no workerd binding
    platformProxy: { enabled: false }, // miniflare-at-dev-startup hangs here; re-enable when bindings are needed locally
  }),
})
```

Pages prerender by default. `/api/contact` opts into server rendering with
`export const prerender = false`, and runs inside the Worker.

## wrangler.toml

Hand-written config supplies name + compatibility settings. The adapter **generates**
`main` and `[assets]` at build time — do **not** set them in the root `wrangler.toml`, or the
Cloudflare Vite plugin tries to resolve `dist/` before the build exists.

```toml
name = "nozil-dev"
compatibility_date = "2026-06-01"
compatibility_flags = ["nodejs_compat"]
```

The generated config's location depends on the build:

- **Mixed build** (has server routes, e.g. `/api/contact`) → `dist/server/wrangler.json`
- **Static-only build** → `dist/client/wrangler.json` (inside the assets dir, which makes
  `wrangler dev` reload-loop)

`scripts/cf-config.mjs` resolves the right path (and, for the static-only case, emits a
relocated `dist/wrangler.json` so the config sits outside the watched assets dir). The
preview/deploy scripts and `deploy.yml` all call it:

```bash
pnpm deploy    # wrangler deploy -c "$(node scripts/cf-config.mjs)"
pnpm preview   # wrangler dev    -c "$(node scripts/cf-config.mjs)" --ip 127.0.0.1 --port 8788
```

### WSL/devcontainer build note

`astro build` prerenders inside `workerd`, which binds to `127.0.0.1`. Where `localhost`
resolves to IPv6 `::1` only (some WSL2/devcontainer setups), the prerender fetch fails with
`ECONNREFUSED`. The `build` script sets `NODE_OPTIONS=--dns-result-order=ipv4first` to fix
this; it is harmless on CI (Ubuntu resolves `localhost` to `127.0.0.1`).

## Local authentication (devcontainer)

`wrangler whoami` / `deploy` / `versions upload` from inside the devcontainer need an OAuth
login. Run it once:

```bash
pnpm exec wrangler login --callback-host 0.0.0.0
```

`--callback-host 0.0.0.0` is required in the devcontainer: the OAuth callback server binds to
all interfaces (not just `localhost`) so the host browser's redirect reaches it through the
forwarded port. Port **8976** (the callback port) is in `devcontainer.json` → `forwardPorts`
for this reason. Open the printed URL, approve, and the flow completes.

The token is written to `/home/node/.config/.wrangler/config/default.toml`, which is the
`nozil.dev-wrangler` named volume — so the login **persists across container rebuilds**.
Verify with `pnpm exec wrangler whoami`.

> wrangler resolves its config dir to `~/.config/.wrangler` (XDG) unless a legacy
> `~/.wrangler` directory exists; the volume is mounted at the former. CI doesn't use this —
> it authenticates with the `CLOUDFLARE_API_TOKEN` repo secret instead (see below).

## Environment Variables

| Variable         | Where                                       | Notes               |
| ---------------- | ------------------------------------------- | ------------------- |
| `RESEND_API_KEY` | CF Workers dashboard → Settings → Variables | Resend API key      |
| `EMAIL_FROM`     | CF Workers dashboard → Settings → Variables | `contact@nozil.dev` |
| `EMAIL_TO`       | CF Workers dashboard → Settings → Variables | Destination inbox   |

Never commit secrets. Use `wrangler secret put <NAME>` or the CF dashboard. Local dev
values go in `.dev.vars` (gitignored).

## Deployment (GitHub Actions)

Deploys run from `.github/workflows/deploy.yml` using `wrangler` directly:

| Trigger                         | Action                     | Result                                 |
| ------------------------------- | -------------------------- | -------------------------------------- |
| Pull request (open/update)      | `wrangler versions upload` | Ephemeral preview URL, commented on PR |
| Push to `main`                  | `wrangler versions upload` | New preview version (staged, not live) |
| Manual (Actions → Run workflow) | `wrangler deploy`          | Promotes a fresh build to production   |

`versions upload` uploads a new Worker version **without** shifting production traffic, and
returns a `*.workers.dev` preview URL. Production is never deployed automatically — promote
it deliberately via the **workflow_dispatch** button (production deploys use the `production`
GitHub Environment, so you can add required reviewers there for an approval gate).

### Required CI credentials

The deploy workflow needs two **repository secrets**. Until they are set, the preview step
skips gracefully (the job stays green).

| Secret                  | Value                                                        |
| ----------------------- | ------------------------------------------------------------ |
| `CLOUDFLARE_API_TOKEN`  | Cloudflare API token (template: **Edit Cloudflare Workers**) |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID — CF dashboard → Workers & Pages → right sidebar  |

**Create the token**: CF dashboard → My Profile → API Tokens → Create Token →
_Edit Cloudflare Workers_ template (grants Workers Scripts:Edit; the bundled Workers KV:Edit
is unused — sessions are disabled in `astro.config.mjs`, so no KV binding exists). Scope it
to the relevant account.

**Set the secrets** (never commit them) — via the GitHub UI (Settings → Secrets and variables
→ Actions) or the CLI:

```bash
gh secret set CLOUDFLARE_API_TOKEN    # paste the token when prompted
gh secret set CLOUDFLARE_ACCOUNT_ID   # paste the account id when prompted
```

### First deploy — create the Worker once

`wrangler versions upload` requires the `nozil-dev` Worker to already exist. On a brand-new
account, run the production path **once** to create it (locally or via the manual workflow):

```bash
pnpm build
pnpm exec wrangler deploy -c dist/server/wrangler.json
```

After that, PR/main preview uploads work. Preview URLs also require a **workers.dev
subdomain** enabled on the account (CF dashboard → Workers & Pages → Subdomain).

## Domain / DNS

- nozil.dev A/CNAME record managed in CF DNS dashboard
- Proxied (orange cloud) — CF handles SSL automatically
- www redirect: set up a CF redirect rule www → apex

## Rollback

Workers keeps prior versions. Roll back via the dashboard or:

```bash
wrangler deployments list
wrangler rollback [version-id]
```
