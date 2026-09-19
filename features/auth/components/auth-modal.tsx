/**
 * Undismissable auth modal the web app's single entry
 * point to a session. Web is ALWAYS authenticated, so this modal cannot be closed: no
 * close button, no Esc, no click-outside. `AuthGate` mounts it whenever the session is
 * `unauthenticated`; a successful login/register updates `sessionStore`, which flips
 * the gate to `authenticated` and unmounts this modal — so it never closes itself.
 *
 * One component, four views (login / register / forgot / forgotSent) driven by local
 * state, all sharing the same branded shell: logo card over a soft violet gradient
 * with a faint tiled-logo watermark, icon-prefixed inputs, a full-width primary CTA and
 * a Google-only social option (Apple/Facebook are intentionally absent). The
 * "reset link sent" view swaps the icon for a Lottie success check.
 *
 * Validation is Material-style, not native: the form is `noValidate` and each view's
 * Zod schema (the single source of truth) is `safeParse`d on submit — failures paint the
 * field red (`aria-invalid` + `data-invalid`) and drop a `FieldError` hint underneath,
 * instead of the browser's ugly bubble.
 *
 * Backend errors go through the app-wide error modal (`useReportError`, which branches
 * on `internalCode`) — no ad-hoc callout here. A flow that ever needs to swallow the
 * generic modal can pass `report(err, { silent: true })`; for now everything is generic.
 */
'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon, UserIcon, XIcon } from 'lucide-react'
import { toast } from 'sonner'

import { BrandMark } from '@/components/brand-mark'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'
import { useReportError } from '@/hooks/use-report-error'
import { BffError } from '@/lib/api/bff-client'
import { InternalCode } from '@/lib/api/error-codes'
import { env } from '@/lib/config/env'
import {
  forgotPasswordInputSchema,
  loginEmailInputSchema,
  oauthRegisterInputSchema,
  registerEmailInputSchema,
} from '@/lib/domain/inputs'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'

import {
  forgotPassword,
  loginEmail,
  loginOAuth,
  registerEmail,
  registerOAuth,
} from '../services/auth-client'

import { GoogleSignInButton } from './google-sign-in-button'
import { LottieCheck } from './lottie-check'

type AuthView = 'login' | 'register' | 'forgot' | 'forgotSent'
type FieldErrors = { email?: string; password?: string; nickname?: string }

