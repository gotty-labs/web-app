/**
 * Search filter bar (Phase 5 / QA Chunk 1) — presentational. The container
 * (`GameSearch`) owns the criteria + the `useFilterOptions()` data; this renders the
 * controls in a single non-wrapping row (the sidebar toggle sits to its left):
 *  - a text query with a violet clear (X) button — Enter searches, button hides on mobile,
 *  - a multi-select dropdown of N consoles (with covers from the backend),
 *  - a single Select for one genre OR theme (the backend's `content` field),
 *  - a reset control shown when a console/genre filter is active.
 */
'use client'

import { type FormEvent } from 'react'
import Image from 'next/image'
import { MonitorIcon, SearchIcon, XIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { GameFilterOptions } from '@/lib/domain/models'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'

/** Radix Select forbids empty-string values; this models "no content filter". */
const NO_CONTENT = '__all__'

export function SearchFilters({
  query,
  onQueryChange,
  onSubmit,
  onClearQuery,
  onReset,
  showReset,
  options,
  consoleIds,
  onToggleConsole,
  content,
  onContentChange,
}: {
  query: string
  onQueryChange: (value: string) => void
  onSubmit: () => void
  onClearQuery: () => void
  onReset: () => void
  showReset: boolean
  options: GameFilterOptions | null
  consoleIds: string[]
  onToggleConsole: (id: string) => void
  content?: string
  onContentChange: (key: string | undefined) => void
}) {
  const dict = useDictionary()
  const t = dict.app.search

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <form onSubmit={handleSubmit} className="flex min-w-0 flex-1 items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Input
            type="search"
            placeholder={t.placeholder}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            aria-label={t.placeholder}
            className="min-w-0 pr-8 [&::-webkit-search-cancel-button]:appearance-none"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={onClearQuery}
              aria-label={t.clear}
              className="text-primary hover:text-primary/80 absolute top-1/2 right-2 -translate-y-1/2"
            >
              <XIcon className="size-4" />
            </button>
          )}
        </div>
        <Button type="submit" className="hidden shrink-0 sm:inline-flex">
          <SearchIcon data-icon="inline-start" />
          {t.submit}
        </Button>
      </form>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="shrink-0" aria-label={t.consoles}>
            <MonitorIcon />
            <span className="hidden sm:inline">{t.consoles}</span>
            {consoleIds.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {consoleIds.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="max-h-72 w-56 overflow-y-auto">
          {options?.consoles.map((gameConsole) => (
            <DropdownMenuCheckboxItem
              key={gameConsole.id}
              checked={consoleIds.includes(gameConsole.id)}
              onCheckedChange={() => onToggleConsole(gameConsole.id)}
              onSelect={(e) => e.preventDefault()}
            >
              <span className="flex min-w-0 items-center gap-2">
                <Image
                  src={gameConsole.cover}
                  alt=""
                  width={20}
                  height={20}
                  className="size-5 shrink-0 rounded object-contain"
                />
                <span className="truncate">{gameConsole.name}</span>
              </span>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Select
        value={content ?? NO_CONTENT}
        onValueChange={(value) => onContentChange(value === NO_CONTENT ? undefined : value)}
      >
        <SelectTrigger className="w-28 shrink-0 sm:w-44">
          <SelectValue placeholder={t.genreTheme} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_CONTENT}>{t.all}</SelectItem>
          {options && options.genres.length > 0 && (
            <SelectGroup>
              <SelectLabel>{t.genres}</SelectLabel>
              {options.genres.map((genre) => (
                <SelectItem key={`genre-${genre.key}`} value={genre.key}>
                  {genre.name}
                </SelectItem>
              ))}
            </SelectGroup>
          )}
          {options && options.themes.length > 0 && (
            <SelectGroup>
              <SelectLabel>{t.themes}</SelectLabel>
              {options.themes.map((theme) => (
                <SelectItem key={`theme-${theme.key}`} value={theme.key}>
                  {theme.name}
                </SelectItem>
              ))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>

      {showReset && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          aria-label={t.reset}
          className="shrink-0"
        >
          <XIcon />
          <span className="hidden sm:inline">{t.reset}</span>
        </Button>
      )}
    </div>
  )
}
