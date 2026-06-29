/**
 * "See all" modal (Phase 5, Slice C) — opens from a feed section's interactive
 * title and shows the whole section as a paginated grid. Loads its first page on
 * mount and appends more via `useSectionPager` (cursor-based, opaque).
 *
 * It's a normal (dismissable) dialog; the shared `GameResultsGrid` renders the
 * results so it matches search. The mount effect relies on `loadMore` being stable
 * (the pager guards re-entrancy with a ref) so it fires exactly once.
 */
'use client'

import { useEffect } from 'react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { GameSection } from '@/lib/domain/enums'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'

import { useSectionPager } from '../hooks/use-section-pager'

import { GameResultsGrid } from './game-results-grid'

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
  const { items, loading, error, hasMore, loadMore } = useSectionPager(section)

  useEffect(() => {
    void loadMore()
  }, [loadMore])

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
          <GameResultsGrid
            items={items}
            loading={loading}
            error={error}
            hasMore={hasMore}
            onLoadMore={() => void loadMore()}
            emptyLabel={dict.app.feed.empty}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
