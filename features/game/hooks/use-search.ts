/**
 * Search controller (Phase 5, Slice D) — drives `GET /game/filter/search`.
 *
 * Criteria: free-text `query` (sent only when ≥3 chars, per the backend), N
 * `consoleIds`, and a single `content` key (one genre OR theme — the backend takes
 * one for now). `search(criteria)` builds the request and swaps in a fresh pager via
 * the shared `useCursorPagerList` (which also invalidates any in-flight page from
 * the previous criteria, so stale results never overwrite the new search).
 *
 * `touched` distinguishes "haven't searched yet" (show a prompt) from "searched, no
 * results" (show empty) at the page level.
 */
'use client'

import { useCallback, useState } from 'react'

import { CursorPager } from '@/lib/api/cursor-pager'
import {
  useCursorPagerList,
  type CursorPagerLoadResult,
} from '@/lib/api/hooks/use-cursor-pager-list'
import type { GameSearchInput } from '@/lib/domain/inputs'
import type { GameSummary } from '@/lib/domain/models'

import { searchGames } from '../services/catalog'

export interface SearchCriteria {
  query: string
  consoleIds: string[]
  content?: string
}

function buildInput(criteria: SearchCriteria, cursor?: string): GameSearchInput {
  const query = criteria.query.trim()
  if (query.length >= 3) return { query, cursor }

  return {
    consoleIds: criteria.consoleIds.length > 0 ? criteria.consoleIds : undefined,
    content: criteria.content || undefined,
    cursor,
  }
}

/** True when at least one usable filter is present (else searching is a no-op). */
function hasUsableCriteria(criteria: SearchCriteria): boolean {
  const input = buildInput(criteria)
  return !!(input.query || input.consoleIds || input.content)
}

export interface SearchState {
  items: GameSummary[]
  loading: boolean
  error: unknown
  hasMore: boolean
  touched: boolean
  search: (
    criteria: SearchCriteria,
    options?: { preserveItems?: boolean },
  ) => Promise<CursorPagerLoadResult>
  loadMore: () => void
  /** Clear results AND `touched`, so the next search is a clean interaction. */
  reset: () => void
}

export function useSearch(): SearchState {
  const [touched, setTouched] = useState(false)
  const {
    items,
    loading,
    error,
    hasMore,
    loadMore,
    reset: resetList,
  } = useCursorPagerList<GameSummary>()

  const search = useCallback(
    async (criteria: SearchCriteria, options?: { preserveItems?: boolean }) => {
      setTouched(true)
      if (!hasUsableCriteria(criteria)) {
        resetList(null)
        return { ok: true } as const
      }
      resetList(new CursorPager((cursor) => searchGames(buildInput(criteria, cursor))), options)
      return loadMore()
    },
    [resetList, loadMore],
  )

  const reset = useCallback(() => {
    resetList(null)
    setTouched(false)
  }, [resetList])

  return {
    items,
    loading,
    error,
    hasMore,
    touched,
    search,
    loadMore: () => void loadMore(),
    reset,
  }
}
