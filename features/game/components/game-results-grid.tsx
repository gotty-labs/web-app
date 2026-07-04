/**
 * Shared paginated grid of game cards (Phase 5) — the single results surface reused
 * by the see-all dialog (Slice C) and search (Slice D), so both look identical.
 *
 * Owns the load/error/empty presentation; the caller owns the data (items + pager
 * state) and passes `onLoadMore` (which also doubles as "retry" on error). Labels
 * come from the dictionary; the error detail goes through `useErrorMessage`.
 */
'use client'

import { useEffect, useRef } from 'react'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import type { GameSummary } from '@/lib/domain/models'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'
import { useErrorMessage } from '@/lib/i18n/hooks/use-error-message'
import { cn } from '@/lib/utils'

import { GameCard } from './game-card'
import { GameCardSkeleton } from './game-card-skeleton'

export function GameResultsGrid({
  items,
  loading,
  error,
  hasMore,
  onLoadMore,
  emptyLabel,
  skeletonCount = 10,
  gridClassName = 'grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-5 lg:grid-cols-6',
}: {
  items: GameSummary[]
  loading: boolean
  error: unknown
  hasMore: boolean
  onLoadMore: () => void
  emptyLabel: string
  skeletonCount?: number
  /** Override the grid columns/gap — e.g. the see-all modal uses bigger cards. */
  gridClassName?: string
}) {
  const dict = useDictionary()
  const toMessage = useErrorMessage()

  // Infinite scroll: a sentinel near the bottom auto-loads the next page. Keep
  // `onLoadMore` in a ref (some callers pass a fresh fn each render) so the observer
  // isn't torn down/rebuilt every render — only when `canLoad` changes.
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadMoreRef = useRef(onLoadMore)
  useEffect(() => {
    loadMoreRef.current = onLoadMore
  })
  // `!error` is critical: on a failed page (e.g. a 429) the pager's cursor doesn't
  // advance, so without this the observer would keep re-firing the SAME request in a
  // tight loop and hammer the backend. On error we stop and show a manual retry.
  const canLoad = hasMore && !loading && !error && items.length > 0

  useEffect(() => {
    if (!canLoad) return
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMoreRef.current()
      },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [canLoad])

  if (error && items.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{dict.app.feed.error}</EmptyTitle>
          <EmptyDescription>{toMessage(error)}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" onClick={onLoadMore}>
            {dict.app.actions.retry}
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  if (!loading && items.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{emptyLabel}</EmptyTitle>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className={cn('grid', gridClassName)}>
        {items.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
        {loading &&
          items.length === 0 &&
          Array.from({ length: skeletonCount }).map((_, i) => <GameCardSkeleton key={i} />)}
      </div>
      {/* A load-more error stops the auto-loader; offer a manual retry instead of
          silently looping. */}
      {!!error && items.length > 0 && (
        <div className="flex justify-center py-4">
          <Button variant="outline" onClick={onLoadMore}>
            {dict.app.actions.retry}
          </Button>
        </div>
      )}
      {hasMore && !error && items.length > 0 && (
        <div ref={sentinelRef} className="flex justify-center py-4">
          {loading ? <Spinner className="text-muted-foreground size-5" /> : null}
        </div>
      )}
    </div>
  )
}
