/**
 * Decorative, CSS-only mock of the Gotty app (no screenshots, no remote
 * images — keeps `/` fully static with zero image dependencies). Everything is
 * `aria-hidden` except nothing: the block is presentational, so the whole mock
 * is hidden from assistive tech. Fake "cover art" is derived from the `primary`
 * token at different opacities/directions — no raw palette colors.
 */
import {
  GhostIcon,
  LayoutGridIcon,
  LibraryIcon,
  PuzzleIcon,
  RocketIcon,
  SearchIcon,
  SettingsIcon,
  SwordsIcon,
  TrophyIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import type { Dictionary } from '@/lib/i18n'

const COVERS = [
  { art: 'bg-linear-to-br from-primary/90 via-primary/50 to-primary/15', Icon: SwordsIcon },
  { art: 'bg-linear-to-tr from-primary/45 via-primary/75 to-primary/20', Icon: RocketIcon },
  { art: 'bg-linear-to-b from-primary/80 via-primary/35 to-primary/10', Icon: GhostIcon },
  { art: 'bg-linear-to-bl from-primary/60 via-primary/30 to-primary/5', Icon: TrophyIcon },
  { art: 'bg-linear-to-tr from-primary/75 via-primary/45 to-primary/15', Icon: PuzzleIcon },
] as const

export function HeroAppMock({ dict }: { dict: Dictionary }) {
  const { nav, landing } = dict.app
  const progress = dict.games.progressState

  const libraryRows = [
    { art: COVERS[0].art, fill: 'w-3/5', label: progress.IN_PROGRESS },
    { art: COVERS[2].art, fill: 'w-full', label: progress.COMPLETED },
    { art: COVERS[4].art, fill: 'w-[8%]', label: progress.NOT_STARTED },
  ]

  return (
    <div aria-hidden className="relative mx-auto w-full max-w-4xl select-none">
      <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-primary/20 blur-3xl sm:-inset-10" />

      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-2xl shadow-primary/10 backdrop-blur">
        {/* Window chrome */}
        <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-muted-foreground/40" />
            <span className="size-2.5 rounded-full bg-muted-foreground/25" />
            <span className="size-2.5 rounded-full bg-muted-foreground/15" />
          </div>
          <div className="ml-2 flex h-7 max-w-64 flex-1 items-center gap-2 rounded-lg bg-muted/60 px-3 text-xs text-muted-foreground">
            <SearchIcon className="size-3.5" />
            {landing.mock.search}
          </div>
        </div>

        <div className="flex">
          {/* App sidebar */}
          <div className="hidden w-44 flex-col gap-1 border-r border-border/60 p-3 sm:flex">
            <div className="flex items-center gap-2 rounded-lg bg-primary/15 px-2.5 py-2 text-sm font-medium text-primary">
              <LayoutGridIcon className="size-4" />
              {nav.feed}
            </div>
            <div className="flex items-center gap-2 px-2.5 py-2 text-sm text-muted-foreground">
              <LibraryIcon className="size-4" />
              {nav.library}
            </div>
            <div className="flex items-center gap-2 px-2.5 py-2 text-sm text-muted-foreground">
              <SettingsIcon className="size-4" />
              {nav.options}
            </div>
          </div>

          {/* Main panel */}
          <div className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6">
            <div className="flex flex-col gap-3">
              <span className="text-sm font-semibold">{landing.mock.trending}</span>
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                {COVERS.map(({ art, Icon }, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex flex-col gap-1.5 transition-transform duration-300 hover:-translate-y-1',
                      index === 4 && 'hidden sm:flex',
                    )}
                  >
                    <div
                      className={cn(
                        'flex aspect-[3/4] items-center justify-center rounded-lg',
                        art,
                      )}
                    >
                      <Icon className="size-6 text-primary-foreground/50" />
                    </div>
                    <div className="h-1.5 w-4/5 rounded-full bg-foreground/20" />
                    <div className="h-1.5 w-1/2 rounded-full bg-foreground/10" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-sm font-semibold">{landing.mock.library}</span>
              <div className="grid gap-2 lg:grid-cols-3">
                {libraryRows.map(({ art, fill, label }, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/50 p-3"
                  >
                    <div className={cn('size-10 shrink-0 rounded-md', art)} />
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <div className="h-2 w-3/4 rounded-full bg-foreground/25" />
                      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                        <div className={cn('h-full rounded-full bg-primary', fill)} />
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
