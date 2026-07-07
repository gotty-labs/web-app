import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { PlusIcon, DownloadIcon, ArrowRightIcon, Trash2Icon } from 'lucide-react'

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="dark bg-background text-foreground flex flex-wrap items-center gap-3 p-6">
    {children}
  </div>
)

export const Variants = () => (
  <Frame>
    <Button>Play now</Button>
    <Button variant="secondary">Add to library</Button>
    <Button variant="outline">Wishlist</Button>
    <Button variant="ghost">Details</Button>
    <Button variant="destructive">Remove</Button>
    <Button variant="link">Learn more</Button>
  </Frame>
)

export const Sizes = () => (
  <Frame>
    <Button size="xs">Extra small</Button>
    <Button size="sm">Small</Button>
    <Button size="default">Default</Button>
    <Button size="lg">Large</Button>
  </Frame>
)

export const WithIcons = () => (
  <Frame>
    <Button>
      <PlusIcon data-icon="inline-start" />
      Add game
    </Button>
    <Button variant="secondary">
      <DownloadIcon data-icon="inline-start" />
      Install
    </Button>
    <Button variant="outline">
      Continue
      <ArrowRightIcon data-icon="inline-end" />
    </Button>
  </Frame>
)

export const IconButtons = () => (
  <Frame>
    <Button size="icon-sm" variant="secondary" aria-label="Add">
      <PlusIcon />
    </Button>
    <Button size="icon" variant="outline" aria-label="Download">
      <DownloadIcon />
    </Button>
    <Button size="icon-lg" variant="destructive" aria-label="Delete">
      <Trash2Icon />
    </Button>
  </Frame>
)

export const States = () => (
  <Frame>
    <Button disabled>Disabled</Button>
    <Button variant="secondary" disabled>
      <Spinner />
      Loading
    </Button>
  </Frame>
)
