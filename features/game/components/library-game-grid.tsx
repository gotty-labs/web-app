'use client'

import { useEffect, useRef } from 'react'
import { LibraryBigIcon, RefreshCwIcon } from 'lucide-react'
import Link from 'next/link'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import type { GameLibrary } from '@/lib/domain/models'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'

import { LibraryGameCard } from './library-game-card'
import { LibraryGameCardSkeleton } from './library-game-card-skeleton'

export function LibraryGameGrid({
  games,
  mode,
  selectedListId,
  loading,
  error,
  hasMore,
  pendingIds,
  removingIds,
  onLoadMore,
  onOpenActions,
}: {
  games: GameLibrary[]
  mode: 'library' | 'whitelist'
  selectedListId?: string
  loading: boolean
  error: unknown
  hasMore: boolean
  pendingIds: Set<string>
  removingIds: Set<string>
  onLoadMore: () => void
  onOpenActions: (game: GameLibrary) => void
}) {
  const dict = useDictionary()
  const t = dict.app.library
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadMoreRef = useRef(onLoadMore)
  const initialLoading = games.length === 0 && !error && (loading || hasMore)
  const canLoad = hasMore && !loading && !error && games.length > 0

  useEffect(() => {
    loadMoreRef.current = onLoadMore
  })

  useEffect(() => {
    if (!canLoad || !sentinelRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMoreRef.current()
      },
      { rootMargin: '300px' },
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [canLoad])

  if (error && games.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertTitle>{t.loadError}</AlertTitle>
        <AlertDescription className="flex flex-col items-start gap-3">
          <span>{t.actionFailed}</span>
          <Button variant="outline" onClick={onLoadMore}>
            <RefreshCwIcon data-icon="inline-start" />
            {dict.app.actions.retry}
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!initialLoading && games.length === 0) {
    const title = selectedListId
      ? t.listEmpty
      : mode === 'whitelist'
        ? t.whitelistEmpty
        : t.savedEmpty
    const description = selectedListId
      ? undefined
      : mode === 'whitelist'
        ? t.whitelistEmptyDescription
        : t.savedEmptyDescription

    return (
      <Empty className="min-h-96 border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LibraryBigIcon />
          </EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          {description ? <EmptyDescription>{description}</EmptyDescription> : null}
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link href="/home">{t.emptyCta}</Link>
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] lg:gap-5">
        {games.map((game) => (
          <LibraryGameCard
            key={game.id}
            game={game}
            mode={mode}
            selectedListId={selectedListId}
            pending={pendingIds.has(game.id)}
            removing={removingIds.has(game.id)}
            onOpenActions={() => onOpenActions(game)}
          />
        ))}
        {(initialLoading || (loading && games.length > 0)) &&
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className={index >= 4 ? 'hidden lg:block' : undefined}>
              <LibraryGameCardSkeleton />
            </div>
          ))}
      </div>

      {error && games.length > 0 ? (
        <Alert variant="destructive">
          <AlertTitle>{t.loadError}</AlertTitle>
          <AlertDescription>
            <Button variant="outline" onClick={onLoadMore}>
              <RefreshCwIcon data-icon="inline-start" />
              {dict.app.actions.retry}
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {hasMore && !error && games.length > 0 ? (
        <div ref={sentinelRef} className="h-px" aria-hidden />
      ) : null}
    </div>
  )
}
