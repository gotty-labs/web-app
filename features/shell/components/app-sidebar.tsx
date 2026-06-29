/**
 * App sidebar (Phase 5, Slice B) — primary navigation for the authenticated zone.
 *
 * Maps `NAV_ITEMS` to `SidebarMenuButton`s (icons + localized labels), marking the
 * active route from `usePathname()`. `collapsible="icon"` keeps it usable as a rail;
 * the tooltip shows the label when collapsed. The footer hosts the `ProfileMenu`.
 */
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Gamepad2Icon } from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'

import { NAV_ITEMS } from '../config/shell'

import { ProfileMenu } from './profile-menu'

export function AppSidebar() {
  const dict = useDictionary()
  const pathname = usePathname()

  return (
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
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <ProfileMenu />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
