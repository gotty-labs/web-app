/**
 * Search + explore (Phase 5 / QA Chunk 1) — a search bar pinned at the top with the
 * body below. When there's an active search (a submitted query ≥3 chars, or a console
 * / genre-theme filter), the carousels are replaced by the results grid; otherwise the
 * `idle` slot renders (the home feed). This is why search now lives in the feed header
 * instead of the sidebar.
 *
 * `showResults = touched && active`: `active` reflects the current criteria, and
 * `touched` only flips once a search actually runs — so typing text (which searches on
 * submit) keeps the feed visible until the user submits, while dropdown changes (which
 * search immediately) swap to results at once.
 */
'use client'

import { useState, type ReactNode } from 'react'

import { AppTopBar } from '@/components/app-top-bar'
import { Empty, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'

import { useFilterOptions } from '../hooks/use-filter-options'
import { useSearch } from '../hooks/use-search'

import { GameResultsGrid } from './game-results-grid'
import { SearchFilters } from './search-filters'

export function GameSearch({ idle }: { idle?: ReactNode }) {
  const dict = useDictionary()
  const { options } = useFilterOptions()
  const { items, loading, error, hasMore, touched, search, loadMore } = useSearch()

  const [query, setQuery] = useState('')
  const [consoleIds, setConsoleIds] = useState<string[]>([])
  const [content, setContent] = useState<string | undefined>(undefined)

  const hasFilters = consoleIds.length > 0 || !!content
  const active = query.trim().length >= 3 || hasFilters
  const showResults = touched && active

  // Name search and console/genre filters are MUTUALLY EXCLUSIVE (per QA): submitting a
  // query clears the filters, and touching a filter clears the query. Console + genre
  // still coexist. The search() call takes explicit criteria (not the async state).
  function submitQuery() {
    setConsoleIds([])
    setContent(undefined)
    search({ query, consoleIds: [], content: undefined })
  }

  function toggleConsole(id: string) {
    const next = consoleIds.includes(id)
      ? consoleIds.filter((c) => c !== id)
      : [...consoleIds, id]
    setQuery('')
    setConsoleIds(next)
    search({ query: '', consoleIds: next, content })
  }

  function changeContent(key: string | undefined) {
    setQuery('')
    setContent(key)
    search({ query: '', consoleIds, content: key })
  }

  // Clearing the query (violet X) in query mode leaves no criteria → back to the feed.
  function clearQuery() {
    setQuery('')
    search({ query: '', consoleIds, content })
  }

  // Reset control (shown when a filter is active) → clears everything → feed.
  function resetAll() {
    setQuery('')
    setConsoleIds([])
    setContent(undefined)
    search({ query: '', consoleIds: [], content: undefined })
  }

  return (
    <main className="flex flex-col">
      <AppTopBar>
        <SearchFilters
          query={query}
          onQueryChange={setQuery}
          onSubmit={submitQuery}
          onClearQuery={clearQuery}
          onReset={resetAll}
          showReset={hasFilters}
          options={options}
          consoleIds={consoleIds}
          onToggleConsole={toggleConsole}
          content={content}
          onContentChange={changeContent}
        />
      </AppTopBar>

      {showResults ? (
        <div className="p-4 md:p-6">
          <GameResultsGrid
            items={items}
            loading={loading}
            error={error}
            hasMore={hasMore}
            onLoadMore={loadMore}
            emptyLabel={dict.app.search.noResults}
          />
        </div>
      ) : (
        (idle ?? (
          <div className="p-4 md:p-6">
            <Empty>
              <EmptyHeader>
                <EmptyTitle>{dict.app.search.prompt}</EmptyTitle>
              </EmptyHeader>
            </Empty>
          </div>
        ))
      )}
    </main>
  )
}
