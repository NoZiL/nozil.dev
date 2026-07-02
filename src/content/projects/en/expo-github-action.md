---
title: expo/expo-github-action
tagline: An accepted contribution to Expo's official GitHub Action for continuous deployment.
github: https://github.com/expo/expo-github-action/pull/280
startDate: 2024-09-01
endDate: 2024-09-24
role: Contributor
client: Open source
technologies: [TypeScript, GitHub Actions, Expo, EAS]
categories: [oss]
order: 5
type: oss
status: live
---

## Overview

[expo-github-action](https://github.com/expo/expo-github-action) is Expo's official GitHub
Action for building, deploying, and previewing Expo / EAS apps in CI. I contributed a feature
to the `continuous-deploy-fingerprint` action.

## My Role

Contributor. While wiring up continuous deployment for an app on SDK 51, I noticed the
`continuous-deploy-fingerprint` action was missing a `platform` input — so I added it,
opened a PR, and worked it through review with the Expo maintainers.

## Key Challenges

- **Matching maintainer expectations.** A change to a widely-used official action has to fit
  the existing input/typing conventions and not break anyone's pipeline — most of the work was
  in getting the surface right, not the diff size.

## Outcome

[Merged](https://github.com/expo/expo-github-action/pull/280) into the official Expo action
in September 2024 — a small, real contribution to tooling that the wider React Native
community ships with.
