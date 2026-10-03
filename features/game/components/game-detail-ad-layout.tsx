'use client'

import { AdSlot, adPlacement } from '@/features/advertising'
import { cn } from '@/lib/utils'

import { DETAIL_COLUMN_CLASS, DETAIL_GRID_CLASS } from '../config/detail-layout'

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
    <div className={DETAIL_GRID_CLASS}>
      <AdSlot
        placement={adPlacement.gameDetail}
        label={label}
        className={`${SIDE_AD_CLASS_NAME} min-[90rem]:col-start-1`}
      />

      <div className={cn(DETAIL_COLUMN_CLASS, 'pb-20')}>{children}</div>

      <AdSlot
        placement={adPlacement.gameDetail}
        label={label}
        className={`${SIDE_AD_CLASS_NAME} min-[90rem]:col-start-3`}
      />
    </div>
  )
}
