import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export const Default = () => (
  <div className="dark bg-background text-foreground flex items-center gap-4 p-6">
    <Avatar size="lg">
      <AvatarFallback>JG</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback>AB</AvatarFallback>
    </Avatar>
    <Avatar size="sm">
      <AvatarFallback>CD</AvatarFallback>
    </Avatar>
  </div>
)
