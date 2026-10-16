/**
 * The News list: pages `GET /news` with the given exclusions on top of the shared
 * `useCursorPagerList`. The caller remounts it (React `key`) whenever the session or
 * the exclusions change, so one instance always pages ONE filter from the first page —
 * the backend filters, so every page arrives complete.
 *
 * `news_viewed` fires whenever a FIRST page loads successfully (mount or a retry of a
 * failed first page), never for later pages or failures. `loadMore` doubles as retry:
 * the pager doesn't advance its cursor on failure, so it repeats the same request.
 */
'use client'

import { useCallback, useEffect, useRef } from 'react'

import { CursorPager } from '@/lib/api/cursor-pager'
import { useCursorPagerList } from '@/lib/api/hooks/use-cursor-pager-list'
import type { NewsStory } from '@/lib/domain/models'

import { getNews } from '../services/news'
import { trackNewsViewed } from '../utils/analytics'

export function useNews(excludedSources: readonly string[]) {
  const pagerRef = useRef<CursorPager<NewsStory> | null>(null)
  const { items, loading, error, hasMore, loadMore } = useCursorPagerList<NewsStory>(() => {
    const pager = new CursorPager<NewsStory>((cursor) =>
      getNews({
        cursor,
        excludedSources: excludedSources.length > 0 ? [...excludedSources] : undefined,
      }),
    )
    pagerRef.current = pager
    return pager
  })

  const load = useCallback(async () => {
    const firstPage = pagerRef.current?.items.length === 0 && pagerRef.current.hasMore
    const result = await loadMore()
    if (result.ok && firstPage) trackNewsViewed()
  }, [loadMore])

  useEffect(() => {
    void load()
  }, [load])

  return { items, loading, error, hasMore, loadMore: () => void load() }
}
