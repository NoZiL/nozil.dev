---
title: nozil.dev
tagline: This site — a personal CV and portfolio designed and built from scratch on modern web tooling.
github: https://github.com/nozil/nozil.dev
links:
  - label: Live
    url: https://nozil.dev
startDate: 2026-05-01
role: Sole Developer
client: Personal
technologies: [Astro, Tailwind CSS, TypeScript, Cloudflare Workers, Resend, Claude Code]
categories: [web]
image: /projects/nozil.dev.png
featured: true
order: 0
type: personal
status: live
---

## Overview

nozil.dev is the site you're reading. It's a self-referential portfolio piece: a fast,
zero-JS-by-default CV and portfolio that doubles as a sandbox for tooling I wanted to use in
anger. The source is public — that's the point.

## My Role

Sole developer — design, content, and engineering. Every technical decision (framework,
styling approach, hosting, email) was made from a blank slate.

## Key Challenges

- **A modern, deliberate stack.** Astro 6 for zero-runtime static pages, Tailwind CSS v4
  (CSS-first, no config file), and a single Cloudflare Worker serving prerendered assets plus
  one server route for the contact form via Resend.
- **AI-assisted development, for real.** The whole site is built with Claude Code as the
  primary workflow — typed content collections, Playwright gates, and conventions encoded so
  the assistant ships changes that match the house style.
- **Privacy & craft details.** The email address never appears in static HTML (assembled by
  JS on click), dark mode renders with no flash, and every page is keyboard-navigable.

## Outcome

Public source at [github.com/nozil/nozil.dev](https://github.com/nozil/nozil.dev) — the repo
itself is the portfolio entry. It demonstrates current tooling choices and an
AI-assisted development workflow end to end.
