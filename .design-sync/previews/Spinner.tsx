import { Spinner } from '@/components/ui/spinner'

export const Sizes = () => (
  <div className="dark bg-background text-foreground flex items-center gap-4 p-6">
    <Spinner className="size-4" />
    <Spinner className="size-6" />
    <Spinner className="text-primary size-8" />
  </div>
)
