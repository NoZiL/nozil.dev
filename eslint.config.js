import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import astro from 'eslint-plugin-astro'

export default [
  {
    ignores: ['dist/', '.astro/', '.wrangler/', 'node_modules/', 'playwright-report/', 'test-results/', '**/*.d.ts'],
  },
  {
    // Node scripts (build/deploy helpers) run in the Node runtime.
    files: ['scripts/**/*.{js,mjs}'],
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        fetch: 'readonly',
        URLSearchParams: 'readonly',
      },
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  // Registers the jsx-a11y plugin + its recommended rules for .astro files.
  ...astro.configs['jsx-a11y-recommended'],
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
]
