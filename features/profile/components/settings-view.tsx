/**
 * Settings screen (Phase 5, Slice G). Two sections: email verification (opens the OTP
 * modal; verified state seeded from the session, flipped optimistically on success)
 * and change-password (emails a secure link). Console visibility moved to the sidebar
 * "Options" group (QA Chunk 1).
 */
'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { AppTopBar } from '@/components/app-top-bar'
import { useReportError } from '@/hooks/use-report-error'
import { useSession } from '@/features/auth'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'

import { changePassword } from '../services/profile'

import { VerifyEmailModal } from './verify-email-modal'

export function SettingsView() {
  const dict = useDictionary()
  const s = dict.app.settings
  const report = useReportError()
  const { user } = useSession()

  const [verifyOpen, setVerifyOpen] = useState(false)
  const [verified, setVerified] = useState(user?.twoFa.verifiedEmail ?? false)
  const [changingPassword, setChangingPassword] = useState(false)

  async function handleChangePassword() {
    setChangingPassword(true)
    try {
      await changePassword()
      toast.success(s.password.sentToast)
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

        <Card>
          <CardHeader>
            <CardTitle>{s.email.title}</CardTitle>
            <CardDescription>{verified ? s.email.verified : s.email.unverified}</CardDescription>
          </CardHeader>
          {!verified && (
            <CardContent>
              <Button onClick={() => setVerifyOpen(true)}>{s.email.verifyCta}</Button>
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{s.password.title}</CardTitle>
            <CardDescription>{s.password.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleChangePassword} disabled={changingPassword}>
              {changingPassword && <Spinner data-icon="inline-start" />}
              {s.password.cta}
            </Button>
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
