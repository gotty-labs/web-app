/**
 * App sidebar (Phase 5, Slice B) — primary navigation for the authenticated zone.
 *
 * Maps `NAV_ITEMS` to `SidebarMenuButton`s (icons + localized labels), marking the
 * active route from `usePathname()`. `collapsible="icon"` keeps it usable as a rail;
 * the tooltip shows the label when collapsed. The footer hosts the `ProfileMenu`.
 */
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquareIcon, MonitorIcon } from 'lucide-react'

import { BrandMark } from '@/components/brand-mark'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { useConsoleVisibility } from '@/hooks/use-console-visibility'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'

import { NAV_ITEMS } from '../config/shell'

import { FeedbackModal } from './feedback-modal'
import { ProfileMenu } from './profile-menu'

export function AppSidebar() {
  const dict = useDictionary()
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()
  const { openConsoleVisibility } = useConsoleVisibility()
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  // On mobile the sidebar is an off-canvas sheet; activating any item should dismiss
  // it (navigation or opening a modal). Dismissing an overlay does NOT (handled by the
  // Sheet's onInteractOutside guard).
  const closeMobile = () => setOpenMobile(false)
  const openFeedback = () => {
    setFeedbackOpen(true)
    closeMobile()
  }

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="lg" tooltip={dict.app.brand.name}>
                <Link href="/home" onClick={closeMobile}>
                  <BrandMark wrapperClassName="size-8 rounded-md" sizes="32px" priority />
                  <span className="font-pixel text-base font-semibold">{dict.app.brand.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{dict.app.nav.games}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_ITEMS.map((item) => {
                  const label = dict.app.nav[item.key]
                  const active =
                    item.href === '/home'
                      ? pathname === '/home'
                      : pathname === item.href || pathname.startsWith(`${item.href}/`)
                  const Icon = item.icon
                  return (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton asChild isActive={active} tooltip={label}>
                        <Link href={item.href} onClick={closeMobile}>
                          <Icon />
                          <span>{label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>{dict.app.nav.options}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => {
                      openConsoleVisibility()
                      closeMobile()
                    }}
                    tooltip={dict.app.nav.consoleVisibility}
                  >
                    <MonitorIcon />
                    <span>{dict.app.nav.consoleVisibility}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={openFeedback} tooltip={dict.app.nav.feedback}>
                    <MessageSquareIcon />
                    <span>{dict.app.nav.feedback}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <ProfileMenu />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        {/* Clickable edge rail to expand/collapse on desktop (Cmd/Ctrl+B also toggles). */}
        <SidebarRail />
      </Sidebar>

      {feedbackOpen && <FeedbackModal onClose={() => setFeedbackOpen(false)} />}
    </>
  )
}
