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
preview/deploy scripts and the deploy workflows all call it:

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

| Variable          | Where                                       | When    | Notes                                                                                                                                                                        |
| ----------------- | ------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RESEND_API_KEY`  | CF Workers dashboard → Settings → Variables | runtime | Resend API key                                                                                                                                                               |
| `EMAIL_FROM`      | CF Workers dashboard → Settings → Variables | runtime | `contact@nozil.dev`                                                                                                                                                          |
| `EMAIL_TO`        | CF Workers dashboard → Settings → Variables | runtime | Destination inbox                                                                                                                                                            |
| `CF_BEACON_TOKEN` | GitHub Actions repo secret                  | build   | Cloudflare Web Analytics beacon token (see Analytics below)                                                                                                                  |
| `GSC_SA_KEY`      | GitHub Actions repo secret                  | deploy  | Google service-account JSON for the Search Console sitemap submit in the `deploy-production` job (`deploy.yml`; optional, skips if unset — setup in docs/discoverability.md) |

Never commit secrets. Use `wrangler secret put <NAME>` or the CF dashboard. Local dev
values go in `.dev.vars` (gitignored).

**Runtime vs build-time.** `RESEND_*`/`EMAIL_*` are read by the Worker at request time
(`import { env } from 'cloudflare:workers'` in `src/pages/api/contact.ts`). `CF_BEACON_TOKEN`
is different: the pages it lands on are **prerendered**, so it must be present when
`pnpm build` runs — it is read via `astro:env/client` in `BaseLayout.astro` and baked into the
static HTML. That's why it's a GitHub Actions secret (wired into the `pnpm build` step of the
deploy workflows — `pr-preview.yml`, `deploy.yml`), not a
Worker dashboard variable. Local builds read it from `.env` (see `.env.example`); omit it and
the build simply ships no beacon.

## Analytics — Cloudflare Web Analytics

Cookieless, privacy-first, no consent banner needed (no PII, no cross-site tracking) — a good
fit for an EU site. Free and unlimited.

**Manual beacon, not automatic.** Cloudflare's "Automatic setup" only injects the beacon on
proxied origins / Pages, **not** on responses served by a Worker — so this Worker-hosted site
gets nothing from automatic mode (verify: `curl -s https://nozil.dev/ | grep cloudflareinsights`
returns nothing under automatic mode). The beacon is therefore added manually in
`src/layouts/BaseLayout.astro`, gated on `CF_BEACON_TOKEN`.

Setup:

1. CF dashboard → Analytics → Web Analytics → add site `nozil.dev` → copy the **site token**.
2. Set it as a GitHub Actions secret so deploy builds emit the beacon:
   ```bash
   gh secret set CF_BEACON_TOKEN   # paste the site token when prompted
   ```
3. (Optional, local) add it to `.env` to preview the beacon locally.

The token is not a true secret — it ships in the public page source — but it's kept out of the
repo (env var, not hard-coded) for hygiene and to match the `RESEND_API_KEY` pattern.

## Deployment (GitHub Actions)

Deploys run from two workflows, each gated by the reusable `ci.yml` (pipeline overview in
[docs/quality-ci.md](./quality-ci.md)):

| Workflow         | Trigger                              | wrangler                                 | Result                                                                               |
| ---------------- | ------------------------------------ | ---------------------------------------- | ------------------------------------------------------------------------------------ |
| `pr-preview.yml` | Pull request (open/update)           | `versions upload`                        | Ephemeral `pr-<n>` env (GitHub Deployment)                                           |
| `deploy.yml`     | Push to `main` + `workflow_dispatch` | `deploy -c $(cf-config.mjs [--preview])` | Fixed `nozil-dev-preview` Worker, then **gated** promote to production (`nozil.dev`) |

`versions upload` stages a new Worker version **without** shifting production traffic and
returns an ephemeral `*.workers.dev` preview URL — surfaced as a per-PR GitHub Deployment, not
a comment.

