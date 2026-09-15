/**
 * Game engines as chips (logo + name when a logo is available). Presentational +
 * server-safe.
 */
import { AppImage } from '@/components/app-image'
import type { Engine } from '@/lib/domain/models'

export function GameEngines({ engines }: { engines: Engine[] }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {engines.map((engine) => (
        <div
          key={engine.name}
          className="flex items-center gap-2.5 rounded-xl bg-card px-3.5 py-2.5 ring-1 ring-border"
        >
          {engine.logo ? (
            <AppImage
              src={engine.logo}
              alt=""
              fill
              sizes="2rem"
              wrapperClassName="size-8 shrink-0 rounded-md bg-transparent"
              className="object-contain"
            />
          ) : null}
          <span className="text-sm font-medium">{engine.name}</span>
        </div>
      ))}
    </div>
  )
}
