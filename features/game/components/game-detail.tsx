/**
 * Minimal public game detail render shared by the en/es SEO pages (Option B).
 * Server component (no token) — fetches the public game in the given locale.
 * Placeholder markup; visual design lands in Phase 5.
 *
 * The fetch here is the SAME `getPublicGame(slug, locale)` call as in the page's
 * `generateMetadata`, so Next memoizes it per request → one backend call.
 */
import { notFound } from 'next/navigation'

import type { Locale } from '@/lib/i18n'

import { getPublicGame } from '../services/seo'

export async function GameDetail({
  slug,
  locale,
}: {
  slug: string
  locale: Locale
}) {
  const game = await getPublicGame(slug, locale).catch(() => null)
  if (!game) notFound()

  return (
    <main>
      <h1>{game.name}</h1>
      {game.description ? <p>{game.description}</p> : null}
    </main>
  )
}
