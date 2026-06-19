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
  // Form stays visible; submit button re-enabled (no network request was made)
  await expect(page.locator('#form-wrap')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Send message' })).toBeEnabled()
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

test('server-side field errors (422) render inline on their slots', async ({ page }) => {
  await page.route('/api/contact', (route) =>
    route.fulfill({
      status: 422,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Validation failed', issues: { email: ['A valid email is required'] } }),
    })
  )

  await page.goto('/contact')

  // Fill values that pass client validation so the request actually fires
  await page.getByLabel('Name').fill('Test User')
  await page.getByLabel('Email').fill('test@example.com')
  await page.getByLabel('Message').fill('This is a test message that is long enough to pass validation.')
  await page.getByRole('button', { name: 'Send message' }).click()

  // Server-flagged field error appears inline; generic block stays hidden
  await expect(page.locator('#error-email')).toBeVisible({ timeout: 5_000 })
  await expect(page.locator('#error-email')).toContainText('valid email')
  await expect(page.locator('#server-error')).toBeHidden()
})

test('server error for a field with no slot falls back to the generic block', async ({ page }) => {
  await page.route('/api/contact', (route) =>
    route.fulfill({
      status: 422,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Validation failed', issues: { _form: ['Unexpected error'] } }),
    })
  )

  await page.goto('/contact')

  await page.getByLabel('Name').fill('Test User')
  await page.getByLabel('Email').fill('test@example.com')
  await page.getByLabel('Message').fill('This is a test message that is long enough to pass validation.')
  await page.getByRole('button', { name: 'Send message' }).click()

  // No slot for _form → must not be silently swallowed; generic block shows
  await expect(page.locator('#server-error')).toBeVisible({ timeout: 5_000 })
})

test('server error state shown when API returns 500 (mocked)', async ({ page }) => {
  await page.route('/api/contact', (route) =>
    route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Server error' }) })
  )

  await page.goto('/contact')

  await page.getByLabel('Name').fill('Test User')
  await page.getByLabel('Email').fill('test@example.com')
  await page.getByLabel('Message').fill('This is a test message that is long enough to pass validation.')
  await page.getByRole('button', { name: 'Send message' }).click()

  await expect(page.locator('#server-error')).toBeVisible({ timeout: 5_000 })
  // Submit button re-enabled so the user can retry
  await expect(page.getByRole('button', { name: 'Send message' })).toBeEnabled()
  // Reveal fallback email button is shown inside the error area
  await expect(page.locator('#server-error').getByRole('button', { name: 'Show email' })).toBeVisible()
})

test('success state shown when API returns 200 (mocked)', async ({ page }) => {
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

test('re-submit after server error clears error state and can succeed', async ({ page }) => {
  let callCount = 0
  await page.route('/api/contact', (route) => {
    callCount++
    if (callCount === 1) {
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Server error' }) })
    } else {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
    }
  })

  await page.goto('/contact')

  const fillForm = async () => {
    await page.getByLabel('Name').fill('Test User')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Message').fill('This is a test message that is long enough to pass validation.')
  }

  // First submit → error
  await fillForm()
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.locator('#server-error')).toBeVisible({ timeout: 5_000 })

  // Second submit → success; error area must be cleared
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.locator('#server-error')).toBeHidden()
  await expect(page.locator('#success-wrap')).toBeVisible({ timeout: 5_000 })
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
