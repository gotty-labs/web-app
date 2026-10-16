/**
 * Focus return for sheets opened programmatically (no Radix `<Trigger>`): Radix only
 * refocuses its own trigger on close, so without this focus drops to `<body>`. The
 * opener is whatever had focus when the sheet mounted — captured during the first
 * render, before Radix moves focus into the sheet. Pass the result as the content's
 * `onCloseAutoFocus`.
 */
'use client'

import { useState } from 'react'

export function useReturnFocus(): (event: Event) => void {
  const [opener] = useState(() =>
    document.activeElement instanceof HTMLElement ? document.activeElement : null,
  )

  return (event) => {
    event.preventDefault()
    if (opener?.isConnected) opener.focus()
  }
}
