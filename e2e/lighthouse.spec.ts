import { test as base } from '@playwright/test'
import { chromium } from '@playwright/test'
import type { Browser } from '@playwright/test'
import { playAudit } from 'playwright-lighthouse'

// Lighthouse needs a Chromium exposing the DevTools protocol on a known port,
// so each worker launches its own browser with --remote-debugging-port. The
// `page` fixture inherited from the base test then drives that browser (and so
// still resolves URLs against the config baseURL). One unique port per worker
// keeps parallel runs from colliding.
const lighthouseTest = base.extend<object, { port: number; browser: Browser }>({
  port: [
    // Playwright requires the destructuring form even with no dependencies.
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      await use(10000 + Math.floor(Math.random() * 50000))
    },
    { scope: 'worker' },
  ],
  browser: [
    async ({ port }, use) => {
      const browser = await chromium.launch({
        args: [`--remote-debugging-port=${port}`, '--no-sandbox'],
      })
      await use(browser)
      await browser.close()
    },
    { scope: 'worker' },
  ],
})

lighthouseTest('home page scores ≥ 95 on Lighthouse SEO', async ({ page, port }, testInfo) => {
  // The SEO audit is device-independent — run it once, on the desktop project.
  lighthouseTest.skip(testInfo.project.name !== 'chromium', 'Lighthouse SEO audit runs once on desktop chromium')

  await page.goto('/')
  await page.waitForLoadState('networkidle')

  // playAudit throws (failing the test) when a category is below its threshold.
  await playAudit({
    page,
    port,
    // SEO only: faster and immune to CI perf/throttling flakiness.
    opts: { onlyCategories: ['seo'] },
    thresholds: { seo: 95 },
  })
})
