import { Badge } from '@/components/ui/badge'
import type { GameConsole } from '@/lib/domain/models'

/** Outlined chip for a console/platform (image when present + name). */
export function ConsoleBadge({ console: gameConsole }: { console: GameConsole }) {
  return (
    <Badge variant="outline">
      {gameConsole.image ? (
        // eslint-disable-next-line @next/next/no-img-element -- small remote icon; migrate to next/image + remotePatterns when host is known
        <img src={gameConsole.image} alt="" className="size-3.5" />
      ) : null}
      {gameConsole.name}
    </Badge>
  )
}
