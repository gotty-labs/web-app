/**
 * Centered rating summary for the game detail: the score above its trophies and the
 * rating count above its label, split by a vertical divider. Each column sits `gap-6`
 * from the divider; the `1fr_auto_1fr` grid keeps the divider centered and gives the
 * leftover width to the outer margins. Screen readers get a single phrase ("4.32 out
 * of 5, 69 ratings") instead of the visual pieces. Server-safe.
 */
import { Separator } from '@/components/ui/separator'
import type { Rating } from '@/lib/domain/models'
import type { Dictionary, Locale } from '@/lib/i18n'

import { formatCount, formatRating } from '../utils/format'

import { RatingTrophies } from './rating-trophies'

export function GameRatingSummary({
  rating,
  dict,
  locale,
}: {
  rating?: Rating
  dict: Dictionary
  locale: Locale
}) {
  const value = rating?.value
  const quantity = rating?.quantity ?? 0
  // Only a scored rating with at least one vote is worth summarizing.
  if (value == null || quantity <= 0) return null

  const t = dict.app.detail
  const formattedValue = formatRating(value, locale)
  const formattedCount = formatCount(quantity, locale)
  const countLabel = quantity === 1 ? t.rating : t.ratings

  return (
    <div>
      <p className="sr-only">
        {`${t.ratingOutOf.replace('{value}', formattedValue)}, ${formattedCount} ${countLabel}`}
      </p>
      <div aria-hidden className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
        <div className="flex flex-col items-center gap-1 justify-self-end">
          <span className="font-heading text-2xl leading-tight font-semibold">
            {formattedValue}
          </span>
          <RatingTrophies value={value} />
        </div>
        <Separator orientation="vertical" />
        <div className="flex flex-col items-center gap-1 justify-self-start">
          <span className="font-heading text-2xl leading-tight font-semibold">
            {formattedCount}
          </span>
          <span className="text-xs font-semibold">{countLabel}</span>
        </div>
      </div>
    </div>
  )
}
