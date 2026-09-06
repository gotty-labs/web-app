'use client'

import { MoreHorizontalIcon, StarIcon } from 'lucide-react'
import Link from 'next/link'

import { AppImage } from '@/components/app-image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { GameLibrary } from '@/lib/domain/models'
import { useDictionary, useLocale } from '@/lib/i18n/hooks/use-i18n'
import { cn } from '@/lib/utils'

import { progressStateBadgeClass } from '../config/progress-state-styles'
import { DEFAULT_MAX_TIME_TO_BEAT } from '../constants/default-max-time-to-beast.const'
import { formatReleaseChip, isBeforeToday, timeToBeatHours } from '../utils/format'
import { gameGenreLabel, gameProgressStateLabel } from '../utils/labels'

import { LibraryListIcon } from './library-list-icon'

function progressMetrics(game: GameLibrary) {
  if (game.progress.state === 'NOT_STARTED') return undefined

  const totalMinutes = game.timeToBeat?.total
    ? timeToBeatHours(game.timeToBeat.total) * 60
    : DEFAULT_MAX_TIME_TO_BEAT * 60
  if (totalMinutes <= 0) return undefined

  const currentMinutes = Math.max(0, game.progress.duration ?? 0)
  return {
    currentHours: currentMinutes / 60,
    percent: Math.min(100, (currentMinutes / totalMinutes) * 100),
    totalHours: totalMinutes / 60,
  }
}

