/**
 * Dictionary loading (Next docs' "Localization" pattern). Translations live in
 * `dictionaries/<locale>.json` — the SINGLE source of copy, used everywhere
 * (errors now, UI later). The JSON is dynamically imported so only the ACTIVE
 * locale's file is code-split into the bundle (works on server AND client).
 *
 * The shape is validated with Zod on load (fail-loud): a missing/renamed key in
 * any locale file throws here instead of rendering `undefined` in the UI. The
 * `Dictionary` TYPE is inferred from that schema — one source of truth.
 *
 * New namespaces (e.g. `common`, per-screen UI copy) get added to BOTH the schema
 * and every `<locale>.json`.
 */
import { z } from 'zod'

import { defaultLocale, type Locale } from './locales'

const errorByCodeSchema = z.object({
  invalidCredentials: z.string(),
  resetLinkExpired: z.string(),
  userNotFound: z.string(),
  invalidOAuthCredentials: z.string(),
  guestNotAllowed: z.string(),
  registerUnavailable: z.string(),
  oauthAlreadyRegistered: z.string(),
  invalidVerificationCode: z.string(),
  gameNotFound: z.string(),
  listNameExists: z.string(),
  webNotAllowed: z.string(),
})

export const dictionarySchema = z.object({
  errors: z.object({
    byCode: errorByCodeSchema,
    generic: z.object({
      rateLimit: z.string(),
      server: z.string(),
      network: z.string(),
      validation: z.string(),
      sessionExpired: z.string(),
      unknown: z.string(),
    }),
  }),
})

export type Dictionary = z.infer<typeof dictionarySchema>
/** Semantic keys for per-`internalCode` error copy (see `errors.ts` mapping). */
export type ErrorByCodeKey = keyof Dictionary['errors']['byCode']

const loaders: Record<Locale, () => Promise<unknown>> = {
  en: () => import('./dictionaries/en.json').then((m) => m.default),
  es: () => import('./dictionaries/es.json').then((m) => m.default),
}

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const raw = await (loaders[locale] ?? loaders[defaultLocale])()
  return dictionarySchema.parse(raw)
}
