import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'zod'

// One Markdown file per role in src/content/work/. Fields mirror docs/cv-plan.md.
const work = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    company: z.string(),
    companyUrl: z.url().optional(),
    // Studio/agency the engagement ran through (freelance work), e.g. "wedoproduct studio".
    via: z.string().optional(),
    startDate: z.coerce.date(),
    // null = present (current role)
    endDate: z.coerce.date().nullable().default(null),
    location: z.string(),
    type: z.enum(['full-time', 'freelance', 'contract', 'open-source']),
    technologies: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
  }),
})

// One Markdown file per project in src/content/projects/. Fields mirror
// docs/portfolio-plan.md. Shown on /portfolio (grid + filter chips), the home
// page (featured cards), and /portfolio/[slug] detail pages.
const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    // One sentence — what it does and for whom.
    tagline: z.string(),
    github: z.url().optional(),
    // Live / store / case-study links, rendered as labelled buttons.
    links: z.array(z.object({ label: z.string(), url: z.url() })).default([]),
    startDate: z.coerce.date(),
    // null = ongoing
    endDate: z.coerce.date().nullable().default(null),
    role: z.string(),
    client: z.string().optional(),
    technologies: z.array(z.string()).default([]),
    // Drives the /portfolio filter chips (All · Mobile · Web · OSS).
    categories: z.array(z.enum(['mobile', 'web', 'oss'])).default([]),
    // Optional screenshot path under public/ (e.g. /projects/foo.png). Used for
    // the card thumbnail and detail-page og:image; falls back to a generated
    // monogram card when absent. A public/ path (not astro:assets) sidesteps
    // the compile image-service limitation noted in src/pages/index.astro.
    image: z.string().optional(),
    featured: z.boolean().default(false),
    // Lower sorts first among featured cards (ties break by recency).
    order: z.number().default(0),
    // Nature of the project — primary badge (Work · OSS · Personal).
    type: z.enum(['work', 'oss', 'personal']),
    // Lifecycle, shown muted alongside the type badge. Orthogonal to repo
    // visibility — a private-repo project can still be live or archived.
    status: z.enum(['live', 'archived']).default('live'),
  }),
})

export const collections = { work, projects }
