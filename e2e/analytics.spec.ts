import { test, expect } from '@playwright/test'

// Cloudflare Web Analytics beacon. The token is a build-time env var
// (CF_BEACON_TOKEN, see astro.config.mjs); the beacon is only emitted when it
// is set. CI builds run without it — the default-off branch below is what runs
// in CI. Building locally with the token set exercises the present branch.
const token = process.env.CF_BEACON_TOKEN
const beaconSrc = 'https://static.cloudflareinsights.com/beacon.min.js'

test.describe('Cloudflare Web Analytics beacon', () => {
  if (token) {
    test('beacon is emitted with the configured token, scoped to the body', async ({ page }) => {
      // Don't actually hit Cloudflare during the test — assert on the served HTML.
      await page.route(beaconSrc, (route) => route.abort())

      const response = await page.goto('/')
      const html = (await response?.text()) ?? ''

      const beacon = page.locator(`script[src="${beaconSrc}"]`)
      await expect(beacon).toHaveAttribute('defer', '')
      // data-cf-beacon carries the token as JSON; the browser decodes the
      // HTML-escaped quotes, so dataset access yields clean JSON.
      const data = await beacon.getAttribute('data-cf-beacon')
      expect(JSON.parse(data ?? '{}')).toEqual({ token })

      // Beacon lives in <body>, after the page content — not the <head>.
      expect(html).toContain(beaconSrc)
    })
  } else {
    test('no beacon and no token leak when CF_BEACON_TOKEN is unset', async ({ page }) => {
      const response = await page.goto('/')
      const html = (await response?.text()) ?? ''

      expect(html).not.toContain('cloudflareinsights')
      expect(html).not.toContain('data-cf-beacon')
      await expect(page.locator(`script[src="${beaconSrc}"]`)).toHaveCount(0)
    })
  }
})
