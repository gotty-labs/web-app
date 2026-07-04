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
  initialCursor,
  onClose,
}: {
  section: GameSection
  title: string
  /** The feed section's `nextCursor` — the modal continues FROM here, so it shows
   *  games BEYOND the ones already visible in the feed carousel (never duplicates). */
  initialCursor?: string
  onClose: () => void
}) {
  const dict = useDictionary()
  const { items, loading, error, hasMore, loadMore } = useSectionPager(section, initialCursor)

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
      {/* Wider on desktop (less wasted side space); mobile keeps the default full
          width, which is already right. */}
      <DialogContent className="sm:max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70svh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <GameResultsGrid
            items={items}
            loading={loading}
            error={error}
            hasMore={hasMore}
            onLoadMore={() => void loadMore()}
            emptyLabel={dict.app.feed.empty}
            // Fewer columns than the full-width search page → bigger cards in the modal
            // (mobile stays at 3, which the user confirmed is right).
            gridClassName="grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-5"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
