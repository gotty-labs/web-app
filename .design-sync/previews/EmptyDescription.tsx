import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@/components/ui/empty'
import { Button } from '@/components/ui/button'
import { Gamepad2Icon } from 'lucide-react'

export const Description = () => (
  <div className="dark bg-background text-foreground max-w-md p-6">
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Gamepad2Icon />
        </EmptyMedia>
        <EmptyTitle>Your library is empty</EmptyTitle>
        <EmptyDescription>
          Games you own or add will show up here. Browse the store to get started.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>Browse store</Button>
      </EmptyContent>
    </Empty>
  </div>
)
