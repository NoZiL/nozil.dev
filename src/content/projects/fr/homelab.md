---
title: Homelab auto-hébergé
tagline: Un serveur maison auto-hébergé faisant tourner des services de médias, d'automatisation et d'identité, avec une vraie gestion des utilisateurs.
startDate: 2022-01-01
role: Développeur unique
client: Personnel
technologies: [Docker, Home Assistant, Jellyfin, LLDAP, Linux]
categories: []
image: ../../../assets/projects/homeassistant.png
order: 4
type: personal
status: live
---

## Aperçu

Un serveur homelab personnel que je fais tourner pour mon foyer : streaming de médias, domotique
et l'écosystème d'auto-hébergement « \*arr » — le tout derrière une couche d'identité à
authentification unique plutôt qu'un empilement de connexions déconnectées.

## Mon rôle

Seul architecte et opérateur. J'ai conçu la topologie des services, tout conteneurisé et mis en
place le modèle d'authentification et d'accès de zéro.

## Défis clés

- **Une vraie identité, pas des mots de passe partagés.** Je fais tourner
  [LLDAP](https://github.com/lldap/lldap) comme annuaire léger pour que les membres de la famille
  disposent de comptes propres et d'un accès par groupe à travers les services, au lieu d'un unique
  identifiant partagé par application.
- **Domotique.** Home Assistant relie les appareils connectés entre eux avec des automatisations
  local-first.
- **Pipeline média.** Jellyfin couplé à la stack \*arr (automatisation à la Sonarr/Radarr) pour une
  médiathèque entièrement auto-hébergée et sans publicité.

## Résultat

Une plateforme maison fiable et peu exigeante en maintenance, qui m'a beaucoup appris sur
l'auto-hébergement, l'orchestration de conteneurs et la gestion des identités et des accès — un
travail d'infrastructure concret qui complète l'ingénierie produit de mon quotidien.
