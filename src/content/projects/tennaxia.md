---
title: Tennaxia Déchets
tagline: Field waste-tracing app for EHS teams, integrating France's government Trackdéchets registry — built from zero to paid beta.
links:
  - label: App Store
    url: https://apps.apple.com/fr/app/tennaxia-d%C3%A9chets/id6758090270
  - label: Google Play
    url: https://play.google.com/store/apps/details?id=com.tennaxia.tennaxiaapp
startDate: 2024-12-01
role: Lead Mobile Engineer
client: Tennaxia
technologies: [React Native, Expo, TypeScript, TanStack Query, Tailwind CSS, Auth0, REST, Turborepo, Claude Code]
categories: [mobile]
image: /projects/tennaxia.png
featured: true
order: 1
status: live
---

## Overview

Tennaxia Déchets is a mobile app for environment, health & safety (EHS) teams that
digitises hazardous-waste tracing in the field. It plugs into
[Trackdéchets](https://trackdechets.beta.gouv.fr/) — the French government's official
waste-tracing registry (beta.gouv.fr) — so operators can create, sign, and follow
regulatory waste slips from a phone, on-site, often without a connection.

## My Role

I own the mobile platform end to end — I started it on day 0 and shipped it from an empty
repo to a paid beta in under a year. That meant designing the offline-first data layer, a
custom design system, and a Turborepo monorepo shared across the mobile app and web. As the
team grew from 1 to 3.5 engineers, I set the architecture and conventions that let us scale
without regressions.

## Key Challenges

- **Offline-first in the field.** EHS work happens on industrial sites with poor
  connectivity, so the app is built around a local-first data layer that queues mutations
  and reconciles with the backend once a connection returns.
- **Integrating a government registry.** Trackdéchets has a strict regulatory contract; I
  drove OpenAPI spec adoption on a backend that previously had none, so the mobile client
  could rely on a typed, stable surface.
- **Company-wide Auth0 migration.** I co-led an auth migration that touched every Tennaxia
  product, landing it without breaking existing sessions.

## Outcome

Live on the App Store and Google Play, in paid beta. The mobile platform is now the
template the wider engineering org builds on — including the AI-assisted-development
workflow (custom Claude Code skills and harnesses) I'm rolling out across the team.
