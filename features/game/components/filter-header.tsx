'use client'

import { useCallback, useEffect, useRef, useState, type FormEvent, type RefObject } from 'react'
import {
  ChevronDownIcon,
  Gamepad2Icon,
  Layers3Icon,
  MonitorIcon,
  SearchIcon,
  XIcon,
} from 'lucide-react'

import { AppTopBar } from '@/components/app-top-bar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useConsoleVisibility } from '@/hooks/use-console-visibility'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { track } from '@/lib/analytics'
import type { GameFilterOptions } from '@/lib/domain/models'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'
import { cn } from '@/lib/utils'

import { useScrollProgress } from '../hooks/use-scroll-progress'

import { FilterCard, type FilterPanel } from './filter-card'

const FILTER_HEADER_EXPANDED_HEIGHT_REM = 5
const FILTER_HEADER_COLLAPSED_HEIGHT_REM = 3
const FILTER_HEADER_COMPACT_SCALE = 0.9

/**
 * Opens the console visibility setting, with a count badge while it limits the feed —
 * like the apps' feed header button (it replaces the feed's former notice). From `sm`
 * up only: on phones the row has no room for it, and the count shows on the sidebar
 * item and the menu button instead (see `AppSidebar`, `AppTopBar`).
 */
function ConsoleVisibilityButton() {
  const dict = useDictionary()
  const label = dict.app.nav.consoleVisibility
  const { openConsoleVisibility, appliedConsoleCount: count } = useConsoleVisibility()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={
            count > 0
              ? dict.app.nav.consoleVisibilityCount.replace('{count}', String(count))
              : label
          }
          onClick={openConsoleVisibility}
          className="relative hidden shrink-0 sm:inline-flex"
        >
          <MonitorIcon />
          {count > 0 && (
            <Badge aria-hidden className="absolute -top-1 -right-1 h-4 min-w-4 px-1 tabular-nums">
              {count}
            </Badge>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export interface AppliedFilters {
  consoleIds: string[]
  content?: string
}

export function FilterHeader({
  headerRef,
  query,
  appliedFilters,
  options,
  optionsLoading,
  showConsoleVisibility,
  onQueryChange,
  onSubmitQuery,
  onApplyFilters,
  onClearAll,
}: {
  headerRef: RefObject<HTMLElement | null>
  query: string
  appliedFilters: AppliedFilters
  options: GameFilterOptions | null
  optionsLoading: boolean
  /**
   * Console visibility only limits the feed, so it's offered while the feed shows and
   * hidden over search results (where toggling it would change nothing).
   */
  showConsoleVisibility: boolean
  onQueryChange: (value: string) => void
  onSubmitQuery: () => void
  onApplyFilters: (filters: AppliedFilters) => Promise<boolean>
  /** Drops the query AND every filter at once. */
  onClearAll: () => void
}) {
  const t = useDictionary().app.search
  const scrollProgress = useScrollProgress()
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
  // "Clear all" only earns its place when it saves taps: with a single criterion
  // active, that criterion's own ✕ already does the same.
  const canClearAll = [queryMode, consolesApplied, contentApplied].filter(Boolean).length >= 2

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
    const filterType = activePanel
    const values =
      filterType === 'consoles'
        ? [...draftConsoleIds].sort()
        : filterType === 'content' && draftContent
          ? [draftContent]
          : []
    setApplying(true)
    const succeeded = await onApplyFilters({
      consoleIds: draftConsoleIds,
      content: draftContent,
    })
    setApplying(false)
    if (succeeded) {
      if (filterType && values.length > 0) {
        track({
          name: 'filtered_search_performed',
          properties: { filter_type: filterType, values },
        })
      }
      setActivePanel(null)
    }
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

  function clearAll() {
    setActivePanel(null)
    setDraftConsoleIds([])
    setDraftContent(undefined)
    onClearAll()
    // The button unmounts with nothing left to clear; keep focus in the filter row.
    window.requestAnimationFrame(() => consolesTriggerRef.current?.focus())
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
      // While the home hero shows behind it (`FeedSheetLayout` sets `data-over-hero`),
      // the bar is see-through, like the apps' navigation bar over their hero.
      className="data-over-hero:border-transparent data-over-hero:bg-transparent data-over-hero:backdrop-blur-none"
      // Hidden, a spacer keeps the search centered against the sidebar toggle.
      trailing={showConsoleVisibility ? <ConsoleVisibilityButton /> : undefined}
      balanced
      // Below `sm` the search block flattens (`contents`) into this row, so the filter
      // pills can wrap onto a full-width line of their own under the menu + search.
      contentClassName="min-h-0 py-1 max-sm:flex-wrap"
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
        className="mx-auto flex min-w-0 max-w-4xl flex-1 flex-wrap items-center justify-center gap-2 will-change-transform max-sm:contents motion-reduce:transform-none"
        style={{ transform: `scale(${controlsScale})` }}
      >
        <form
          onSubmit={submitQuery}
          className={cn(
            'min-w-0 transition-[width,max-width,flex-basis] duration-300 ease-out',
            searchExpanded
              ? 'flex-1 sm:min-w-52 sm:max-w-xl'
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
            // Mobile: one swipeable row (never wraps); `py-1` keeps focus rings unclipped.
            'flex min-w-0 touch-pan-x items-center gap-2 overflow-x-auto py-1 [scrollbar-width:none] max-sm:-my-1 sm:max-w-full sm:flex-wrap sm:justify-center sm:overflow-visible sm:py-0 [&::-webkit-scrollbar]:hidden',
            searchExpanded ? 'basis-full sm:basis-auto' : 'flex-1 sm:flex-none',
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

          {canClearAll && (
            <Button
              type="button"
              size="pill"
              variant="ghost"
              disabled={applying}
              onClick={clearAll}
              className="shrink-0"
            >
              {t.reset}
            </Button>
          )}
        </div>
      </div>
    </AppTopBar>
  )
}
