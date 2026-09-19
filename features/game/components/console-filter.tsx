'use client'

import { CheckIcon } from 'lucide-react'

import { AppImage } from '@/components/app-image'
import { Skeleton } from '@/components/ui/skeleton'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { GameFilterOptions } from '@/lib/domain/models'

function ConsoleFilterSkeleton() {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))] gap-2">
      {Array.from({ length: 8 }).map((_, index) => (
        <Skeleton key={index} className="h-14 rounded-lg" />
      ))}
    </div>
  )
}

export function ConsoleFilter({
  consoles,
  loading,
  selectedIds,
  onSelectedIdsChange,
  label,
}: {
  consoles: GameFilterOptions['consoles']
  loading: boolean
  selectedIds: string[]
  onSelectedIdsChange: (ids: string[]) => void
  label: string
}) {
  if (loading) return <ConsoleFilterSkeleton />

  return (
    <ToggleGroup
      type="multiple"
      variant="filter"
      value={selectedIds}
      onValueChange={onSelectedIdsChange}
      aria-label={label}
      className="grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))] gap-2"
    >
      {consoles.map((gameConsole) => {
        const selected = selectedIds.includes(gameConsole.id)
        return (
          <ToggleGroupItem
            key={gameConsole.id}
            value={gameConsole.id}
            aria-label={gameConsole.name}
            className="h-auto min-w-0 justify-start gap-2.5 px-3 py-2.5 text-left whitespace-normal"
          >
            <AppImage
              src={gameConsole.media.image}
              alt={gameConsole.name}
              width={40}
              height={40}
              wrapperClassName="size-10 shrink-0 rounded-md bg-transparent"
              className="object-contain"
            />
            <span className="min-w-0 flex-1 truncate">{gameConsole.name}</span>
            {selected && <CheckIcon aria-hidden className="text-primary shrink-0" />}
          </ToggleGroupItem>
        )
      })}
    </ToggleGroup>
  )
}
