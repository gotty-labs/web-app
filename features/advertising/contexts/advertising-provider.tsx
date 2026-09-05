'use client'

import Script from 'next/script'
import { createContext, useMemo, type ReactNode } from 'react'

import { env } from '@/lib/config/env'

export interface AdSenseConfiguration {
  clientId: string
  inFeedSlotId?: string
  inFeedLayoutKey?: string
  feedCardSlotId: string
  sectionDetailCardSlotId: string
  sidebarSlotId: string
  gameDetailSlotId: string
}

export type AdvertisingState =
  { enabled: false } | { enabled: true; provider: 'adsense'; configuration: AdSenseConfiguration }

export const AdvertisingContext = createContext<AdvertisingState>({ enabled: false })

function getAdvertisingState(disabled: boolean): AdvertisingState {
  const config = env.advertising.adsense
  if (
    disabled ||
    !env.advertising.enabled ||
    env.advertising.provider !== 'adsense' ||
    !config.clientId ||
    !config.feedCardSlotId ||
    !config.sectionDetailCardSlotId ||
    !config.sidebarSlotId ||
    !config.gameDetailSlotId
  ) {
    return { enabled: false }
  }

  return {
    enabled: true,
    provider: 'adsense',
    configuration: {
      clientId: config.clientId,
      inFeedSlotId: config.inFeedSlotId,
      inFeedLayoutKey: config.inFeedLayoutKey,
      feedCardSlotId: config.feedCardSlotId,
      sectionDetailCardSlotId: config.sectionDetailCardSlotId,
      sidebarSlotId: config.sidebarSlotId,
      gameDetailSlotId: config.gameDetailSlotId,
    },
  }
}

/**
 * Provider-neutral ad gate. `disabled` is deliberately independent from AdSense:
 * when the paid entitlement lands, pass it here and no provider script or slot is
 * mounted for that user.
 */
export function AdvertisingProvider({
  children,
  disabled = false,
}: {
  children: ReactNode
  disabled?: boolean
}) {
  const state = useMemo(() => getAdvertisingState(disabled), [disabled])

  return (
    <AdvertisingContext value={state}>
      {state.enabled ? (
        <Script
          id="gotty-ad-provider"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${state.configuration.clientId}`}
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      ) : null}
      {children}
    </AdvertisingContext>
  )
}
