import { en } from './en'
import { fr } from './fr'

// Human-readable language names (used by the nav toggle / aria labels).
export const languages = { en: 'English', fr: 'Français' } as const
export const defaultLang = 'en' as const

export type Lang = keyof typeof languages
// en is the source of truth for the string-map shape; fr must satisfy it.
export type UI = typeof en

const dictionaries: Record<Lang, UI> = { en, fr }

/** Narrow Astro.currentLocale (a loose string | undefined) to a known Lang. */
export function getLang(locale: string | undefined): Lang {
  return locale === 'fr' ? 'fr' : 'en'
}

/** The string map for a locale, e.g. `const t = useTranslations(lang)`. */
export function useTranslations(lang: Lang): UI {
  return dictionaries[lang]
}

/**
 * Strip any locale prefix from a path, yielding the canonical (en) path.
 * `/fr/work/` → `/work/`, `/fr` → `/`, `/work` → `/work`.
 */
export function stripLocale(path: string): string {
  const p = path.replace(/^\/fr(?=\/|$)/, '')
  return p === '' ? '/' : p
}

/**
 * Localize a canonical path for a target locale. en keeps the bare path;
 * fr gets the `/fr` prefix. Trailing slashes are preserved.
 * `localizePath('/work', 'fr')` → `/fr/work`; `localizePath('/', 'fr')` → `/fr/`.
 */
export function localizePath(path: string, lang: Lang): string {
  const shared = stripLocale(path)
  if (lang === 'en') return shared
  return shared === '/' ? '/fr/' : `/fr${shared}`
}
