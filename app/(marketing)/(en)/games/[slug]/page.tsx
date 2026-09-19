/** Default-locale public SEO detail at `/games/[slug]`, generated on demand with ISR. */
import type { Metadata } from 'next'

import { GameDetail } from '@/features/game/components/game-detail'
import { buildGameMetadata } from '@/features/game/services/seo'

export const revalidate = 3600
export const dynamicParams = true

export function generateStaticParams(): { slug: string }[] {
  return []
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  return buildGameMetadata(slug, 'en')
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <GameDetail slug={slug} locale="en" />
}
