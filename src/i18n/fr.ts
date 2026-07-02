import type { UI } from './ui'

// French UI strings. Typed against the en map shape (UI = typeof en), so a
// missing or misnamed key fails the build. See en.ts for scope notes.

export const fr: UI = {
  nav: {
    work: 'Parcours',
    portfolio: 'Portfolio',
    contact: 'Contact',
    language: 'Langue',
    hireMe: 'Me recruter',
  },
  footer: {
    builtWith: 'Conçu avec',
    and: '&',
  },
  email: {
    show: 'Afficher l’e-mail',
  },
  home: {
    title: 'Nicolas Zilli — Lead Mobile Engineer',
    role: 'Lead Mobile Engineer · Développeur freelance',
    intro:
      'Développeur basé à Lyon, spécialisé en React Native et Expo — je dirige l’ingénierie mobile chez Tennaxia. Via nozil.dev, j’aide fondateurs et petites équipes à transformer leurs idées en produits livrés, avec 10 ans de React derrière chaque mission.',
    skillsLabel: 'Compétences clés',
    featured: 'Travaux en avant',
    allProjects: 'Tous les projets →',
    cta: { viewCv: 'Voir le CV', portfolio: 'Voir le portfolio', contact: 'Me contacter' },
    schema: {
      jobTitle: 'Lead Mobile Engineer',
      description:
        'Lead Mobile Engineer et développeur freelance spécialisé en React Native et Expo, basé à Lyon, France.',
    },
  },
  work: {
    title: 'Parcours & CV — Nicolas Zilli',
    metaDescription: 'Parcours professionnel et CV de Nicolas Zilli — Lead Mobile Engineer.',
    heading: 'Parcours & CV',
    downloadDocx: 'Télécharger le CV (DOCX)',
    downloadPdf: 'Télécharger en PDF',
    summary:
      'Ingénieur senior mobile & full-stack avec plus de 10 ans d’expérience à mener des produits du greenfield à la production. Expertise centrale en React Native et TypeScript, au niveau système — architecture, CI/CD, design systems, et montée en compétence de l’équipe autour de moi.',
    openToLabel: 'Ouvert à',
    openToText:
      'des postes de Staff / Lead Mobile Engineer, des rôles de founding engineer et des missions freelance. Basé à Lyon, France · déménagement prévu vers la région de Genève / Lausanne au T1 2027 · ',
    euCitizen: 'citoyen de l’UE',
    experienceHeading: 'Expérience',
    wedoproductBefore: 'Plusieurs missions ci-dessous se sont déroulées via ',
    wedoproductName: 'WeDoProduct',
    wedoproductAfter:
      ', une holding que j’ai co-fondée avec d’autres freelances — nous remportions les contrats collectivement et j’avais la pleine responsabilité technique du travail.',
    present: 'Aujourd’hui',
    typeLabel: {
      'full-time': 'CDI',
      freelance: 'Freelance',
      contract: 'Contrat',
      'open-source': 'Open source',
    },
    earlierHeading: 'Expériences antérieures',
    earlier: {
      avril:
        'Construction d’un MVP de zéro en Elixir / Phoenix ; itérations avec une gestion produit pilotée par la donnée.',
      figaro:
        'Construction d’outils de recrutement (questionnaires, suivi des candidatures) de zéro ; rôle DevOps lors d’une migration d’infrastructure majeure. React, AngularJS.',
      alteca: 'Projets clients dans l’écosystème JVM avec des frontends JavaScript.',
    },
    skillsHeading: 'Compétences',
    skillGroups: {
      mobile: 'Mobile',
      frontend: 'Frontend',
      backend: 'Backend & Infra',
      authServices: 'Auth & Services',
      tooling: 'Outillage & CI/CD',
      ai: 'Développement assisté par IA',
    },
    educationHeading: 'Formation',
    education: {
      polytech: { major: 'Informatique', equivalency: 'M.Sc. en ingénierie' },
      iut: { major: 'Informatique', equivalency: 'Diplôme Bac+2' },
    },
  },
  portfolio: {
    title: 'Portfolio — Nicolas Zilli',
    metaDescription:
      'Projets sélectionnés de Nicolas Zilli — applications mobiles, plateformes web et travaux open-source.',
    heading: 'Portfolio',
    intro:
      'Quelques projets qui montrent le travail — applications mobiles livrées, un service public open-source, et les choses que je construis pour moi-même.',
    filters: { all: 'Tous', mobile: 'Mobile', web: 'Web', oss: 'OSS' },
    filterGroupLabel: 'Filtrer par catégorie',
    noResults: 'Aucun projet dans cette catégorie pour l’instant.',
  },
  project: {
    back: '← Portfolio',
    role: 'Rôle',
    context: 'Contexte',
    when: 'Période',
    ongoing: 'En cours',
    archived: 'Archivé',
    techStack: 'Stack technique',
    categoryLabel: { mobile: 'Mobile', web: 'Web', oss: 'OSS' },
    typeLabel: { work: 'Pro', oss: 'OSS', personal: 'Perso' },
  },
  contact: {
    title: 'Contact — Nicolas Zilli',
    metaDescription: 'Contactez Nicolas Zilli pour une mission freelance, du conseil, ou simplement pour échanger.',
    heading: 'Entrons en contact',
    intro:
      'Vous cherchez un ingénieur freelance, vous avez une idée de projet, ou vous voulez simplement échanger ? Remplissez le formulaire ci-dessous — je réponds sous 2 jours ouvrés.',
    name: 'Nom',
    email: 'E-mail',
    subject: 'Sujet',
    optional: '(facultatif)',
    selectTopic: 'Choisir un sujet…',
    topics: { freelance: 'Demande freelance', hi: 'Juste un bonjour', other: 'Autre' },
    message: 'Message',
    send: 'Envoyer le message',
    sending: 'Envoi…',
    successTitle: 'Message envoyé !',
    successBody: 'Merci — je réponds sous 2 jours ouvrés.',
    serverError: 'Une erreur est survenue. Réessayez ou contactez-moi directement :',
    privacy: 'Votre message arrive directement chez Nicolas. Jamais partagé.',
    errors: {
      name: 'Le nom est requis',
      email: 'Un e-mail valide est requis',
      message: 'Le message doit comporter au moins 20 caractères',
    },
  },
}
