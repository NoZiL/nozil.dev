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

## Preview Deployments

Connect the GitHub repo to the Workers project; pushes to non-`main` branches get
preview URLs. `main` → production (nozil.dev).

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
