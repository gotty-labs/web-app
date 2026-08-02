/**
 * Detail header: a full-bleed hero using the first artwork as a blurred, dimmed
 * background (falling back to a violet gradient when none exists), with the cover
 * framed in a violet gradient border on top. Meta (category / status / rating / year)
 * sits beside the cover — bottom-aligned on desktop, stacked and centered on mobile.
 * Presentational + server-safe (AppImage is a client child, which is fine).
 */
import { AppImage } from '@/components/app-image'
import type { Dictionary } from '@/lib/i18n'
import type { GameDto } from '@/lib/domain/models'

import { gameCategoryLabel, gameStatusLabel } from '../utils/labels'

import { RatingBadge } from './rating-badge'
import { StatusBadge } from './status-badge'

export function GameHero({
  game,
  dict,
  releaseYear,
}: {
  game: GameDto
  dict: Dictionary
  releaseYear: string
}) {
  const artwork = game.media?.artworks?.[0]
  const cover = game.media?.cover
  const developer = game.companies.develop[0]

  return (
    <header className="relative isolate overflow-hidden">
      {/* Background layer */}
      <div className="absolute inset-0 -z-10">
        {artwork ? (
          <AppImage
            src={artwork}
            alt=""
            fill
            priority
            sizes="100vw"
            igdbKind="screenshot"
            wrapperClassName="absolute inset-0"
            className="scale-110 object-cover blur-[2px]"
          />
        ) : (
          <div className="size-full bg-linear-to-br from-primary/25 via-background to-background" />
        )}
        {/* Dim + brand tint so overlaid content stays legible and the art recedes. */}
        <div className="absolute inset-0 bg-background/55" />
        <div className="absolute inset-0 bg-primary/5" />
        {/* Fade into the content below. */}
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/75 to-transparent" />
      </div>

      <div className="mx-auto max-w-5xl px-4 md:px-8">
        <div className="flex flex-col items-center gap-5 pt-24 pb-8 text-center md:flex-row md:items-end md:gap-7 md:pt-36 md:text-left">
          {cover ? (
            <div className="shrink-0 rounded-2xl bg-linear-to-br from-primary/60 via-primary/20 to-primary/5 p-1 shadow-2xl shadow-black/50">
              <div className="relative aspect-3/4 w-36 overflow-hidden rounded-xl ring-1 ring-black/20 sm:w-40 md:w-52">
                <AppImage
                  src={cover}
                  alt={game.name}
                  fill
                  priority
                  sizes="208px"
                  wrapperClassName="absolute inset-0"
                  className="object-cover"
                />
              </div>
            </div>
          ) : null}

          <div className="flex flex-col items-center gap-3 md:items-start md:pb-2">
            <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
              {game.category !== 'MAIN' ? (
                <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {gameCategoryLabel(dict, game.category)}
                </span>
              ) : null}
              {game.status !== 'UNKNOWN' ? (
                <StatusBadge status={game.status} label={gameStatusLabel(dict, game.status)} />
              ) : null}
              <RatingBadge value={game.rating?.value} quantity={game.rating?.quantity} />
            </div>

            <h1 className="font-pixel text-3xl font-bold text-balance sm:text-4xl md:text-5xl">
              {game.name}
            </h1>

            {releaseYear || developer ? (
              <p className="text-sm text-muted-foreground">
                {[releaseYear, developer].filter(Boolean).join(' · ')}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}
