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
