import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="dark bg-background text-foreground flex max-w-md flex-col gap-2 p-6">
    {children}
  </div>
)

export const Default = () => (
  <Frame>
    <Label htmlFor="review">Your review</Label>
    <Textarea
      id="review"
      defaultValue="One of the best action RPGs I've ever played. The world design is unmatched and every boss feels earned."
    />
  </Frame>
)

export const Placeholder = () => (
  <Frame>
    <Textarea placeholder="Write a review for this game…" />
  </Frame>
)
