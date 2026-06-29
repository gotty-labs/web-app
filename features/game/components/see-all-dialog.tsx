/**
 * "See all" modal (Phase 5, Slice C) — opens from a feed section's interactive
 * title and shows the whole section as a paginated grid. Loads its first page on
 * mount and appends more via `useSectionPager` (cursor-based, opaque).
 *
 * It's a normal (dismissable) dialog: closing returns to the feed. The mount effect
 * relies on `loadMore` being stable (the pager guards re-entrancy with a ref) so it
 * fires exactly once.
 */
'use client'

import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import type { GameSection } from '@/lib/domain/enums'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'
import { useErrorMessage } from '@/lib/i18n/hooks/use-error-message'

import { useSectionPager } from '../hooks/use-section-pager'

import { GameCard } from './game-card'
import { GameCardSkeleton } from './game-card-skeleton'

export function SeeAllDialog({
  section,
  title,
  onClose,
}: {
  section: GameSection
  title: string
  onClose: () => void
}) {
  const dict = useDictionary()
  const toMessage = useErrorMessage()
  const { items, loading, error, hasMore, loadMore } = useSectionPager(section)

  useEffect(() => {
    void loadMore()
  }, [loadMore])

  const showInitialSkeletons = loading && items.length === 0
  const showError = !!error && items.length === 0
  const showEmpty = !loading && !error && items.length === 0

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="max-h-[70svh] overflow-y-auto">
          {showError ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>{dict.app.feed.error}</EmptyTitle>
                <EmptyDescription>{toMessage(error)}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" onClick={() => void loadMore()}>
                  {dict.app.actions.retry}
                </Button>
              </EmptyContent>
            </Empty>
          ) : showEmpty ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>{dict.app.feed.empty}</EmptyTitle>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {items.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
                {showInitialSkeletons &&
                  Array.from({ length: 8 }).map((_, i) => <GameCardSkeleton key={i} />)}
              </div>
              {hasMore && items.length > 0 && (
                <div className="mt-4 flex justify-center">
                  <Button variant="outline" onClick={() => void loadMore()} disabled={loading}>
                    {loading && <Spinner data-icon="inline-start" />}
                    {dict.app.feed.loadMore}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
