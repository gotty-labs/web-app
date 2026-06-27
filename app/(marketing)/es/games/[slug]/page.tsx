/**
 * Spanish public SEO game detail (Option B) → URL `/es/games/[slug]`.
 * Mirror of the default-locale page with `locale="es"`; shares `GameDetail` +
 * `buildGameMetadata`. Static + ISR; prebuilds nothing (on-demand at scale).
 */
import type { Metadata } from 'next'

import { GameDetail } from '@/features/game/components/game-detail'
import { buildGameMetadata } from '@/features/game/services/seo'

export const revalidate = 3600
export const dynamicParams = true

// `[]` = prebuild NO pages at build. With `dynamicParams` + `revalidate`, each page
// is rendered on-demand on its first visit (crawler arrives via the sitemap), then
// cached + served static (ISR). This avoids 2×N (game × locale) backend fetches at
// build for a large bilingual catalog. To prebuild popular games instead, return
// their slugs here (e.g. a top-N from `getSitemapEntries`); the rest stay on-demand.
export function generateStaticParams(): { slug: string }[] {
  return []
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  return buildGameMetadata(slug, 'es')
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <GameDetail slug={slug} locale="es" />
}
