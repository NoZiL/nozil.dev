---
title: Tennaxia Déchets
tagline: Application terrain de traçabilité des déchets pour les équipes HSE, intégrant le registre gouvernemental Trackdéchets — menée de zéro à une bêta payante.
links:
  - label: App Store
    url: https://apps.apple.com/fr/app/tennaxia-d%C3%A9chets/id6758090270
  - label: Google Play
    url: https://play.google.com/store/apps/details?id=com.tennaxia.tennaxiaapp
startDate: 2024-12-01
role: Lead Développeur Mobile
client: Tennaxia
technologies: [React Native, Expo, TypeScript, TanStack Query, Tailwind CSS, Auth0, REST, Turborepo, Claude Code]
categories: [mobile]
image: ../../../assets/projects/tennaxia.png
featured: true
order: 1
type: work
status: live
---

## Aperçu

Tennaxia Déchets est une application mobile pour les équipes hygiène, sécurité & environnement
(HSE) qui numérise la traçabilité des déchets dangereux sur le terrain. Elle se branche sur
[Trackdéchets](https://trackdechets.beta.gouv.fr/) — le registre officiel de traçabilité des
déchets de l'État français (beta.gouv.fr) — pour que les opérateurs puissent créer, signer et
suivre les bordereaux réglementaires depuis un téléphone, sur site, souvent sans connexion.

## Mon rôle

Je pilote la plateforme mobile de bout en bout — je l'ai démarrée au jour 0 et livrée d'un dépôt
vide à une bêta payante en moins d'un an. Cela impliquait de concevoir la couche de données
offline-first, un design system sur mesure et un monorepo Turborepo partagé entre l'application
mobile et le web. À mesure que l'équipe passait de 1 à 3,5 ingénieurs, j'ai défini l'architecture
et les conventions qui nous ont permis de passer à l'échelle sans régression.

## Défis clés

- **Offline-first sur le terrain.** Le travail HSE se déroule sur des sites industriels à faible
  connectivité ; l'application est donc construite autour d'une couche de données local-first qui
  met les mutations en file d'attente et se réconcilie avec le backend dès qu'une connexion revient.
- **Intégrer un registre gouvernemental.** Trackdéchets impose un contrat réglementaire strict ;
  j'ai conduit l'adoption d'une spécification OpenAPI sur un backend qui n'en avait aucune, pour que
  le client mobile s'appuie sur une surface typée et stable.
- **Migration Auth0 à l'échelle de l'entreprise.** J'ai co-piloté une migration d'authentification
  qui touchait tous les produits Tennaxia, menée à bien sans casser les sessions existantes.

## Résultat

En ligne sur l'App Store et Google Play, en bêta payante. La plateforme mobile est désormais le
modèle sur lequel s'appuie l'ensemble de l'équipe d'ingénierie — y compris le flux de développement
assisté par IA (skills et harnais Claude Code sur mesure) que je déploie au sein de l'équipe.
