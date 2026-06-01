# CV / Work Page Plan

## Goal

A human-readable, linkable work history that doubles as the data source for a generated PDF CV.
No sync issues between the site and a downloadable file.

## Content Structure

Each role is a Markdown file in `src/content/work/`:

```yaml
---
title: Lead Mobile Engineer
company: Tennaxia
companyUrl: https://www.tennaxia.com
startDate: 2021-01-01
endDate: null # null = present
location: Paris, France (remote)
type: full-time # full-time | freelance | contract | open-source
logo: ./tennaxia.svg # optional, placed in same folder
technologies: [React Native, Expo, TypeScript, GraphQL, Turborepo, GitHub Actions]
featured: true
---
Lead mobile engineering for Tennaxia's EHS (Environmental, Health & Safety) compliance platform,
targeting field teams in industrial environments.

- Built and maintain the React Native / Expo app from ground up (managed → bare workflow migration)
- Introduced Turborepo monorepo structure across mobile + API + shared packages
- Set up CI/CD with EAS Build and GitHub Actions for automated OTA and store releases
- Work directly with product and design to ship features on a 2-week cycle
```

## Roles to Document (initial pass — expand with LinkedIn/resume data)

1. Lead Mobile Engineer — Tennaxia (current)
2. Freelance Software Developer — nozil.dev (ongoing parallel)
3. Prior roles (to be filled from LinkedIn / resume)

## CV PDF Generation

Strategy: **build-time PDF snapshot via `astro-pdf`**

```bash
pnpm add -D astro-pdf
```

Configuration in `astro.config.mjs`:

```js
import pdf from 'astro-pdf'

export default defineConfig({
  integrations: [
    pdf({
      pages: { '/work': 'cv.pdf' },
      // custom styles to print-optimize the /work page
    }),
  ],
})
```

This generates `/dist/cv.pdf` at build time from the live `/work` page, printed with headless Chromium.
The site page and the PDF are always in sync.

Alternative if `astro-pdf` is too heavy for CF Pages build:

- Keep Google Drive PDF link until content is finalised
- Then add a GitHub Actions step to generate and commit `public/cv.pdf`

## Skills Section

Skills are a separate collection `src/content/skills/index.yaml`:

```yaml
groups:
  - name: Mobile
    skills: [React Native, Expo, EAS Build]
  - name: Frontend
    skills: [React, TypeScript, Astro, Next.js, Tailwind CSS]
  - name: Backend
    skills: [Node.js, GraphQL, REST]
  - name: DevOps
    skills: [GitHub Actions, Turborepo, Cloudflare, pnpm]
```

Rendered as styled chips grouped by domain, not a progress-bar gimmick.

## Education

Brief block at the bottom of `/work` — degree, school, year. No elaborate section needed.
