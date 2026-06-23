# Portfolio Page Plan

## Goal

Showcase 4–8 curated projects that demonstrate craft and/or leadership — especially:

- Still-live web/app/mobile products
- Projects where Nicolas was sole dev or technical lead
- Open source work that shows code quality

## Project Card Data Model

Each project is a file in `src/content/projects/`:

```yaml
---
title: Project Name
tagline: One sentence — what it does and for whom
url: https://live-url.com          # optional
github: https://github.com/...     # optional
startDate: 2023-01
endDate: 2024-06                   # null = ongoing
role: Sole Developer               # Sole Developer | Tech Lead | Contributor
client: Client Name                # optional, can be "Personal" or "Freelance"
technologies: [React Native, Expo, TypeScript, GraphQL]
categories: [mobile, web, oss]     # for filter chips
image: ../../assets/projects/foo.png  # screenshot under src/assets/ — the image()
                                      # schema helper + <Image> emit responsive WebP
featured: true                     # shows on home page
status: live                       # live | archived | private
---

## Overview

2–3 sentences on what the product does and why it exists.

## My Role

What I specifically built, led, or decided. Concrete, not vague.

## Key Challenges

- Challenge 1 and how I solved it
- Challenge 2

## Outcome

Usage numbers, client feedback, or technical achievement worth mentioning.
```

## Projects to Document (initial candidates)

Gather the following info from LinkedIn, GH repos, and memory:

| Project                   | Status       | Category   | Notes                                              |
| ------------------------- | ------------ | ---------- | -------------------------------------------------- |
| Tennaxia mobile app       | Live         | Mobile     | Lead engineer, field EHS                           |
| nozil.dev (this site)     | Live         | Web        | Self-referential — shows craft and tooling choices |
| Freelance client projects | Live/Private | Mobile/Web | anonymise client if needed                         |
| Open source contributions | Various      | OSS        | From GH profile                                    |

### nozil.dev — self-referential portfolio entry

The site itself is a first-class portfolio project. It demonstrates:

- Technical choices made from scratch (Astro 6, Tailwind 4, Cloudflare Pages)
- AI-assisted development workflow with Claude Code
- Public source at `github.com/nozil/nozil.dev` — reviewable craft

Content collection entry (`src/content/projects/nozil-dev.md`):

```yaml
---
title: nozil.dev
tagline: Personal CV and portfolio — designed and built from scratch
url: https://nozil.dev
github: https://github.com/nozil/nozil.dev
startDate: 2025-05
role: Sole Developer
technologies: [Astro, Tailwind CSS, TypeScript, Cloudflare Pages, Resend]
categories: [web]
featured: true
status: live
---
```

**Backlink requirement**: the nozil.dev site must link to `github.com/nozil/nozil.dev`
in the portfolio detail page for this project. The repo being public is part of the point.

## Filter Categories

- **All** (default)
- **Mobile** — React Native / Expo apps
- **Web** — websites, web apps
- **OSS** — open source

## Home Page Featured Projects

Top 2–3 projects with `featured: true` appear as cards on `/`.
Same component, same data — no duplication.

## Detail Pages

Route: `/portfolio/[slug]`
Generated statically from the content collection.
Each page has proper OG meta (title, description, og:image from project screenshot).
