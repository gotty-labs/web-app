'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

type GoogleCredentialResponse = {
  credential: string
}

type GoogleButtonConfiguration = {
  theme: 'outline'
  size: 'large'
  text: 'continue_with'
  shape: 'rectangular'
  width: number
}

type GoogleIdentityServices = {
  accounts: {
    id: {
      initialize(configuration: {
        client_id: string
        callback: (response: GoogleCredentialResponse) => void
      }): void
      renderButton(element: HTMLElement, configuration: GoogleButtonConfiguration): void
    }
  }
}

type GoogleWindow = Window & {
  google?: GoogleIdentityServices
}

type GoogleSignInButtonProps = {
  clientId?: string
  label: string
  pending: boolean
  onCredential: (token: string) => void | Promise<void>
  onUnavailable: () => void
}

type ScriptStatus = 'loading' | 'ready' | 'failed'

/**
 * Loads Google's official Sign In With Google button and forwards its ID token to
 * the auth flow. The token is never decoded or persisted in the browser; it is
 * handed to the BFF, which forwards it to the backend for validation.
 */
export function GoogleSignInButton({
  clientId,
  label,
  pending,
  onCredential,
  onUnavailable,
}: GoogleSignInButtonProps) {
  const [scriptStatus, setScriptStatus] = useState<ScriptStatus>('loading')
  const buttonRef = useRef<HTMLDivElement>(null)
  const credentialHandlerRef = useRef(onCredential)

  useEffect(() => {
    credentialHandlerRef.current = onCredential
  }, [onCredential])

  useEffect(() => {
    if (!clientId || scriptStatus !== 'ready') return

    const google = (window as GoogleWindow).google
    const button = buttonRef.current
    if (!google || !button) return

    google.accounts.id.initialize({
      client_id: clientId,
      callback: ({ credential }) => {
        void credentialHandlerRef.current(credential)
      },
    })

    button.replaceChildren()
    google.accounts.id.renderButton(button, {
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      width: 400,
    })

    return () => button.replaceChildren()
  }, [clientId, scriptStatus])

  if (!clientId || scriptStatus === 'failed') {
    return (
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full rounded-xl"
        disabled={pending}
        onClick={onUnavailable}
      >
        <GoogleIcon data-icon="inline-start" />
        {label}
      </Button>
    )
  }

  return (
    <>
      <Script
        id="google-identity-services"
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => setScriptStatus('ready')}
        onError={() => setScriptStatus('failed')}
      />
      {scriptStatus === 'ready' ? (
        <div
          aria-busy={pending}
          className={`flex min-h-11 w-full justify-center${pending ? ' pointer-events-none opacity-60' : ''}`}
        >
          <div ref={buttonRef} />
        </div>
      ) : (
        <Button type="button" variant="outline" className="h-11 w-full rounded-xl" disabled>
          <Spinner data-icon="inline-start" />
          {label}
        </Button>
      )}
    </>
  )
}

function GoogleIcon({ 'data-icon': dataIcon }: { 'data-icon': 'inline-start' }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" data-icon={dataIcon}>
      <path
        fill="currentColor"
        d="M21.35 11.1H12v2.92h5.35c-.23 1.5-1.6 4.4-5.35 4.4a6.1 6.1 0 1 1 0-12.2c1.75 0 2.92.74 3.6 1.38l2.45-2.36C16.46 3.5 14.43 2.6 12 2.6a9.4 9.4 0 1 0 0 18.8c5.43 0 9.02-3.82 9.02-9.2 0-.62-.07-1.1-.17-1.6Z"
      />
    </svg>
  )
}
