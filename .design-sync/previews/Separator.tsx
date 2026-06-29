import { Separator } from '@/components/ui/separator'

export const Horizontal = () => (
  <div className="dark bg-background text-foreground max-w-xs p-6">
    <div className="text-sm font-medium">Library</div>
    <div className="text-muted-foreground text-sm">128 games</div>
    <Separator className="my-3" />
    <div className="text-sm font-medium">Wishlist</div>
    <div className="text-muted-foreground text-sm">14 games</div>
  </div>
)

export const Vertical = () => (
  <div className="dark bg-background text-foreground flex h-8 items-center gap-3 p-6 text-sm">
    <span>Overview</span>
    <Separator orientation="vertical" />
    <span>Reviews</span>
    <Separator orientation="vertical" />
    <span>Achievements</span>
  </div>
)
