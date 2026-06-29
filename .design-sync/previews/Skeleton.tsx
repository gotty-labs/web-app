import { Skeleton } from '@/components/ui/skeleton'

export const GameCard = () => (
  <div className="dark bg-background text-foreground flex w-56 flex-col gap-3 p-6">
    <Skeleton className="aspect-3/4 w-full rounded-lg" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-3 w-1/2" />
  </div>
)

export const Line = () => (
  <div className="dark bg-background text-foreground flex flex-col gap-2 p-6">
    <Skeleton className="h-4 w-48" />
    <Skeleton className="h-4 w-64" />
    <Skeleton className="h-4 w-40" />
  </div>
)
