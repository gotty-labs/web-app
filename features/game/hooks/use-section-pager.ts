/**
 * "See all" pager (Phase 5, Slice C) — wraps the framework-agnostic `CursorPager`
 * for one feed section, paging `GET /game/filter/all` by opaque cursor.
 *
 * All state transitions are event-driven (`loadMore` is called from a button / the
 * dialog's mount effect), and the synchronous `setState`s live inside `loadMore`,
 * not lexically in an effect body — so the `set-state-in-effect` rule is satisfied.
 */
'use client'

import { useCallback, useMemo, useRef, useState } from 'react'

import { CursorPager } from '@/lib/api/cursor-pager'
import type { GameSection } from '@/lib/domain/enums'
import type { GameSummary } from '@/lib/domain/models'

import { getGamesBySection } from '../services/catalog'

export interface SectionPagerState {
  items: GameSummary[]
  loading: boolean
  error: unknown
  hasMore: boolean
  loadMore: () => Promise<void>
}

export function useSectionPager(section: GameSection): SectionPagerState {
  const pager = useMemo(
    () => new CursorPager<GameSummary>((cursor) => getGamesBySection({ section, cursor })),
    [section],
  )
  const [items, setItems] = useState<GameSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const [hasMore, setHasMore] = useState(true)
  // A ref (not the `loading` state) guards re-entrancy, so `loadMore` stays stable
  // across renders — otherwise its identity would change on every load and re-fire
  // the dialog's mount effect, paging endlessly.
  const loadingRef = useRef(false)

  const loadMore = useCallback(async () => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    setError(null)
    try {
      const next = await pager.loadMore()
      setItems([...next])
      setHasMore(pager.hasMore)
    } catch (e) {
      setError(e)
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [pager])

  return { items, loading, error, hasMore, loadMore }
}
