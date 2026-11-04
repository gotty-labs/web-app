/**
 * "See all (N)": every achievement in Steam order, from the data already on the page
 * (opens instantly, no request, URL untouched). Title and close stay fixed; summary and
 * rows scroll together. Reveals live in the dialog body, which unmounts on close, so a
 * reopened list starts hidden again and never shares reveals with the preview.
 */
'use client'

import { useState } from 'react'
import { XIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { fillTemplate } from '@/lib/i18n'
import { useDictionary, useLocale } from '@/lib/i18n/hooks/use-i18n'

import type { GameAchievementsState } from '../hooks/use-game-achievements'
import type { AchievementsView } from '../utils/achievements'
import { formatCount } from '../utils/format'

import { AchievementRows } from './achievement-rows'
import { AchievementsSummary } from './achievements-summary'

export function GameAchievementsDialog({
  view,
  achievements,
}: {
  view: AchievementsView
  achievements: GameAchievementsState
}) {
  const dict = useDictionary()
  const locale = useLocale()
  const t = dict.app.detail.achievements

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-fit"
          data-testid="button.game_achievements.see_all"
        >
          {fillTemplate(t.seeAll, { count: formatCount(view.total, locale) })}
        </Button>
      </DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        showCloseButton={false}
        className="flex max-h-(--dialog-max-height) flex-col overflow-hidden sm:max-w-(--container-dialog)"
      >
        <DialogHeader className="shrink-0 flex-row items-start justify-between gap-3">
          <DialogTitle className="min-w-0 text-lg leading-snug wrap-anywhere">
            {t.title}
          </DialogTitle>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="shrink-0"
              aria-label={dict.app.actions.close}
              data-testid="button.game_achievements_sheet.close"
            >
              <XIcon />
            </Button>
          </DialogClose>
        </DialogHeader>
        <DialogBody view={view} achievements={achievements} />
      </DialogContent>
    </Dialog>
  )
}

function DialogBody({
  view,
  achievements,
}: {
  view: AchievementsView
  achievements: GameAchievementsState
}) {
  const [revealed, setRevealed] = useState<ReadonlySet<number>>(() => new Set())

  return (
    // `px-0.5` keeps the cards' rings inside the scroll clip (as the release dates list).
    <div className="flex min-h-0 flex-col gap-3 overflow-y-auto overscroll-contain px-0.5 pb-[env(safe-area-inset-bottom,0px)]">
      <AchievementsSummary
        total={view.total}
        achieved={achievements.achievedCount}
        className="shrink-0 rounded-xl bg-card ring-1 ring-border"
      />
      <AchievementRows
        items={view.items}
        achievements={achievements}
        revealed={revealed}
        onRevealedChange={setRevealed}
        // Unframed list: rows align with the summary card's edges.
        className="shrink-0 *:px-0"
      />
    </div>
  )
}
