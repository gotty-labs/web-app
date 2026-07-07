/**
 * PUBLIC SEO catalog clients (server-side, NO token) for the static `/games/[slug]`
 * zone. Uses `apiRequest` directly (Option A: public read-only endpoints) and
 * Next's ISR caching (`next: { revalidate, tags }`) so a page is fetched once and
 * served static, then refreshed in the background / on-demand via the revalidate
 * webhook (`game:<slug>` and `game-sitemap` tags).
 */
import { z } from 'zod'

import type { Metadata } from 'next'

import { apiRequest } from '@/lib/api/client'
import { ApiException } from '@/lib/api/envelope'
import { InternalCode } from '@/lib/api/error-codes'
import { retryOn429 } from '@/lib/api/retry'
import { env } from '@/lib/config/env'
import { defaultLocale, locales, type Locale } from '@/lib/i18n'
import {
  gameDtoSchema,
  gameSitemapEntrySchema,
  type GameDto,
  type GameSitemapEntry,
} from '@/lib/domain/models'

/** Shared SEO revalidation window (1h); on-demand revalidation handles freshness. */
export const SEO_REVALIDATE_SECONDS = 3600

/** All publishable games (id/slug/updatedAt) for static params + sitemap. */
export function getSitemapEntries(): Promise<GameSitemapEntry[]> {
  // Idempotent GET on the cold-render path → back off + retry on 429 (rate limit)
  // instead of failing the build/render when many cold pages hit the backend at once.
  return retryOn429(() =>
    apiRequest({
      method: 'GET',
      path: '/game/sitemaps',
      schema: z.array(gameSitemapEntrySchema),
      next: { revalidate: SEO_REVALIDATE_SECONDS, tags: ['game-sitemap'] },
    }),
  )
}

/** Public game detail by slug (no user-specific fields). */
export function getPublicGame(slug: string, locale: Locale = defaultLocale): Promise<GameDto> {
  // Idempotent GET on the cold-render path → back off + retry on 429 (rate limit).
  return retryOn429(() =>
    apiRequest({
      method: 'GET',
      path: `/game/public/${slug}`,
      language: locale,
      schema: gameDtoSchema,
      next: { revalidate: SEO_REVALIDATE_SECONDS, tags: [`game:${slug}`] },
    }),
  )
}

/**
 * Like `getPublicGame` but resolves `null` ONLY for a real "game not found"
 * (`GAME_NOT_FOUND` / HTTP 404). Anything else (5xx, network, rate-limit after
 * retries) RETHROWS so the page render errors instead of soft-404ing — a
 * transient backend outage must never turn indexed game pages into 404s.
 */
export async function findPublicGame(slug: string, locale?: Locale): Promise<GameDto | null> {
  try {
    return await getPublicGame(slug, locale)
  } catch (error) {
    const notFound =
      error instanceof ApiException &&
      (error.internalCode === InternalCode.GAME_NOT_FOUND || error.status === 404)
    if (notFound) return null
    throw error
  }
}

// --- per-locale URLs for the SEO zone (default unprefixed, others under /<locale>) ---

/** SEO path for a game in a given locale, e.g. `/games/x` (en) or `/es/games/x`. */
export function gamePath(slug: string, locale: Locale): string {
  return locale === defaultLocale ? `/games/${slug}` : `/${locale}/games/${slug}`
}

/** Absolute hreflang map (every locale + `x-default`) for a game — used by the
 *  sitemap (`alternates.languages`) and each page's `<head>` (canonical alternates). */
export function gameLanguageAlternates(slug: string): Record<string, string> {
  const languages: Record<string, string> = {}
  for (const locale of locales) {
    languages[locale] = `${env.siteUrl}${gamePath(slug, locale)}`
  }
  languages['x-default'] = `${env.siteUrl}${gamePath(slug, defaultLocale)}`
  return languages
}

/** Per-locale Metadata for a game detail page (title/desc/canonical/hreflang/OG). */
export async function buildGameMetadata(slug: string, locale: Locale): Promise<Metadata> {
  const game = await findPublicGame(slug, locale)
  if (!game) return {}

  const canonical = `${env.siteUrl}${gamePath(slug, locale)}`
  return {
    title: game.name,
    description: game.description,
    alternates: { canonical, languages: gameLanguageAlternates(slug) },
    openGraph: {
      title: game.name,
      description: game.description,
      url: canonical,
      images: game.media?.cover ? [game.media.cover] : undefined,
    },
  }
}
