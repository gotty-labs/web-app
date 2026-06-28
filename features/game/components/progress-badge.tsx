import { Badge } from '@/components/ui/badge'
import type { GameLibraryProgressState } from '@/lib/domain/enums'

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

const VARIANT: Record<GameLibraryProgressState, BadgeVariant> = {
  NOT_STARTED: 'outline',
  IN_PROGRESS: 'default',
  BLOCKED: 'destructive',
  COMPLETED: 'secondary',
}

/**
 * Library progress state as a colored badge. Presentational: `label` is the
 * localized text (resolve with `gameProgressStateLabel`); variant from the enum.
 */
export function ProgressBadge({
  state,
  label,
}: {
  state: GameLibraryProgressState
  label: string
}) {
  return <Badge variant={VARIANT[state]}>{label}</Badge>
}
