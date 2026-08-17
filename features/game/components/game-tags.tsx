/**
 * Genres, themes, and age ratings as clearly-differentiated pill groups (the old UI
 * mixed genres and themes into one undistinguished row of outline badges). Genres
 * carry the violet brand accent; themes and age ratings use neutral chips.
 * Presentational + server-safe: labels are resolved from the dictionary by the
 * caller's helpers here (no hooks).
 */
import type { GameGenre, GameTheme } from '@/lib/domain/enums'
import type { GameDto } from '@/lib/domain/models'
import type { Dictionary } from '@/lib/i18n'
import { cn } from '@/lib/utils'

import { gameAgeRatingLabel, gameGenreLabel, gameThemeLabel } from '../utils/labels'

function TagRow({
  label,
  items,
  tone,
}: {
  label: string
  items: string[]
  tone: 'genre' | 'theme' | 'age-rating'
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
      <TagRow
        label={dict.app.detail.ageRating}
        tone="age-rating"
        items={ageRatings.map(
          (rating) => `${gameAgeRatingLabel(dict, rating.organization)}: ${rating.rate}`,
        )}
      />
    </div>
  )
}
