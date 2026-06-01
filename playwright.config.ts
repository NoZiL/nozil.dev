import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:8788',
  },
  webServer: {
    command: 'pnpm preview',
    port: 8788,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // Pixel 7 is Chromium-based, so CI only needs the chromium browser.
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
})
