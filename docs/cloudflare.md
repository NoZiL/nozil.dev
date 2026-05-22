# Cloudflare Deployment Notes

## Project

- **CF Pages project name**: `nozil-dev` (new project — do not reuse the old `nozil-website` project)
- **Custom domain**: nozil.dev (already pointing to CF Pages)
- **Build command**: `pnpm build`
- **Build output directory**: `dist`

## Adapter

```bash
pnpm add @astrojs/cloudflare
```

`astro.config.mjs`:
```js
import cloudflare from '@astrojs/cloudflare'

export default defineConfig({
  output: 'hybrid',   // static by default, server where needed (contact API)
  adapter: cloudflare(),
})
```

`output: 'hybrid'` = most pages fully static, Pages Functions only for `/api/contact`.

## wrangler.toml

```toml
name = "nozil-dev"
compatibility_date = "2026-05-22"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = "./dist"
```

## Environment Variables

| Variable | Where | Notes |
|----------|-------|-------|
| `RESEND_API_KEY` | CF Pages dashboard → Settings → Env vars | Resend API key |
| `EMAIL_FROM` | CF Pages dashboard → Settings → Env vars | `contact@nozil.dev` |
| `EMAIL_TO` | CF Pages dashboard → Settings → Env vars | Destination inbox |

Never commit secrets to the repo. Use `wrangler secret put` or the CF dashboard.

## Preview Deployments

Every push to a non-main branch auto-deploys to:
`https://<branch-slug>.nozil-dev.pages.dev`

## Domain / DNS

- nozil.dev A/CNAME record managed in CF DNS dashboard
- Proxied (orange cloud) — CF handles SSL automatically
- www redirect: set up a CF redirect rule www → apex

## Rollback

CF Pages keeps last 20 deployments. Instant rollback via dashboard or:
```bash
wrangler pages deployment list
wrangler pages deployment rollback <deployment-id>
```
