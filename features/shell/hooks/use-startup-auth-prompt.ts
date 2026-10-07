/**
 * Raises the start-of-visit auth prompt for guests, once per tab (see
 * `authPromptStore.requestStartup`). It waits for the first-run onboarding to finish so
 * the two takeovers never stack: onboarding first, then the account choice.
 */
'use client'

import { useEffect, useSyncExternalStore } from 'react'

import { authPromptStore, useSession } from '@/features/auth'

import { TEMPORARILY_SKIP_ENTRY_PROMPTS_FOR_ADSENSE } from '../config/entry-flow'
import { onboardingStore } from '../stores/onboarding-store'

export function useStartupAuthPrompt(): void {
  const { status } = useSession()
  const onboarded = useSyncExternalStore(
    onboardingStore.subscribe,
    onboardingStore.getSnapshot,
    onboardingStore.getServerSnapshot,
  )

  useEffect(() => {
    if (TEMPORARILY_SKIP_ENTRY_PROMPTS_FOR_ADSENSE) return
    if (status === 'guest' && onboarded) authPromptStore.requestStartup()
  }, [status, onboarded])
}
