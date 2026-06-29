/**
 * First-run welcome modal (Phase 5, Slice G). Shown once per browser, gated by the
 * localStorage-backed `onboardingStore` (read via `useSyncExternalStore`). Dismissing
 * it — button or overlay/Esc — marks it seen so it won't reappear.
 *
 * Mounted inside the authenticated `AppShell`, so it only greets signed-in users.
 */
'use client'

import { useSyncExternalStore } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'

import { onboardingStore } from '../stores/onboarding-store'

export function OnboardingModal() {
  const dict = useDictionary()
  const t = dict.app.onboarding
  const seen = useSyncExternalStore(
    onboardingStore.subscribe,
    onboardingStore.getSnapshot,
    onboardingStore.getServerSnapshot,
  )

  if (seen) return null

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) onboardingStore.markSeen()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => onboardingStore.markSeen()}>{t.cta}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
