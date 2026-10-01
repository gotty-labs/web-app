import { SITEMAP_CHUNK_SIZE } from '@/features/game/config/sitemap'
import { getSitemapEntries } from '@/features/game/services/seo'
import { env } from '@/lib/config/env'

export const revalidate = 3600

/** A stable sitemap URL for Google Search Console, even when the catalog grows. */
export async function GET(): Promise<Response> {
  const entries = await getSitemapEntries()
  const count = Math.max(1, Math.ceil(entries.length / SITEMAP_CHUNK_SIZE))
  const children = Array.from(
    { length: count },
    (_, id) => `  <sitemap><loc>${env.siteUrl}/sitemap/${id}.xml</loc></sitemap>`,
  ).join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${children}\n</sitemapindex>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
