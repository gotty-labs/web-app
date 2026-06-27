/**
 * Sitemap with `generateSitemaps` (chunked, served at `/sitemap/[id].xml`) and
 * LOCALIZED entries (`alternates.languages` → hreflang). Each game is ONE entry
 * (the en URL) that declares its es alternate, so the entry count = number of
 * games (NOT 2×); chunking keeps each file under Google's 50k limit.
 *
 * Resilient: if the SEO endpoints aren't ready, ships one chunk with the static
 * routes only.
 */
import type { MetadataRoute } from 'next'

import {
  gameLanguageAlternates,
  getSitemapEntries,
} from '@/features/game/services/seo'
import { env } from '@/lib/config/env'

const CHUNK_SIZE = 45000 // under Google's 50k, with headroom

export async function generateSitemaps(): Promise<{ id: number }[]> {
  try {
    const entries = await getSitemapEntries()
    const count = Math.max(1, Math.ceil(entries.length / CHUNK_SIZE))
    return Array.from({ length: count }, (_, id) => ({ id }))
  } catch {
    return [{ id: 0 }]
  }
}

export default async function sitemap({
  id,
}: {
  id: Promise<string>
}): Promise<MetadataRoute.Sitemap> {
  const chunk = Number(await id)
  const base = env.siteUrl

  // Static routes live only in the first chunk.
  const staticRoutes: MetadataRoute.Sitemap =
    chunk === 0
      ? [{ url: `${base}/`, changeFrequency: 'weekly', priority: 1 }]
      : []

  try {
    const entries = await getSitemapEntries()
    const start = chunk * CHUNK_SIZE
    const games: MetadataRoute.Sitemap = entries
      .slice(start, start + CHUNK_SIZE)
      .map((entry) => ({
        url: `${base}/games/${entry.slug}`,
        lastModified: entry.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
        alternates: { languages: gameLanguageAlternates(entry.slug) },
      }))
    return [...staticRoutes, ...games]
  } catch {
    return staticRoutes
  }
}
