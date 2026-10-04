/**
 * Home feed (Phase 5, Slice C) — the Netflix-style screen: a vertical stack of
 * horizontal `GameCarousel` rows, one per section from `useFeed()`, in a sheet that
 * rises over the 3D console hero as the page scrolls (`FeedSheetLayout`, like the apps).
 * Each row's interactive title — and its hero callout — opens the `SeeAllDialog` for
 * that section.
 *
 * Handles the three load states (skeleton rows / error with retry / empty) inside the
 * sheet so the `/home` page stays a thin mount point.
 */
'use client'

import { useState, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { useConsoleVisibility } from '@/hooks/use-console-visibility'
import { appPromotionStore } from '@/features/app-promotion'
import type { GameSection } from '@/lib/domain/enums'
import type { GameFeedSection } from '@/lib/domain/models'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'
import { useErrorMessage } from '@/lib/i18n/hooks/use-error-message'

import { useFeed } from '../hooks/use-feed'

import { FeedHero } from './feed-hero'
import { FeedSheetLayout } from './feed-sheet-layout'
import { GameCardSkeleton } from './game-card-skeleton'
import { GameCarousel } from './game-carousel'
import { SeeAllDialog } from './see-all-dialog'

function FeedSkeleton() {
  return (
    <div className="flex flex-col gap-6 overflow-x-hidden p-3 md:gap-8 md:p-6">
      {Array.from({ length: 3 }).map((_, row) => (
        <section key={row} className="flex flex-col gap-3">
          <Skeleton className="h-6 w-40" />
          {/* Single row (not a wrapping grid) so it matches the carousel's height
              and doesn't jump when the real content loads. */}
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 8 }).map((_, card) => (
              <GameCardSkeleton
                key={card}
                className="w-1/3 shrink-0 sm:w-1/4 md:w-1/5 lg:w-1/6 xl:w-[12.5%]"
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export function GameFeed() {
  const dict = useDictionary()
  const toMessage = useErrorMessage()
  const { visibilityRevision } = useConsoleVisibility()
  const { loading, sections, error, reload } = useFeed(visibilityRevision)
  const [seeAll, setSeeAll] = useState<{ section: GameSection; title: string } | null>(null)

  // "See all" starts from page one, and only for sections with more games beyond the
  // feed (a nextCursor); otherwise the carousel already shows everything.
  function openSection(section: GameFeedSection) {
    setSeeAll({ section: section.section, title: section.title })
    appPromotionStore.request()
  }

  const visible = sections.filter((s) => s.games.length > 0)
  let content: ReactNode
  if (loading) {
    content = <FeedSkeleton />
  } else if (error) {
    content = (
      <div className="p-4 md:p-6">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{dict.app.feed.error}</EmptyTitle>
            <EmptyDescription>{toMessage(error)}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" onClick={reload}>
              {dict.app.actions.retry}
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  } else if (visible.length === 0) {
    content = (
      <div className="p-4 md:p-6">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{dict.app.feed.empty}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      </div>
    )
  } else {
    content = (
      <div className="flex min-w-0 flex-col gap-6 overflow-x-clip p-3 md:gap-8 md:p-6">
        {visible.map((s) => (
          <GameCarousel
            key={s.section}
            title={s.title}
            games={s.games}
            adLabel={dict.app.advertising.label}
            onSeeAll={s.nextCursor ? () => openSection(s) : undefined}
          />
        ))}
      </div>
    )
  }

  return (
    <>
      <FeedSheetLayout
        hero={(headerHeight) => (
          <FeedHero sections={visible} topInset={headerHeight} onOpenSection={openSection} />
        )}
      >
        {content}
      </FeedSheetLayout>
      {seeAll && (
        <SeeAllDialog
          key={seeAll.section}
          section={seeAll.section}
          title={seeAll.title}
          onClose={() => setSeeAll(null)}
        />
      )}
    </>
  )
}
