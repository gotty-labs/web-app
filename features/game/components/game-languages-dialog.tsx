'use client'

import { useRef, useState } from 'react'
import { XIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { GameLanguageCategory } from '@/lib/domain/enums'

import { trackLanguagesSheetOpened } from '../utils/analytics'
import type { GameLanguagesView } from '../utils/languages'
import { GameLanguageRows } from './game-language-rows'

export function GameLanguagesDialog({
  gameId,
  view,
  labels,
}: {
  gameId: string
  view: GameLanguagesView
  labels: { all: string; yourLanguageTag: string; close: string }
}) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<GameLanguageCategory | 'all'>('all')
  const openRef = useRef(false)
  const listRef = useRef<HTMLDivElement>(null)
  function changeOpen(next: boolean) {
    if (next === openRef.current) return
    openRef.current = next
    if (next) {
      setFilter('all')
      trackLanguagesSheetOpened(gameId, view.rows.length, view.level)
    }
    setOpen(next)
  }
  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-auto max-w-full py-2 whitespace-normal">
          {view.showAll}
        </Button>
      </DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        showCloseButton={false}
        className="game-languages-dialog flex translate-x-0 translate-y-0 flex-col gap-4 overflow-hidden"
      >
        <DialogHeader className="shrink-0 flex-row items-start justify-between gap-3">
          <DialogTitle className="min-w-0 text-lg leading-snug wrap-anywhere">
            {view.sheetTitle}
          </DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon-sm" className="shrink-0" aria-label={labels.close}>
              <XIcon />
            </Button>
          </DialogClose>
        </DialogHeader>
        <ToggleGroup
          type="single"
          variant="outline"
          role="radiogroup"
          value={filter}
          aria-label={view.sheetTitle}
          className="w-full shrink-0 flex-wrap justify-start gap-2"
          onValueChange={(value) => {
            if (value !== 'all' && !view.summary.some((item) => item.category === value)) return
            setFilter(value as GameLanguageCategory | 'all')
            listRef.current?.scrollTo({ top: 0 })
          }}
        >
          <ToggleGroupItem
            value="all"
            className="h-auto min-h-8 min-w-0 max-w-full rounded-full border-border bg-card px-3 py-1 text-sm whitespace-normal text-muted-foreground data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            {labels.all}
          </ToggleGroupItem>
          {view.summary.map((item) => (
            <ToggleGroupItem
              key={item.category}
              value={item.category}
              className="h-auto min-h-8 min-w-0 max-w-full rounded-full border-border bg-card px-3 py-1 text-sm whitespace-normal text-muted-foreground data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              {item.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div
          ref={listRef}
          className="game-languages-list min-h-0 overflow-y-auto overscroll-contain"
        >
          <GameLanguageRows
            rows={
              filter === 'all'
                ? view.rows
                : view.rows.filter((row) => row.categories.includes(filter))
            }
            yourLanguageTag={labels.yourLanguageTag}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
