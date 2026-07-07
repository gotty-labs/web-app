/**
 * Library screen (Phase 5, Slice F). Two views over the same data — Library (SAVED)
 * and Whitelist (WHITELIST) — switched with a ToggleGroup, plus an optional custom-
 * list filter. Results render through the shared `GameResultsGrid` (same states +
 * infinite scroll as search/see-all) with `LibraryGameCard`s (cover + progress badge
 * + pen). The pen opens the shared `ProgressUpdateModal`; a successful update reloads
 * the current view so the progress badge refreshes. The empty state links back to the
 * feed so a fresh library isn't a dead end.
 */
'use client'

import { useState } from 'react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { AppTopBar } from '@/components/app-top-bar'
import type { UserGameLibraryStatus } from '@/lib/domain/enums'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'

import { useLibrary } from '../hooks/use-library'
import { useLibraryLists } from '../hooks/use-library-lists'

import { GameResultsGrid } from './game-results-grid'
import { LibraryGameCard } from './library-game-card'
import { ProgressUpdateModal } from './progress-update-modal'

const ALL_LISTS = '__all__'

export function GameLibrary() {
  const dict = useDictionary()
  const t = dict.app.library

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
    <>
      <AppTopBar />
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

        <GameResultsGrid
          items={items}
          loading={loading}
          error={error}
          hasMore={hasMore}
          onLoadMore={loadMore}
          renderItem={(game) => (
            <LibraryGameCard
              game={game}
              onUpdateProgress={() => setProgressGameId(game.id)}
              updateLabel={dict.app.detail.updateProgress}
            />
          )}
          emptyLabel={emptyLabel}
          emptyAction={
            <Button asChild variant="outline">
              <Link href="/home">{t.emptyCta}</Link>
            </Button>
          }
        />

        {progressGameId && (
          <ProgressUpdateModal
            gameId={progressGameId}
            onClose={() => setProgressGameId(null)}
            onUpdated={reload}
          />
        )}
      </main>
    </>
  )
}
