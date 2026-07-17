/**
 * Settings screen (Phase 5, Slice G). Two sections: email verification (opens the OTP
 * modal; verified state seeded from the session, flipped optimistically on success)
 * and change-password (emails a secure link). Console visibility moved to the sidebar
 * "Options" group (QA Chunk 1).
 */
'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { AppTopBar } from '@/components/app-top-bar'
import { useReportError } from '@/hooks/use-report-error'
import { useSession } from '@/features/auth'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'

import { changePassword } from '../services/profile'

import { VerifyEmailModal } from './verify-email-modal'

const PASSWORD_COOLDOWN = 60

export function SettingsView() {
  const dict = useDictionary()
  const s = dict.app.settings
  const report = useReportError()
  const { user } = useSession()

  const [verifyOpen, setVerifyOpen] = useState(false)
  const [verified, setVerified] = useState(user?.twoFa.verifiedEmail ?? false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [pwCooldown, setPwCooldown] = useState(0)
  // No-op preference until the backend exposes notification settings — defaults ON.
  const [notifications, setNotifications] = useState(true)

  // Same cooldown UX as the OTP resend: a successful "email me a link" opens a 60s
  // window so the user can't spam the endpoint. setState lives in the timer callback.
  useEffect(() => {
    if (pwCooldown <= 0) return
    const id = setTimeout(() => setPwCooldown((c) => c - 1), 1000)
    return () => clearTimeout(id)
  }, [pwCooldown])

  async function handleChangePassword() {
    setChangingPassword(true)
    try {
      await changePassword()
      toast.success(s.password.sentToast)
      setPwCooldown(PASSWORD_COOLDOWN)
    } catch (e) {
      report(e)
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <>
      <AppTopBar />
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4 md:p-6">
        <h1 className="font-heading text-2xl font-semibold">{s.title}</h1>

        {/* A verified email needs no action, so the whole section is hidden then. */}
        {!verified && (
          <Card>
            <CardHeader>
              <CardTitle>{s.email.title}</CardTitle>
              <CardDescription>{s.email.unverified}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setVerifyOpen(true)}>{s.email.verifyCta}</Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{s.password.title}</CardTitle>
            <CardDescription>{s.password.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={handleChangePassword}
              disabled={changingPassword || pwCooldown > 0}
            >
              {changingPassword && <Spinner data-icon="inline-start" />}
              {pwCooldown > 0 ? `${s.password.retryIn} ${pwCooldown}s` : s.password.cta}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{s.notifications.title}</CardTitle>
            <CardDescription>{s.notifications.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="notifications-toggle" className="font-normal">
                {s.notifications.enable}
              </Label>
              <Switch
                id="notifications-toggle"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {verifyOpen && (
          <VerifyEmailModal
            onClose={() => setVerifyOpen(false)}
            onVerified={() => setVerified(true)}
          />
        )}
      </main>
    </>
  )
}
