---
title: C+NET Field App
tagline: An offline-first Android app for waste-management field agents in low-connectivity environments — four years as sole engineer.
startDate: 2022-05-01
endDate: 2026-04-01
role: Lead Mobile Engineer
client: C+NET (via WeDoProduct)
technologies: [React Native, Expo, TypeScript, GraphQL, MDM/EMM]
categories: [mobile]
image: ../../assets/projects/c+net.tablette.jpeg
order: 6
type: work
status: live
---

## Overview

A purpose-built Android field app for waste-management agents — the people on the ground
collecting and sorting recyclables. It's designed for the reality of that job: rugged
devices, patchy or no connectivity, and a workflow that can't stop to wait for a network.
The app is distributed and locked down through MDM/EMM fleet management, not the public
stores.

## My Role

Sole engineer for four years. I built the app from scratch and owned every layer — the
offline-first data sync, the QR-code data exchange between agents and assets, and the
MDM/EMM fleet-management setup that keeps a managed device fleet provisioned and up to date.

## Key Challenges

- **Low-connectivity by design.** Agents work where there's often no signal, so the app is
  offline-first: it captures and queues everything locally and reconciles with the backend
  opportunistically, never blocking the agent's workflow.
- **QR-code data exchange.** Routes, containers, and pickups are identified and handed off via
  QR codes, so data moves reliably between agents and assets without a live connection.
- **Managed device fleet.** I set up MDM/EMM fleet management from scratch so the client could
  provision, configure, and update the rugged devices in the field at scale.

## Outcome

Four years of continuous feature development with **zero critical production incidents** — a
field tool that field workers actually relied on every day, in conditions most apps would
fall over in.
