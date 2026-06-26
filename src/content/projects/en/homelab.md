---
title: Self-hosted Homelab
tagline: A self-hosted home server running media, automation, and identity services with proper user management.
startDate: 2022-01-01
role: Sole Developer
client: Personal
technologies: [Docker, Home Assistant, Jellyfin, LLDAP, Linux]
categories: []
image: ../../../assets/projects/homeassistant.png
order: 4
type: personal
status: live
---

## Overview

A personal homelab server I run for my household: media streaming, home automation, and the
self-hosting "\*arr" ecosystem — all behind a single sign-on identity layer rather than a pile
of disconnected logins.

## My Role

Sole architect and operator. I designed the service topology, containerised everything, and
set up the auth and access model from scratch.

## Key Challenges

- **Real identity, not shared passwords.** I run [LLDAP](https://github.com/lldap/lldap) as a
  lightweight directory so family members get proper accounts and group-based access across
  services, instead of a single shared login per app.
- **Home automation.** Home Assistant ties the smart-home devices together with local-first
  automations.
- **Media pipeline.** Jellyfin plus the \*arr stack (Sonarr/Radarr-style automation) for a
  fully self-hosted, ad-free media library.

## Outcome

A reliable, low-maintenance home platform that's taught me a lot about self-hosting, container
orchestration, and identity/access management — hands-on infra work that complements the
product engineering I do day to day.
