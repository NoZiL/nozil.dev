# Search & LLM Discoverability

How nozil.dev gets found by search engines and the AI assistants that retrieve
from them. This is the map of what's automated, what's one-time manual setup, and
what only time + inbound links can fix.

## TL;DR

- **There is no single API that tells every engine "I exist."** IndexNow pushes
  to Bing & co.; Google offers only the Search Console API's `sitemaps.submit`
  (now automated, below); Brave offers nothing.
- An LLM answers about you from **two** sources: its frozen **training data**
  (can't edit) and **live retrieval** via its search backend (the fixable part).
  A new site loses on training data and must win on retrieval — which first
  requires being in that backend's index.
- A dedicated "LLM page" is **not** the lever — `public/llms.txt` /
  `src/pages/llms-full.txt.ts` already serve that, and almost no consumer
  assistant fetches `llms.txt` during a chat. Being **indexed** is the lever.

## How each assistant retrieves

| Assistant                    | Search backend            | How we reach it                                |
| ---------------------------- | ------------------------- | ---------------------------------------------- |
| Microsoft Copilot            | Bing                      | IndexNow (automated, below)                    |
| ChatGPT (search mode)        | Bing                      | IndexNow                                       |
| Google Gemini / AI Overviews | Google                    | Search Console + sitemap `<lastmod>`           |
| Brave Leo                    | Brave (independent index) | organic crawl only — no push exists            |
| Perplexity                   | own crawler + others      | `robots.txt` welcomes `PerplexityBot`; organic |

## What's automated — IndexNow (Bing + fan-out)

The `deploy-production` job in `deploy.yml` runs `bojieyang/indexnow-action` after each
production deploy. IndexNow is a shared protocol: one submission propagates to **Bing,
Yandex, Seznam, and Naver**. Submitting to `api.indexnow.org` fans out to all of
them.

Config that matters:

- Key file `public/e16dc979212c4ded832d4d0805716198.txt` (content == filename
  stem) is served at the apex so engines can verify ownership.
- `lastmod-required: false` — **required here.** `@astrojs/sitemap` historically
  emitted no `<lastmod>`, so the action's default filter dropped every URL
  ("No candidate urls need to submit") and silently submitted nothing on every
  deploy. We now also emit `<lastmod>` (see below), but this flag keeps the step
  robust regardless.

**It only fires on a production deploy** (the gated `deploy-production` job in `deploy.yml`),
not on the PR or fixed `preview` deploys. Verify a run worked: in the deploy log the step should list submitted
URLs rather than "No candidate urls need to submit."

**Not covered by IndexNow:** Google and Brave are not participants. Fixing
IndexNow helps Bing/Copilot/ChatGPT only.

## What's automated — Google Search Console (sitemap submit)

The same `deploy-production` job in `deploy.yml` also re-submits the sitemap to
Google after each production deploy, via the Search Console API `sitemaps.submit`
(`PUT /webmasters/v3/sites/{siteUrl}/sitemaps/{feedpath}`). This is Google's
**only** push: the old `google.com/ping?sitemap=` endpoint was **removed in
2023**. Re-submitting nudges Google to recrawl using the build-time `<lastmod>`
stamps (below) — the path to Gemini / AI Overviews.

How it works (`scripts/gsc-submit.mjs`):

- Mints an access token directly from the `GSC_SA_KEY` service-account key with
  the self-signed **JWT-bearer flow** (RFC 7523), scope
  `https://www.googleapis.com/auth/webmasters`, then `PUT`s the sitemap.
- **Why not `google-github-actions/auth`:** its `token_format: access_token`
  path _impersonates_ the SA via the IAM Credentials API, which needs
  `roles/iam.serviceAccountTokenCreator` on the SA — a plain key lacks it and the
  step 403s (`iam.serviceAccounts.getAccessToken denied`). The JWT-bearer flow
  uses the key as its own identity: no impersonation, no extra IAM role.
- `siteUrl` is `sc-domain:nozil.dev` (the domain property), `feedpath` is
  `https://nozil.dev/sitemap-index.xml`.
- **No-ops gracefully:** with no `GSC_SA_KEY` secret the script exits 0 without
  doing anything, so the deploy stays green.

The one-time setup (verify the property, create the service account, grant it,
add the secret) is **"Google Search Console" under One-time manual setup** below.
After that this step is hands-off.

## Sitemap `<lastmod>`

`astro.config.mjs` stamps every sitemap entry with the build time via
`sitemap({ serialize })`. `@astrojs/sitemap` omits `lastmod` by default. It
matters because:

- **Google** uses it to schedule recrawls (the main reason to have it).
- The IndexNow action reads it to pick URLs to submit.

Build time is a deliberate proxy for content-change time: deploys here are
content-driven, and the site is small enough that uniform timestamps are fine.

## One-time manual setup (only the site owner can do these)

These need logins/profile edits that CI can't perform.

1. **Google Search Console** — verify the property, then create a service
   account so the deploy can auto-submit the sitemap (see "What's automated —
   Google Search Console" above). This is the only path to Gemini/AI Overviews.

   **a. Verify the domain property.** Search Console → _Add property_ → **Domain**
   → enter `nozil.dev` → add the TXT record it gives you to Cloudflare DNS →
   _Verify_. Use the **Domain** type (not "URL prefix") so the property id is
   `sc-domain:nozil.dev` — what the workflow submits to.

   **b. Create the service account + key (this is the token).**
   - Go to **Google Cloud Console → IAM & Admin → Service Accounts**
     (https://console.cloud.google.com/iam-admin/serviceaccounts). Pick or create
     a project first (any project works — the project only owns the credential;
     it doesn't have to "contain" the site).
   - _Create service account_ → name it e.g. `gsc-sitemap-submit` → _Done_ (no
     project roles needed; access is granted on the Search Console side in step c).
   - Open the new account → **Keys** tab → _Add key → Create new key → JSON_ →
     this downloads the key file. **That JSON file is the token** — it's the whole
     credential, treat it like a password and don't commit it.
   - Enable the API for the project: **APIs & Services → Library → "Google Search
     Console API"** (a.k.a. Search Console API / Webmasters) → _Enable_
     (https://console.cloud.google.com/apis/library/searchconsole.googleapis.com).
   - Copy the service account's **email** (looks like
     `gsc-sitemap-submit@<project>.iam.gserviceaccount.com`) — it's in the JSON as
     `client_email`.

   **c. Grant the service account on the property.** Search Console → _Settings →
   Users and permissions → Add user_ → paste the service-account email →
   permission **Owner** (Full lets it read; Owner is required to submit sitemaps).

   **d. Add the key as a GitHub Actions secret** named `GSC_SA_KEY` — paste the
   **entire JSON file contents** as the value:

   ```bash
   # gh CLI: read the downloaded file straight into the secret
   gh secret set GSC_SA_KEY < ~/Downloads/<project>-<id>.json
   ```

   Or repo **Settings → Secrets and variables → Actions → New repository secret**,
   name `GSC_SA_KEY`, paste the file's contents. Once set, the next production
   deploy submits the sitemap automatically; until then the step skips and you can
   submit `https://nozil.dev/sitemap-index.xml` by hand in Search Console (Google
   then auto-recrawls using the `<lastmod>` above).

2. **Bing Webmaster Tools** — optional; IndexNow already covers Bing, but adding
   the site lets you see crawl stats and confirm IndexNow submissions land.
3. **Entity / backlink consolidation** — the fix for "Leo returned RocketReach."
   Make cross-site identity bidirectional so engines collapse the profiles into
   one entity that points at nozil.dev as canonical:
   - LinkedIn → set the "Website" field to `https://nozil.dev`.
   - GitHub → set the profile URL / bio link to `https://nozil.dev`.
   - Any other ranking profile (aggregators, Stack Overflow, etc.) → link back if
     possible, and add it to `Person.sameAs` in `src/pages/index.astro` so the
     JSON-LD declares "these are all me; nozil.dev is the hub."

## Brave / Leo specifically

Brave has **no submission tool and no IndexNow** — its index is built solely by
its own crawler. The only levers are inbound links (step 3 above) and time.
Until Brave crawls nozil.dev, Leo falls back to training data (the stale
aggregator profile). There is nothing to ship that forces this.

## Quick verification

```bash
# Key file + sitemaps are served
curl -s -o /dev/null -w '%{http_code}\n' https://nozil.dev/e16dc979212c4ded832d4d0805716198.txt
curl -s -o /dev/null -w '%{http_code}\n' https://nozil.dev/sitemap-0.xml

# lastmod present
curl -s https://nozil.dev/sitemap-0.xml | grep -o '<lastmod>[^<]*</lastmod>' | head

# Is the site in an engine's index yet?
#   site:nozil.dev   on Google / Bing / Brave
```
