/**
 * Standalone "choose a new password" card for `/reset-password?id=<resetId>`, the
 * page the backend's reset email links to. Same branded shell as `AuthModal` (logo
 * over a soft violet gradient + faint tiled-logo watermark, icon-prefixed inputs), but
 * rendered inline: there's no session here, so it lives outside `AuthGate`.
 *
 * Three views: `form` → `done` (Lottie check + CTA to the app), or `invalid` when the
 * link's `id` isn't a UUID (never hits the backend). An expired link (50044) and any
 * other backend error go through the app-wide error modal, which maps `internalCode`.
 *
 * The password is sent as typed (not the schema's trimmed output), matching how
 * login/register send it, so the stored password is exactly what the user signs in with.
 */
'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { EyeIcon, EyeOffIcon, LockIcon } from 'lucide-react'

import { BrandMark } from '@/components/brand-mark'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'
import { useReportError } from '@/hooks/use-report-error'
import { resetPasswordInputSchema } from '@/lib/domain/inputs'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'

import { resetPassword } from '../services/auth-client'

import { LottieCheck } from './lottie-check'

type FieldErrors = { password?: string; confirm?: string }

export function ResetPasswordForm({ resetId }: { resetId: string | null }) {
  const dict = useDictionary()
  const t = dict.app.auth
  const report = useReportError()

  const isValidLink = resetPasswordInputSchema.shape.resetId.safeParse(resetId).success

  const [done, setDone] = useState(false)
  const [pending, setPending] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  function validate(): FieldErrors {
    const next: FieldErrors = {}
    if (!resetPasswordInputSchema.safeParse({ resetId, password }).success) {
      next.password = t.errPassword
    } else if (confirm !== password) {
      next.confirm = t.errPasswordMismatch
    }
    return next
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!resetId) return

    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setPending(true)
    try {
      await resetPassword(resetId, password)
      setDone(true)
    } catch (err) {
      report(err)
    } finally {
      setPending(false)
    }
  }

  const passwordToggle = (
    <InputGroupAddon align="inline-end">
      <InputGroupButton
        size="icon-xs"
        aria-label={showPassword ? t.hidePassword : t.showPassword}
        onClick={() => setShowPassword((s) => !s)}
      >
        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
      </InputGroupButton>
    </InputGroupAddon>
  )

  return (
    <div className="relative w-full max-w-md overflow-hidden rounded-xl bg-popover text-sm text-popover-foreground ring-1 ring-foreground/10">
      {/* Decorative branded backdrop: soft violet gradient + faint tiled logo. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-44 opacity-[0.05] [mask-image:linear-gradient(to_bottom,black,transparent)]"
        style={{
          backgroundImage: 'url(/assets/images/app-icon-logo.png)',
          backgroundSize: '64px',
        }}
      />

      {done || !isValidLink ? (
        <div className="relative z-10 flex flex-col items-center gap-4 px-6 pt-10 pb-8">
          {done ? (
            <LottieCheck className="size-28" />
          ) : (
            <BrandMark wrapperClassName="h-16 w-20" sizes="80px" priority />
          )}
          <div className="flex flex-col items-center gap-1.5 text-center">
            <h1 className="font-heading text-2xl font-medium">
              {done ? t.resetSuccessTitle : t.resetInvalidTitle}
            </h1>
            <p className="text-balance text-muted-foreground">
              {done ? t.resetSuccessDescription : t.resetInvalidDescription}
            </p>
          </div>
          <Button asChild variant="outline" className="mt-2 h-11 w-full rounded-xl">
            <Link href="/home">{t.openGotty}</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="relative z-10 flex flex-col items-center gap-3 px-6 pt-10 pb-6">
            <BrandMark wrapperClassName="h-16 w-20" sizes="80px" priority />
            <div className="flex flex-col items-center gap-1.5 text-center">
              <h1 className="font-heading text-2xl font-medium">{t.resetTitle}</h1>
              <p className="text-balance text-muted-foreground">{t.resetDescription}</p>
            </div>
          </div>

          <div className="relative z-10 px-6 pb-8">
            <form noValidate onSubmit={handleSubmit}>
              <FieldGroup className="gap-4">
                <Field data-invalid={fieldErrors.password ? true : undefined}>
                  <FieldLabel htmlFor="reset-password" className="sr-only">
                    {t.passwordLabel}
                  </FieldLabel>
                  <InputGroup className="h-11 rounded-xl bg-muted/40">
                    <InputGroupAddon>
                      <LockIcon />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="reset-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder={t.newPasswordPlaceholder}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (fieldErrors.password)
                          setFieldErrors((p) => ({ ...p, password: undefined }))
                      }}
                      aria-invalid={fieldErrors.password ? true : undefined}
                    />
                    {passwordToggle}
                  </InputGroup>
                  {fieldErrors.password && <FieldError>{fieldErrors.password}</FieldError>}
                </Field>

                <Field data-invalid={fieldErrors.confirm ? true : undefined}>
                  <FieldLabel htmlFor="reset-password-confirm" className="sr-only">
                    {t.confirmPasswordLabel}
                  </FieldLabel>
                  <InputGroup className="h-11 rounded-xl bg-muted/40">
                    <InputGroupAddon>
                      <LockIcon />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="reset-password-confirm"
                      name="confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder={t.confirmPasswordPlaceholder}
                      value={confirm}
                      onChange={(e) => {
                        setConfirm(e.target.value)
                        if (fieldErrors.confirm)
                          setFieldErrors((p) => ({ ...p, confirm: undefined }))
                      }}
                      aria-invalid={fieldErrors.confirm ? true : undefined}
                    />
                  </InputGroup>
                  {fieldErrors.confirm && <FieldError>{fieldErrors.confirm}</FieldError>}
                </Field>

                <Button type="submit" disabled={pending} className="h-11 w-full rounded-xl text-base">
                  {pending && <Spinner data-icon="inline-start" />}
                  {t.submitReset}
                </Button>
              </FieldGroup>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
