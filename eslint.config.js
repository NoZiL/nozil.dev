import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import astro from 'eslint-plugin-astro'
import jsxA11y from 'eslint-plugin-jsx-a11y'

export default [
  {
    ignores: ['dist/', '.astro/', 'node_modules/', 'playwright-report/', 'test-results/', '**/*.d.ts'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  ...astro.configs['jsx-a11y-recommended'],
  {
    plugins: { 'jsx-a11y': jsxA11y },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
]
