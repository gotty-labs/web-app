/** Age-rating board assets. Unknown values are omitted without breaking the detail page. */
import { AppImage } from '@/components/app-image'
import type { GameDto } from '@/lib/domain/models'
import type { Dictionary } from '@/lib/i18n'

import { getAgeRatingImage } from '../config/age-rating-images'
import { gameAgeRatingLabel } from '../utils/labels'

const AGE_RATING_IMAGE_HEIGHT = 96

export function GameAgeRating({
  dict,
  ratings,
}: {
  dict: Dictionary
  ratings: GameDto['ageRating']
}) {
  const ratingsWithImage = ratings.flatMap((rating) => {
    const image = getAgeRatingImage(rating.organization, rating.rate)
    return image === null ? [] : [{ ...rating, image }]
  })

  if (ratingsWithImage.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {dict.app.detail.ageRating}
      </span>
      <div className="flex w-full flex-wrap items-center justify-start gap-4">
        {ratingsWithImage.map((rating) => {
          const width = Math.round(
            (rating.image.width / rating.image.height) * AGE_RATING_IMAGE_HEIGHT,
          )

          return (
            <AppImage
              key={`${rating.organization}-${rating.rate}`}
              src={rating.image.src}
              alt={`${gameAgeRatingLabel(dict, rating.organization)} ${rating.rate}`}
              width={width}
              height={AGE_RATING_IMAGE_HEIGHT}
              wrapperClassName="shrink-0 rounded-md bg-transparent"
              wrapperStyle={{ width, height: AGE_RATING_IMAGE_HEIGHT }}
              className="h-full w-full object-contain"
            />
          )
        })}
      </div>
    </div>
  )
}
