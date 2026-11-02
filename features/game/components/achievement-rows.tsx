/**
 * A run of achievement rows with its own reveal state (owned by the caller: the detail
 * preview and the dialog each keep theirs). Marking a hidden achievement also reveals
 * it on that surface, so it stays revealed if it's unmarked again.
 */
'use client'

import type { GameAchievementsState } from '../hooks/use-game-achievements'
import type { AchievementView } from '../utils/achievements'

import { AchievementRow } from './achievement-row'

export function AchievementRows({
  items,
  achievements,
  revealed,
  onRevealedChange,
  className,
}: {
  items: readonly AchievementView[]
  achievements: GameAchievementsState
  revealed: ReadonlySet<number>
  onRevealedChange: (next: ReadonlySet<number>) => void
  className?: string
}) {
  const reveal = (position: number) => {
    if (!revealed.has(position)) onRevealedChange(new Set(revealed).add(position))
    achievements.loadHidden()
  }

  return (
    <ul className={className}>
      {items.map((item) => (
        <AchievementRow
          key={item.position}
          item={item}
          content={achievements.contentAt(item.position)}
          revealed={revealed.has(item.position)}
          achieved={achievements.isAchieved(item.position)}
          control={achievements.control}
          onReveal={() => reveal(item.position)}
          onToggle={() => {
            if (item.hidden && achievements.control === 'active') reveal(item.position)
            achievements.toggle(item.position)
          }}
        />
      ))}
    </ul>
  )
}
