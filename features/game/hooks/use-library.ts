/**
 * Library view controller (Phase 5, Slice F). Pages the user's library through
 * `getLibrary`, filtered by `status` (SAVED = library, WHITELIST = whitelist) and an
 * optional custom `listId`, on top of the shared `useCursorPagerList`.
 *
 * The initial pager is built lazily on first render and page 1 loads from a mount
 * effect calling the (stable) `loadMore`. `apply` (an event handler) swaps criteria
 * + pager and reloads; `reload` re-runs the current criteria (used after a progress
 * update so the badges refresh). Criteria swaps invalidate in-flight pages from the
 * previous criteria (handled inside the shared hook).
 *
 * NOTE: the backend list input has no sort param, so ordering is backend-defined.
 */
'use client'

import { useCallback, useEffect, useState } from 'react'

import { CursorPager } from '@/lib/api/cursor-pager'
import { useCursorPagerList } from '@/lib/api/hooks/use-cursor-pager-list'
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
  const { items, loading, error, hasMore, loadMore, reset } = useCursorPagerList<GameLibrary>(
    () => buildPager({ status: initialStatus }),
  )

  useEffect(() => {
    void loadMore()
  }, [loadMore])

  const apply = useCallback(
    (next: LibraryCriteria) => {
      setCriteria(next)
      reset(buildPager(next))
      void loadMore()
    },
    [reset, loadMore],
  )

  const reload = useCallback(() => {
    reset(buildPager(criteria))
    void loadMore()
  }, [criteria, reset, loadMore])

  return { items, loading, error, hasMore, criteria, apply, loadMore: () => void loadMore(), reload }
}
