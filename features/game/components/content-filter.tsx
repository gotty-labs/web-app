'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { GameFilterOptions } from '@/lib/domain/models'

function ContentFilterSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {Array.from({ length: 2 }).map((_, group) => (
        <div key={group} className="flex flex-col gap-3">
          <Skeleton className="h-4 w-24" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 8 }).map((__, index) => (
              <Skeleton key={index} className="h-8 w-24 rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ContentGroup({
  title,
  id,
  items,
  selected,
  onSelectedChange,
}: {
  title: string
  id: string
  items: Array<{ key: string; name: string }>
  selected?: string
  onSelectedChange: (value?: string) => void
}) {
  return (
    <section className="flex flex-col gap-3" aria-labelledby={id}>
      <h3 id={id} className="font-pixel text-base font-semibold">
        {title}
      </h3>
      <ToggleGroup
        type="single"
        variant="filter"
        value={selected ?? ''}
        onValueChange={(value) => onSelectedChange(value || undefined)}
        aria-label={title}
        className="flex w-full flex-wrap justify-start gap-2"
      >
        {items.map((item) => (
          <ToggleGroupItem key={item.key} value={item.key} className="px-3">
            {item.name}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </section>
  )
}

export function ContentFilter({
  genres,
  themes,
  loading,
  selected,
  onSelectedChange,
  genresLabel,
  themesLabel,
}: {
  genres: GameFilterOptions['genres']
  themes: GameFilterOptions['themes']
  loading: boolean
  selected?: string
  onSelectedChange: (value?: string) => void
  genresLabel: string
  themesLabel: string
}) {
  if (loading) return <ContentFilterSkeleton />

  return (
    <div className="flex flex-col gap-6">
      <ContentGroup
        id="filter-genres"
        title={genresLabel}
        items={genres}
        selected={selected}
        onSelectedChange={onSelectedChange}
      />
      <ContentGroup
        id="filter-themes"
        title={themesLabel}
        items={themes}
        selected={selected}
        onSelectedChange={onSelectedChange}
      />
    </div>
  )
}
