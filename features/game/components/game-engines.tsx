/**
 * Game engines as chips (logo + name when a logo is available). Presentational +
 * server-safe.
 */
import Image from 'next/image'

import type { Engine } from '@/lib/domain/models'

export function GameEngines({ engines }: { engines: Engine[] }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {engines.map((engine) => (
        <div
          key={engine.name}
          className="flex items-center gap-2 rounded-xl bg-card px-3.5 py-2 ring-1 ring-border"
        >
          {engine.logo ? (
            <Image
              src={engine.logo}
              alt=""
              width={18}
              height={18}
              className="size-4.5 object-contain"
            />
          ) : null}
          <span className="text-sm font-medium">{engine.name}</span>
        </div>
      ))}
    </div>
  )
}
