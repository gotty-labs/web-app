import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export const Default = () => (
  <div className="dark bg-background text-foreground flex max-w-xs flex-col gap-2 p-6">
    <Label htmlFor="nick">Player nickname</Label>
    <Input id="nick" defaultValue="ShadowPlayer" />
  </div>
)
