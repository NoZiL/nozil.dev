import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    // Explicit 127.0.0.1 (not "localhost") — wrangler dev / workerd bind IPv4,
    // and on some hosts "localhost" resolves to IPv6 ::1, which never connects.
    baseURL: 'http://127.0.0.1:8788',
  },
  webServer: {
    command: 'pnpm preview',
    url: 'http://127.0.0.1:8788',
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // Pixel 7 is Chromium-based, so CI only needs the chromium browser.
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
})
