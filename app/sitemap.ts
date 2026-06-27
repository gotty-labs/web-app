/**
 * Sitemap (Next metadata file convention). Lists the landing + every public game
 * URL with its `<lastmod>`, so crawlers discover and re-crawl pages. Revalidated
 * on a schedule and on-demand (the `game-sitemap` tag) via `/api/revalidate`.
 *
 * Resilient: if the SEO endpoints aren't ready, ships the static routes only.
 * (If the catalog ever exceeds ~50k URLs, switch to `generateSitemaps()`.)
 */
import type { MetadataRoute } from 'next'

import { getSitemapEntries } from '@/features/game/services/seo'
import { env } from '@/lib/config/env'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.siteUrl
  const routes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
  ]

  try {
    const entries = await getSitemapEntries()
    for (const entry of entries) {
      routes.push({
        url: `${base}/games/${entry.slug}`,
        lastModified: entry.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }
  } catch {
    // SEO endpoints not ready yet — static routes only.
  }

  return routes
}
