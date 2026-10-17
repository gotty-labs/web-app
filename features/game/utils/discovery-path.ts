import { localizedPath, type Locale } from '@/lib/i18n'

/** Discovery is published per language: `/discover` (English) and `/es/discover` (Spanish). */
export const DISCOVERY_PATH = '/discover'

export function discoveryPath(locale: Locale): string {
  return localizedPath(DISCOVERY_PATH, locale)
}
