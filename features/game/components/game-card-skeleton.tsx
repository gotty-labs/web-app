import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/** Loading placeholder matching GameCard's layout (cover + name + subtitle). */
export function GameCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      <Skeleton className="aspect-3/4 w-full rounded-lg" />
      <div className="flex flex-col gap-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}
