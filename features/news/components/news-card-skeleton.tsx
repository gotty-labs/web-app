import { Skeleton } from '@/components/ui/skeleton'

export function NewsCardSkeleton() {
  return (
    <div className="bg-card flex flex-col overflow-hidden rounded-xl border">
      <Skeleton className="aspect-news-card w-full rounded-none" />
      <div className="flex flex-col gap-2 px-4 pt-3 pb-4">
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-3 w-2/5" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  )
}
