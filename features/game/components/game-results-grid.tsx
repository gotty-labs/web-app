/**
 * Shared paginated grid (Phase 5) — the single results surface reused by the
 * see-all dialog (Slice C), search (Slice D) and the library (Slice F), so every
 * paginated grid looks and behaves identically (same load/error/empty states,
 * same infinite scroll).
 *
 * Generic over the item type: the caller supplies `renderItem` (game card,
 * library card, …) and owns the data (items + pager state); `onLoadMore` also
 * doubles as "retry" on error. Labels come from the dictionary; the error detail
 * goes through `useErrorMessage`. `emptyAction` lets a screen offer a next step
 * (e.g. the empty library links to the feed).
 */
'use client'

import { useEffect, useRef, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'
import { useErrorMessage } from '@/lib/i18n/hooks/use-error-message'
import { cn } from '@/lib/utils'

import { GameCardSkeleton } from './game-card-skeleton'

export function GameResultsGrid<T extends { id: string }>({
  items,
  loading,
  error,
  hasMore,
  onLoadMore,
  renderItem,
  emptyLabel,
  emptyAction,
  skeletonCount = 10,
  gridClassName = 'grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-5 lg:grid-cols-6',
}: {
  items: T[]
  loading: boolean
  error: unknown
  hasMore: boolean
  onLoadMore: () => void
  renderItem: (item: T) => ReactNode
  emptyLabel: string
  /** Optional call-to-action rendered under the empty state (e.g. "go discover"). */
  emptyAction?: ReactNode
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
        {emptyAction && <EmptyContent>{emptyAction}</EmptyContent>}
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className={cn('grid', gridClassName)}>
        {items.map((item) => (
          <div key={item.id} className="min-w-0">
            {renderItem(item)}
          </div>
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
