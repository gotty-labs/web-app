'use client'

import { cn } from '@/lib/utils'

import type { AdPlacement } from '../config/placements'
import { useAdvertising } from '../hooks/use-advertising'
import { useWideAdViewport } from '../hooks/use-wide-ad-viewport'

import { AdSenseAdUnit } from './adsense-ad-unit'

export function AdSlot({
  placement,
  label,
  className,
}: {
  placement: AdPlacement
  label: string
  className?: string
}) {
  const advertising = useAdvertising()
  const wideViewport = useWideAdViewport()
  if (!advertising.enabled || (placement === 'game-detail' && !wideViewport)) return null

  return (
    <aside
      aria-label={label}
      className={cn('flex min-w-0 flex-col gap-1 overflow-hidden', className)}
    >
      <p className="text-muted-foreground text-center text-[10px] uppercase tracking-wide">
        {label}
      </p>
      {advertising.provider === 'adsense' ? (
        <AdSenseAdUnit placement={placement} configuration={advertising.configuration} />
      ) : null}
    </aside>
  )
}
