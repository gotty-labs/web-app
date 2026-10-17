/**
 * PUBLIC SEO catalog clients (server-side, NO token) for the static `/games/[slug]`
 * zone. Uses `apiRequest` directly (Option A: public read-only endpoints) and
 * Next's ISR caching (`next: { revalidate, tags }`; the oversized sitemap catalogue
 * uses `unstable_cache` instead) so data is fetched once and served static, then
 * refreshed in the background / on-demand via the revalidate webhook
 * (`game:<slug>` and `game-sitemap` tags).
 */
import { z } from 'zod'

import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'

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

import { getGameCover } from '../config/images'
import { gamePath } from '../utils/paths'

/** 78-hour fallback; backend webhooks invalidate changed content before this expires.
 * Keep the route-level revalidate literals in game pages and sitemaps in sync. */
export const SEO_REVALIDATE_SECONDS = 280800

/** What the sitemaps need from each publishable game. */
export type SitemapEntry = Pick<GameSitemapEntry, 'slug' | 'updatedAt'>

/**
 * The full catalogue response (~2.2 MB JSON for ~22k games, ~2.9 MB once the fetch
 * cache base64-encodes it) exceeds Next's 2 MB data-cache entry limit, so a cached
 * `fetch` silently stays uncached and every sitemap chunk re-downloads it. Instead,
 * fetch uncached (`fetch` is no-store inside `unstable_cache`) and cache only compact
 * `[slug, updatedAt]` tuples: ~54 bytes/game serialized → fits up to ~38k games.
 * Errors are not cached, so a backend failure still fails the sitemap render.
 */
const getCachedSitemapTuples = unstable_cache(
  async (): Promise<[slug: string, updatedAt: string][]> => {
    // Idempotent GET on the cold-render path → back off + retry on 429 (rate limit)
    // instead of failing the build/render when many cold pages hit the backend at once.
    const entries = await retryOn429(() =>
      apiRequest({
        method: 'GET',
        path: '/game/sitemaps',
        schema: z.array(gameSitemapEntrySchema),
      }),
    )
    return entries.map(({ slug, updatedAt }) => [slug, updatedAt])
  },
  ['game-sitemap-entries'],
  { revalidate: SEO_REVALIDATE_SECONDS, tags: ['game-sitemap'] },
)

/** All publishable games (slug/updatedAt) for the sitemap, in backend order. */
export async function getSitemapEntries(): Promise<SitemapEntry[]> {
  const tuples = await getCachedSitemapTuples()
  return tuples.map(([slug, updatedAt]) => ({ slug, updatedAt }))
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
      images: [getGameCover(game.media?.cover)],
    },
  }
}
