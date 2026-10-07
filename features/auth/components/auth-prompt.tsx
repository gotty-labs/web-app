/**
 * Renders the auth modal over the current screen whenever `authPromptStore` is open
 * and the visitor is not a member yet. Mounted once per provider tree (the `(app)`
 * shell and the SEO detail island); features open it with `authPromptStore.show()`.
 * Finishing the modal — member login/register or "Continue as guest" — closes it.
 */
'use client'

import { useSyncExternalStore } from 'react'

import { useSession } from '../hooks/use-session'
import { authPromptStore } from '../stores/auth-prompt-store'

import { AuthModal } from './auth-modal'

export function AuthPrompt() {
  const { status } = useSession()
  const open = useSyncExternalStore(
    authPromptStore.subscribe,
    authPromptStore.getSnapshot,
    authPromptStore.getServerSnapshot,
  )

  if (!open || status === 'loading' || status === 'authenticated') return null
  return <AuthModal onComplete={authPromptStore.dismiss} />
}
