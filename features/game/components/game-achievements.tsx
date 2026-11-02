/**
 * Achievements block of the game detail: one card with the summary on top and the
 * first three achievements below (single column at every width), then "See all (N)"
 * when there are more. The static HTML already holds it (with hidden achievements
 * stripped of their content); personal progress and the toggles hydrate on top from
 * the shared library state.
 */
'use client'

import { useState } from 'react'

import type { Locale } from '@/lib/i18n'

import { useGameAchievements } from '../hooks/use-game-achievements'
import type { GameAddedMetadata } from '../utils/analytics'
import { ACHIEVEMENTS_PREVIEW_COUNT, type AchievementsView } from '../utils/achievements'

import { AchievementRows } from './achievement-rows'
import { AchievementsSummary } from './achievements-summary'
import { GameAchievementsDialog } from './game-achievements-dialog'

export function GameAchievements({
  view,
  slug,
  locale,
  game,
}: {
  view: AchievementsView
  slug: string
  locale: Locale
  game: GameAddedMetadata
}) {
  const achievements = useGameAchievements({ view, slug, locale, game })
  const [revealed, setRevealed] = useState<ReadonlySet<number>>(() => new Set())

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-xl bg-card pb-1 ring-1 ring-border">
        <AchievementsSummary
          total={view.total}
          achieved={achievements.achievedCount}
          className="border-b border-border"
        />
        <AchievementRows
          items={view.items.slice(0, ACHIEVEMENTS_PREVIEW_COUNT)}
          achievements={achievements}
          revealed={revealed}
          onRevealedChange={setRevealed}
        />
      </div>
      {view.total > ACHIEVEMENTS_PREVIEW_COUNT ? (
        <GameAchievementsDialog view={view} achievements={achievements} />
      ) : null}
    </div>
  )
}
