import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="dark bg-background text-foreground flex flex-col gap-3 p-6">
    {children}
  </div>
)

export const States = () => (
  <Frame>
    <Switch defaultChecked />
    <Switch />
    <Switch size="sm" defaultChecked />
    <Switch disabled defaultChecked />
  </Frame>
)

export const WithLabel = () => (
  <Frame>
    <div className="flex items-center gap-2">
      <Switch id="s1" defaultChecked />
      <Label htmlFor="s1">Auto-update games</Label>
    </div>
  </Frame>
)