export function LibraryGameCard({
  game,
  mode,
  selectedListId,
  pending,
  removing,
  onOpenActions,
}: {
  game: GameLibrary
  mode: 'library' | 'whitelist'
  selectedListId?: string
  pending?: boolean
  removing?: boolean
  onOpenActions: () => void
}) {
  const dict = useDictionary()
  const locale = useLocale()
  const t = dict.app.library
  const progress = mode === 'library' ? progressMetrics(game) : undefined
  const releaseText =
    mode === 'whitelist' && game.releaseDate
      ? isBeforeToday(game.releaseDate)
        ? t.released
        : `${t.releaseLabel} · ${formatReleaseChip(game.releaseDate, locale)}`
      : ''
  const developer = game.companies.develop[0]
  const rating = game.rating?.value
  const currentHours = progress?.currentHours.toLocaleString(locale, { maximumFractionDigits: 1 })
  const totalHours = progress?.totalHours.toLocaleString(locale, { maximumFractionDigits: 1 })

  return (
    <Card
      className={cn(
        'group relative gap-0 py-0 transition-shadow duration-200 ease-out hover:shadow-lg hover:shadow-black/10',
        removing && 'scale-95 opacity-0',
        pending && 'pointer-events-none opacity-70',
      )}
    >
      <div className="bg-muted relative aspect-3/4 overflow-hidden">
        {game.cover ? (
          <AppImage
            src={game.cover}
            alt={game.name}
            fill
            sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 280px"
            wrapperClassName="absolute inset-0"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}

        <div className="pointer-events-none absolute inset-0 hidden bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 lg:block">
          <div className="absolute inset-x-3 bottom-3 flex flex-wrap gap-1">
            {game.genres.slice(0, 3).map((genre) => (
              <Badge key={genre} className="border-transparent bg-black/70 text-white">
                {gameGenreLabel(dict, genre)}
              </Badge>
            ))}
          </div>
        </div>

        {mode === 'library' ? (
          <div className="pointer-events-none absolute top-0 left-0 z-10 size-16 overflow-hidden">
            <Badge
              className={cn(
                'absolute top-2.5 -left-7 h-5 w-24 -rotate-45 rounded-none border-0 px-0 text-[7px] leading-none font-bold tracking-[0.06em] uppercase shadow-sm',
                progressStateBadgeClass[game.progress.state],
              )}
            >
              {gameProgressStateLabel(dict, game.progress.state)}
            </Badge>
          </div>
        ) : null}

        {game.platforms.length > 0 ? (
          <div className="pointer-events-none absolute top-2 right-2 flex items-center [&>*+*]:-ml-2">
            {game.platforms.slice(0, 3).map((platform) =>
              platform.media.image ? (
                <AppImage
                  key={platform.id}
                  src={platform.media.image}
                  alt={platform.name}
                  width={32}
                  height={32}
                  wrapperClassName="size-8 shrink-0 rounded-full border-2 border-card shadow-sm"
                  wrapperStyle={{ backgroundColor: platform.media.color }}
                  className="size-full object-cover"
                />
              ) : (
                <span
                  key={platform.id}
                  title={platform.name}
                  className="bg-secondary text-secondary-foreground flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-card text-[10px] font-semibold shadow-sm"
                >
                  {platform.name.slice(0, 2).toLocaleUpperCase()}
                </span>
              ),
            )}
            {game.platforms.length > 3 ? (
              <Badge
                variant="secondary"
                className="size-8 rounded-full border-2 border-card p-0 shadow-sm"
              >
                +{game.platforms.length - 3}
              </Badge>
            ) : null}
          </div>
        ) : null}
      </div>

      <CardHeader className="gap-1 py-3">
        <CardTitle className="line-clamp-2 min-h-10 text-sm leading-tight font-semibold">
          {game.name}
        </CardTitle>
        <CardAction className="relative z-20">
          <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            aria-label={`${t.actionsTitle}: ${game.name}`}
            onClick={onOpenActions}
          >
            <MoreHorizontalIcon />
          </Button>
        </CardAction>
        {developer || rating != null ? (
          <CardDescription className="flex min-w-0 items-center gap-1.5 text-xs">
            {developer ? <span className="truncate">{developer}</span> : null}
            {developer && rating != null ? <span aria-hidden>·</span> : null}
            {rating != null ? (
              <span className="flex shrink-0 items-center gap-1">
                <StarIcon aria-hidden className="size-3" />
                {Math.round(rating)}
              </span>
            ) : null}
          </CardDescription>
        ) : null}
        {game.lists.length > 0 && !selectedListId ? (
          <div className="mt-1 flex flex-wrap gap-1" role="group" aria-label={t.listsLabel}>
            {game.lists.slice(0, 3).map((list) => (
              <Badge
                key={list.id}
                variant="outline"
                className="size-6 p-0"
                style={{
                  borderColor: list.hexColor,
                  backgroundColor: `${list.hexColor}1A`,
                }}
              >
                <LibraryListIcon icon={list.icon} style={{ color: list.hexColor }} />
              </Badge>
            ))}
            {game.lists.length > 3 ? (
              <Badge variant="secondary" className="size-6 p-0">
                +{game.lists.length - 3}
              </Badge>
            ) : null}
          </div>
        ) : null}
      </CardHeader>

      {progress || releaseText ? (
        <CardContent className="mt-auto flex flex-col gap-2.5 pb-4">
          {releaseText ? <p className="text-muted-foreground text-xs">{releaseText}</p> : null}

          {progress && currentHours && totalHours ? (
            <div className="relative pt-5">
              <Badge
                className="absolute top-0 h-4 -translate-x-1/2 px-1.5 text-[9px] tabular-nums after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-x-3 after:border-t-3 after:border-x-transparent after:border-t-primary after:content-['']"
                style={{
                  left: `clamp(1.25rem, ${progress.percent}%, calc(100% - 1.25rem))`,
                }}
              >
                {currentHours} h
              </Badge>
              <div className="relative">
                <Progress
                  value={progress.percent}
                  aria-label={t.progressCardLabel
                    .replace('{current}', currentHours)
                    .replace('{total}', totalHours)}
                  className="h-1.5"
                />
                <span className="ring-card bg-primary absolute top-1/2 left-0 size-2 -translate-y-1/2 rounded-full ring-2" />
                <span className="ring-card bg-muted-foreground absolute top-1/2 right-0 size-2 -translate-y-1/2 rounded-full ring-2" />
                <span
                  className="ring-card bg-primary absolute top-1/2 z-10 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2"
                  style={{
                    left: `clamp(0.25rem, ${progress.percent}%, calc(100% - 0.25rem))`,
                  }}
                />
              </div>
              <div className="text-muted-foreground mt-1 flex justify-between text-[10px] tabular-nums">
                <span>0 h</span>
                <span>{totalHours} h</span>
              </div>
            </div>
          ) : null}
        </CardContent>
      ) : null}

      {game.slug ? (
        <Link
          href={`/games/${game.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          prefetch={false}
          aria-label={`${t.openGame}: ${game.name}`}
          className="absolute inset-0 z-10 cursor-pointer rounded-xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        />
      ) : null}
    </Card>
  )
}
