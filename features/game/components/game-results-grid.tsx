/**
 * Shared paginated grid of game cards (Phase 5) — the single results surface reused
 * by the see-all dialog (Slice C) and search (Slice D), so both look identical.
 *
 * Owns the load/error/empty presentation; the caller owns the data (items + pager
 * state) and passes `onLoadMore` (which also doubles as "retry" on error). Labels
 * come from the dictionary; the error detail goes through `useErrorMessage`.
 */
'use client'

import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import type { GameSummary } from '@/lib/domain/models'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'
import { useErrorMessage } from '@/lib/i18n/hooks/use-error-message'

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
}: {
  items: GameSummary[]
  loading: boolean
  error: unknown
  hasMore: boolean
  onLoadMore: () => void
  emptyLabel: string
  skeletonCount?: number
}) {
  const dict = useDictionary()
  const toMessage = useErrorMessage()

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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {items.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
        {loading &&
          items.length === 0 &&
          Array.from({ length: skeletonCount }).map((_, i) => <GameCardSkeleton key={i} />)}
      </div>
      {hasMore && items.length > 0 && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={onLoadMore} disabled={loading}>
            {loading && <Spinner data-icon="inline-start" />}
            {dict.app.feed.loadMore}
          </Button>
        </div>
      )}
    </div>
  )
}
