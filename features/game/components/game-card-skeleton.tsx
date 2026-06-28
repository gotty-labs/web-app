import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/** Loading placeholder matching GameCard's layout (cover + name line). */
export function GameCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      <Skeleton className="aspect-3/4 w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )
}
