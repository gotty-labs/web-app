/**
 * Library view controller (Phase 5, Slice F). Pages the user's library through
 * `getLibrary`, filtered by `status` (SAVED = library, WHITELIST = whitelist) and an
 * optional custom `listId`.
 *
 * The pager is lazily created at render time for the initial criteria, and the first
 * page loads from a mount effect calling the (stable) `loadMore` — so no `setState`
 * runs synchronously in an effect body. `apply` (an event handler) swaps criteria,
 * rebuilds the pager, and reloads; `reload` re-runs the current criteria (used after
 * a progress update so the badges refresh).
 *
 * NOTE: the backend list input has no sort param, so ordering is backend-defined.
 */
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { CursorPager } from '@/lib/api/cursor-pager'
import type { UserGameLibraryStatus } from '@/lib/domain/enums'
import type { GameLibrary } from '@/lib/domain/models'

import { getLibrary } from '../services/library'

export interface LibraryCriteria {
  status: UserGameLibraryStatus
  listId?: string
}

function buildPager(criteria: LibraryCriteria): CursorPager<GameLibrary> {
  return new CursorPager<GameLibrary>((cursor) =>
    getLibrary({ status: criteria.status, listId: criteria.listId, cursor }),
  )
}

export interface LibraryState {
  items: GameLibrary[]
  loading: boolean
  error: unknown
  hasMore: boolean
  criteria: LibraryCriteria
  apply: (criteria: LibraryCriteria) => void
  loadMore: () => void
  reload: () => void
}

export function useLibrary(initialStatus: UserGameLibraryStatus = 'SAVED'): LibraryState {
  const [criteria, setCriteria] = useState<LibraryCriteria>({ status: initialStatus })
  const [items, setItems] = useState<GameLibrary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const [hasMore, setHasMore] = useState(true)

  const pagerRef = useRef<CursorPager<GameLibrary> | null>(null)
  if (pagerRef.current === null) pagerRef.current = buildPager(criteria)
  const loadingRef = useRef(false)

  const loadMore = useCallback(async () => {
    const pager = pagerRef.current
    if (!pager || loadingRef.current) return
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
  }, [])

  useEffect(() => {
    void loadMore()
  }, [loadMore])

  const apply = useCallback(
    (next: LibraryCriteria) => {
      setCriteria(next)
      setError(null)
      pagerRef.current = buildPager(next)
      setItems([])
      setHasMore(true)
      void loadMore()
    },
    [loadMore],
  )

  const reload = useCallback(() => {
    pagerRef.current = buildPager(criteria)
    setItems([])
    setHasMore(true)
    void loadMore()
  }, [criteria, loadMore])

  return { items, loading, error, hasMore, criteria, apply, loadMore: () => void loadMore(), reload }
}
