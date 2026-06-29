import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="dark bg-background text-foreground flex flex-col gap-3 p-6">
    {children}
  </div>
)

export const States = () => (
  <Frame>
    <Checkbox defaultChecked />
    <Checkbox />
    <Checkbox disabled defaultChecked />
    <Checkbox disabled />
  </Frame>
)

export const WithLabels = () => (
  <Frame>
    <div className="flex items-center gap-2">
      <Checkbox id="c1" defaultChecked />
      <Label htmlFor="c1">Add to wishlist</Label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="c2" />
      <Label htmlFor="c2">Notify me on release</Label>
    </div>
  </Frame>
)
