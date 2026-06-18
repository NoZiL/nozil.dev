import { test, expect } from '@playwright/test'

test('portfolio page loads with correct title and heading, no console errors', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })

  await page.goto('/portfolio')

  await expect(page).toHaveTitle(/Portfolio/)
  await expect(page.getByRole('heading', { name: 'Portfolio', level: 1 })).toBeVisible()
  expect(errors).toEqual([])
})

test('grid renders every project as a card', async ({ page }) => {
  await page.goto('/portfolio')

  const cards = page.locator('#project-grid > li')
  await expect(cards).toHaveCount(7)
  await expect(page.getByRole('heading', { name: 'Tennaxia Déchets' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'nozil.dev' })).toBeVisible()
})

test('filter chips toggle card visibility without a reload', async ({ page }) => {
  await page.goto('/portfolio')
  const cards = page.locator('#project-grid > li')

  // Default: All — everything visible
  await expect(cards).toHaveCount(7)
  for (let i = 0; i < 7; i++) await expect(cards.nth(i)).toBeVisible()

  // Mobile → only the three mobile apps
  await page.getByRole('button', { name: 'Mobile' }).click()
  await expect(page.getByRole('button', { name: 'Mobile' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('#project-grid > li:visible')).toHaveCount(3)
  await expect(page.getByRole('heading', { name: 'Tennaxia Déchets' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'nozil.dev' })).toBeHidden()

  // OSS → the two open-source entries
  await page.getByRole('button', { name: 'OSS' }).click()
  await expect(page.locator('#project-grid > li:visible')).toHaveCount(2)
  await expect(page.getByRole('heading', { name: 'expo/expo-github-action' })).toBeVisible()

  // Back to All
  await page.getByRole('button', { name: 'All' }).click()
  await expect(page.locator('#project-grid > li:visible')).toHaveCount(7)
})

test('clicking a card opens its detail page', async ({ page }) => {
  await page.goto('/portfolio')

  await page.getByRole('heading', { name: 'Tennaxia Déchets' }).getByRole('link').click()
  await expect(page).toHaveURL(/\/portfolio\/tennaxia\/?$/)
  await expect(page.getByRole('heading', { name: 'Tennaxia Déchets', level: 1 })).toBeVisible()

  // Detail page essentials: role, tech stack, external links, og:image meta
  await expect(page.getByText('Lead Mobile Engineer')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Tech stack' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'App Store' })).toHaveAttribute('href', /apps\.apple\.com/)
  await expect(page.getByRole('link', { name: '← Portfolio' })).toHaveAttribute('href', '/portfolio')
})

test('home page shows featured project cards linking to detail pages', async ({ page }) => {
  await page.goto('/')

  const featured = page.locator('section[aria-labelledby="featured-heading"] > ul > li')
  await expect(featured).toHaveCount(3)
  await expect(page.getByRole('link', { name: 'All projects →' })).toHaveAttribute('href', '/portfolio')
  await expect(page.getByRole('heading', { name: 'nozil.dev' }).getByRole('link')).toHaveAttribute(
    'href',
    '/portfolio/nozil-dev'
  )
})

// Layout-critical mobile gate (docs/ux-plan.md → Responsive). Runs on Pixel 7.
test('no horizontal overflow and grid collapses to one column on mobile', async ({ page }, testInfo) => {
  await page.goto('/portfolio')

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  )
  expect(overflow).toBe(0)

  // Single-column collapse is a mobile-viewport concern; desktop runs the 2-col grid.
  if (testInfo.project.name === 'mobile') {
    // first two visible cards stack vertically (different rows)
    const cards = page.locator('#project-grid > li')
    const first = await cards.nth(0).boundingBox()
    const second = await cards.nth(1).boundingBox()
    expect(first && second && second.y).toBeGreaterThan((first?.y ?? 0) + (first?.height ?? 0) - 1)
  }

  // Filter chips wrap, stay reachable
  await expect(page.getByRole('button', { name: 'Mobile' })).toBeVisible()
})
