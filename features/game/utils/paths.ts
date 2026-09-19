import { defaultLocale, type Locale } from '@/lib/i18n/locales'

/** Public SEO path for a game in the requested locale. */
export function gamePath(slug: string, locale: Locale): string {
  return locale === defaultLocale ? `/games/${slug}` : `/${locale}/games/${slug}`
}
