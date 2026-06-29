/**
 * App shell (Phase 5, Slice B) — the chrome wrapping every authenticated screen.
 *
 * Mounted INSIDE `AuthGate`'s authenticated branch (see the `(app)` layout), so the
 * sidebar only exists for signed-in users. `SidebarProvider` owns the open/collapsed
 * state (persisted to a cookie by the primitive); `SidebarInset` is the main content
 * column. A slim top bar carries the `SidebarTrigger` for mobile (where the sidebar
 * becomes an off-canvas sheet).
 */
'use client'

import type { ReactNode } from 'react'

import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

import { AppSidebar } from './app-sidebar'
import { OnboardingModal } from './onboarding-modal'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 items-center gap-2 px-3 md:hidden">
          <SidebarTrigger />
        </header>
        {children}
      </SidebarInset>
      <OnboardingModal />
    </SidebarProvider>
  )
}
