import { test, expect } from '@playwright/test'

// French locale, hreflang, and the language toggle (issue #7). English is the
// default at `/`; French lives under `/fr/`.

test('French home page loads with French strings and lang=fr', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })

  await page.goto('/fr/')

  await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
  // Localized nav + intro prose
  const nav = page.getByRole('navigation', { name: 'Main' })
  await expect(nav.getByRole('link', { name: 'Parcours' })).toBeVisible()
  await expect(page.getByText(/Développeur basé à Lyon/)).toBeVisible()
  await expect(page.getByRole('link', { name: 'Voir le CV' })).toHaveAttribute('href', '/fr/work')
  expect(errors).toEqual([])
})

test('French sub-pages render their localized headings', async ({ page }) => {
  await page.goto('/fr/work')
  await expect(page.getByRole('heading', { name: 'Parcours & CV', level: 1 })).toBeVisible()

  await page.goto('/fr/contact')
  await expect(page.getByRole('heading', { name: 'Entrons en contact' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Envoyer le message' })).toBeVisible()

  await page.goto('/fr/portfolio')
  await expect(page.getByRole('heading', { name: 'Portfolio', level: 1 })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Tous' })).toBeVisible()
})

test('language toggle switches locale and persists in the URL', async ({ page }) => {
  // Scope to the nav + exact match: "EN"/"FR" would otherwise substring-match
  // links like "Tennaxia" or "Télécharger en PDF".
  const nav = page.getByRole('navigation', { name: 'Main' })

  // EN → FR from a sub-page keeps the same page
  await page.goto('/work')
  await nav.getByRole('link', { name: 'FR', exact: true }).click()
  await expect(page).toHaveURL(/\/fr\/work\/?$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr')

  // FR → EN back to the English equivalent
  await nav.getByRole('link', { name: 'EN', exact: true }).click()
  await expect(page).toHaveURL(/\/work\/?$/)
  await expect(page).not.toHaveURL(/\/fr\//)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
})

test('the active locale link is marked aria-current', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Main' })

  await page.goto('/')
  await expect(nav.getByRole('link', { name: 'EN', exact: true })).toHaveAttribute('aria-current', 'true')

  await page.goto('/fr/')
  await expect(nav.getByRole('link', { name: 'FR', exact: true })).toHaveAttribute('aria-current', 'true')
})

test('hreflang alternates are present on both locales', async ({ page }) => {
  for (const path of ['/', '/fr/']) {
    await page.goto(path)
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', 'https://nozil.dev/')
    await expect(page.locator('link[rel="alternate"][hreflang="fr"]')).toHaveAttribute('href', 'https://nozil.dev/fr/')
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
      'href',
      'https://nozil.dev/'
    )
  }
})

test('sitemap exposes hreflang alternates', async ({ request }) => {
  // The i18n sitemap config emits <xhtml:link rel="alternate" hreflang> pairs.
  const index = await request.get('/sitemap-index.xml')
  expect(index.status()).toBe(200)
  const sub = (await index.text()).match(/<loc>([^<]+sitemap-0\.xml)<\/loc>/)?.[1]
  expect(sub).toBeTruthy()

  const res = await request.get(new URL(sub!).pathname)
  const body = await res.text()
  expect(body).toContain('hreflang="fr"')
  expect(body).toContain('hreflang="en"')
  expect(body).toContain('https://nozil.dev/fr/')
})

// Layout-critical mobile gate (docs/ux-plan.md → Responsive). Runs on Pixel 7.
test('French home: no horizontal overflow and nav stays usable', async ({ page }) => {
  await page.goto('/fr/')

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  )
  expect(overflow).toBe(0)

  const nav = page.getByRole('navigation', { name: 'Main' })
  await expect(nav.getByRole('link', { name: 'Parcours' })).toBeVisible()
  await expect(nav.getByRole('button', { name: 'Toggle dark mode' })).toBeVisible()
  await expect(nav.getByRole('link', { name: 'FR', exact: true })).toBeVisible()
})
