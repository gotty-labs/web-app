/**
 * App shell (Phase 5, Slice B) — the chrome wrapping every authenticated screen.
 *
 * Mounted INSIDE `AuthGate`'s session branch (see the `(app)` layout), so it renders
 * for members and guests alike; guests get the auth prompt at the start of a visit and
 * whenever they reach a member-only feature (`AuthPrompt`). `SidebarProvider` owns the open/collapsed
 * state (persisted to a cookie by the primitive); `SidebarInset` is the main content
 * column. A slim top bar carries the `SidebarTrigger` for mobile (where the sidebar
 * becomes an off-canvas sheet).
 */
'use client'

import type { ReactNode } from 'react'

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { ConsoleVisibilityProvider } from '@/contexts/console-visibility-provider'
import { AppDownloadPrompt } from '@/features/app-promotion'
import { AdBlockPrompt } from '@/features/advertising'
import { AuthPrompt } from '@/features/auth'

import { useStartupAuthPrompt } from '../hooks/use-startup-auth-prompt'

import { AppSidebar } from './app-sidebar'
import { OnboardingFlow } from './onboarding-flow'

export function AppShell({ children }: { children: ReactNode }) {
  useStartupAuthPrompt()

  return (
    <ConsoleVisibilityProvider>
      <SidebarProvider>
        <AppSidebar />
        {/* min-w-0 lets this flex child shrink instead of expanding to the carousel's
            intrinsic width (the flexbox min-width:auto trap) — the real cause of the
            page-wide horizontal scroll. No overflow here: it would become a scroll
            container and break sticky headers. The sidebar toggle now lives in each
            page's <AppTopBar/>. */}
        <SidebarInset className="min-w-0">{children}</SidebarInset>
        <OnboardingFlow />
        <AppDownloadPrompt />
        <AdBlockPrompt />
        <AuthPrompt />
      </SidebarProvider>
    </ConsoleVisibilityProvider>
  )
}
