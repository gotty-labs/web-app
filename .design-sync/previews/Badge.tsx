import { Badge } from '@/components/ui/badge'
import { StarIcon, CheckIcon, FlameIcon } from 'lucide-react'

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="dark bg-background text-foreground flex flex-wrap items-center gap-2 p-6">
    {children}
  </div>
)

export const Variants = () => (
  <Frame>
    <Badge>New</Badge>
    <Badge variant="secondary">Installed</Badge>
    <Badge variant="outline">Wishlist</Badge>
    <Badge variant="destructive">Removed</Badge>
    <Badge variant="ghost">Hidden</Badge>
  </Frame>
)

export const WithIcon = () => (
  <Frame>
    <Badge variant="secondary">
      <StarIcon />
      9.4
    </Badge>
    <Badge>
      <FlameIcon />
      Trending
    </Badge>
    <Badge variant="outline">
      <CheckIcon />
      Completed
    </Badge>
  </Frame>
)
