/**
 * Profile overlay menu (Phase 5, Slice B) — lives in the sidebar footer.
 *
 * A `DropdownMenu` whose trigger is a `SidebarMenuButton` showing the user's avatar +
 * nickname. The menu collects account-level actions: settings, hidden consoles,
 * notifications, and log out, with the app version pinned at the bottom.
 *
 * Reads the user from `useSession()` (so it only renders inside the authenticated
 * shell) and routes log-out through `signOut()` (clears the session + cookie, then
 * returns to the landing).
 */
'use client'

import Link from 'next/link'
import { ChevronUpIcon, LogOutIcon, SettingsIcon } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenuButton, useSidebar } from '@/components/ui/sidebar'
import { useSession } from '@/features/auth'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'

import { APP_VERSION } from '../config/shell'

function initials(nickname: string): string {
  return nickname.slice(0, 2).toUpperCase()
}

export function ProfileMenu() {
  const { user, signOut } = useSession()
  const dict = useDictionary()
  const { setOpenMobile } = useSidebar()
  const t = dict.app.profile

  if (!user) return null

  // Selecting an account action dismisses the mobile sidebar sheet (see AppSidebar).
  const closeMobile = () => setOpenMobile(false)

  const avatar = (
    <Avatar className="size-8 rounded-md">
      {user.avatar && <AvatarImage src={user.avatar} alt={user.nickname} />}
      <AvatarFallback className="rounded-md">{initials(user.nickname)}</AvatarFallback>
    </Avatar>
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton size="lg" aria-label={t.account}>
          {avatar}
          <div className="flex min-w-0 flex-col text-left leading-tight">
            <span className="truncate text-sm font-medium">{user.nickname}</span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          </div>
          <ChevronUpIcon className="ml-auto" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          {avatar}
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-medium">{user.nickname}</span>
            <span className="truncate text-xs font-normal text-muted-foreground">
              {user.email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/settings" onClick={closeMobile}>
              <SettingsIcon />
              {t.settings}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => {
            void signOut()
            closeMobile()
          }}
        >
          <LogOutIcon />
          {t.logout}
        </DropdownMenuItem>
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          {t.version} {APP_VERSION}
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
