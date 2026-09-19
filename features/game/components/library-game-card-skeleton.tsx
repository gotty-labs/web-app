import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function LibraryGameCardSkeleton() {
  return (
    <Card className="gap-0 py-0">
      <Skeleton className="aspect-3/4 w-full rounded-none" />
      <CardHeader className="gap-2 py-3">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-1/2" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2 pb-4">
        <div className="flex gap-1">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <Skeleton className="h-1.5 w-full rounded-full" />
      </CardContent>
    </Card>
  )
}
