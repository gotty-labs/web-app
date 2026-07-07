import Image from 'next/image'

import { Badge } from '@/components/ui/badge'
import type { GameConsole } from '@/lib/domain/models'

/** Outlined chip for a console/platform (image when present + name). */
export function ConsoleBadge({ console: gameConsole }: { console: GameConsole }) {
  return (
    <Badge variant="outline">
      {gameConsole.image ? (
        <Image
          src={gameConsole.image}
          alt=""
          width={14}
          height={14}
          className="size-3.5"
        />
      ) : null}
      {gameConsole.name}
    </Badge>
  )
}
