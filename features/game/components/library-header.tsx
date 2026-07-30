'use client'

import { BookmarkIcon, LibraryBigIcon } from 'lucide-react'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { UserGameLibraryStatus } from '@/lib/domain/enums'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'

export function LibraryHeader({
  status,
  loading,
  onStatusChange,
}: {
  status: UserGameLibraryStatus
  loading: boolean
  onStatusChange: (status: UserGameLibraryStatus) => void
}) {
  const t = useDictionary().app.library

  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-1">
        <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">JustGame</p>
        <h1 className="font-heading text-2xl font-semibold tracking-tight lg:text-3xl">
          {t.title}
        </h1>
      </div>

      <ToggleGroup
        type="single"
        value={status}
        onValueChange={(value) => {
          if (value) onStatusChange(value as UserGameLibraryStatus)
        }}
        variant="outline"
        className="grid w-full grid-cols-2 rounded-xl bg-transparent p-1 ring-1 ring-border lg:w-auto"
        disabled={loading}
      >
        <ToggleGroupItem
          value="SAVED"
          aria-label={t.savedTab}
          className="w-full rounded-lg data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground lg:min-w-36"
        >
          <LibraryBigIcon data-icon="inline-start" />
          {t.savedTab}
        </ToggleGroupItem>
        <ToggleGroupItem
          value="WHITELIST"
          aria-label={t.whitelistTab}
          className="w-full rounded-lg data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground lg:min-w-36"
        >
          <BookmarkIcon data-icon="inline-start" />
          {t.whitelistTab}
        </ToggleGroupItem>
      </ToggleGroup>
    </header>
  )
}
