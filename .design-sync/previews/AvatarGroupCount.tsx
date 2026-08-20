import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from '@/components/ui/avatar'

export const Overflow = () => (
  <div className="dark bg-background text-foreground flex items-center gap-6 p-6">
    <AvatarGroup>
      <Avatar>
        <AvatarFallback>GT</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+12</AvatarGroupCount>
    </AvatarGroup>
  </div>
)
