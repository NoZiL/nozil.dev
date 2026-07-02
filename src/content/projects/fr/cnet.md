---
title: Application terrain C+NET
tagline: Une application Android offline-first pour les agents de terrain de la gestion des déchets en environnement à faible connectivité — quatre ans comme seul développeur.
startDate: 2022-05-01
endDate: 2026-04-01
role: Lead Développeur Mobile
client: C+NET (via WeDoProduct)
technologies: [React Native, Expo, TypeScript, GraphQL, MDM/EMM]
categories: [mobile]
image: ../../../assets/projects/c+net.tablette.jpeg
order: 6
type: work
status: live
---

## Aperçu

Une application Android de terrain conçue sur mesure pour les agents de la gestion des déchets —
les personnes sur le terrain qui collectent et trient les recyclables. Elle est pensée pour la
réalité de ce métier : appareils durcis, connectivité partielle ou inexistante, et un flux de
travail qui ne peut pas s'arrêter pour attendre le réseau. L'application est distribuée et
verrouillée via une gestion de flotte MDM/EMM, et non par les stores publics.

## Mon rôle

Seul développeur pendant quatre ans. J'ai construit l'application de zéro et maîtrisé chaque
couche — la synchronisation des données offline-first, l'échange de données par QR codes entre
agents et équipements, et la configuration de la gestion de flotte MDM/EMM qui maintient un parc
d'appareils gérés à jour et opérationnel.

## Défis clés

- **Pensée pour la faible connectivité.** Les agents travaillent là où il n'y a souvent aucun
  signal ; l'application est donc offline-first : elle capture et met en file d'attente tout
  localement et se réconcilie avec le backend de façon opportuniste, sans jamais bloquer le travail
  de l'agent.
- **Échange de données par QR codes.** Tournées, conteneurs et collectes sont identifiés et
  transmis via des QR codes, de sorte que les données circulent de façon fiable entre agents et
  équipements sans connexion active.
- **Parc d'appareils géré.** J'ai mis en place la gestion de flotte MDM/EMM de zéro pour que le
  client puisse provisionner, configurer et mettre à jour les appareils durcis sur le terrain, à
  grande échelle.

## Résultat

Quatre ans de développement continu de fonctionnalités avec **zéro incident critique en
production** — un outil de terrain sur lequel les agents s'appuyaient réellement chaque jour, dans
des conditions où la plupart des applications auraient flanché.
