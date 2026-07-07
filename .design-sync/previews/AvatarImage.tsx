import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

const IMG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='64' height='64' fill='%237c5cff'/><text x='32' y='42' font-size='30' fill='white' text-anchor='middle' font-family='sans-serif'>JG</text></svg>"

export const Default = () => (
  <div className="dark bg-background text-foreground flex items-center gap-4 p-6">
    <Avatar size="lg">
      <AvatarImage src={IMG} alt="Player avatar" />
      <AvatarFallback>JG</AvatarFallback>
    </Avatar>
  </div>
)
