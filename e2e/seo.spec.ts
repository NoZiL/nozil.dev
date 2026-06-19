import { test, expect } from '@playwright/test'

// Reads every JSON-LD block on the current page and returns the parsed objects.
async function jsonLd(page: import('@playwright/test').Page) {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
  return blocks.map((b) => JSON.parse(b) as Record<string, unknown>)
}

test('robots.txt is served and welcomes AI crawlers', async ({ request }) => {
  const res = await request.get('/robots.txt')
  expect(res.status()).toBe(200)
  const body = await res.text()
  expect(body).toContain('User-agent: *')
  expect(body).toContain('GPTBot')
  expect(body).toContain('ClaudeBot')
  expect(body).toContain('PerplexityBot')
  expect(body).toContain('Sitemap: https://nozil.dev/sitemap-index.xml')
})

test('llms.txt is served and follows the llmstxt.org shape', async ({ request }) => {
  const res = await request.get('/llms.txt')
  expect(res.status()).toBe(200)
  const body = await res.text()
  expect(body).toMatch(/^# Nicolas Zilli/)
  expect(body).toContain('## Skills')
  expect(body).toContain('## Contact')
  expect(body).toContain('https://nozil.dev/llms-full.txt')
})

test('llms-full.txt is served with CV and portfolio data', async ({ request }) => {
  const res = await request.get('/llms-full.txt')
  expect(res.status()).toBe(200)
  expect(res.headers()['content-type']).toContain('text/plain')
  const body = await res.text()
  expect(body).toContain('## Work Experience')
  expect(body).toContain('## Portfolio')
  // Pulled from the content collections, so a known role/project must appear.
  expect(body).toContain('Tennaxia')
})

test('sitemap index is generated', async ({ request }) => {
  const res = await request.get('/sitemap-index.xml')
  expect(res.status()).toBe(200)
  expect(await res.text()).toContain('<sitemapindex')
})

test('home page has a canonical link and Person + BreadcrumbList JSON-LD', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://nozil.dev/')

  const schemas = await jsonLd(page)
  const person = schemas.find((s) => s['@type'] === 'Person')
  expect(person).toBeTruthy()
  expect(person?.name).toBe('Nicolas Zilli')
  expect(person?.sameAs).toEqual(
    expect.arrayContaining(['https://github.com/nozil', 'https://www.linkedin.com/in/nicolaszilli'])
  )

  expect(schemas.some((s) => s['@type'] === 'BreadcrumbList')).toBe(true)
})

test('portfolio page exposes an ItemList of projects', async ({ page }) => {
  await page.goto('/portfolio')

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://nozil.dev/portfolio/')

  const schemas = await jsonLd(page)
  const list = schemas.find((s) => s['@type'] === 'ItemList') as { itemListElement?: unknown[] } | undefined
  expect(list).toBeTruthy()
  expect((list?.itemListElement ?? []).length).toBeGreaterThan(0)
})

test('project detail page has a BreadcrumbList ending on the project title', async ({ page }) => {
  // Reach a detail page via the first portfolio card so the slug stays in sync.
  await page.goto('/portfolio')
  const firstCard = page.locator('#project-grid > li').first().getByRole('link').first()
  await firstCard.click()
  await expect(page).toHaveURL(/\/portfolio\/.+/)

  const schemas = await jsonLd(page)
  const crumbs = schemas.find((s) => s['@type'] === 'BreadcrumbList') as
    | { itemListElement: { name: string; position: number }[] }
    | undefined
  expect(crumbs).toBeTruthy()
  const names = crumbs!.itemListElement.map((c) => c.name)
  expect(names[0]).toBe('Home')
  expect(names[1]).toBe('Portfolio')
  expect(names.length).toBe(3)
})
