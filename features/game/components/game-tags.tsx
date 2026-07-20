/**
 * Genres and themes as two clearly-differentiated pill groups (the old UI mixed both
 * into one undistinguished row of outline badges). Genres carry the violet brand
 * accent; themes read as neutral chips — so the two taxonomies are visually separate.
 * Presentational + server-safe: labels are resolved from the dictionary by the caller's
 * helpers here (no hooks).
 */
import type { GameGenre, GameTheme } from '@/lib/domain/enums'
import type { Dictionary } from '@/lib/i18n'
import { cn } from '@/lib/utils'

import { gameGenreLabel, gameThemeLabel } from '../utils/labels'

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
}: {
  dict: Dictionary
  genres: GameGenre[]
  themes: GameTheme[]
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
    </div>
  )
}
