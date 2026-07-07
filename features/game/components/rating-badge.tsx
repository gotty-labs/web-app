import { StarIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/** Compact rating badge (star + rounded value). Renders nothing when there's no value. */
export function RatingBadge({
  value,
  quantity,
  className,
}: {
  value?: number
  quantity?: number
  className?: string
}) {
  if (value == null) return null
  return (
    <Badge variant="secondary" className={cn(className)}>
      <StarIcon className="size-3.5 fill-current" />
      {Math.round(value)}
      {quantity ? <span className="text-muted-foreground">· {quantity}</span> : null}
    </Badge>
  )
}
