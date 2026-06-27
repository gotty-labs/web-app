/**
 * Locale model (shared). We support `en` (default) and `es`, detected from the
 * user's system — NO user toggle and NO locale in the URL (homogeneous routing).
 * This uses the Next docs' "Localization" (dictionaries) approach decoupled from
 * its `[lang]` routing approach.
 *
 * `Locale` is the same union as the backend's `jg-language` header, so one source
 * of truth drives both UI copy and the language we ask the backend for.
 */
import type { JgLanguage } from '@/lib/domain/enums'

export type Locale = JgLanguage // "en" | "es"

export const locales = ['en', 'es'] as const satisfies readonly Locale[]
export const defaultLocale: Locale = 'en'

/**
 * Resolve a `Locale` from an `Accept-Language` header or a `navigator.language(s)`
 * value. Accepts a comma/quality list ("es-ES,es;q=0.9,en;q=0.8") or a single tag
 * ("es-ES"); matches by primary subtag; falls back to the default.
 *
 * For two locales this lightweight matcher is enough; if the set grows, switch to
 * `@formatjs/intl-localematcher` + `negotiator` as the Next docs suggest.
 */
export function resolveLocale(input: string | null | undefined): Locale {
  if (!input) return defaultLocale
  const tags = input
    .split(',')
    .map((part) => part.split(';')[0]?.trim().toLowerCase())
    .filter(Boolean) as string[]

  for (const tag of tags) {
    const primary = tag.split('-')[0]
    if ((locales as readonly string[]).includes(primary)) {
      return primary as Locale
    }
  }
  return defaultLocale
}

/** Client-side locale from the browser (safe to call during SSR → returns default). */
export function getClientLocale(): Locale {
  if (typeof navigator === 'undefined') return defaultLocale
  const fromBrowser = navigator.languages?.join(',') ?? navigator.language
  return resolveLocale(fromBrowser)
}
