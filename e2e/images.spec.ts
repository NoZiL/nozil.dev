import { test, expect } from '@playwright/test'

// Deterministic guard for image optimisation (issue #32). Unlike the Lighthouse
// performance audit this asserts concrete, hardware-independent invariants, so
// it can never flake on CI throttling:
//   - every <img> has alt text (a11y / SEO),
//   - every <img> is explicitly sized (no layout shift),
//   - project screenshots ship as optimised WebP, not raw PNG/JPEG,
//   - no single image transfers more than the byte budget.

const PAGES = ['/', '/portfolio', '/portfolio/tennaxia', '/work']

// Generous cap — the optimised WebP variants land well under this; a regression
// that reintroduces a raw multi-MB screenshot blows straight past it.
const MAX_IMAGE_BYTES = 300 * 1024

for (const path of PAGES) {
  test(`every image on ${path} has alt text and explicit dimensions`, async ({ page }) => {
    await page.goto(path)
    const imgs = page.locator('img')
    const count = await imgs.count()
    for (let i = 0; i < count; i++) {
      const img = imgs.nth(i)
      // alt must be present (empty alt is only valid on aria-hidden decoratives,
      // of which this site has none rendered as <img>).
      await expect(img, `img #${i} on ${path} missing alt`).toHaveAttribute('alt', /.+/)
      await expect(img, `img #${i} on ${path} missing width`).toHaveAttribute('width', /\d+/)
      await expect(img, `img #${i} on ${path} missing height`).toHaveAttribute('height', /\d+/)
    }
  })
}

test('project screenshots are served as optimised WebP under budget', async ({ page }) => {
  const oversized: string[] = []
  const nonWebp: string[] = []

  page.on('response', async (res) => {
    const url = res.url()
    const type = res.request().resourceType()
    if (type !== 'image') return
    // Ignore the SVG favicon — it's vector, not a raster screenshot.
    if (url.endsWith('.svg')) return

    if (!/\.webp(\?|$)/.test(url)) nonWebp.push(url)

    const len = Number(res.headers()['content-length'] ?? '0')
    if (len > MAX_IMAGE_BYTES) oversized.push(`${url} (${Math.round(len / 1024)}KB)`)
  })

  await page.goto('/portfolio')
  await page.waitForLoadState('networkidle')

  expect(nonWebp, `non-WebP raster images served: ${nonWebp.join(', ')}`).toEqual([])
  expect(oversized, `images over ${MAX_IMAGE_BYTES / 1024}KB: ${oversized.join(', ')}`).toEqual([])
})
