import { test, expect } from '@playwright/test'

test('work page loads with correct title', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })

  await page.goto('/work')

  await expect(page).toHaveTitle(/Nicolas Zilli/)
  await expect(page.getByRole('heading', { name: 'Work & CV', level: 1 })).toBeVisible()
  expect(errors).toEqual([])
})

test('download CV button is present and links to /cv.pdf', async ({ page }) => {
  await page.goto('/work')

  const downloadBtn = page.getByRole('link', { name: /Download CV/i })
  await expect(downloadBtn).toBeVisible()
  await expect(downloadBtn).toHaveAttribute('href', '/cv.pdf')
  await expect(downloadBtn).toHaveAttribute('download')
})

test('work history renders at least two roles', async ({ page }) => {
  await page.goto('/work')

  const timeline = page.getByRole('list', { name: 'Work history' })
  await expect(timeline).toBeVisible()

  const roles = timeline.getByRole('listitem')
  await expect(roles).toHaveCount(2)
})

test('Tennaxia role is rendered with correct details', async ({ page }) => {
  await page.goto('/work')

  await expect(page.getByRole('heading', { name: 'Lead Mobile Engineer', level: 3 })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Tennaxia' })).toHaveAttribute('href', 'https://www.tennaxia.com')

  const tennaxiaArticle = page.getByRole('article').filter({ hasText: 'Tennaxia' }).first()
  await expect(tennaxiaArticle.getByText('Present')).toBeVisible()

  const techList = tennaxiaArticle.getByRole('list', { name: 'Technologies used' })
  await expect(techList.getByRole('listitem').filter({ hasText: 'React Native' })).toBeVisible()
  await expect(techList.getByRole('listitem').filter({ hasText: 'TypeScript' })).toBeVisible()
})

test('freelance role is rendered', async ({ page }) => {
  await page.goto('/work')

  await expect(page.getByRole('heading', { name: 'Freelance Software Developer', level: 3 })).toBeVisible()
})

test('skills section renders grouped chips', async ({ page }) => {
  await page.goto('/work')

  const skillsSection = page.getByRole('region', { name: 'Skills' })
  await expect(skillsSection).toBeVisible()

  await expect(skillsSection.getByText('Mobile', { exact: true })).toBeVisible()
  await expect(skillsSection.getByText('React Native')).toBeVisible()
  await expect(skillsSection.getByText('Frontend', { exact: true })).toBeVisible()
  await expect(skillsSection.getByText('TypeScript')).toBeVisible()
  await expect(skillsSection.getByText('DevOps & Tooling')).toBeVisible()
  await expect(skillsSection.getByText('GitHub Actions')).toBeVisible()
})

test('education section is present', async ({ page }) => {
  await page.goto('/work')

  const educationSection = page.getByRole('region', { name: 'Education' })
  await expect(educationSection).toBeVisible()
})

// Runs in both projects; on Pixel 7 this is the layout-critical mobile gate
// (see docs/ux-plan.md → Responsive).
test('no horizontal overflow and nav stays usable on work page', async ({ page }) => {
  await page.goto('/work')

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  )
  expect(overflow).toBe(0)

  const nav = page.getByRole('navigation', { name: 'Main' })
  await expect(nav.getByRole('link', { name: 'Work' })).toBeVisible()
  await expect(nav.getByRole('button', { name: 'Toggle dark mode' })).toBeVisible()
})
