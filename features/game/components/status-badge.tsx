import { Badge } from '@/components/ui/badge'
import type { GameStatus } from '@/lib/domain/enums'
import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

const VARIANT: Record<GameStatus, BadgeVariant> = {
  RELEASED: 'secondary',
  ALPHA: 'outline',
  BETA: 'outline',
  EARLY_ACCESS: 'outline',
  CANCELLED: 'destructive',
  RUMORED: 'outline',
  DELISTED: 'destructive',
  UNKNOWN: 'outline',
}

/**
 * Game release status as a colored badge. Presentational: the `label` is the
 * localized text (resolved by the caller from the dictionary via `gameStatusLabel`),
 * so this works in both server and client contexts. The variant (color) is derived
 * from the enum.
 */
export function StatusBadge({
  status,
  label,
  className,
}: {
  status: GameStatus
  label: string
  className?: string
}) {
  return (
    <Badge variant={VARIANT[status]} className={cn(className)}>
      {label}
    </Badge>
  )
}
