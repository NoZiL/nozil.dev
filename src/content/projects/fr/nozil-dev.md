---
title: nozil.dev
tagline: Ce site — un CV et portfolio personnel conçu et développé de zéro avec un outillage web moderne.
github: https://github.com/nozil/nozil.dev
links:
  - label: En ligne
    url: https://nozil.dev
startDate: 2026-05-01
role: Développeur unique
client: Personnel
technologies: [Astro, Tailwind CSS, TypeScript, Cloudflare Workers, Resend, Claude Code]
categories: [web]
image: ../../../assets/projects/nozil.dev.png
featured: true
order: 0
type: personal
status: live
---

## Aperçu

nozil.dev est le site que vous lisez. C'est une pièce de portfolio autoréférentielle : un CV et
portfolio rapide, sans JS par défaut, qui sert aussi de bac à sable pour des outils que je voulais
utiliser pour de vrai. Le code source est public — c'est tout l'intérêt.

## Mon rôle

Développeur unique — design, contenu et ingénierie. Chaque décision technique (framework, approche
de style, hébergement, e-mail) a été prise à partir d'une page blanche.

## Défis clés

- **Une stack moderne et assumée.** Astro 6 pour des pages statiques sans runtime, Tailwind CSS v4
  (CSS-first, sans fichier de configuration) et un unique Cloudflare Worker servant les assets
  prérendus plus une route serveur pour le formulaire de contact via Resend.
- **Du développement assisté par IA, pour de vrai.** Tout le site est construit avec Claude Code
  comme flux de travail principal — collections de contenu typées, garde-fous Playwright et
  conventions encodées pour que l'assistant livre des changements conformes au style de la maison.
- **Souci de la vie privée et du détail.** L'adresse e-mail n'apparaît jamais dans le HTML statique
  (assemblée par JS au clic), le mode sombre s'affiche sans flash et chaque page est navigable au
  clavier.

## Résultat

Code source public sur [github.com/nozil/nozil.dev](https://github.com/nozil/nozil.dev) — le dépôt
lui-même est l'entrée du portfolio. Il illustre des choix d'outillage actuels et un flux de
développement assisté par IA de bout en bout.
