'use client'

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { ChevronDownIcon, Gamepad2Icon, Layers3Icon, SearchIcon, XIcon } from 'lucide-react'

import { AppTopBar } from '@/components/app-top-bar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import type { GameFilterOptions } from '@/lib/domain/models'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'
import { cn } from '@/lib/utils'

import { useScrollProgress } from '../hooks/use-scroll-progress'

import { FilterCard, type FilterPanel } from './filter-card'

const FILTER_HEADER_EXPANDED_HEIGHT_REM = 5
const FILTER_HEADER_COLLAPSED_HEIGHT_REM = 3
const FILTER_HEADER_COMPACT_SCALE = 0.9

export interface AppliedFilters {
  consoleIds: string[]
  content?: string
}

export function FilterHeader({
  query,
  appliedFilters,
  options,
  optionsLoading,
  onQueryChange,
  onSubmitQuery,
  onApplyFilters,
}: {
  query: string
  appliedFilters: AppliedFilters
  options: GameFilterOptions | null
  optionsLoading: boolean
  onQueryChange: (value: string) => void
  onSubmitQuery: () => void
  onApplyFilters: (filters: AppliedFilters) => Promise<boolean>
}) {
  const t = useDictionary().app.search
  const scrollProgress = useScrollProgress()
  const headerRef = useRef<HTMLElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const consolesTriggerRef = useRef<HTMLButtonElement>(null)
  const contentTriggerRef = useRef<HTMLButtonElement>(null)
  const [searchFocused, setSearchFocused] = useState(false)
  const [activePanel, setActivePanel] = useState<FilterPanel | null>(null)
  const [draftConsoleIds, setDraftConsoleIds] = useState<string[]>(appliedFilters.consoleIds)
  const [draftContent, setDraftContent] = useState<string | undefined>(appliedFilters.content)
  const [applying, setApplying] = useState(false)

  const queryMode = query.trim().length > 0
  const searchExpanded = searchFocused || queryMode
  const consolesApplied = appliedFilters.consoleIds.length > 0
  const contentApplied = !!appliedFilters.content

  const discardDraft = useCallback(
    (returnFocus = false) => {
      const closingPanel = activePanel
      setDraftConsoleIds(appliedFilters.consoleIds)
      setDraftContent(appliedFilters.content)
      setActivePanel(null)
      if (returnFocus && closingPanel) {
        window.requestAnimationFrame(() => {
          if (closingPanel === 'consoles') consolesTriggerRef.current?.focus()
          else contentTriggerRef.current?.focus()
        })
      }
    },
    [activePanel, appliedFilters],
  )

  useEffect(() => {
    if (!activePanel) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) discardDraft()
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        discardDraft(true)
      } else if (['PageDown', 'PageUp', 'Home', 'End'].includes(event.key)) {
        discardDraft()
      }
    }
    const handleScrollIntent = (event: Event) => {
      if (!panelRef.current?.contains(event.target as Node)) discardDraft()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('wheel', handleScrollIntent, { passive: true })
    window.addEventListener('touchmove', handleScrollIntent, { passive: true })
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('wheel', handleScrollIntent)
      window.removeEventListener('touchmove', handleScrollIntent)
    }
  }, [activePanel, discardDraft])

  function togglePanel(panel: FilterPanel) {
    if (applying) return
    if (activePanel === panel) {
      discardDraft(true)
      return
    }
    if (!activePanel) {
      setDraftConsoleIds(appliedFilters.consoleIds)
      setDraftContent(appliedFilters.content)
    }
    setActivePanel(panel)
  }

  async function applyDraft() {
    setApplying(true)
    const succeeded = await onApplyFilters({
      consoleIds: draftConsoleIds,
      content: draftContent,
    })
    setApplying(false)
    if (succeeded) setActivePanel(null)
  }

  async function clearFilter(panel: FilterPanel) {
    setApplying(true)
    const succeeded = await onApplyFilters({
      consoleIds: panel === 'consoles' ? [] : appliedFilters.consoleIds,
      content: panel === 'content' ? undefined : appliedFilters.content,
    })
    setApplying(false)
    if (succeeded) {
      setDraftConsoleIds(panel === 'consoles' ? [] : appliedFilters.consoleIds)
      setDraftContent(panel === 'content' ? undefined : appliedFilters.content)
    }
  }

  function submitQuery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmitQuery()
  }

  function changeQuery(value: string) {
    if (value.trim().length > 0 && activePanel) discardDraft()
    onQueryChange(value)
  }

  const easedScrollProgress = scrollProgress * scrollProgress * (3 - 2 * scrollProgress)
  const headerHeight =
    FILTER_HEADER_EXPANDED_HEIGHT_REM -
    (FILTER_HEADER_EXPANDED_HEIGHT_REM - FILTER_HEADER_COLLAPSED_HEIGHT_REM) * easedScrollProgress
  const controlsScale = 1 - (1 - FILTER_HEADER_COMPACT_SCALE) * easedScrollProgress

  return (
    <AppTopBar
      headerRef={headerRef}
      balanced
      contentClassName="min-h-0 py-1"
      contentStyle={{ minHeight: `${headerHeight}rem` }}
      panel={
        activePanel ? (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200 motion-reduce:animate-none">
            <FilterCard
              activePanel={activePanel}
              options={options}
              optionsLoading={optionsLoading}
              consoleIds={draftConsoleIds}
              content={draftContent}
              applying={applying}
              panelRef={panelRef}
              onConsoleIdsChange={setDraftConsoleIds}
              onContentChange={setDraftContent}
              onClose={() => discardDraft(true)}
              onApply={() => void applyDraft()}
            />
          </div>
        ) : undefined
      }
    >
      <div
        role="search"
        className="mx-auto flex min-w-0 max-w-4xl flex-1 flex-wrap items-center justify-center gap-1.5 will-change-transform sm:gap-2 motion-reduce:transform-none"
        style={{ transform: `scale(${controlsScale})` }}
      >
        <form
          onSubmit={submitQuery}
          className={cn(
            'min-w-0 transition-[width,max-width,flex-basis] duration-300 ease-out',
            searchExpanded
              ? 'basis-full sm:min-w-52 sm:flex-1 sm:basis-auto sm:max-w-xl'
              : 'w-10 flex-none sm:min-w-44 sm:flex-1 sm:max-w-md',
          )}
        >
          <InputGroup
            size="lg"
            className={cn(!searchExpanded && 'justify-center sm:justify-start')}
          >
            <InputGroupInput
              type="search"
              value={query}
              placeholder={t.placeholder}
              aria-label={t.placeholder}
              autoComplete="off"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              onChange={(event) => changeQuery(event.target.value)}
              className={cn(
                '[&::-webkit-search-cancel-button]:appearance-none',
                !searchExpanded &&
                  'absolute inset-0 cursor-text px-0 opacity-0 sm:static sm:flex-1 sm:px-2.5 sm:opacity-100',
              )}
            />
            <InputGroupAddon className={cn(!searchExpanded && 'w-full p-0 sm:w-auto sm:pl-2')}>
              <SearchIcon aria-hidden />
            </InputGroupAddon>
            {query.length > 0 && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-xs"
                  aria-label={t.clear}
                  onClick={() => changeQuery('')}
                >
                  <XIcon />
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>
        </form>

        <div
          className={cn(
            'flex min-w-0 max-w-full flex-wrap items-center justify-center gap-2',
            searchExpanded && 'w-full sm:w-auto',
          )}
        >
          <div className="flex shrink-0 items-center">
            <Button
              ref={consolesTriggerRef}
              type="button"
              size="pill"
              variant={
                activePanel === 'consoles' ? 'default' : consolesApplied ? 'secondary' : 'outline'
              }
              disabled={applying}
              aria-label={
                consolesApplied
                  ? (appliedFilters.consoleIds.length === 1
                      ? t.consoleSelected
                      : t.consolesSelected
                    ).replace('{count}', String(appliedFilters.consoleIds.length))
                  : t.consoles
              }
              aria-expanded={activePanel === 'consoles'}
              aria-controls="feed-filter-panel"
              onClick={() => togglePanel('consoles')}
              className={cn(consolesApplied && 'rounded-r-none pr-2')}
            >
              <Gamepad2Icon data-icon="inline-start" />
              {t.consoles}
              {consolesApplied && (
                <Badge variant="default">{appliedFilters.consoleIds.length}</Badge>
              )}
              <ChevronDownIcon data-icon="inline-end" />
            </Button>
            {consolesApplied && (
              <Button
                type="button"
                size="pill-icon"
                variant="secondary"
                disabled={applying}
                aria-label={t.clearConsoles}
                onClick={() => void clearFilter('consoles')}
                className="-ml-px rounded-l-none rounded-r-full"
              >
                <XIcon />
              </Button>
            )}
          </div>

          <div className="flex shrink-0 items-center">
            <Button
              ref={contentTriggerRef}
              type="button"
              size="pill"
              variant={
                activePanel === 'content' ? 'default' : contentApplied ? 'secondary' : 'outline'
              }
              disabled={applying}
              aria-label={contentApplied ? t.contentSelected : t.content}
              aria-expanded={activePanel === 'content'}
              aria-controls="feed-filter-panel"
              onClick={() => togglePanel('content')}
              className={cn(contentApplied && 'rounded-r-none pr-2')}
            >
              <Layers3Icon data-icon="inline-start" />
              {t.content}
              {contentApplied && <Badge variant="default">1</Badge>}
              <ChevronDownIcon data-icon="inline-end" />
            </Button>
            {contentApplied && (
              <Button
                type="button"
                size="pill-icon"
                variant="secondary"
                disabled={applying}
                aria-label={t.clearContent}
                onClick={() => void clearFilter('content')}
                className="-ml-px rounded-l-none rounded-r-full"
              >
                <XIcon />
              </Button>
            )}
          </div>
        </div>
      </div>
    </AppTopBar>
  )
}
