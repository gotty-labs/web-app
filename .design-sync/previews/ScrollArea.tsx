import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

const games = [
  'Elden Ring',
  'Hades II',
  'Stardew Valley',
  'Baldur’s Gate 3',
  'Hollow Knight',
  'Celeste',
  'Disco Elysium',
  'Cyberpunk 2077',
  'The Witcher 3',
  'Cuphead',
]

export const GameList = () => (
  <div className="dark bg-background text-foreground p-6">
    <ScrollArea className="ring-foreground/10 h-48 w-56 rounded-lg ring-1">
      <div className="p-3">
        <div className="text-sm font-medium">Recently played</div>
        {games.map((g) => (
          <div key={g}>
            <div className="py-2 text-sm">{g}</div>
            <Separator />
          </div>
        ))}
      </div>
    </ScrollArea>
  </div>
)
