/**
 * Search controller (Phase 5, Slice D) — drives `GET /game/filter/search`.
 *
 * Criteria: free-text `query` (sent only when ≥3 chars, per the backend), N
 * `consoleIds`, and a single `content` key (one genre OR theme — the backend takes
 * one for now). `search(criteria)` builds the request, spins up a fresh `CursorPager`
 * for it, and loads page 1; `loadMore` appends. A `loadingRef` keeps `loadMore`
 * stable and guards re-entrancy (same rationale as `useSectionPager`).
 *
 * `touched` distinguishes "haven't searched yet" (show a prompt) from "searched, no
 * results" (show empty) at the page level.
 */
'use client'

import { useCallback, useRef, useState } from 'react'

import { CursorPager } from '@/lib/api/cursor-pager'
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
  return {
    query: query.length >= 3 ? query : undefined,
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
  search: (criteria: SearchCriteria) => void
  loadMore: () => void
  /** Clear results AND `touched`, so the next search is a clean interaction. */
  reset: () => void
}

export function useSearch(): SearchState {
  const [items, setItems] = useState<GameSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const [hasMore, setHasMore] = useState(false)
  const [touched, setTouched] = useState(false)

  const pagerRef = useRef<CursorPager<GameSummary> | null>(null)
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

  const search = useCallback(
    (criteria: SearchCriteria) => {
      setTouched(true)
      setError(null)
      if (!hasUsableCriteria(criteria)) {
        pagerRef.current = null
        setItems([])
        setHasMore(false)
        return
      }
      pagerRef.current = new CursorPager<GameSummary>((cursor) =>
        searchGames(buildInput(criteria, cursor)),
      )
      setItems([])
      setHasMore(true)
      void loadMore()
    },
    [loadMore],
  )

  const reset = useCallback(() => {
    pagerRef.current = null
    setItems([])
    setHasMore(false)
    setError(null)
    setTouched(false)
  }, [])

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
