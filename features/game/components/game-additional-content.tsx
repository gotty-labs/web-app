/**
 * DLC and expansions, grouped and clearly labelled. Each item is a cover card; opening
 * one slides up a bottom sheet with the full cover and its sub-data (per-console/region
 * release dates, each with an "add to calendar" control).
 *
 * View-models (name/cover + localized release rows incl. the raw ISO date for calendar
 * events) are built on the server.
 */
'use client'

import { useState } from 'react'

import { AppImage } from '@/components/app-image'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

import { CalendarMenu, type CalendarLabels } from './calendar-menu'

export type DlcRelease = {
  id: string
  dateIso: string
  dateLabel: string
  consoleName: string
  regionLabel: string
  statusLabel?: string
}

export type DlcItem = {
  id: string
  name: string
  cover: string
  releases: DlcRelease[]
}

type Labels = CalendarLabels & { expansions: string; dlcs: string; releasesTitle: string }

function ItemGroup({
  title,
  items,
  onOpen,
}: {
  title: string
  items: DlcItem[]
  onOpen: (item: DlcItem) => void
}) {
  if (items.length === 0) return null
  return (
    <div className="flex flex-col gap-4">
      <h2 className="flex items-center gap-2.5 font-heading text-lg font-semibold tracking-tight sm:text-xl">
        <span aria-hidden className="h-5 w-1 rounded-full bg-primary" />
        {title}
      </h2>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onOpen(item)}
            className="group flex flex-col gap-1.5 text-left"
          >
            <span className="relative aspect-3/4 overflow-hidden rounded-lg bg-muted ring-1 ring-border transition-all group-hover:ring-primary/50">
              <AppImage
                src={item.cover}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 33vw, 160px"
                wrapperClassName="absolute inset-0"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </span>
            <span className="line-clamp-2 text-xs font-medium text-muted-foreground group-hover:text-foreground">
              {item.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function GameAdditionalContent({
  expansions,
  dlcs,
  labels,
}: {
  expansions: DlcItem[]
  dlcs: DlcItem[]
  labels: Labels
}) {
  const [active, setActive] = useState<DlcItem | null>(null)

  return (
    <div className="flex flex-col gap-10">
      <ItemGroup title={labels.expansions} items={expansions} onOpen={setActive} />
      <ItemGroup title={labels.dlcs} items={dlcs} onOpen={setActive} />

      <Sheet open={active !== null} onOpenChange={(next) => !next && setActive(null)}>
        <SheetContent side="bottom" className="max-h-[85svh]">
          {active ? (
            <>
              <SheetHeader className="border-b border-border">
                <SheetTitle>{active.name}</SheetTitle>
              </SheetHeader>
              <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 overflow-y-auto overscroll-contain px-4 pb-6 sm:flex-row [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <span className="relative aspect-3/4 w-40 shrink-0 self-center overflow-hidden rounded-xl bg-muted ring-1 ring-border sm:w-48 sm:self-start">
                  <AppImage
                    src={active.cover}
                    alt={active.name}
                    fill
                    sizes="192px"
                    wrapperClassName="absolute inset-0"
                    className="object-cover"
                  />
                </span>

                <div className="min-w-0 flex-1">
                  {active.releases.length > 0 ? (
                    <>
                      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        {labels.releasesTitle}
                      </span>
                      <ul className="mt-2 flex flex-col gap-2">
                        {active.releases.map((release) => (
                          <li
                            key={release.id}
                            className="flex items-center gap-3 rounded-xl bg-card px-3.5 py-2.5 ring-1 ring-border"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <span className="truncate text-sm font-medium">
                                  {release.consoleName}
                                </span>
                                {release.statusLabel ? (
                                  <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[0.7rem] font-medium text-primary">
                                    {release.statusLabel}
                                  </span>
                                ) : null}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {release.regionLabel} · {release.dateLabel}
                              </div>
                            </div>
                            <CalendarMenu
                              event={{
                                title: `${active.name} — ${release.consoleName}`,
                                date: release.dateIso,
                                details: `${release.regionLabel} · ${release.consoleName}`,
                              }}
                              labels={labels}
                            />
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}
