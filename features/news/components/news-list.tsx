/**
 * The paginated News grid with its states (§2.9): skeletons, cards with one ad card
 * after every `NEWS_STORIES_PER_AD` stories (a product choice over the card's "one per
 * page"), infinite scroll, next-page error footer, the two empty
 * states and the initial error. Mounted with a `key` per (session, exclusions), so a
 * new filter always starts from the first page.
 *
 * Columns: as many equal columns as fit `--news-card-min-width`, clamped to the
 * available width (`min(…, 100%)`) so a narrower container gets one full-width column
 * and the page never scrolls horizontally.
 */
'use client'

import { Fragment, useEffect, useRef } from 'react'
import { ListFilterIcon, NewspaperIcon, RefreshCwIcon } from 'lucide-react'

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
import {
  AdSlot,
  adPlacement,
  NEWS_STORIES_PER_AD,
  useAdvertising,
  useCardAdViewport,
} from '@/features/advertising'
import type { NewsSource, NewsStory } from '@/lib/domain/models'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'

import { useNews } from '../hooks/use-news'
import { newsEmptyKind } from '../utils/rules'

import { NewsCard } from './news-card'
import { NewsCardSkeleton } from './news-card-skeleton'

const GRID_CLASS_NAME =
  'grid grid-cols-[repeat(auto-fill,minmax(min(var(--news-card-min-width),100%),1fr))] items-start gap-6'

export function NewsList({
  excludedSources,
  isMember,
  catalog,
  onOpenAlsoIn,
  onChooseSources,
}: {
  excludedSources: readonly string[]
  isMember: boolean
  /** The source catalog, or `null` while it isn't loaded (or failed, or a guest). */
  catalog: readonly NewsSource[] | null
  onOpenAlsoIn: (story: NewsStory) => void
  onChooseSources: () => void
}) {
  const dict = useDictionary()
  const t = dict.app.news
  const advertising = useAdvertising()
  const canRenderCardAds = useCardAdViewport()
  const { items, loading, error, hasMore, loadMore } = useNews(excludedSources)

  // Infinite scroll, as in the library grid: the sentinel stops on error (the cursor
  // doesn't advance on failure, so re-firing would loop) and offers a manual retry.
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadMoreRef = useRef(loadMore)
  useEffect(() => {
    loadMoreRef.current = loadMore
  })
  const canLoad = hasMore && !loading && !error && items.length > 0
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

  const initialLoading = items.length === 0 && !error && (loading || hasMore)

  if (error && items.length === 0) {
    return <LoadError message={dict.app.feed.error} testId="button.news.retry" onRetry={loadMore} />
  }

  if (!initialLoading && items.length === 0) {
    const allHidden = newsEmptyKind({ isMember, catalog, hidden: excludedSources }) === 'all-hidden'
    return (
      <Empty className="min-h-96 border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            {allHidden ? <ListFilterIcon /> : <NewspaperIcon />}
          </EmptyMedia>
          <EmptyTitle>{allHidden ? t.allHidden.title : t.empty.title}</EmptyTitle>
          <EmptyDescription>
            {allHidden ? t.allHidden.description : t.empty.description}
          </EmptyDescription>
        </EmptyHeader>
        {allHidden ? (
          <EmptyContent>
            <Button data-testid="button.news.empty.choose-sources" onClick={onChooseSources}>
              {t.allHidden.action}
            </Button>
          </EmptyContent>
        ) : null}
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className={GRID_CLASS_NAME}>
        {items.map((story, index) => (
          <Fragment key={story.id}>
            <NewsCard story={story} eager={index < 3} onOpenAlsoIn={onOpenAlsoIn} />
            {advertising.enabled && canRenderCardAds && (index + 1) % NEWS_STORIES_PER_AD === 0 ? (
              <AdSlot
                placement={adPlacement.paginatedSection}
                label={dict.app.advertising.label}
                className="border-border/60 bg-muted/20 min-h-64 rounded-xl border p-2"
              />
            ) : null}
          </Fragment>
        ))}
        {(initialLoading || (loading && items.length > 0)) &&
          Array.from({ length: 6 }).map((_, index) => (
            <div key={`skeleton-${index}`} className={index >= 4 ? 'hidden lg:block' : undefined}>
              <NewsCardSkeleton />
            </div>
          ))}
      </div>

      {error && items.length > 0 ? (
        <LoadError
          message={t.error.nextPage}
          testId="button.news.next-page.retry"
          onRetry={loadMore}
        />
      ) : null}

      {hasMore && !error && items.length > 0 ? (
        <div ref={sentinelRef} className="h-px" aria-hidden />
      ) : null}
    </div>
  )
}

/** Initial / next-page load failure, as the library's destructive alert (Paper). */
function LoadError({
  message,
  testId,
  onRetry,
}: {
  message: string
  testId: string
  onRetry: () => void
}) {
  const dict = useDictionary()
  return (
    <Alert variant="destructive">
      <AlertTitle>{message}</AlertTitle>
      <AlertDescription>
        <Button variant="outline" data-testid={testId} onClick={onRetry}>
          <RefreshCwIcon data-icon="inline-start" />
          {dict.app.actions.retry}
        </Button>
      </AlertDescription>
    </Alert>
  )
}
