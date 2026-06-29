/**
 * Search screen (Phase 5, Slice D) — container. Owns the live criteria (query +
 * console ids + one genre/theme key), wires `useFilterOptions` (the controls' data)
 * and `useSearch` (the results), and re-runs the search whenever a dropdown changes
 * or the text form is submitted. Results reuse the shared `GameResultsGrid`.
 *
 * Before the first search a prompt is shown (`touched` from the hook); after, the
 * grid handles results / empty / error.
 */
'use client'

import { useState } from 'react'

import { Empty, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'

import { useFilterOptions } from '../hooks/use-filter-options'
import { useSearch, type SearchCriteria } from '../hooks/use-search'

import { GameResultsGrid } from './game-results-grid'
import { SearchFilters } from './search-filters'

export function GameSearch() {
  const dict = useDictionary()
  const { options } = useFilterOptions()
  const { items, loading, error, hasMore, touched, search, loadMore } = useSearch()

  const [query, setQuery] = useState('')
  const [consoleIds, setConsoleIds] = useState<string[]>([])
  const [content, setContent] = useState<string | undefined>(undefined)

  // Merge a partial change with the current criteria, then search. `'content' in
  // next` lets an explicit `undefined` clear the genre/theme without being treated
  // as "unchanged".
  function runSearch(next: Partial<SearchCriteria>) {
    search({
      query: next.query ?? query,
      consoleIds: next.consoleIds ?? consoleIds,
      content: 'content' in next ? next.content : content,
    })
  }

  function toggleConsole(id: string) {
    const next = consoleIds.includes(id)
      ? consoleIds.filter((c) => c !== id)
      : [...consoleIds, id]
    setConsoleIds(next)
    runSearch({ consoleIds: next })
  }

  function changeContent(key: string | undefined) {
    setContent(key)
    runSearch({ content: key })
  }

  return (
    <main className="flex flex-col gap-6 p-4 md:p-6">
      <SearchFilters
        query={query}
        onQueryChange={setQuery}
        onSubmit={() => runSearch({ query })}
        options={options}
        consoleIds={consoleIds}
        onToggleConsole={toggleConsole}
        content={content}
        onContentChange={changeContent}
      />

      {touched ? (
        <GameResultsGrid
          items={items}
          loading={loading}
          error={error}
          hasMore={hasMore}
          onLoadMore={loadMore}
          emptyLabel={dict.app.search.noResults}
        />
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{dict.app.search.prompt}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      )}
    </main>
  )
}
