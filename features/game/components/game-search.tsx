/**
 * Explore controller — combines the Airbnb-inspired filter header with the existing
 * cursor-paged results surface. Text search is debounced and mutually exclusive
 * with the console/content filtering mode.
 */
'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Empty, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { useIsMobile } from '@/hooks/use-mobile'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'
import { useErrorMessage } from '@/lib/i18n/hooks/use-error-message'

import { useFilterOptions } from '../hooks/use-filter-options'
import { useSearch } from '../hooks/use-search'

import { FilterHeader, type AppliedFilters } from './filter-header'
import { GameCard } from './game-card'
import { GameResultsGrid } from './game-results-grid'

const SEARCH_DEBOUNCE_MS = 300

export function GameSearch({ idle }: { idle?: ReactNode }) {
  const dict = useDictionary()
  const t = dict.app.search
  const toMessage = useErrorMessage()
  const isMobile = useIsMobile()
  const { options, loading: optionsLoading } = useFilterOptions()
  const { items, loading, error, hasMore, touched, search, loadMore, reset } = useSearch()
  const [query, setQuery] = useState('')
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({ consoleIds: [] })
  const searchedTextRef = useRef(false)
  const submittedQueryRef = useRef<string | null>(null)

  const trimmedQuery = query.trim()
  const queryReady = trimmedQuery.length >= 3
  const hasFilters = appliedFilters.consoleIds.length > 0 || !!appliedFilters.content
  const showResults = touched && (queryReady || hasFilters)

  useEffect(() => {
    if (trimmedQuery.length >= 3) {
      const timer = window.setTimeout(() => {
        if (submittedQueryRef.current === trimmedQuery) {
          submittedQueryRef.current = null
          return
        }
        setAppliedFilters((current) =>
          current.consoleIds.length > 0 || current.content ? { consoleIds: [] } : current,
        )
        searchedTextRef.current = true
        void search(
          { query: trimmedQuery, consoleIds: [], content: undefined },
          { preserveItems: true },
        )
      }, SEARCH_DEBOUNCE_MS)
      return () => window.clearTimeout(timer)
    }

    if (trimmedQuery.length === 0 && searchedTextRef.current) {
      searchedTextRef.current = false
      submittedQueryRef.current = null
      reset()
    }
  }, [reset, search, trimmedQuery])

  function submitQuery() {
    if (!queryReady) return
    submittedQueryRef.current = trimmedQuery
    searchedTextRef.current = true
    setAppliedFilters((current) =>
      current.consoleIds.length > 0 || current.content ? { consoleIds: [] } : current,
    )
    void search(
      { query: trimmedQuery, consoleIds: [], content: undefined },
      { preserveItems: true },
    )
  }

  function changeQuery(value: string) {
    setQuery(value)
  }

  async function applyFilters(filters: AppliedFilters): Promise<boolean> {
    const active = filters.consoleIds.length > 0 || !!filters.content
    if (!active) {
      submittedQueryRef.current = null
      searchedTextRef.current = false
      setQuery('')
      setAppliedFilters(filters)
      reset()
      return true
    }

    const result = await search({ query: '', ...filters }, { preserveItems: true })
    if (!result.ok) {
      toast.error(result.error ? toMessage(result.error) : t.applyError)
      return false
    }

    submittedQueryRef.current = null
    searchedTextRef.current = false
    setQuery('')
    setAppliedFilters(filters)
    return true
  }

  const emptyLabel = hasFilters
    ? t.noFilterResults
    : t.noQueryResults.replace('{query}', trimmedQuery)

  return (
    <main className="flex flex-col">
      <FilterHeader
        query={query}
        appliedFilters={appliedFilters}
        options={options}
        optionsLoading={optionsLoading}
        onQueryChange={changeQuery}
        onSubmitQuery={submitQuery}
        onApplyFilters={applyFilters}
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
              !queryReady && hasFilters ? (
                <Button variant="outline" onClick={() => void applyFilters({ consoleIds: [] })}>
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
  )
}
