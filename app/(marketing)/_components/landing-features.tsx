/**
 * Features bento grid. Each card = icon chip + copy + a small CSS-only visual
 * that hints at the real product (feed covers, search filters, library rows,
 * progress bars). Visual labels reuse already-localized app/game dictionary
 * entries where possible, so the mocks read in the visitor's language.
 */
import { CompassIcon, LibraryIcon, SearchIcon, TrendingUpIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { Dictionary } from '@/lib/i18n'

import { Reveal } from './reveal'

const MINI_COVERS = [
  'bg-linear-to-br from-primary/85 via-primary/45 to-primary/15',
  'bg-linear-to-tr from-primary/50 via-primary/70 to-primary/20',
  'bg-linear-to-b from-primary/75 via-primary/35 to-primary/10',
  'bg-linear-to-bl from-primary/60 via-primary/30 to-primary/5',
]

function DiscoverVisual() {
  return (
    <div aria-hidden className="grid grid-cols-4 gap-3">
      {MINI_COVERS.map((art, index) => (
        <div
          key={index}
          className={cn(
            'aspect-[3/4] rounded-lg transition-transform duration-300 group-hover:-translate-y-1',
            index % 2 === 1 && 'group-hover:-translate-y-2',
            art,
          )}
        />
      ))}
    </div>
  )
}

function SearchVisual({ dict }: { dict: Dictionary }) {
  const { search } = dict.app
  return (
    <div aria-hidden className="flex flex-col gap-2.5">
      <div className="flex h-9 items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-3">
        <SearchIcon className="size-4 text-muted-foreground" />
        <span className="h-2 w-24 rounded-full bg-foreground/20" />
      </div>
      <div className="flex flex-wrap gap-2">
        {[search.consoles, search.genres, search.themes].map((label) => (
          <span
            key={label}
            className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs text-foreground"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

function LibraryVisual({ dict }: { dict: Dictionary }) {
  const status = dict.games.libraryStatus
  return (
    <div aria-hidden className="flex flex-col gap-2">
      {[
        { art: MINI_COVERS[0], label: status.SAVED },
        { art: MINI_COVERS[2], label: status.WHITELIST },
      ].map(({ art, label }, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/50 p-2.5"
        >
          <div className={cn('size-8 shrink-0 rounded-md', art)} />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="h-2 w-2/3 rounded-full bg-foreground/25" />
            <span className="h-1.5 w-1/3 rounded-full bg-foreground/10" />
          </div>
          <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}

function ProgressVisual({ dict }: { dict: Dictionary }) {
  const progress = dict.games.progressState
  return (
    <div aria-hidden className="flex flex-col gap-3">
      {[
        { label: progress.COMPLETED, fill: 'w-full' },
        { label: progress.IN_PROGRESS, fill: 'w-3/5' },
        { label: progress.NOT_STARTED, fill: 'w-[6%]' },
      ].map(({ label, fill }) => (
        <div key={label} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-xs text-muted-foreground">{label}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div className={cn('h-full rounded-full bg-primary', fill)} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function LandingFeatures({ dict }: { dict: Dictionary }) {
  const { features } = dict.app.landing

  const cards = [
    {
      copy: features.discover,
      Icon: CompassIcon,
      visual: <DiscoverVisual />,
      className: 'lg:col-span-4',
    },
    {
      copy: features.search,
      Icon: SearchIcon,
      visual: <SearchVisual dict={dict} />,
      className: 'lg:col-span-2',
    },
    {
      copy: features.library,
      Icon: LibraryIcon,
      visual: <LibraryVisual dict={dict} />,
      className: 'lg:col-span-2',
    },
    {
      copy: features.progress,
      Icon: TrendingUpIcon,
      visual: <ProgressVisual dict={dict} />,
      className: 'lg:col-span-4',
    },
  ]

  return (
    <section id="features" className="scroll-mt-24 px-6 py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-14">
        <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="font-heading text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            {features.title}
          </h2>
          <p className="text-pretty text-lg text-muted-foreground">{features.subtitle}</p>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {cards.map(({ copy, Icon, visual, className }, index) => (
            <Reveal key={copy.title} delay={index * 100} className={className}>
              <div className="group flex h-full flex-col gap-4 rounded-2xl border border-border/60 bg-card/40 p-6 transition-colors duration-300 hover:border-primary/40 hover:bg-card/70">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="size-5" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-heading text-lg font-semibold">{copy.title}</h3>
                  <p className="text-sm text-muted-foreground">{copy.description}</p>
                </div>
                <div className="mt-auto pt-2">{visual}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
