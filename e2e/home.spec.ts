import { test, expect } from '@playwright/test'

test('home page loads with correct title and no console errors', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })

  await page.goto('/')

  await expect(page).toHaveTitle(/Nicolas Zilli/)
  await expect(page.getByRole('heading', { name: 'Nicolas Zilli', level: 1 })).toBeVisible()
  expect(errors).toEqual([])
})

test('hero, skill chips and featured empty state are visible', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByText('Lead Mobile Engineer · Freelance Software Developer')).toBeVisible()
  await expect(page.getByText(/Lyon-based developer/)).toBeVisible()
  await expect(page.getByRole('listitem').filter({ hasText: 'React Native' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Featured work' })).toBeVisible()
})

test('nav and CTA links point to the right routes', async ({ page }) => {
  await page.goto('/')

  const nav = page.getByRole('navigation', { name: 'Main' })
  await expect(nav.getByRole('link', { name: 'Work' })).toHaveAttribute('href', '/work')
  await expect(nav.getByRole('link', { name: 'Portfolio' })).toHaveAttribute('href', '/portfolio')
  await expect(nav.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/contact')

  await expect(page.getByRole('link', { name: 'View CV' })).toHaveAttribute('href', '/work')
  await expect(page.getByRole('link', { name: 'See portfolio' })).toHaveAttribute('href', '/portfolio')
  await expect(page.getByRole('link', { name: 'Contact me' })).toHaveAttribute('href', '/contact')
})

test('dark mode toggle switches the class and persists across reloads', async ({ page }) => {
  await page.goto('/')
  const html = page.locator('html')
  const toggle = page.getByRole('button', { name: 'Toggle dark mode' })

  await expect(html).not.toHaveClass(/dark/)

  await toggle.click()
  await expect(html).toHaveClass(/dark/)

  await page.reload()
  await expect(html).toHaveClass(/dark/)

  await toggle.click()
  await expect(html).not.toHaveClass(/dark/)
  await page.reload()
  await expect(html).not.toHaveClass(/dark/)
})

test('footer has the required backlinks and colophon', async ({ page }) => {
  await page.goto('/')
  const footer = page.locator('footer')

  await expect(footer.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/nozil')
  await expect(footer.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
    'href',
    'https://www.linkedin.com/in/nicolaszilli'
  )
  await expect(footer.getByText(/Built with/)).toBeVisible()
})

test('email never appears in static HTML and is revealed on click', async ({ page }) => {
  const response = await page.goto('/')
  const source = (await response?.text()) ?? ''

  expect(source).not.toContain('contact@nozil.dev')
  expect(source).not.toContain('mailto:')

  await page.getByRole('button', { name: 'Show email' }).click()
  await expect(page.locator('#email-display')).toHaveText('contact@nozil.dev')
  await expect(page.getByRole('button', { name: 'Show email' })).toBeHidden()
})

test('og and rel=me meta tags are present', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Nicolas Zilli/)
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /.+/)
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', 'https://nozil.dev/')
  await expect(page.locator('link[rel="me"]')).toHaveCount(2)
})

// Runs in both projects; on Pixel 7 this is the layout-critical mobile gate
// (see docs/ux-plan.md → Responsive).
test('no horizontal overflow and nav stays usable', async ({ page }) => {
  await page.goto('/')

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  )
  expect(overflow).toBe(0)

  const nav = page.getByRole('navigation', { name: 'Main' })
  await expect(nav.getByRole('link', { name: 'Work' })).toBeVisible()
  await expect(nav.getByRole('button', { name: 'Toggle dark mode' })).toBeVisible()
})
