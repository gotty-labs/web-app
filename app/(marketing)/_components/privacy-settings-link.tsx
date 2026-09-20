'use client'

import type { MouseEvent } from 'react'

declare global {
  interface Window {
    googlefc?: {
      callbackQueue?: Array<() => void>
      showRevocationMessage?: () => void
    }
  }
}

export function PrivacySettingsLink({ label, fallbackHref }: { label: string; fallbackHref: string }) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const googleConsent = window.googlefc
    if (!googleConsent?.callbackQueue || !googleConsent.showRevocationMessage) return

    event.preventDefault()
    googleConsent.callbackQueue.push(googleConsent.showRevocationMessage)
  }

  return (
    <a href={fallbackHref} onClick={handleClick} className="transition-colors hover:text-foreground">
      {label}
    </a>
  )
}
