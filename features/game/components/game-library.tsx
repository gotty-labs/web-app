/**
 * Library screen (Phase 5, Slice F). Two views over the same data — Library (SAVED)
 * and Whitelist (WHITELIST) — switched with a ToggleGroup, plus an optional custom-
 * list filter. Renders `LibraryGameCard`s (cover + progress badge + pen) and opens
 * the shared `ProgressUpdateModal` from the pen; a successful update reloads the
 * current view so the progress badge refreshes.
 */
'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { UserGameLibraryStatus } from '@/lib/domain/enums'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'
import { useErrorMessage } from '@/lib/i18n/hooks/use-error-message'

import { useLibrary } from '../hooks/use-library'
import { useLibraryLists } from '../hooks/use-library-lists'

import { GameCardSkeleton } from './game-card-skeleton'
import { LibraryGameCard } from './library-game-card'
import { ProgressUpdateModal } from './progress-update-modal'

const ALL_LISTS = '__all__'

export function GameLibrary() {
  const dict = useDictionary()
  const t = dict.app.library
  const toMessage = useErrorMessage()

  const lists = useLibraryLists()
  const { items, loading, error, hasMore, criteria, apply, loadMore, reload } = useLibrary('SAVED')
  const [progressGameId, setProgressGameId] = useState<string | null>(null)

  function changeStatus(value: string) {
    if (!value) return // ToggleGroup emits '' on deselect; keep a view selected
    apply({ status: value as UserGameLibraryStatus, listId: criteria.listId })
  }

  function changeList(value: string) {
    apply({ status: criteria.status, listId: value === ALL_LISTS ? undefined : value })
  }

  const emptyLabel = criteria.status === 'WHITELIST' ? t.whitelistEmpty : t.savedEmpty

  return (
    <main className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ToggleGroup
          type="single"
          value={criteria.status}
          onValueChange={changeStatus}
          variant="outline"
        >
          <ToggleGroupItem value="SAVED">{t.savedTab}</ToggleGroupItem>
          <ToggleGroupItem value="WHITELIST">{t.whitelistTab}</ToggleGroupItem>
        </ToggleGroup>

        {lists.length > 0 && (
          <Select value={criteria.listId ?? ALL_LISTS} onValueChange={changeList}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t.allLists} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_LISTS}>{t.allLists}</SelectItem>
              {lists.map((list) => (
                <SelectItem key={list.id} value={list.id}>
                  {list.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {error && items.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{dict.app.feed.error}</EmptyTitle>
            <EmptyDescription>{toMessage(error)}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" onClick={loadMore}>
              {dict.app.actions.retry}
            </Button>
          </EmptyContent>
        </Empty>
      ) : !loading && items.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{emptyLabel}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {items.map((game) => (
              <LibraryGameCard
                key={game.id}
                game={game}
                onUpdateProgress={() => setProgressGameId(game.id)}
                updateLabel={dict.app.detail.updateProgress}
              />
            ))}
            {loading &&
              items.length === 0 &&
              Array.from({ length: 10 }).map((_, i) => <GameCardSkeleton key={i} />)}
          </div>
          {hasMore && items.length > 0 && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={loadMore} disabled={loading}>
                {loading && <Spinner data-icon="inline-start" />}
                {dict.app.feed.loadMore}
              </Button>
            </div>
          )}
        </>
      )}

      {progressGameId && (
        <ProgressUpdateModal
          gameId={progressGameId}
          onClose={() => setProgressGameId(null)}
          onUpdated={reload}
        />
      )}
    </main>
  )
}
