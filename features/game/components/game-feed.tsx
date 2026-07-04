/**
 * Home feed (Phase 5, Slice C) — the Netflix-style screen: a vertical stack of
 * horizontal `GameCarousel` rows, one per section from `useFeed()`. Each row's
 * interactive title opens the `SeeAllDialog` for that section.
 *
 * Handles the three load states (skeleton rows / error with retry / empty) so the
 * `/home` page stays a thin mount point.
 */
'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import type { GameSection } from '@/lib/domain/enums'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'
import { useErrorMessage } from '@/lib/i18n/hooks/use-error-message'

import { useFeed } from '../hooks/use-feed'

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
  const { loading, sections, error, reload } = useFeed()
  const [seeAll, setSeeAll] = useState<{
    section: GameSection
    title: string
    cursor?: string
  } | null>(null)

  if (loading) return <FeedSkeleton />

  if (error) {
    return (
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
  }

  const visible = sections.filter((s) => s.games.length > 0)

  if (visible.length === 0) {
    return (
      <div className="p-4 md:p-6">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{dict.app.feed.empty}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return (
    <div className="flex min-w-0 flex-col gap-6 overflow-x-hidden p-3 md:gap-8 md:p-6">
      {visible.map((s) => (
        <GameCarousel
          key={s.section}
          title={s.title}
          games={s.games}
          // "See all" only when the section has more games beyond the feed (a
          // nextCursor). Otherwise the carousel already shows everything.
          onSeeAll={
            s.nextCursor
              ? () => setSeeAll({ section: s.section, title: s.title, cursor: s.nextCursor })
              : undefined
          }
        />
      ))}
      {seeAll && (
        <SeeAllDialog
          section={seeAll.section}
          title={seeAll.title}
          initialCursor={seeAll.cursor}
          onClose={() => setSeeAll(null)}
        />
      )}
    </div>
  )
}
