// English UI strings (default locale). This map is the source of truth for the
// translation shape — fr.ts is typed against `typeof en` (see ui.ts), so a
// missing or misnamed French key is a type error at build time.
//
// Scope: UI/chrome strings and page prose authored in the page templates.
// Long-form content in the work/ and projects/ collections (role bullets,
// project case studies) is not translated here — see docs/concept.md.

export const en: {
  nav: { work: string; portfolio: string; contact: string; language: string }
  footer: { builtWith: string; and: string }
  email: { show: string }
  home: {
    title: string
    role: string
    intro: string
    skillsLabel: string
    featured: string
    allProjects: string
    cta: { viewCv: string; portfolio: string; contact: string }
    schema: { jobTitle: string; description: string }
  }
  work: {
    title: string
    metaDescription: string
    heading: string
    downloadDocx: string
    downloadPdf: string
    summary: string
    openToLabel: string
    openToText: string
    euCitizen: string
    experienceHeading: string
    wedoproductBefore: string
    wedoproductName: string
    wedoproductAfter: string
    present: string
    typeLabel: Record<'full-time' | 'freelance' | 'contract' | 'open-source', string>
    earlierHeading: string
    earlier: { avril: string; figaro: string; alteca: string }
    skillsHeading: string
    skillGroups: {
      mobile: string
      frontend: string
      backend: string
      authServices: string
      tooling: string
      ai: string
    }
    educationHeading: string
    education: {
      polytech: { major: string; equivalency: string }
      iut: { major: string; equivalency: string }
    }
  }
  portfolio: {
    title: string
    metaDescription: string
    heading: string
    intro: string
    filters: { all: string; mobile: string; web: string; oss: string }
    filterGroupLabel: string
    noResults: string
  }
  project: {
    back: string
    role: string
    context: string
    when: string
    ongoing: string
    archived: string
    techStack: string
    categoryLabel: Record<'mobile' | 'web' | 'oss', string>
    typeLabel: Record<'work' | 'oss' | 'personal', string>
  }
  contact: {
    title: string
    metaDescription: string
    heading: string
    intro: string
    name: string
    email: string
    subject: string
    optional: string
    selectTopic: string
    topics: { freelance: string; hi: string; other: string }
    message: string
    send: string
    sending: string
    successTitle: string
    successBody: string
    serverError: string
    privacy: string
    errors: { name: string; email: string; message: string }
  }
} = {
  nav: {
    work: 'Work',
    portfolio: 'Portfolio',
    contact: 'Contact',
    language: 'Language',
  },
  footer: {
    builtWith: 'Built with',
    and: '&',
  },
  email: {
    show: 'Show email',
  },
  home: {
    title: 'Nicolas Zilli — Lead Mobile Engineer',
    role: 'Lead Mobile Engineer · Freelance Software Developer',
    intro:
      "I'm a Lyon-based developer specialising in React Native and Expo — leading mobile engineering at Tennaxia. Through nozil.dev I help founders and small teams turn ideas into shipped products, with 10 years of React behind every engagement.",
    skillsLabel: 'Key skills',
    featured: 'Featured work',
    allProjects: 'All projects →',
    cta: { viewCv: 'View CV', portfolio: 'See portfolio', contact: 'Contact me' },
    schema: {
      jobTitle: 'Lead Mobile Engineer',
      description:
        'Lead Mobile Engineer and freelance software developer specialising in React Native and Expo, based in Lyon, France.',
    },
  },
  work: {
    title: 'Work & CV — Nicolas Zilli',
    metaDescription: 'Work history and CV of Nicolas Zilli — Lead Mobile Engineer.',
    heading: 'Work & CV',
    downloadDocx: 'Download CV (DOCX)',
    downloadPdf: 'Download as PDF',
    summary:
      'Senior mobile & full-stack engineer with 10+ years taking products from greenfield to production. Core expertise in React Native and TypeScript, working at the system level — architecture, CI/CD, design systems, and growing the team around me.',
    openToLabel: 'Open to',
    openToText:
      'Staff / Lead Mobile Engineer roles, founding-engineer positions, and freelance contracts. Based in Lyon, France · relocating to the Geneva / Lausanne area Q1 2027 · ',
    euCitizen: 'EU citizen',
    experienceHeading: 'Experience',
    wedoproductBefore: 'Several roles below ran through ',
    wedoproductName: 'WeDoProduct',
    wedoproductAfter:
      ', a holding I co-founded with fellow freelancers — we won contracts collectively and I held full technical ownership of the work.',
    present: 'Present',
    typeLabel: {
      'full-time': 'Full-time',
      freelance: 'Freelance',
      contract: 'Contract',
      'open-source': 'Open source',
    },
    earlierHeading: 'Earlier experience',
    earlier: {
      avril: 'Built an MVP from scratch in Elixir / Phoenix; iterated with data-driven product management.',
      figaro:
        'Built recruitment tooling (questionnaires, applicant tracking) from scratch; DevOps role during a major infra migration. React, AngularJS.',
      alteca: 'Client projects in the JVM ecosystem with JavaScript frontends.',
    },
    skillsHeading: 'Skills',
    skillGroups: {
      mobile: 'Mobile',
      frontend: 'Frontend',
      backend: 'Backend & Infra',
      authServices: 'Auth & Services',
      tooling: 'Tooling & CI/CD',
      ai: 'AI-assisted development',
    },
    educationHeading: 'Education',
    education: {
      polytech: { major: 'Computer Science', equivalency: 'M.Sc. in Engineering' },
      iut: { major: 'Computer Science', equivalency: '2-year Undergraduate Degree' },
    },
  },
  portfolio: {
    title: 'Portfolio — Nicolas Zilli',
    metaDescription: 'Selected projects by Nicolas Zilli — mobile apps, web platforms, and open-source work.',
    heading: 'Portfolio',
    intro:
      'A few projects that show the work — shipped mobile apps, an open-source public service, and the things I build for myself.',
    filters: { all: 'All', mobile: 'Mobile', web: 'Web', oss: 'OSS' },
    filterGroupLabel: 'Filter by category',
    noResults: 'No projects in this category yet.',
  },
  project: {
    back: '← Portfolio',
    role: 'Role',
    context: 'Context',
    when: 'When',
    ongoing: 'Ongoing',
    archived: 'Archived',
    techStack: 'Tech stack',
    categoryLabel: { mobile: 'Mobile', web: 'Web', oss: 'OSS' },
    typeLabel: { work: 'Work', oss: 'OSS', personal: 'Personal' },
  },
  contact: {
    title: 'Contact — Nicolas Zilli',
    metaDescription: 'Get in touch with Nicolas Zilli for freelance work, consulting, or just to say hi.',
    heading: 'Get in touch',
    intro:
      'Looking for a freelance engineer, have a project idea, or just want to connect? Fill in the form below — I reply within 2 business days.',
    name: 'Name',
    email: 'Email',
    subject: 'Subject',
    optional: '(optional)',
    selectTopic: 'Select a topic…',
    topics: { freelance: 'Freelance inquiry', hi: 'Just saying hi', other: 'Other' },
    message: 'Message',
    send: 'Send message',
    sending: 'Sending…',
    successTitle: 'Message sent!',
    successBody: "Thanks — I'll reply within 2 business days.",
    serverError: 'Something went wrong. Try again or reach me directly:',
    privacy: 'Your message goes directly to Nicolas. Never shared.',
    errors: {
      name: 'Name is required',
      email: 'A valid email is required',
      message: 'Message must be at least 20 characters',
    },
  },
}