`deploy.yml` runs the preview deploy (`deploy -c $(cf-config.mjs --preview)`) then the
production deploy (`deploy -c $(cf-config.mjs)`) as two jobs in one pipeline. Production is
never reached automatically: the `deploy-production` job targets the `production` GitHub
Environment, whose **required reviewers** pause the run for approval — on both the `push` and
`workflow_dispatch` paths (environment protection rules apply to the job regardless of
trigger). A manual dispatch takes a `target` input (`all` / `only-preview` / `only-production`)
to scope which stages run; `all` mirrors a push.

The **fixed preview** is a _separate_ Worker. `scripts/cf-config.mjs --preview` emits a config
that renames it to `nozil-dev-preview`, strips the `nozil.dev` route (it would 409-conflict
with prod — see Domain / DNS), and re-enables `workers_dev` for a stable
`nozil-dev-preview.*.workers.dev` URL. It runs with no Resend secrets, so `/api/contact`
returns its "not configured" path on preview.

### Required CI credentials

The deploy workflows need two **repository secrets**. Until they are set, the preview steps
skip gracefully (the job stays green).

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

**Apex (`nozil.dev`) is canonical; `www` 301-redirects to it.** The apex matches
`site: 'https://nozil.dev'` in `astro.config.mjs`, so canonical tags, sitemap, `hreflang`,
and OG URLs already point there — no rebuild needed. The Cloudflare-managed zone flattens the
apex internally, so a Worker custom domain on the bare apex works natively (the legacy
"can't CNAME an apex" limitation doesn't apply).

### Custom domain — config-as-code

The apex is bound to the Worker via `routes` in the root `wrangler.toml`:

```toml
routes = [{ pattern = "nozil.dev", custom_domain = true }]
```

`custom_domain = true` makes Cloudflare create/manage the proxied DNS record and TLS cert for
the apex and route it to the `nozil-dev` Worker. The adapter merges this into
`dist/server/wrangler.json`, so it ships with the gated production `wrangler deploy` job in
`deploy.yml` (reached on a `main` push or `workflow_dispatch`). The PR `versions upload` and
the fixed-preview deploy (`--preview` config strips the route) do not touch routes.

> **`routes` flips two defaults to `false`** — `wrangler.toml` pins them back:
>
> ```toml
> preview_urls = true   # keep version *.workers.dev URLs (deploy.yml comments them on PRs)
> workers_dev  = false  # apex is the sole production route — no duplicate-content URL
> ```
>
> Without `preview_urls = true`, `wrangler versions upload` stops returning a `*.workers.dev`
> URL and the PR preview comment silently goes blank. `workers_dev = false` is the desired
> end state (the old `nozil-dev.*.workers.dev` production URL now 404s — expected).

> **Token scope:** binding a route needs **Zone → Workers Routes → Edit** for the `nozil.dev`
> zone, not just the account-level Workers scope on the default _Edit Cloudflare Workers_
> token. If the production deploy errors on the route, add a Zone-scoped permission to
> `CLOUDFLARE_API_TOKEN` (or add the domain once via the dashboard: Workers & Pages →
> `nozil-dev` → Settings → Domains & Routes).

### www → apex redirect (dashboard, no code)

Handled at the edge with a **Single Redirect Rule** — no Worker invocation:

- CF dashboard → `nozil.dev` zone → **Rules → Redirect Rules → Create**
- **When**: Hostname **equals** `www.nozil.dev`
- **Then**: Dynamic redirect → Expression `concat("https://nozil.dev", http.request.uri.path)`
- **Status**: `301`, **Preserve query string**: on
- Requires a DNS record for `www` (proxied) so CF terminates TLS before redirecting — an
  `AAAA www → 100::` (or `CNAME www → nozil.dev`) proxied record is the usual placeholder.

### Acceptance (issue #10)

- `https://nozil.dev` serves the Worker (HTTP 200), valid TLS
- `https://www.nozil.dev/*` 301s to `https://nozil.dev/*`

## Rollback

Workers keeps prior versions. Roll back via the dashboard or:

```bash
wrangler deployments list
wrangler rollback [version-id]
```
