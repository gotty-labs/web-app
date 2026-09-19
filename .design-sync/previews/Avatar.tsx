import { Avatar, AvatarImage, AvatarFallback, AvatarBadge } from '@/components/ui/avatar'

const IMG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='64' height='64' fill='%237c5cff'/><text x='32' y='42' font-size='30' fill='white' text-anchor='middle' font-family='sans-serif'>GT</text></svg>"

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="dark bg-background text-foreground flex items-center gap-4 p-6">
    {children}
  </div>
)

export const Sizes = () => (
  <Frame>
    <Avatar size="sm">
      <AvatarImage src={IMG} alt="Player" />
      <AvatarFallback>GT</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarImage src={IMG} alt="Player" />
      <AvatarFallback>GT</AvatarFallback>
    </Avatar>
    <Avatar size="lg">
      <AvatarImage src={IMG} alt="Player" />
      <AvatarFallback>GT</AvatarFallback>
    </Avatar>
  </Frame>
)

export const Fallback = () => (
  <Frame>
    <Avatar>
      <AvatarFallback>AB</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback>CD</AvatarFallback>
    </Avatar>
  </Frame>
)

export const WithStatus = () => (
  <Frame>
    <Avatar size="lg">
      <AvatarImage src={IMG} alt="Player" />
      <AvatarFallback>GT</AvatarFallback>
      <AvatarBadge className="bg-green-500" />
    </Avatar>
  </Frame>
)
