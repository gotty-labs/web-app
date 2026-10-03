import { StarIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import type { Locale } from '@/lib/i18n'
import { cn } from '@/lib/utils'

import { formatRating } from '../utils/format'

/** Compact rating badge (star + 0 to 5 score). Renders nothing when there's no value. */
export function RatingBadge({
  value,
  locale,
  className,
}: {
  value?: number
  locale: Locale
  className?: string
}) {
  if (value == null) return null
  return (
    <Badge variant="secondary" className={cn(className)}>
      <StarIcon className="size-3.5 fill-current" />
      {formatRating(value, locale)}
    </Badge>
  )
}
