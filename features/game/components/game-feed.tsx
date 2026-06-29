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
    <div className="flex flex-col gap-8 p-4 md:p-6">
      {Array.from({ length: 3 }).map((_, row) => (
        <section key={row} className="flex flex-col gap-3">
          <Skeleton className="h-6 w-40" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, card) => (
              <GameCardSkeleton key={card} />
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
  const [seeAll, setSeeAll] = useState<{ section: GameSection; title: string } | null>(null)

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
    <div className="flex flex-col gap-8 p-4 md:p-6">
      {visible.map((s) => (
        <GameCarousel
          key={s.section}
          title={s.title}
          games={s.games}
          onSeeAll={() => setSeeAll({ section: s.section, title: s.title })}
        />
      ))}
      {seeAll && (
        <SeeAllDialog
          section={seeAll.section}
          title={seeAll.title}
          onClose={() => setSeeAll(null)}
        />
      )}
    </div>
  )
}
