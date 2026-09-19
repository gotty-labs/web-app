'use client'

import { AdSlot, adPlacement } from '@/features/advertising'

const SIDE_AD_CLASS_NAME =
  'sticky top-6 hidden min-h-[36rem] min-w-[250px] self-start rounded-lg border border-border/60 bg-muted/20 p-2 min-[90rem]:flex'

/**
 * Preserves symmetric side rails on wide screens whether or not ads render.
 * Explicit column placement prevents absent or blocked ad slots from collapsing
 * the content into the 250px left rail.
 */
export function GameDetailAdLayout({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto grid w-full max-w-[96rem] grid-cols-1 gap-6 min-[90rem]:grid-cols-[250px_minmax(0,1fr)_250px]">
      <AdSlot
        placement={adPlacement.gameDetail}
        label={label}
        className={`${SIDE_AD_CLASS_NAME} min-[90rem]:col-start-1`}
      />

      <div className="w-full px-4 pb-20 xl:px-0 min-[90rem]:col-start-2">{children}</div>

      <AdSlot
        placement={adPlacement.gameDetail}
        label={label}
        className={`${SIDE_AD_CLASS_NAME} min-[90rem]:col-start-3`}
      />
    </div>
  )
}
