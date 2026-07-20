/**
 * Supported platforms as raised cards (image + name) instead of flat outline pills —
 * a console logo in a rounded tile with a hover lift, so the platforms read as a
 * gallery of hardware rather than plain text. Presentational + server-safe.
 */
import Image from 'next/image'

import type { GameConsole } from '@/lib/domain/models'

export function GamePlatforms({ platforms }: { platforms: GameConsole[] }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {platforms.map((platform) => (
        <div
          key={platform.id}
          className="group flex items-center gap-2.5 rounded-xl bg-card px-3.5 py-2.5 ring-1 ring-border transition-all hover:-translate-y-0.5 hover:ring-primary/40"
        >
          {platform.image ? (
            <span className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
              <Image
                src={platform.image}
                alt=""
                width={20}
                height={20}
                className="size-5 object-contain"
              />
            </span>
          ) : null}
          <span className="text-sm font-medium">{platform.name}</span>
        </div>
      ))}
    </div>
  )
}
