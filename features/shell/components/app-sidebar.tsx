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
import { Gamepad2Icon, MessageSquareIcon, MonitorIcon } from 'lucide-react'

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
} from '@/components/ui/sidebar'
import { ConsoleVisibilityModal } from '@/features/profile'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'

import { NAV_ITEMS } from '../config/shell'

import { FeedbackModal } from './feedback-modal'
import { ProfileMenu } from './profile-menu'

export function AppSidebar() {
  const dict = useDictionary()
  const pathname = usePathname()
  const [modal, setModal] = useState<'consoles' | 'feedback' | null>(null)

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="lg" tooltip={dict.app.brand.name}>
                <Link href="/home">
                  <Gamepad2Icon className="text-primary" />
                  <span className="font-heading text-base font-semibold tracking-tight">
                    {dict.app.brand.name}
                  </span>
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
                        <Link href={item.href}>
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
                    onClick={() => setModal('consoles')}
                    tooltip={dict.app.nav.consoleVisibility}
                  >
                    <MonitorIcon />
                    <span>{dict.app.nav.consoleVisibility}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setModal('feedback')}
                    tooltip={dict.app.nav.feedback}
                  >
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

      {modal === 'consoles' && <ConsoleVisibilityModal onClose={() => setModal(null)} />}
      {modal === 'feedback' && <FeedbackModal onClose={() => setModal(null)} />}
    </>
  )
}
