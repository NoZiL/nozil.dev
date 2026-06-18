import { test, expect } from '@playwright/test'

test('contact page loads with correct title and no console errors', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })

  await page.goto('/contact')

  await expect(page).toHaveTitle(/Contact.*Nicolas Zilli/)
  await expect(page.getByRole('heading', { name: 'Get in touch' })).toBeVisible()
  expect(errors).toEqual([])
})

test('form renders all required fields', async ({ page }) => {
  await page.goto('/contact')

  await expect(page.getByLabel('Name')).toBeVisible()
  await expect(page.getByLabel('Email')).toBeVisible()
  await expect(page.getByLabel(/Subject/)).toBeVisible()
  await expect(page.getByLabel('Message')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Send message' })).toBeVisible()
})

test('client-side validation shows field errors on empty submit', async ({ page }) => {
  await page.goto('/contact')

  await page.getByRole('button', { name: 'Send message' }).click()

  await expect(page.locator('#error-name')).toBeVisible()
  await expect(page.locator('#error-email')).toBeVisible()
  await expect(page.locator('#error-message')).toBeVisible()
  // Form stays visible
  await expect(page.locator('#form-wrap')).toBeVisible()
})

test('short message triggers validation error', async ({ page }) => {
  await page.goto('/contact')

  await page.getByLabel('Name').fill('Test User')
  await page.getByLabel('Email').fill('test@example.com')
  await page.getByLabel('Message').fill('Too short')
  await page.getByRole('button', { name: 'Send message' }).click()

  await expect(page.locator('#error-message')).toBeVisible()
  await expect(page.locator('#error-message')).toContainText('20 characters')
})

test('server error state shown when API is unconfigured (no env vars)', async ({ page }) => {
  await page.goto('/contact')

  await page.getByLabel('Name').fill('Test User')
  await page.getByLabel('Email').fill('test@example.com')
  await page.getByLabel('Message').fill('This is a test message that is long enough to pass validation.')
  await page.getByRole('button', { name: 'Send message' }).click()

  // RESEND_API_KEY is not set in the test environment — expect server error state
  await expect(page.locator('#server-error')).toBeVisible({ timeout: 10_000 })
  // Reveal fallback email button is shown inside the error area
  await expect(page.locator('#server-error').getByRole('button', { name: 'Show email' })).toBeVisible()
})

test('success state shown when API returns 200 (mocked)', async ({ page }) => {
  // Intercept the POST and return a mocked success response
  await page.route('/api/contact', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
  )

  await page.goto('/contact')

  await page.getByLabel('Name').fill('Test User')
  await page.getByLabel('Email').fill('test@example.com')
  await page.getByLabel('Message').fill('This is a test message that is long enough to pass validation.')
  await page.getByRole('button', { name: 'Send message' }).click()

  await expect(page.locator('#success-wrap')).toBeVisible({ timeout: 5_000 })
  await expect(page.locator('#success-wrap')).toContainText('Message sent')
  await expect(page.locator('#form-wrap')).toBeHidden()
})

test('email reveal in error area assembles address on click', async ({ page }) => {
  await page.route('/api/contact', (route) =>
    route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Server error' }) })
  )

  await page.goto('/contact')

  await page.getByLabel('Name').fill('Test User')
  await page.getByLabel('Email').fill('test@example.com')
  await page.getByLabel('Message').fill('This is a test message that is long enough to pass validation.')
  await page.getByRole('button', { name: 'Send message' }).click()

  const errorArea = page.locator('#server-error')
  await expect(errorArea).toBeVisible({ timeout: 5_000 })

  await errorArea.getByRole('button', { name: 'Show email' }).click()
  await expect(page.locator('#email-display-contact')).toHaveText('contact@nozil.dev')
  await expect(errorArea.getByRole('button', { name: 'Show email' })).toBeHidden()
})

test('email address never appears in contact page static HTML', async ({ page }) => {
  const response = await page.goto('/contact')
  const source = (await response?.text()) ?? ''

  expect(source).not.toContain('contact@nozil.dev')
  expect(source).not.toContain('mailto:')
})

// Layout-critical mobile gate (docs/ux-plan.md → Responsive). Runs on Pixel 7.
test('no horizontal overflow, form fields full width on mobile', async ({ page }, testInfo) => {
  await page.goto('/contact')

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  )
  expect(overflow).toBe(0)

  if (testInfo.project.name === 'mobile') {
    // Inputs should be full-width on mobile (touch targets reachable)
    const nameInput = page.getByLabel('Name')
    const box = await nameInput.boundingBox()
    expect(box?.width).toBeGreaterThan(280)
  }
})
