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

export const collections = { work }
