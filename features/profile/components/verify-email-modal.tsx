/**
 * Email verification modal (Phase 5, Slice G). On open it calls `startVerifyEmail()`
 * (backend sends a 6-digit OTP and returns the recipient), then collects the code
 * with `InputOTP` and confirms via `verifyEmail({ otp })` (the OTP is a NUMBER per the
 * contract).
 *
 * Errors go through the app-wide `report()` (generic error modal); it's stable, so the
 * initial-send effect can depend on it without resending on every render. That send
 * lives in the effect (setState only in `.then`, never synchronously in the body);
 * `resend` is a separate event handler that can show its spinner.
 */
'use client'

import { useEffect, useRef, useState } from 'react'
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
import { useReportError } from '@/hooks/use-report-error'
import { useSession } from '@/features/auth'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'

import { startVerifyEmail, verifyEmail } from '../services/profile'

const OTP_LENGTH = 6
const RESEND_COOLDOWN = 60

export function VerifyEmailModal({
  onClose,
  onVerified,
}: {
  onClose: () => void
  onVerified?: () => void
}) {
  const dict = useDictionary()
  const t = dict.app.settings.email
  const report = useReportError()
  const { markEmailVerified } = useSession()

  const [recipient, setRecipient] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [sending, setSending] = useState(false)
  const [pending, setPending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const started = useRef(false)

  // Initial send: fire ONCE. The ref guard survives React StrictMode's double effect
  // invocation (dev) AND any re-run from an unstable dep, so the OTP endpoint is hit a
  // single time per open — sending twice back-to-back raced on the backend. setState
  // lives in `.then`/`.catch`, never synchronously in the effect body. A successful send
  // opens the resend cooldown so the user can't spam the endpoint.
  useEffect(() => {
    if (started.current) return
    started.current = true
    startVerifyEmail()
      .then(({ recipient: to }) => {
        setRecipient(to)
        setCooldown(RESEND_COOLDOWN)
      })
      .catch((e) => report(e))
  }, [report])

  // Tick the resend cooldown down once per second. setState lives in the timer callback
  // (not synchronously in the effect body); the effect self-stops when it reaches 0.
  useEffect(() => {
    if (cooldown <= 0) return
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(id)
  }, [cooldown])

  async function resend() {
    setSending(true)
    try {
      const { recipient: to } = await startVerifyEmail()
      setRecipient(to)
      setCooldown(RESEND_COOLDOWN)
    } catch (e) {
      report(e)
    } finally {
      setSending(false)
    }
  }

  async function confirm() {
    setPending(true)
    try {
      await verifyEmail({ otp: Number(code) })
      markEmailVerified()
      toast.success(t.successToast, { position: 'bottom-center' })
      onVerified?.()
      onClose()
    } catch (e) {
      report(e)
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
          <Button variant="ghost" onClick={() => void resend()} disabled={sending || cooldown > 0}>
            {sending && <Spinner data-icon="inline-start" />}
            {cooldown > 0 ? `${t.resendIn} ${cooldown}s` : t.resend}
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
