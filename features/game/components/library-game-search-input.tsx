'use client'

import { useEffect, useRef, useState, type WheelEvent } from 'react'
import { SearchIcon, XIcon } from 'lucide-react'

import { AppImage } from '@/components/app-image'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Spinner } from '@/components/ui/spinner'
import type { GameSummary } from '@/lib/domain/models'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'

import { searchGames } from '../services/catalog'

export function LibraryGameSearchInput({
  selected,
  onSelectedChange,
}: {
  selected: GameSummary[]
  onSelectedChange: (games: GameSummary[]) => void
}) {
  const t = useDictionary().app.library
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GameSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const requestRef = useRef(0)

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    [],
  )

  function changeQuery(value: string) {
    setQuery(value)
    if (timerRef.current) clearTimeout(timerRef.current)
    requestRef.current += 1
    const request = requestRef.current
    const trimmed = value.trim()

    if (trimmed.length < 3) {
      setResults([])
      setLoading(false)
      setOpen(false)
      return
    }

    setLoading(true)
    setOpen(true)
    timerRef.current = setTimeout(() => {
      searchGames({ query: trimmed, limit: 20 })
        .then((page) => {
          if (request === requestRef.current) setResults(page.items)
        })
        .catch(() => {
          if (request === requestRef.current) setResults([])
        })
        .finally(() => {
          if (request === requestRef.current) setLoading(false)
        })
    }, 300)
  }

  function selectGame(game: GameSummary) {
    if (selected.some((current) => current.id === game.id)) return
    onSelectedChange([...selected, game])
  }

  function scrollResults(event: WheelEvent<HTMLDivElement>) {
    const viewport = event.currentTarget.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]',
    )
    if (!viewport) return

    const multiplier =
      event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientHeight : 1
    const previousScrollTop = viewport.scrollTop
    viewport.scrollTop += event.deltaY * multiplier

    if (viewport.scrollTop !== previousScrollTop) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div className="relative">
            <SearchIcon
              aria-hidden
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
            />
            <Input
              value={query}
              onChange={(event) => changeQuery(event.target.value)}
              onFocus={() => {
                if (query.trim().length >= 3) setOpen(true)
              }}
              placeholder={t.gameSearchPlaceholder}
              className="pl-8"
              autoComplete="off"
            />
          </div>
        </PopoverAnchor>
        <PopoverContent
          align="start"
          className="w-(--radix-popover-trigger-width) overflow-hidden p-0"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Spinner className="text-muted-foreground" />
            </div>
          ) : null}
          {!loading && results.length === 0 ? (
            <p className="text-muted-foreground px-2 py-4 text-center text-sm">
              {t.gameSearchNoResults}
            </p>
          ) : null}
          {!loading && results.length > 0 ? (
            <ScrollArea className="h-72" onWheel={scrollResults}>
              <div className="flex flex-col p-2">
                {results.map((game) => {
                  const alreadySelected = selected.some((current) => current.id === game.id)
                  return (
                    <Button
                      type="button"
                      variant="ghost"
                      key={game.id}
                      disabled={alreadySelected}
                      onClick={() => selectGame(game)}
                      className="h-auto w-full justify-start gap-3 px-2 py-2"
                    >
                      {game.cover ? (
                        <AppImage
                          src={game.cover}
                          alt=""
                          width={40}
                          height={56}
                          wrapperClassName="h-14 w-10 shrink-0 rounded-md"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span aria-hidden className="bg-muted h-14 w-10 shrink-0 rounded-md" />
                      )}
                      <span className="line-clamp-2 text-left whitespace-normal">{game.name}</span>
                    </Button>
                  )
                })}
              </div>
            </ScrollArea>
          ) : null}
        </PopoverContent>
      </Popover>

      {query.trim().length > 0 && query.trim().length < 3 ? (
        <p className="text-muted-foreground text-xs">{t.gameSearchHint}</p>
      ) : null}

      {selected.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground text-xs font-medium">{t.selectedGames}</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {selected.map((game) => (
              <Card key={game.id} size="sm" className="relative flex-row gap-0 py-0">
                {game.cover ? (
                  <AppImage
                    src={game.cover}
                    alt=""
                    width={48}
                    height={64}
                    wrapperClassName="h-16 w-12 shrink-0 rounded-l-xl"
                    className="size-full object-cover"
                  />
                ) : (
                  <span aria-hidden className="bg-muted h-16 w-12 shrink-0 rounded-l-xl" />
                )}
                <CardHeader className="min-w-0 flex-1 justify-center py-2 pr-8 pl-3">
                  <CardTitle className="line-clamp-2 text-xs leading-tight">{game.name}</CardTitle>
                </CardHeader>
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  aria-label={`${t.confirmRemove}: ${game.name}`}
                  onClick={() =>
                    onSelectedChange(selected.filter((current) => current.id !== game.id))
                  }
                  className="absolute top-1 right-1 rounded-full"
                >
                  <XIcon />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
