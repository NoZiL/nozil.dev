# Search & LLM Discoverability

How nozil.dev gets found by search engines and the AI assistants that retrieve
from them. This is the map of what's automated, what's one-time manual setup, and
what only time + inbound links can fix.

## TL;DR

- **There is no single API that tells every engine "I exist."** Only IndexNow
  offers a push; Google and Brave do not.
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

`deploy-production.yml` runs `bojieyang/indexnow-action` after each production
deploy. IndexNow is a shared protocol: one submission propagates to **Bing,
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

**It only fires on a production deploy** (`workflow_dispatch`), not on PR/main
preview. Verify a run worked: in the deploy log the step should list submitted
URLs rather than "No candidate urls need to submit."

**Not covered by IndexNow:** Google and Brave are not participants. Fixing
IndexNow helps Bing/Copilot/ChatGPT only.

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

1. **Google Search Console** — verify the `nozil.dev` domain (DNS TXT record),
   submit `https://nozil.dev/sitemap-index.xml` once. Google then auto-recrawls
   using the `<lastmod>` above. This is the only path to Gemini/AI Overviews.
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
