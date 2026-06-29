/**
 * Email verification modal (Phase 5, Slice G). On open it calls `startVerifyEmail()`
 * (backend sends a 6-digit OTP and returns the recipient), then collects the code
 * with `InputOTP` and confirms via `verifyEmail({ otp })` (the OTP is a NUMBER per the
 * contract).
 *
 * Errors are mapped with `getErrorMessage(e, dict)` directly (not `useErrorMessage`)
 * so the effect depends only on the stable `dict` and doesn't resend on every render.
 * The initial send lives in the effect (setState only in `.then`, never synchronously
 * in the body); `resend` is a separate event handler that can show its spinner.
 */
'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Spinner } from '@/components/ui/spinner'
import { getErrorMessage } from '@/lib/i18n'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'

import { startVerifyEmail, verifyEmail } from '../services/profile'

const OTP_LENGTH = 6

export function VerifyEmailModal({
  onClose,
  onVerified,
}: {
  onClose: () => void
  onVerified?: () => void
}) {
  const dict = useDictionary()
  const t = dict.app.settings.email

  const [recipient, setRecipient] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [sending, setSending] = useState(false)
  const [pending, setPending] = useState(false)

  // Initial send: setState only inside `.then`/`.catch`, never synchronously in the
  // effect body (the set-state-in-effect rule). The spinner is for `resend` only.
  useEffect(() => {
    let active = true
    startVerifyEmail()
      .then(({ recipient: to }) => {
        if (active) setRecipient(to)
      })
      .catch((e) => {
        if (active) toast.error(getErrorMessage(e, dict))
      })
    return () => {
      active = false
    }
  }, [dict])

  async function resend() {
    setSending(true)
    try {
      const { recipient: to } = await startVerifyEmail()
      setRecipient(to)
    } catch (e) {
      toast.error(getErrorMessage(e, dict))
    } finally {
      setSending(false)
    }
  }

  async function confirm() {
    setPending(true)
    try {
      await verifyEmail({ otp: Number(code) })
      toast.success(t.successToast)
      onVerified?.()
      onClose()
    } catch (e) {
      toast.error(getErrorMessage(e, dict))
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.modalTitle}</DialogTitle>
          <DialogDescription>
            {t.sentTo} {recipient ?? '…'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-2">
          <InputOTP maxLength={OTP_LENGTH} value={code} onChange={setCode}>
            <InputOTPGroup>
              {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" onClick={() => void resend()} disabled={sending}>
            {sending && <Spinner data-icon="inline-start" />}
            {t.resend}
          </Button>
          <Button onClick={confirm} disabled={pending || code.length < OTP_LENGTH}>
            {pending && <Spinner data-icon="inline-start" />}
            {t.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
