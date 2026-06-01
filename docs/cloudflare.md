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

export default defineConfig({
  site: 'https://nozil.dev',
  output: 'static', // Astro 6 removed 'hybrid'; static is the default
  adapter: cloudflare({
    imageService: 'compile', // optimise with sharp at build time, no workerd binding
    platformProxy: { enabled: true },
  }),
})
```

Pages prerender by default. `/api/contact` opts into server rendering with
`export const prerender = false`, and runs inside the Worker.

## wrangler.toml

Hand-written config supplies name + compatibility settings. The adapter **generates**
`main` and `[assets]` into `dist/server/wrangler.json` at build time — do **not** set them
in the root `wrangler.toml`, or the Cloudflare Vite plugin tries to resolve `dist/` before
the build exists.

```toml
name = "nozil-dev"
compatibility_date = "2026-06-01"
compatibility_flags = ["nodejs_compat"]
```

Deploy and local preview both point at the generated config:

```bash
pnpm deploy    # wrangler deploy -c dist/server/wrangler.json
pnpm preview   # wrangler dev    -c dist/server/wrangler.json --port 8788
```

### WSL/devcontainer build note

`astro build` prerenders inside `workerd`, which binds to `127.0.0.1`. Where `localhost`
resolves to IPv6 `::1` only (some WSL2/devcontainer setups), the prerender fetch fails with
`ECONNREFUSED`. The `build` script sets `NODE_OPTIONS=--dns-result-order=ipv4first` to fix
this; it is harmless on CI (Ubuntu resolves `localhost` to `127.0.0.1`).

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
_Edit Cloudflare Workers_ template (grants Workers Scripts:Edit + Workers KV:Edit, which the
`SESSION` KV binding needs). Scope it to the relevant account.

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
