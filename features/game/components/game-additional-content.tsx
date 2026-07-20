/**
 * DLC and expansions, grouped and clearly labelled. Each item is a cover card; opening
 * one reveals its sub-data (per-console/region release dates) in a dialog, so the page
 * shows the catalogue compactly and the detail lives one tap away.
 *
 * View-models (name/cover + localized release rows) are built on the server.
 */
'use client'

import { useState } from 'react'

import { AppImage } from '@/components/app-image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export type DlcRelease = {
  id: string
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

type Labels = { expansions: string; dlcs: string; releasesTitle: string }

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

      <Dialog open={active !== null} onOpenChange={(next) => !next && setActive(null)}>
        <DialogContent className="sm:max-w-md">
          {active ? (
            <>
              <DialogHeader>
                <DialogTitle>{active.name}</DialogTitle>
              </DialogHeader>
              <div className="flex gap-4">
                <span className="relative aspect-3/4 w-24 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border">
                  <AppImage
                    src={active.cover}
                    alt={active.name}
                    fill
                    sizes="96px"
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
                          <li key={release.id} className="text-sm">
                            <span className="font-medium">{release.consoleName}</span>
                            <span className="block text-xs text-muted-foreground">
                              {release.regionLabel} · {release.dateLabel}
                              {release.statusLabel ? ` · ${release.statusLabel}` : ''}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
