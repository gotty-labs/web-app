/**
 * Public URLs for the marketing pages published in both languages. English
 * keeps the unprefixed path (`/`, `/discover`); Spanish adds `/es` (`/es`,
 * `/es/discover`). The `(app)` zone does NOT use these: it stays homogeneous.
 */
import { defaultLocale, locales, type Locale } from './locales'

/** `/` → `/es`, `/discover` → `/es/discover` (English is returned unchanged). */
export function localizedPath(path: string, locale: Locale): string {
  if (locale === defaultLocale) return path
  return path === '/' ? `/${locale}` : `/${locale}${path}`
}

/** hreflang map for `path`: one entry per locale plus `x-default` → English. Pass `base` for absolute URLs. */
export function languageAlternates(path: string, base = ''): Record<Locale | 'x-default', string> {
  const languages = {} as Record<Locale | 'x-default', string>
  for (const locale of locales) languages[locale] = `${base}${localizedPath(path, locale)}`
  languages['x-default'] = `${base}${localizedPath(path, defaultLocale)}`
  return languages
}
