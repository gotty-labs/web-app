/**
 * Undismissable auth modal (Phase 5, §4.1) — the web app's single entry point to a
 * session. Web is ALWAYS authenticated, so this modal cannot be closed: no close
 * button, no Esc, no click-outside. It's mounted by `AuthGate` whenever the session
 * is `unauthenticated`; a successful login/register updates `sessionStore`, which
 * flips the gate to `authenticated` and unmounts this modal — so it never needs to
 * close itself.
 *
 * One component, four views (login / register / forgot / forgotSent) driven by local
 * state. Email flows are fully wired (`loginEmail`/`registerEmail`/`forgotPassword`);
 * Google is present but deferred — it needs Google Identity Services + a public client
 * id to mint the token `loginOAuth` expects (see `onGoogle`).
 *
 * Errors surface through `useErrorMessage()` (the single error→copy mapper), shown as
 * a form-level `Alert` (shadcn convention: callouts use `Alert`, not styled divs).
 */
'use client'

import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'
import { useErrorMessage } from '@/lib/i18n/hooks/use-error-message'

import { forgotPassword, loginEmail, registerEmail } from '../services/auth-client'

type AuthView = 'login' | 'register' | 'forgot' | 'forgotSent'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path
        fill="currentColor"
        d="M21.35 11.1H12v2.92h5.35c-.23 1.5-1.6 4.4-5.35 4.4a6.1 6.1 0 1 1 0-12.2c1.75 0 2.92.74 3.6 1.38l2.45-2.36C16.46 3.5 14.43 2.6 12 2.6a9.4 9.4 0 1 0 0 18.8c5.43 0 9.02-3.82 9.02-9.2 0-.62-.07-1.1-.17-1.6Z"
      />
    </svg>
  )
}

export function AuthModal() {
  const dict = useDictionary()
  const t = dict.app.auth
  const toMessage = useErrorMessage()

  const [view, setView] = useState<AuthView>('login')
  const [pending, setPending] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')

  function go(next: AuthView) {
    setView(next)
    setFormError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setFormError(null)
    try {
      if (view === 'login') {
        await loginEmail(email, password)
      } else if (view === 'register') {
        await registerEmail(email, nickname, password)
      } else if (view === 'forgot') {
        await forgotPassword(email)
        setView('forgotSent')
      }
      // On login/register success the session store updates and AuthGate unmounts us.
    } catch (err) {
      // Inline, not the global error modal: a dialog stacked over the auth dialog
      // would bury the form. The message still comes from the single error mapper.
      setFormError(toMessage(err))
    } finally {
      setPending(false)
    }
  }

  // NOTE (backend/config): wire Google Identity Services here to obtain an id token,
  // then `loginOAuth('google', token)` / `registerOAuth(...)`. Needs a public client
  // id (NEXT_PUBLIC_GOOGLE_CLIENT_ID). Until then it explains itself rather than fail.
  function onGoogle() {
    toast.info(t.googleUnavailable)
  }

  const titles: Record<AuthView, { title: string; description: string }> = {
    login: { title: t.loginTitle, description: t.loginDescription },
    register: { title: t.registerTitle, description: t.registerDescription },
    forgot: { title: t.forgotTitle, description: t.forgotDescription },
    forgotSent: { title: t.forgotSentTitle, description: t.forgotSentDescription },
  }

  return (
    <Dialog open>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        className="sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle>{titles[view].title}</DialogTitle>
          <DialogDescription>{titles[view].description}</DialogDescription>
        </DialogHeader>

        {view === 'forgotSent' ? (
          <Button variant="outline" onClick={() => go('login')}>
            {t.backToLogin}
          </Button>
        ) : (
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {formError && (
                <Alert variant="destructive">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              {view === 'register' && (
                <Field>
                  <FieldLabel htmlFor="auth-nickname">{t.nicknameLabel}</FieldLabel>
                  <Input
                    id="auth-nickname"
                    name="nickname"
                    autoComplete="nickname"
                    required
                    placeholder={t.nicknamePlaceholder}
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                  />
                </Field>
              )}

              <Field>
                <FieldLabel htmlFor="auth-email">{t.emailLabel}</FieldLabel>
                <Input
                  id="auth-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>

              {view !== 'forgot' && (
                <Field>
                  <FieldLabel htmlFor="auth-password">{t.passwordLabel}</FieldLabel>
                  <Input
                    id="auth-password"
                    name="password"
                    type="password"
                    autoComplete={view === 'login' ? 'current-password' : 'new-password'}
                    required
                    placeholder={t.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Field>
              )}

              <Button type="submit" disabled={pending}>
                {pending && <Spinner data-icon="inline-start" />}
                {view === 'login'
                  ? t.submitLogin
                  : view === 'register'
                    ? t.submitRegister
                    : t.submitForgot}
              </Button>

              {view === 'login' && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="mx-auto"
                  onClick={() => go('forgot')}
                >
                  {t.forgotLink}
                </Button>
              )}

              {view !== 'forgot' && (
                <>
                  <FieldSeparator>{t.orSeparator}</FieldSeparator>
                  <Button type="button" variant="outline" onClick={onGoogle}>
                    <GoogleIcon />
                    {t.googleContinue}
                  </Button>
                </>
              )}
            </FieldGroup>
          </form>
        )}

        {view !== 'forgotSent' && (
          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
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
      </DialogContent>
    </Dialog>
  )
}
