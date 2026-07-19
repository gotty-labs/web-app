/**
 * Public game detail shared by the en/es SEO pages (Option B). Server Component (no
 * token): fetches the public game + the dictionary for the page's locale, both
 * statically cacheable (no `headers()`), so the page stays SSG.
 *
 * The static markup composes the presentational badges (resolving enum labels with
 * the pure `gameXLabel(dict, …)` helpers). The authed library actions live in the
 * `GameDetailIsland` client widget, which brings its own session/i18n/toaster.
 */
import { notFound } from 'next/navigation'

import { AppImage } from '@/components/app-image'

import { getDictionary, type Locale } from '@/lib/i18n'

import type { GameReleaseDate } from '@/lib/domain/models'

import { findPublicGame } from '../services/seo'
import { gameGenreLabel, gameStatusLabel, gameThemeLabel } from '../utils/labels'
import { formatFullDate, formatTimeToBeat, parseIsoDate } from '../utils/format'

import { ConsoleBadge } from './console-badge'
import { GameDetailIsland } from './game-detail-island'
import { GenreThemeChip } from './genre-theme-chip'
import { RatingBadge } from './rating-badge'
import { StatusBadge } from './status-badge'

/** Earliest release across consoles/regions — the date a visitor asks about. */
function earliestRelease(releases: GameReleaseDate[]): string | undefined {
  const dated = releases
    .map((release) => ({ iso: release.date, time: parseIsoDate(release.date)?.toMillis() }))
    .filter((entry): entry is { iso: string; time: number } => entry.time !== undefined)
  if (dated.length === 0) return undefined
  return dated.reduce((min, entry) => (entry.time < min.time ? entry : min)).iso
}

export async function GameDetail({ slug, locale }: { slug: string; locale: Locale }) {
  const [game, dict] = await Promise.all([findPublicGame(slug, locale), getDictionary(locale)])
  if (!game) notFound()

  const t = dict.app.detail
  const cover = game.media?.cover

  // Key facts the backend already sends but the page never surfaced.
  const releaseIso = earliestRelease(game.releaseDates)
  const timeToBeatSeconds = game.timeToBeat?.average ?? game.timeToBeat?.total
  const facts = [
    releaseIso ? { label: t.releaseDate, value: formatFullDate(releaseIso, locale) } : null,
    game.companies.develop.length > 0
      ? { label: t.developer, value: game.companies.develop.join(', ') }
      : null,
    game.companies.publish.length > 0
      ? { label: t.publisher, value: game.companies.publish.join(', ') }
      : null,
    timeToBeatSeconds
      ? { label: t.timeToBeat, value: formatTimeToBeat(timeToBeatSeconds) }
      : null,
  ].filter((fact): fact is { label: string; value: string } => fact !== null)

  return (
    <main className="mx-auto max-w-5xl p-4 md:p-8">
      <div className="flex flex-col gap-6 md:flex-row">
        {cover && (
          <div className="relative mx-auto aspect-3/4 w-full max-w-[240px] shrink-0 overflow-hidden rounded-lg md:mx-0">
            <AppImage
              src={cover}
              alt={game.name}
              fill
              sizes="240px"
              wrapperClassName="absolute inset-0"
              className="object-cover"
            />
          </div>
        )}

        <div className="flex flex-1 flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h1 className="font-heading text-3xl font-semibold tracking-tight">{game.name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              {/* UNKNOWN says nothing — omit it rather than badge the ignorance. */}
              {game.status !== 'UNKNOWN' && (
                <StatusBadge status={game.status} label={gameStatusLabel(dict, game.status)} />
              )}
              <RatingBadge value={game.rating?.value} quantity={game.rating?.quantity} />
            </div>
          </div>

          {facts.length > 0 && (
            <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-4">
              {facts.map((fact) => (
                <div key={fact.label} className="flex flex-col gap-0.5">
                  <dt className="text-muted-foreground text-xs">{fact.label}</dt>
                  <dd className="font-medium">{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <GameDetailIsland
            gameId={game.id}
            slug={slug}
            locale={locale}
            dictionary={dict}
          />

          {game.description && (
            <p className="leading-relaxed text-muted-foreground">{game.description}</p>
          )}

          {(game.genres.length > 0 || game.themes.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {game.genres.map((genre) => (
                <GenreThemeChip key={`genre-${genre}`} label={gameGenreLabel(dict, genre)} />
              ))}
              {game.themes.map((theme) => (
                <GenreThemeChip key={`theme-${theme}`} label={gameThemeLabel(dict, theme)} />
              ))}
            </div>
          )}

          {game.platforms.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {game.platforms.map((platform) => (
                <ConsoleBadge key={platform.id} console={platform} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
