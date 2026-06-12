import { defineConfig, configDefaults } from 'vitest/config'

// Unit tests only (src/**). The e2e/ dir holds Playwright specs, which must
// not be picked up by Vitest.
export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.ts'],
    exclude: [...configDefaults.exclude, 'e2e/**'],
    // No unit tests yet; don't fail the script until the first one lands.
    passWithNoTests: true,
  },
})
