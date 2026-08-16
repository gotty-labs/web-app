/**
 * Release dates, richer than a single date string. Each entry shows its console,
 * region and status, and offers a one-click "add to calendar" (Apple `.ics` download
 * or a Google Calendar link). The first three show inline; the rest live behind a
 * "see all" dialog so the section never floods with dates.
 *
 * Rows are plain view-models resolved on the server (labels already localized), so
 * this client component ships no dictionary.
 */
'use client'

import { useState } from 'react'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

import { CalendarMenu, type CalendarLabels } from './calendar-menu'

export type ReleaseRow = {
  id: string
  dateIso: string
  dateLabel: string
  consoleName: string
  consoleImage?: string
  regionLabel: string
  statusLabel?: string
}

type Labels = CalendarLabels & {
  gameName: string
  releasesTitle: string
  seeAll: string
}

function ReleaseRowItem({ row, labels }: { row: ReleaseRow; labels: Labels }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-card px-3.5 py-2.5 ring-1 ring-border">
      {row.consoleImage ? (
        <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-transparent">
          <Image
            src={row.consoleImage}
            alt=""
            width={36}
            height={36}
            className="size-9 object-contain"
          />
        </span>
      ) : null}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="truncate text-sm font-medium">{row.consoleName}</span>
          {row.statusLabel ? (
            <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[0.7rem] font-medium text-primary">
              {row.statusLabel}
            </span>
          ) : null}
        </div>
        <div className="text-xs text-muted-foreground">
          {row.regionLabel} · {row.dateLabel}
        </div>
      </div>

      <CalendarMenu
        event={{
          title: `${labels.gameName} — ${row.consoleName}`,
          date: row.dateIso,
          details: `${row.regionLabel} · ${row.consoleName}`,
        }}
        labels={labels}
      />
    </div>
  )
}

export function GameReleaseDates({ rows, labels }: { rows: ReleaseRow[]; labels: Labels }) {
  const [open, setOpen] = useState(false)
  const preview = rows.slice(0, 3)
  const hasMore = rows.length > preview.length

  return (
    <div className="flex flex-col gap-2.5">
      {preview.map((row) => (
        <ReleaseRowItem key={row.id} row={row} labels={labels} />
      ))}

      {hasMore ? (
        <>
          <Button variant="outline" size="sm" className="w-fit" onClick={() => setOpen(true)}>
            {labels.seeAll} ({rows.length})
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{labels.releasesTitle}</DialogTitle>
              </DialogHeader>
              <div className="flex max-h-[70svh] flex-col gap-2.5 overflow-y-auto overscroll-contain px-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {rows.map((row) => (
                  <ReleaseRowItem key={row.id} row={row} labels={labels} />
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </>
      ) : null}
    </div>
  )
}
