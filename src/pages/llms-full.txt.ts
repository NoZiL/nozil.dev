import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'

// Extended llms.txt (https://llmstxt.org) — the long-form companion to the
// curated public/llms.txt. Generated at build time from the work + projects
// content collections so the CV and portfolio data never drift from the site.
// Served as plain text at /llms-full.txt.

const fmtMonth = (d: Date) => d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
const dateRange = (start: Date, end: Date | null) => `${fmtMonth(start)} – ${end ? fmtMonth(end) : 'Present'}`

export const GET: APIRoute = async () => {
  // Reverse-chronological: current roles (no endDate) first, then by start date.
  const work = (await getCollection('work')).sort((a, b) => {
    const aEnd = a.data.endDate?.getTime() ?? Infinity
    const bEnd = b.data.endDate?.getTime() ?? Infinity
    if (aEnd !== bEnd) return bEnd - aEnd
    return b.data.startDate.getTime() - a.data.startDate.getTime()
  })

  const projects = (await getCollection('projects')).sort((a, b) => {
    if (a.data.featured !== b.data.featured) return a.data.featured ? -1 : 1
    if (a.data.featured && b.data.featured && a.data.order !== b.data.order) return a.data.order - b.data.order
    const aEnd = a.data.endDate?.getTime() ?? Infinity
    const bEnd = b.data.endDate?.getTime() ?? Infinity
    if (aEnd !== bEnd) return bEnd - aEnd
    return b.data.startDate.getTime() - a.data.startDate.getTime()
  })

  const sections: string[] = []

  sections.push(`# Nicolas Zilli — Full Profile

> Lead Mobile Engineer and freelance software developer based in Lyon, France. Specialises in
> React Native and Expo, with 10 years of React experience. Full CV and portfolio in plain text.

Nicolas Zilli leads mobile engineering at Tennaxia, building field-first health, safety and
environmental (HSE) compliance tools used by teams on the ground. Through nozil.dev he works with
founders and small teams — often as the sole developer or technical lead, working directly
alongside CEOs and entrepreneurs — to turn ideas into shipped products. He brings 10 years of
React experience and 5 years of mobile-focused work, and is leaning into AI-assisted development
(Claude in particular) to help solo mobile developers punch above their weight.

Status: open to freelance, mobile-first product engagements. Not actively looking for full-time
roles. Based in Lyon, France — remote-friendly.

Links:
- Website: https://nozil.dev
- GitHub: https://github.com/nozil
- LinkedIn: https://www.linkedin.com/in/nicolaszilli
- Contact: https://nozil.dev/contact`)

  sections.push(`## Skills

- Mobile: React Native (5 years), Expo (managed + bare workflow), EAS Build / EAS Submit
- Frontend: React (10 years), TypeScript, Tailwind CSS, Astro, Next.js
- Backend / API: Node.js, GraphQL, REST, Elixir / Phoenix, Go, PostgreSQL, SQLite
- DevOps & Tooling: Turborepo, pnpm workspaces, GitHub Actions, Docker, Kubernetes, Cloudflare Workers
- AI / Productivity: Claude (Anthropic), Claude Code`)

  const workEntries = work.map((role) => {
    const { title, company, via, location, type, technologies, startDate, endDate } = role.data
    const heading = `### ${title} — ${company}`
    const meta = [
      dateRange(startDate, endDate),
      location,
      type,
      via ? `via ${via}` : null,
      technologies.length ? `Tech: ${technologies.join(', ')}` : null,
    ]
      .filter(Boolean)
      .join('\n')
    return `${heading}\n${meta}\n\n${role.body?.trim() ?? ''}`
  })
  sections.push(`## Work Experience\n\n${workEntries.join('\n\n')}`)

  const projectEntries = projects.map((project) => {
    const { title, tagline, role, client, technologies, startDate, endDate, github, links } = project.data
    const heading = `### ${title}`
    const meta = [
      tagline,
      `Role: ${role}`,
      client ? `Client: ${client}` : null,
      dateRange(startDate, endDate),
      technologies.length ? `Tech: ${technologies.join(', ')}` : null,
      github ? `GitHub: ${github}` : null,
      ...links.map((l) => `${l.label}: ${l.url}`),
      `Details: https://nozil.dev/portfolio/${project.id}`,
    ]
      .filter(Boolean)
      .join('\n')
    return `${heading}\n${meta}\n\n${project.body?.trim() ?? ''}`
  })
  sections.push(`## Portfolio\n\n${projectEntries.join('\n\n')}`)

  const body = sections.join('\n\n---\n\n') + '\n'

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
