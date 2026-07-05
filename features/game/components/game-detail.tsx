/**
 * Public game detail shared by the en/es SEO pages (Option B). Server Component (no
 * token): fetches the public game + the dictionary for the page's locale, both
 * statically cacheable (no `headers()`), so the page stays SSG.
 *
 * The static markup composes the presentational badges (resolving enum labels with
 * the pure `gameXLabel(dict, …)` helpers). The authed library actions live in the
 * `GameDetailIsland` client widget, which brings its own session/i18n/toaster.
 */
import Image from 'next/image'
import { notFound } from 'next/navigation'

import { getDictionary, type Locale } from '@/lib/i18n'

import { getPublicGame } from '../services/seo'
import { gameGenreLabel, gameStatusLabel, gameThemeLabel } from '../utils/labels'

import { ConsoleBadge } from './console-badge'
import { GameDetailIsland } from './game-detail-island'
import { GenreThemeChip } from './genre-theme-chip'
import { RatingBadge } from './rating-badge'
import { StatusBadge } from './status-badge'

export async function GameDetail({ slug, locale }: { slug: string; locale: Locale }) {
  const [game, dict] = await Promise.all([
    getPublicGame(slug, locale).catch(() => null),
    getDictionary(locale),
  ])
  if (!game) notFound()

  const cover = game.media?.cover

  return (
    <main className="mx-auto max-w-5xl p-4 md:p-8">
      <div className="flex flex-col gap-6 md:flex-row">
        {cover && (
          <div className="relative mx-auto aspect-3/4 w-full max-w-[240px] shrink-0 overflow-hidden rounded-lg md:mx-0">
            <Image src={cover} alt={game.name} fill sizes="240px" className="object-cover" />
          </div>
        )}

        <div className="flex flex-1 flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h1 className="font-heading text-3xl font-semibold tracking-tight">{game.name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={game.status} label={gameStatusLabel(dict, game.status)} />
              <RatingBadge value={game.rating?.value} quantity={game.rating?.quantity} />
            </div>
          </div>

          <GameDetailIsland gameId={game.id} locale={locale} dictionary={dict} />

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
