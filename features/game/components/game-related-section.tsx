/**
 * "Related games" — the LAST block of the public game detail: the shared section
 * heading + a `GameCarousel` of the precomputed `related` cards (backend order).
 *
 * The marketing zone has none of the app providers, so this island mounts its own
 * `I18nProvider` (the cards read labels from it). Cards are real same-tab links
 * (crawlable); the row neither loops nor carries ads (the page keeps its side rails).
 *
 * Repeated clicks: the first plain click marks the block as "navigating" and emits a
 * single `related_game_opened`; later clicks are cancelled until the page changes.
 * The flag resets when the block unmounts/hides (route change, back-navigation).
 */
'use client'

import { useEffect, useId, useRef, type MouseEvent } from 'react'

import type { GameSummary } from '@/lib/domain/models'
import type { Dictionary, Locale } from '@/lib/i18n'
import { I18nProvider } from '@/lib/i18n/contexts/i18n-provider'

import { RELATED_GAMES_MIN_SERVED } from '../constants/related-games.const'
import { trackRelatedGameOpened } from '../utils/analytics'

import { DetailSection } from './detail-section'
import { GameCarousel } from './game-carousel'

/** Modified/middle clicks open elsewhere (new tab/window): the page doesn't navigate. */
function opensElsewhere(event: MouseEvent): boolean {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
}

export function GameRelatedSection({
  sourceGameId,
  games,
  locale,
  dictionary,
}: {
  sourceGameId: string
  games: GameSummary[]
  locale: Locale
  dictionary: Dictionary
}) {
  const headingId = useId()
  const navigatingRef = useRef(false)

  useEffect(
    () => () => {
      navigatingRef.current = false
    },
    [],
  )

  if (games.length < RELATED_GAMES_MIN_SERVED) return null

  const handleGameClick = (
    game: GameSummary,
    index: number,
    event: MouseEvent<HTMLAnchorElement>,
  ) => {
    if (navigatingRef.current) {
      event.preventDefault()
      return
    }
    if (!opensElsewhere(event)) navigatingRef.current = true
    trackRelatedGameOpened(sourceGameId, game.id, index + 1)
  }

  return (
    <I18nProvider locale={locale} dictionary={dictionary}>
      <DetailSection title={dictionary.app.detail.related.title} headingId={headingId}>
        <GameCarousel
          games={games}
          adLabel={dictionary.app.advertising.label}
          withAds={false}
          loop={false}
          newTab={false}
          onGameClick={handleGameClick}
        />
      </DetailSection>
    </I18nProvider>
  )
}
