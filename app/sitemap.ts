/**
 * Sitemap with `generateSitemaps` (chunked, served at `/sitemap/[id].xml`) and
 * LOCALIZED entries (`alternates.languages` → hreflang). Each locale has its
 * own URL entry with the same alternates, as Google requires. Chunking keeps
 * each file under the 50,000 URL limit.
 *
 * Fail if the SEO endpoint is unavailable. Serving a successful but incomplete
 * sitemap can hide all game pages from crawlers until the next deployment.
 */
import type { MetadataRoute } from 'next'

import { gameLanguageAlternates, getSitemapEntries } from '@/features/game/services/seo'
import { SITEMAP_CHUNK_SIZE } from '@/features/game/config/sitemap'
import { env } from '@/lib/config/env'
import { locales } from '@/lib/i18n'

export const revalidate = 3600

export async function generateSitemaps(): Promise<{ id: number }[]> {
  const entries = await getSitemapEntries()
  const count = Math.max(1, Math.ceil(entries.length / SITEMAP_CHUNK_SIZE))
  return Array.from({ length: count }, (_, id) => ({ id }))
}

export default async function sitemap({
  id,
}: {
  id: Promise<string>
}): Promise<MetadataRoute.Sitemap> {
  const chunk = Number(await id)
  const base = env.siteUrl

  // Public static routes live only in the first chunk.
  const staticPaths = ['support', 'privacy', 'terms', 'cookies', 'account-deletion']
  const staticRoutes: MetadataRoute.Sitemap =
    chunk === 0
      ? [
          { url: `${base}/` },
          ...staticPaths.flatMap((path) => {
            const languages = {
              en: `${base}/${path}`,
              es: `${base}/es/${path}`,
              'x-default': `${base}/${path}`,
            }
            return locales.map((locale) => ({
              url: languages[locale],
              alternates: { languages },
            }))
          }),
        ]
      : []

  const entries = await getSitemapEntries()
  const start = chunk * SITEMAP_CHUNK_SIZE
  const games: MetadataRoute.Sitemap = entries
    .slice(start, start + SITEMAP_CHUNK_SIZE)
    .flatMap((entry) => {
      const languages = gameLanguageAlternates(entry.slug)
      return locales.map((locale) => ({
        url: languages[locale],
        lastModified: entry.updatedAt,
        alternates: { languages },
      }))
    })
  return [...staticRoutes, ...games]
}
