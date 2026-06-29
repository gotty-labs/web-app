import { Toggle } from '@/components/ui/toggle'
import { BoldIcon, StarIcon, HeartIcon } from 'lucide-react'

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="dark bg-background text-foreground flex flex-wrap items-center gap-3 p-6">
    {children}
  </div>
)

export const States = () => (
  <Frame>
    <Toggle aria-label="Bold" defaultPressed>
      <BoldIcon />
    </Toggle>
    <Toggle aria-label="Star">
      <StarIcon />
    </Toggle>
    <Toggle variant="outline" aria-label="Favorite" defaultPressed>
      <HeartIcon />
      Favorite
    </Toggle>
  </Frame>
)

export const Sizes = () => (
  <Frame>
    <Toggle size="sm" defaultPressed>
      <StarIcon />
    </Toggle>
    <Toggle size="default" defaultPressed>
      <StarIcon />
    </Toggle>
    <Toggle size="lg" defaultPressed>
      <StarIcon />
    </Toggle>
  </Frame>
)
