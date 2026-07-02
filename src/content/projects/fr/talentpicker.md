---
title: TalentPicker
tagline: Une application mobile pour recruteurs construite de zéro en cinq mois — authentification, navigation webview, push et deep links.
links:
  - label: Site web
    url: https://www.talentpicker.io/
startDate: 2024-01-01
endDate: 2024-05-01
role: Lead Développeur Mobile
client: CVDesignR
technologies: [React Native, Expo, TypeScript, Brevo, EAS]
categories: [mobile]
image: ../../../assets/projects/talentpicker.png
order: 3
type: work
status: archived
---

## Aperçu

TalentPicker est une application mobile à destination des recruteurs, éditée par CVDesignR, conçue
pour leur permettre d'évaluer et de présélectionner des candidats en déplacement. Je l'ai construite
d'un dépôt vide jusqu'aux stores en environ cinq mois.

## Mon rôle

Seul développeur mobile. J'ai construit l'application de bout en bout : authentification, une couche
de navigation pilotée par webview au-dessus du produit existant, et la plomberie d'engagement —
notifications push et deep links câblés via Brevo. J'ai aussi mis en place le pipeline de
publication pour que livrer ne soit pas une corvée manuelle.

## Défis clés

- **Navigation native au-dessus d'une webview.** Une grande partie du produit était une application
  web existante ; la difficulté était donc de rendre l'hybride « natif » — en maîtrisant la
  navigation, les deep links et le routage push-vers-écran depuis le shell React Native.
- **Un vrai pipeline CI/CD dès le premier jour.** J'ai mis en place EAS avec mises à jour OTA et
  soumissions automatisées sur l'App Store et Google Play, pour qu'un projet de cinq mois livre tout
  de même à une cadence prévisible.

## Résultat

Livrée sur les deux stores au cours de la mission. Le produit a depuis été retiré, mais il reste un
exemple net de prise en charge d'une application mobile greenfield, menée du néant aux stores
rapidement. Les écrans n'étaient pas la plus belle partie du travail — la valeur résidait dans la
vitesse de livraison et l'automatisation des releases derrière.
