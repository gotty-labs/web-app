import { StarIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'

/** Compact rating badge (star + rounded value). Renders nothing when there's no value. */
export function RatingBadge({ value, quantity }: { value?: number; quantity?: number }) {
  if (value == null) return null
  return (
    <Badge variant="secondary">
      <StarIcon className="size-3.5 fill-current" />
      {Math.round(value)}
      {quantity ? <span className="text-muted-foreground">· {quantity}</span> : null}
    </Badge>
  )
}
