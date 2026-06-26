---
title: expo/expo-github-action
tagline: Une contribution acceptée à la GitHub Action officielle d'Expo pour le déploiement continu.
github: https://github.com/expo/expo-github-action/pull/280
startDate: 2024-09-01
endDate: 2024-09-24
role: Contributeur
client: Open source
technologies: [TypeScript, GitHub Actions, Expo, EAS]
categories: [oss]
order: 5
type: oss
status: live
---

## Aperçu

[expo-github-action](https://github.com/expo/expo-github-action) est la GitHub Action officielle
d'Expo pour construire, déployer et prévisualiser des applications Expo / EAS en CI. J'ai contribué
une fonctionnalité à l'action `continuous-deploy-fingerprint`.

## Mon rôle

Contributeur. En mettant en place le déploiement continu d'une application sur le SDK 51, j'ai
remarqué qu'il manquait une entrée `platform` à l'action `continuous-deploy-fingerprint` — je l'ai
donc ajoutée, ouvert une PR et menée jusqu'à la revue avec les mainteneurs d'Expo.

## Défis clés

- **Répondre aux attentes des mainteneurs.** Une modification d'une action officielle largement
  utilisée doit respecter les conventions d'entrées et de typage existantes sans casser le pipeline
  de personne — l'essentiel du travail consistait à bien dessiner la surface, pas à la taille du
  diff.

## Résultat

[Mergée](https://github.com/expo/expo-github-action/pull/280) dans l'action officielle Expo en
septembre 2024 — une petite contribution bien réelle à un outillage avec lequel l'ensemble de la
communauté React Native livre ses applications.
