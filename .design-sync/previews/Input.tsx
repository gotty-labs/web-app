import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="dark bg-background text-foreground flex max-w-xs flex-col gap-3 p-6">
    {children}
  </div>
)

export const Default = () => (
  <Frame>
    <Input placeholder="Search games…" />
    <Input defaultValue="Elden Ring" />
  </Frame>
)

export const States = () => (
  <Frame>
    <Input placeholder="Disabled" disabled />
    <Input aria-invalid defaultValue="invalid@" />
  </Frame>
)

export const WithLabel = () => (
  <Frame>
    <Label htmlFor="email-in">Email</Label>
    <Input id="email-in" type="email" placeholder="you@example.com" />
  </Frame>
)
