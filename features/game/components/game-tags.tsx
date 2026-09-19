/** Genres, themes, and age-rating assets grouped for the game detail page. */
import type { GameGenre, GameTheme } from '@/lib/domain/enums'
import type { GameDto } from '@/lib/domain/models'
import type { Dictionary } from '@/lib/i18n'
import { cn } from '@/lib/utils'

import { getAgeRatingImage } from '../config/age-rating-images'
import { gameGenreLabel, gameThemeLabel } from '../utils/labels'
import { GameAgeRating } from './game-age-rating'

function TagRow({
  label,
  items,
  tone,
}: {
  label: string
  items: string[]
  tone: 'genre' | 'theme'
}) {
  if (items.length === 0) return null
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={cn(
              'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ring-1 transition-colors',
              tone === 'genre'
                ? 'bg-primary/12 text-primary ring-primary/25 hover:bg-primary/20'
                : 'bg-secondary text-secondary-foreground ring-border hover:bg-accent',
            )}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

export function GameTags({
  dict,
  genres,
  themes,
  ageRatings,
}: {
  dict: Dictionary
  genres: GameGenre[]
  themes: GameTheme[]
  ageRatings: GameDto['ageRating']
}) {
  const hasVisibleAgeRating = ageRatings.some(
    (rating) => getAgeRatingImage(rating.organization, rating.rate) !== null,
  )

  if (genres.length === 0 && themes.length === 0 && !hasVisibleAgeRating) return null

  return (
    <div className="flex flex-col gap-5">
      <TagRow
        label={dict.app.detail.genres}
        tone="genre"
        items={genres.map((genre) => gameGenreLabel(dict, genre))}
      />
      <TagRow
        label={dict.app.detail.themes}
        tone="theme"
        items={themes.map((theme) => gameThemeLabel(dict, theme))}
      />
      <GameAgeRating dict={dict} ratings={ageRatings} />
    </div>
  )
}
