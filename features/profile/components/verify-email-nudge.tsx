/**
 * Verify-email nudge (QA Chunk 2). Reads the app-scoped startup result and, when the
 * backend reports `needVerifiedEmail`, raises a persistent sonner toast (icon + text +
 * "verify" action + dismiss) whose action opens the OTP `VerifyEmailModal`.
 *
 * It's a toast, not an inline banner, because a banner above the feed/filters went
 * unnoticed. Mounted ONCE in the `(app)` layout (not per page) so the toast fires a
 * single time per authenticated entry and the modal host survives route changes — the
 * `useRef` guard also absorbs React StrictMode's double effect invocation in dev.
 */
'use client'

import { useEffect, useRef, useState } from 'react'
import { MailWarningIcon } from 'lucide-react'
import { toast } from 'sonner'

import { useStartup } from '@/features/app-config'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'

import { VerifyEmailModal } from './verify-email-modal'

export function VerifyEmailNudge() {
  const { startup } = useStartup()
  const dict = useDictionary()
  const t = dict.app.verifyBanner

  const [verifyOpen, setVerifyOpen] = useState(false)
  const [verified, setVerified] = useState(false)
  const shown = useRef(false)

  useEffect(() => {
    if (shown.current || verified || !startup?.needVerifiedEmail) return
    shown.current = true
    toast(t.text, {
      icon: <MailWarningIcon className="size-4" />,
      duration: Infinity,
      position: 'bottom-center',
      action: { label: t.cta, onClick: () => setVerifyOpen(true) },
      // sonner auto-dismisses on cancel; the handler is required by its type.
      cancel: { label: t.dismiss, onClick: () => undefined },
    })
  }, [startup, verified, t])

  return verifyOpen ? (
    <VerifyEmailModal onClose={() => setVerifyOpen(false)} onVerified={() => setVerified(true)} />
  ) : null
}
