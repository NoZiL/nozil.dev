import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'zod'

const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    company: z.string(),
    companyUrl: z.string().url().optional(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().nullish(),
    location: z.string(),
    type: z.enum(['full-time', 'freelance', 'contract', 'open-source']),
    technologies: z.array(z.string()),
    featured: z.boolean().default(false),
  }),
})

export const collections = { work }
