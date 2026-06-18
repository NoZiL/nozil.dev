---
title: TalentPicker
tagline: A recruiter mobile app built from scratch in five months — auth, webview navigation, push and deep links.
links:
  - label: Website
    url: https://www.talentpicker.io/
startDate: 2024-01-01
endDate: 2024-05-01
role: Lead Mobile Engineer
client: CVDesignR
technologies: [React Native, Expo, TypeScript, Brevo, EAS]
categories: [mobile]
image: /projects/talentpicker.png
order: 3
status: archived
---

## Overview

TalentPicker is a recruiter-facing mobile app from CVDesignR, designed to let recruiters
review and shortlist candidates on the go. I built it from an empty repo to the stores in
about five months.

## My Role

Sole mobile engineer. I built the app end to end: authentication, a webview-driven
navigation layer over the existing product, and engagement plumbing — push notifications and
deep links wired through Brevo. I also set up the release pipeline so shipping wasn't a
manual chore.

## Key Challenges

- **Webview-over-native navigation.** Much of the product surface was an existing web app, so
  the hard part was making a hybrid feel native — owning navigation, deep links, and
  push-to-screen routing from the React Native shell.
- **A real CI/CD pipeline from day one.** I set up EAS with OTA updates and automated App
  Store / Google Play submissions, so a five-month build still shipped on a predictable
  cadence.

## Outcome

Shipped to both stores within the engagement. The product has since been retired, but it's a
clean example of taking a greenfield mobile app from nothing to the stores fast. The screens
weren't the prettiest part of the job — the value was the delivery speed and the release
automation behind it.
