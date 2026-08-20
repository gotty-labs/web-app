/**
 * Server-side locale detection. Reads the request's `Accept-Language` header.
 * Server-only by construction (imports `next/headers`), so it never lands in a
 * client bundle. Use in Server Components, route handlers, and (Phase 4) the SEO
 * pages to pick the dictionary and the `gt-language` we send the backend.
 */
import { headers } from 'next/headers'

import { resolveLocale, type Locale } from './locales'

export async function getServerLocale(): Promise<Locale> {
  const acceptLanguage = (await headers()).get('accept-language')
  return resolveLocale(acceptLanguage)
}
