/**
 * Shared React state over a `CursorPager` — the single "paginated list" hook that
 * every cursor-paged screen (feed see-all, search, library) builds on, so the
 * items/loading/error/hasMore lifecycle exists exactly once.
 *
 * Design notes:
 *  - `loadMore` is STABLE (empty deps): re-entrancy is guarded by a ref, not the
 *    `loading` state, so mount effects that call it fire exactly once.
 *  - `reset(pager)` swaps the active pager (null = no pager → `hasMore` false).
 *    Any in-flight `loadMore` from a PREVIOUS pager is invalidated: its result is
 *    dropped (checked against `pagerRef`) instead of overwriting the new list —
 *    and the guard is released on reset, so the new pager can load immediately
 *    even while the stale request is still resolving.
 *  - All synchronous `setState`s live inside event handlers / async continuations,
 *    never lexically in an effect body (`set-state-in-effect` safe).
 */
'use client'

import { useCallback, useRef, useState } from 'react'

import type { CursorPager } from '../cursor-pager'

export interface CursorPagerListState<T> {
  items: T[]
  loading: boolean
  error: unknown
  hasMore: boolean
  /** Fetch the next page of the active pager (no-op while one is in flight). */
  loadMore: () => Promise<CursorPagerLoadResult>
  /** Swap the active pager (null = none) and clear items/error/loading. */
  reset: (pager: CursorPager<T> | null, options?: { preserveItems?: boolean }) => void
}

export type CursorPagerLoadResult =
  { ok: true } | { ok: false; error?: unknown; superseded?: boolean }

export function useCursorPagerList<T>(
  /** Lazily builds the initial pager (first render only). Omit to start empty. */
  createInitialPager?: () => CursorPager<T>,
): CursorPagerListState<T> {
  const pagerRef = useRef<CursorPager<T> | null | undefined>(undefined)
  if (pagerRef.current === undefined) {
    pagerRef.current = createInitialPager ? createInitialPager() : null
  }

  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)
  // An initial pager exists iff a factory was provided (can't read the ref in render).
  const [hasMore, setHasMore] = useState(createInitialPager !== undefined)

  const loadingRef = useRef(false)

  const loadMore = useCallback(async () => {
    const pager = pagerRef.current
    if (!pager || loadingRef.current) return { ok: false } as const
    loadingRef.current = true
    setLoading(true)
    setError(null)
    try {
      const next = await pager.loadMore()
      if (pagerRef.current !== pager) return { ok: false, superseded: true } as const
      setItems([...next])
      setHasMore(pager.hasMore)
      return { ok: true } as const
    } catch (e) {
      if (pagerRef.current === pager) setError(e)
      return { ok: false, error: e } as const
    } finally {
      // Only release/clear if still current: a reset() already released the guard
      // (and a load for the NEW pager may be running — don't clobber its state).
      if (pagerRef.current === pager) {
        loadingRef.current = false
        setLoading(false)
      }
    }
  }, [])

  const reset = useCallback(
    (pager: CursorPager<T> | null, options?: { preserveItems?: boolean }) => {
      pagerRef.current = pager
      loadingRef.current = false
      if (!options?.preserveItems || pager === null) setItems([])
      setError(null)
      setHasMore(pager !== null)
      setLoading(false)
    },
    [],
  )

  return { items, loading, error, hasMore, loadMore, reset }
}
