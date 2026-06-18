import { tv } from 'tailwind-variants'

// Shared pill shape for the rounded tag/chip family. Chip (static tag) and
// FilterChip (interactive toggle) extend this so the base geometry lives in
// one place; each adds its own surface/state styling.
export const pill = tv({
  base: 'dark:border-dusk-border rounded-full border border-zinc-200 font-mono text-xs',
  variants: {
    size: {
      sm: 'px-2.5 py-0.5',
      md: 'px-3 py-1',
    },
  },
  defaultVariants: { size: 'sm' },
})
