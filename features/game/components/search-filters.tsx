/**
 * Search filter bar (Phase 5, Slice D) — presentational. The container (`GameSearch`)
 * owns the criteria + the `useFilterOptions()` data; this just renders the controls
 * and reports changes:
 *  - a text query form (submit on Enter / button),
 *  - a multi-select dropdown of N consoles (checkbox items, menu stays open),
 *  - a single Select for one genre OR theme (the backend's `content` field).
 *
 * Console options carry a `cover`; genres/themes are name-only for now (no icon URL
 * from the backend yet — known gap). A sentinel value models "no genre/theme".
 */
'use client'

import { type FormEvent } from 'react'
import { MonitorIcon, SearchIcon } from 'lucide-react'

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
  options,
  consoleIds,
  onToggleConsole,
  content,
  onContentChange,
}: {
  query: string
  onQueryChange: (value: string) => void
  onSubmit: () => void
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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <form onSubmit={handleSubmit} className="flex flex-1 gap-2">
        <Input
          type="search"
          placeholder={t.placeholder}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          aria-label={t.placeholder}
        />
        <Button type="submit">
          <SearchIcon data-icon="inline-start" />
          {t.submit}
        </Button>
      </form>

      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <MonitorIcon data-icon="inline-start" />
              {t.consoles}
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
                {gameConsole.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Select
          value={content ?? NO_CONTENT}
          onValueChange={(value) => onContentChange(value === NO_CONTENT ? undefined : value)}
        >
          <SelectTrigger className="w-44">
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
      </div>
    </div>
  )
}
