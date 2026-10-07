/**
 * Explore controller — combines the Airbnb-inspired filter header with the existing
 * cursor-paged results surface. Text search (debounced) and the console/content
 * filters combine freely: every search sends the effective query (≥3 chars) together
 * with the applied filters, and any of them alone is enough to search.
 */
'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Empty, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { useIsMobile } from '@/hooks/use-mobile'
import { track } from '@/lib/analytics'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'
import { useErrorMessage } from '@/lib/i18n/hooks/use-error-message'

import { FilterHeaderProvider } from '../contexts/filter-header-provider'
import { FilterOptionsProvider } from '../contexts/filter-options-context'
import { useFilterOptions } from '../hooks/use-filter-options'
import { useSearch } from '../hooks/use-search'

import { FilterHeader, type AppliedFilters } from './filter-header'
import { GameCard } from './game-card'
import { GameResultsGrid } from './game-results-grid'

const SEARCH_DEBOUNCE_MS = 300
const MIN_QUERY_LENGTH = 3
const NO_FILTERS: AppliedFilters = { consoleIds: [] }

function hasActiveFilters(filters: AppliedFilters): boolean {
  return filters.consoleIds.length > 0 || !!filters.content
}

export function GameSearch({ idle }: { idle?: ReactNode }) {
  const dict = useDictionary()
  const t = dict.app.search
  const toMessage = useErrorMessage()
  const isMobile = useIsMobile()
  const { options, loading: optionsLoading } = useFilterOptions()
  const { items, loading, error, hasMore, touched, search, loadMore, reset } = useSearch()
  const [query, setQuery] = useState('')
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>(NO_FILTERS)
  const headerRef = useRef<HTMLElement>(null)
  // Latest applied filters for the debounced query search (read, not a dependency:
  // applying filters runs its own search, so it must not re-trigger the debounce).
  const appliedFiltersRef = useRef(appliedFilters)
  // Effective query the current results were fetched with ('' = filters only / none).
  // Dedupes the debounce after an Enter submit and detects when the query is cleared.
  const searchedQueryRef = useRef('')

  const trimmedQuery = query.trim()
  const queryReady = trimmedQuery.length >= MIN_QUERY_LENGTH
  const effectiveQuery = queryReady ? trimmedQuery : ''
  const hasFilters = hasActiveFilters(appliedFilters)
  const showResults = touched && (queryReady || hasFilters)

  useEffect(() => {
    appliedFiltersRef.current = appliedFilters
  }, [appliedFilters])

  useEffect(() => {
    if (effectiveQuery === searchedQueryRef.current) return

    // Clearing the input applies at once; typing (or dropping under 3 chars) debounces.
    const delay = trimmedQuery.length === 0 ? 0 : SEARCH_DEBOUNCE_MS
    const timer = window.setTimeout(() => {
      searchedQueryRef.current = effectiveQuery
      const filters = appliedFiltersRef.current
      if (!effectiveQuery && !hasActiveFilters(filters)) {
        reset()
        return
      }
      if (effectiveQuery) {
        track({ name: 'search_performed', properties: { query: effectiveQuery } })
      }
      void search({ query: effectiveQuery, ...filters }, { preserveItems: true })
    }, delay)
    return () => window.clearTimeout(timer)
  }, [effectiveQuery, trimmedQuery.length, reset, search])

  function submitQuery() {
    if (!queryReady || searchedQueryRef.current === effectiveQuery) return
    searchedQueryRef.current = effectiveQuery
    track({ name: 'search_performed', properties: { query: effectiveQuery } })
    void search({ query: effectiveQuery, ...appliedFilters }, { preserveItems: true })
  }

  function changeQuery(value: string) {
    setQuery(value)
  }

  async function applyFilters(filters: AppliedFilters): Promise<boolean> {
    if (!effectiveQuery && !hasActiveFilters(filters)) {
      searchedQueryRef.current = ''
      setAppliedFilters(filters)
      reset()
      return true
    }

    const result = await search({ query: effectiveQuery, ...filters }, { preserveItems: true })
    if (!result.ok) {
      toast.error(result.error ? toMessage(result.error) : t.applyError)
      return false
    }

    searchedQueryRef.current = effectiveQuery
    setAppliedFilters(filters)
    return true
  }

  /** Empty-state "Clear all": drop the query AND the filters, back to the idle view. */
  function clearAll() {
    searchedQueryRef.current = ''
    setQuery('')
    setAppliedFilters(NO_FILTERS)
    reset()
  }

  const emptyLabel = queryReady
    ? (hasFilters ? t.noQueryFilterResults : t.noQueryResults).replace('{query}', trimmedQuery)
    : t.noFilterResults

  return (
    <FilterOptionsProvider options={options}>
      <FilterHeaderProvider headerRef={headerRef}>
        <main className="flex flex-col">
          <FilterHeader
            headerRef={headerRef}
            query={query}
            appliedFilters={appliedFilters}
            options={options}
            optionsLoading={optionsLoading}
            showConsoleVisibility={!showResults}
            onQueryChange={changeQuery}
            onSubmitQuery={submitQuery}
            onApplyFilters={applyFilters}
            onClearAll={clearAll}
          />

          {showResults ? (
            <div className="p-4 md:p-6">
              <GameResultsGrid
                items={items}
                loading={loading}
                error={error}
                hasMore={hasMore}
                onLoadMore={loadMore}
                renderItem={(game) => <GameCard game={game} />}
                emptyLabel={emptyLabel}
                emptyAction={
                  hasFilters ? (
                    <Button variant="outline" onClick={clearAll}>
                      {t.reset}
                    </Button>
                  ) : undefined
                }
                skeletonCount={isMobile ? 4 : 6}
              />
            </div>
          ) : (
            (idle ?? (
              <div className="p-4 md:p-6">
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>{t.prompt}</EmptyTitle>
                  </EmptyHeader>
                </Empty>
              </div>
            ))
          )}
        </main>
      </FilterHeaderProvider>
    </FilterOptionsProvider>
  )
}
