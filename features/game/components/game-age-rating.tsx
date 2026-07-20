/**
 * Age-rating boards (ESRB, PEGI, …) with their rating value — data the detail page
 * never surfaced before. Each board renders as a small card: the board name in a
 * violet chip + the rate itself (free text from the backend). Presentational + server-safe.
 */
import type { GameAgeRating } from '@/lib/domain/enums'
import type { Dictionary } from '@/lib/i18n'

import { gameAgeRatingLabel } from '../utils/labels'

export function GameAgeRating({
  dict,
  ratings,
}: {
  dict: Dictionary
  ratings: { organization: GameAgeRating; rate: string }[]
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {ratings.map((rating) => (
        <div
          key={`${rating.organization}-${rating.rate}`}
          className="flex items-center gap-2.5 rounded-xl bg-card px-3 py-2 ring-1 ring-border"
        >
          <span className="rounded-md bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
            {gameAgeRatingLabel(dict, rating.organization)}
          </span>
          <span className="text-sm font-medium">{rating.rate}</span>
        </div>
      ))}
    </div>
  )
}