export function AuthModal() {
  const dict = useDictionary()
  const t = dict.app.auth
  const report = useReportError()
  const router = useRouter()

  const [view, setView] = useState<AuthView>('login')
  const [pending, setPending] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [oauthToken, setOauthToken] = useState<string | null>(null)

  const isGoogleRegister = view === 'register' && oauthToken !== null

  function go(next: AuthView) {
    setView(next)
    setFieldErrors({})
    setShowPassword(false)
    if (next !== 'register') setOauthToken(null)
  }

  function startGoogleRegistration(token: string) {
    setOauthToken(token)
    setView('register')
    setFieldErrors({})
    setShowPassword(false)
  }

  // Map the active view's Zod schema onto per-field copy. One message per field is
  // enough for the hint style (email covers both "required" and "malformed").
  function validate(): FieldErrors {
    const next: FieldErrors = {}
    const result =
      view === 'login'
        ? loginEmailInputSchema.safeParse({ email, password })
        : view === 'register'
          ? oauthToken
            ? oauthRegisterInputSchema.safeParse({ token: oauthToken, nickname })
            : registerEmailInputSchema.safeParse({ email, nickname, password })
          : forgotPasswordInputSchema.safeParse({ email })

    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0]
        if (field === 'email' && !next.email) next.email = t.errEmail
        else if (field === 'password' && !next.password) next.password = t.errPassword
        else if (field === 'nickname' && !next.nickname) next.nickname = t.errNickname
      }
    }
    return next
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setPending(true)
    try {
      if (view === 'login') {
        await loginEmail(email, password)
      } else if (view === 'register') {
        if (oauthToken) {
          await registerOAuth('google', oauthToken, nickname)
        } else {
          await registerEmail(email, nickname, password)
        }
      } else if (view === 'forgot') {
        await forgotPassword(email)
        setView('forgotSent')
      }
      // On login/register success the session store updates and AuthGate unmounts us.
    } catch (err) {
      // Generic path: the app-wide error modal (stacks over this dialog, dismiss to
      // return here). It already maps by internalCode, so no per-flow handling needed.
      report(err)
    } finally {
      setPending(false)
    }
  }

  async function onGoogleCredential(token: string) {
    if (pending) return

    setPending(true)
    try {
      if (view === 'login') {
        await loginOAuth('google', token)
      } else if (view === 'register') {
        setOauthToken(token)
        const result = oauthRegisterInputSchema.safeParse({ token, nickname })
        if (!result.success) {
          setFieldErrors({ nickname: t.errNickname })
          return
        }
        await registerOAuth('google', token, nickname)
      }
    } catch (error) {
      if (
        view === 'login' &&
        error instanceof BffError &&
        error.internalCode === InternalCode.INVALID_OAUTH_CREDENTIALS
      ) {
        startGoogleRegistration(token)
      } else {
        report(error)
      }
    } finally {
      setPending(false)
    }
  }

  function onGoogleUnavailable() {
    toast.info(t.googleUnavailable)
  }

  const titles: Record<AuthView, { title: string; description: string }> = {
    login: { title: t.loginTitle, description: t.loginDescription },
    register: { title: t.registerTitle, description: t.registerDescription },
    forgot: { title: t.forgotTitle, description: t.forgotDescription },
    forgotSent: { title: t.forgotSentTitle, description: t.forgotSentDescription },
  }

  const submitLabel =
    view === 'login' ? t.submitLogin : view === 'register' ? t.submitRegister : t.submitForgot

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) router.push('/')
      }}
    >
      <DialogContent
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        className="gap-0 overflow-hidden p-0 sm:max-w-md"
      >
        {/*
         * Custom close (escape hatch to the landing `/`).
         */}
        <button
          type="button"
          onClick={() => router.push('/')}
          aria-label={dict.app.actions.close}
          className="absolute top-3 right-3 z-20 flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <XIcon className="size-4" />
        </button>

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

        {view === 'forgotSent' ? (
          <div className="relative z-10 flex flex-col items-center gap-4 px-6 pt-10 pb-8">
            <LottieCheck className="size-28" />
            <DialogHeader className="items-center gap-1.5 text-center sm:text-center">
              <DialogTitle className="text-2xl">{titles.forgotSent.title}</DialogTitle>
              <DialogDescription className="text-balance">
                {titles.forgotSent.description}
              </DialogDescription>
            </DialogHeader>
            <Button
              variant="outline"
              className="mt-2 h-11 w-full rounded-xl"
              onClick={() => go('login')}
            >
              {t.backToLogin}
            </Button>
          </div>
        ) : (
          <>
            <div className="relative z-10 flex flex-col items-center gap-3 px-6 pt-10 pb-6">
              <BrandMark wrapperClassName="h-16 w-20" sizes="80px" priority />
              <DialogHeader className="items-center gap-1.5 text-center sm:text-center">
                <DialogTitle className="text-2xl">{titles[view].title}</DialogTitle>
                <DialogDescription className="text-balance">
                  {titles[view].description}
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="relative z-10 px-6 pb-6">
              <form noValidate onSubmit={handleSubmit}>
                <FieldGroup className="gap-4">
                  {view === 'register' && (
                    <Field data-invalid={fieldErrors.nickname ? true : undefined}>
                      <FieldLabel htmlFor="auth-nickname" className="sr-only">
                        {t.nicknameLabel}
                      </FieldLabel>
                      <InputGroup className="h-11 rounded-xl bg-muted/40">
                        <InputGroupAddon>
                          <UserIcon />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="auth-nickname"
                          name="nickname"
                          autoComplete="nickname"
                          placeholder={t.nicknamePlaceholder}
                          value={nickname}
                          onChange={(e) => {
                            setNickname(e.target.value)
                            if (fieldErrors.nickname)
                              setFieldErrors((p) => ({ ...p, nickname: undefined }))
                          }}
                          aria-invalid={fieldErrors.nickname ? true : undefined}
                        />
                      </InputGroup>
                      {fieldErrors.nickname && <FieldError>{fieldErrors.nickname}</FieldError>}
                    </Field>
                  )}

                  {!isGoogleRegister && (
                    <Field data-invalid={fieldErrors.email ? true : undefined}>
                      <FieldLabel htmlFor="auth-email" className="sr-only">
                        {t.emailLabel}
                      </FieldLabel>
                      <InputGroup className="h-11 rounded-xl bg-muted/40">
                        <InputGroupAddon>
                          <MailIcon />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="auth-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          placeholder={t.emailPlaceholder}
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value)
                            if (fieldErrors.email)
                              setFieldErrors((p) => ({ ...p, email: undefined }))
                          }}
                          aria-invalid={fieldErrors.email ? true : undefined}
                        />
                      </InputGroup>
                      {fieldErrors.email && <FieldError>{fieldErrors.email}</FieldError>}
                    </Field>
                  )}

                  {view !== 'forgot' && !isGoogleRegister && (
                    <Field data-invalid={fieldErrors.password ? true : undefined}>
                      <FieldLabel htmlFor="auth-password" className="sr-only">
                        {t.passwordLabel}
                      </FieldLabel>
                      <InputGroup className="h-11 rounded-xl bg-muted/40">
                        <InputGroupAddon>
                          <LockIcon />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="auth-password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete={view === 'login' ? 'current-password' : 'new-password'}
                          placeholder={t.passwordPlaceholder}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value)
                            if (fieldErrors.password)
                              setFieldErrors((p) => ({ ...p, password: undefined }))
                          }}
                          aria-invalid={fieldErrors.password ? true : undefined}
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupButton
                            size="icon-xs"
                            aria-label={showPassword ? t.hidePassword : t.showPassword}
                            onClick={() => setShowPassword((s) => !s)}
                          >
                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                      {fieldErrors.password && <FieldError>{fieldErrors.password}</FieldError>}
                    </Field>
                  )}

                  {view === 'login' && (
                    <div className="-mt-2 flex justify-end">
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-muted-foreground"
                        onClick={() => go('forgot')}
                      >
                        {t.forgotLink}
                      </Button>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={pending}
                    className="h-11 w-full rounded-xl text-base"
                  >
                    {pending && <Spinner data-icon="inline-start" />}
                    {submitLabel}
                  </Button>

                  {view !== 'forgot' && !isGoogleRegister && (
                    <>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <Separator className="flex-1" />
                        <span className="shrink-0">{t.socialSeparator}</span>
                        <Separator className="flex-1" />
                      </div>
                      <GoogleSignInButton
                        clientId={env.googleClientId}
                        label={t.googleContinue}
                        pending={pending}
                        onCredential={onGoogleCredential}
                        onUnavailable={onGoogleUnavailable}
                      />
                    </>
                  )}
                </FieldGroup>
              </form>

              {view !== 'forgot' && (
                <div className="mt-6 flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <span>{view === 'login' ? t.noAccountPrompt : t.haveAccountPrompt}</span>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="px-0"
                    onClick={() => go(view === 'login' ? 'register' : 'login')}
                  >
                    {view === 'login' ? dict.app.actions.signUp : dict.app.actions.signIn}
                  </Button>
                </div>
              )}

              {view === 'forgot' && (
                <div className="mt-6 flex justify-center">
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => go('login')}
                  >
                    {t.backToLogin}
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
