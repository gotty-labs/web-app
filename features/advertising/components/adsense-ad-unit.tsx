'use client'

import { useEffect, useRef } from 'react'

import type { AdPlacement } from '../config/placements'
import type { AdSenseConfiguration } from '../contexts/advertising-provider'

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[]
  }
}

function placementAttributes(
  placement: AdPlacement,
  configuration: AdSenseConfiguration,
): Record<string, string> {
  switch (placement) {
    case 'feed':
      return {
        'data-ad-slot': configuration.feedCardSlotId,
        'data-ad-format': 'auto',
        'data-full-width-responsive': 'false',
      }
    case 'paginated-section':
      return {
        'data-ad-slot': configuration.sectionDetailCardSlotId,
        'data-ad-format': 'auto',
        'data-full-width-responsive': 'false',
      }
    case 'sidebar':
      return {
        'data-ad-slot': configuration.sidebarSlotId,
        'data-ad-format': 'vertical',
        'data-full-width-responsive': 'true',
      }
    case 'game-detail':
      return {
        'data-ad-slot': configuration.gameDetailSlotId,
        'data-ad-format': 'autorelaxed',
        'data-matched-content-rows-num': '4',
        'data-matched-content-columns-num': '1',
        'data-matched-content-ui-type': 'image_card_stacked',
      }
  }
}

export function AdSenseAdUnit({
  placement,
  configuration,
}: {
  placement: AdPlacement
  configuration: AdSenseConfiguration
}) {
  const elementRef = useRef<HTMLModElement>(null)
  const requestedRef = useRef(false)
  const isCardPlacement = placement === 'feed' || placement === 'paginated-section'

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const requestAd = () => {
      if (
        requestedRef.current ||
        element.dataset.adsbygoogleStatus ||
        (isCardPlacement && element.getBoundingClientRect().width < 120)
      ) {
        return
      }

      try {
        requestedRef.current = true
        ;(window.adsbygoogle ??= []).push({})
      } catch (error) {
        requestedRef.current = false
        // Ad blockers and provider failures must never break Gotty's content surface.
        console.warn('Advertising provider could not render a slot.', error)
      }
    }

    const observer = new ResizeObserver(requestAd)
    observer.observe(element)
    requestAd()

    return () => observer.disconnect()
  }, [isCardPlacement])

  return (
    <ins
      ref={elementRef}
      className={
        isCardPlacement
          ? 'adsbygoogle block min-h-0 w-full flex-1'
          : 'adsbygoogle block min-h-24 w-full'
      }
      data-ad-client={configuration.clientId}
      {...placementAttributes(placement, configuration)}
    />
  )
}
