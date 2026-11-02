/**
 * Achievements summary: total ("42 achievements") or, for a member, progress ("12 of
 * 42 unlocked" + bar + percent), with the Steam mark as the list's origin. Read as one
 * element. Unframed: the detail card frames it with the preview; the dialog wraps it in
 * its own card.
 */
'use client'

import { SteamIcon } from '@/components/icons/steam-icon'
import { Progress } from '@/components/ui/progress'
import { useDictionary, useLocale } from '@/lib/i18n/hooks/use-i18n'
import { cn } from '@/lib/utils'

import { achievementsSummaryText } from '../utils/achievements'

export function AchievementsSummary({
  total,
  achieved,
  className,
}: {
  total: number
  achieved: number | null
  className?: string
}) {
  const summary = achievementsSummaryText(useDictionary(), useLocale(), total, achieved)

  return (
    <div
      role="img"
      aria-label={summary.a11y}
      data-testid="label.game_achievements.summary"
      className={cn('flex flex-col gap-3 p-4', className)}
    >
      <div className="flex items-start gap-3">
        <p className="min-w-0 flex-1 font-heading text-lg font-bold wrap-anywhere">
          {summary.text}
        </p>
        <SteamIcon className="text-muted-foreground" />
      </div>
      {summary.percent !== null ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Progress
            value={summary.progress}
            className="h-2 min-w-1/2 flex-1 *:data-[slot=progress-indicator]:bg-success"
          />
          <span className="shrink-0 text-sm font-semibold tabular-nums">{summary.percent}</span>
        </div>
      ) : null}
    </div>
  )
}
