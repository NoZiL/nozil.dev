import { test, expect } from '@playwright/test'

test('work page loads with correct title and heading, no console errors', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })

  await page.goto('/work')

  await expect(page).toHaveTitle(/Work & CV/)
  await expect(page.getByRole('heading', { name: 'Work & CV', level: 1 })).toBeVisible()
  expect(errors).toEqual([])
})

test('download CV button is present and points to /cv.pdf', async ({ page }) => {
  await page.goto('/work')
  const downloadBtn = page.getByRole('link', { name: 'Download CV' })
  await expect(downloadBtn).toHaveAttribute('href', '/cv.pdf')
  await expect(downloadBtn).toHaveAttribute('download')
})

test('renders roles in reverse-chronological timeline with details', async ({ page }) => {
  await page.goto('/work')

  const roles = page.locator('#experience-heading ~ ol > li')
  await expect(roles).toHaveCount(6)

  // Current roles show "Present" and the company link opens in a new tab
  await expect(page.getByRole('heading', { name: /Lead Mobile Engineer · Tennaxia/ })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Tennaxia' })).toHaveAttribute('href', 'https://www.tennaxia.com')
  await expect(page.getByText('Present').first()).toBeVisible()

  // Tech tags render as chips (exact match avoids matching the bullet prose)
  await expect(roles.first().getByText('React Native', { exact: true })).toBeVisible()

  // Each role shows a company badge — a logo image or a monogram fallback
  await expect(page.locator('#experience-heading ~ ol [data-company-badge]')).toHaveCount(6)
})

test('skills section groups chips by domain', async ({ page }) => {
  await page.goto('/work')

  await expect(page.getByRole('heading', { name: 'Skills' })).toBeVisible()
  for (const group of [
    'Mobile',
    'Frontend',
    'Backend & Infra',
    'Auth & Services',
    'Tooling & CI/CD',
    'AI-assisted development',
  ]) {
    await expect(page.getByRole('heading', { name: group, exact: true })).toBeVisible()
  }
  await expect(page.getByRole('listitem').filter({ hasText: 'Expo' }).first()).toBeVisible()
  await expect(page.getByRole('listitem').filter({ hasText: 'Claude Code' }).first()).toBeVisible()
})

test('education block lists both schools with badges', async ({ page }) => {
  await page.goto('/work')
  await expect(page.getByRole('heading', { name: 'Education' })).toBeVisible()
  await expect(page.getByText('Polytech Lyon')).toBeVisible()
  await expect(page.getByText('IUT Lyon 1')).toBeVisible()
  await expect(page.locator('#education-heading ~ ul [data-school-badge]')).toHaveCount(2)
})

// Layout-critical mobile gate (docs/ux-plan.md → Responsive). Runs on Pixel 7.
test('no horizontal overflow and nav stays usable on mobile', async ({ page }) => {
  await page.goto('/work')

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  )
  expect(overflow).toBe(0)

  // CV download stays reachable above the timeline
  await expect(page.getByRole('link', { name: 'Download CV' })).toBeVisible()

  const nav = page.getByRole('navigation', { name: 'Main' })
  await expect(nav.getByRole('link', { name: 'Work' })).toBeVisible()
})
