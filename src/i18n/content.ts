import { getCollection, type CollectionEntry } from 'astro:content'
import { defaultLang, type Lang } from './ui'

// Helpers for the locale-partitioned content collections (work, projects).
// Each entry lives under a locale subdir, so its id is `<lang>/<slug>` (e.g.
// `en/cnet`, `fr/cnet`). The slug is locale-independent: it's the stable key
// that ties the two language versions together and keeps /portfolio/<slug> and
// /fr/portfolio/<slug> — and their hreflang alternates — symmetric.

type LocalizedCollection = 'work' | 'projects'

/** Locale prefix of an entry id (`fr/cnet` → `fr`, `en/cnet` → `en`). */
export function entryLocale(id: string): Lang {
  return id.startsWith('fr/') ? 'fr' : 'en'
}

/** Locale-independent slug of an entry id (`en/cnet` → `cnet`). */
export function entrySlug(id: string): string {
  return id.replace(/^(en|fr)\//, '')
}

/**
 * Entries of a collection for one locale, keyed by slug. When a slug has no
 * translation for `lang`, the default-locale (en) entry is used as a fallback
 * so an untranslated item still renders and the slug stays present in both
 * locales (keeping detail routes and hreflang alternates aligned).
 */
export async function getLocalizedEntries<C extends LocalizedCollection>(
  collection: C,
  lang: Lang
): Promise<CollectionEntry<C>[]> {
  const all = await getCollection(collection)
  const bySlug = new Map<string, CollectionEntry<C>>()
  for (const entry of all) {
    const slug = entrySlug(entry.id)
    const loc = entryLocale(entry.id)
    if (loc === lang)
      bySlug.set(slug, entry) // requested locale always wins
    else if (loc === defaultLang && !bySlug.has(slug)) bySlug.set(slug, entry) // fallback
  }
  return [...bySlug.values()]
}
