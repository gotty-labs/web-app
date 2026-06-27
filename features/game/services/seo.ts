/**
 * PUBLIC SEO catalog clients (server-side, NO token) for the static `/games/[slug]`
 * zone. Uses `apiRequest` directly (Option A: public read-only endpoints) and
 * Next's ISR caching (`next: { revalidate, tags }`) so a page is fetched once and
 * served static, then refreshed in the background / on-demand via the revalidate
 * webhook (`game:<slug>` and `game-sitemap` tags).
 */
import { z } from 'zod'

import { apiRequest } from '@/lib/api/client'
import { defaultLocale, type Locale } from '@/lib/i18n'
import {
  gameDtoSchema,
  gameSitemapEntrySchema,
  type GameDto,
  type GameSitemapEntry
} from '@/lib/domain/models'

/** Shared SEO revalidation window (1h); on-demand revalidation handles freshness. */
export const SEO_REVALIDATE_SECONDS = 3600

/** All publishable games (id/slug/updatedAt) for static params + sitemap. */
export function getSitemapEntries(): Promise<GameSitemapEntry[]> {
  return apiRequest({
    method: 'GET',
    path: '/game/sitemaps',
    schema: z.array(gameSitemapEntrySchema),
    next: { revalidate: SEO_REVALIDATE_SECONDS, tags: ['game-sitemap'] }
  })
}

/** Public game detail by slug (no user-specific fields). */
export function getPublicGame(
  slug: string,
  locale: Locale = defaultLocale
): Promise<GameDto> {
  return apiRequest({
    method: 'GET',
    path: `/game/public/${slug}`,
    language: locale,
    schema: gameDtoSchema,
    next: { revalidate: SEO_REVALIDATE_SECONDS, tags: [`game:${slug}`] }
  })
}
