/**
 * Profile overlay menu (Phase 5, Slice B) — lives in the sidebar footer.
 *
 * A `DropdownMenu` whose trigger is a `SidebarMenuButton` showing the user's avatar +
 * nickname. The menu collects account-level actions: settings, hidden consoles,
 * notifications, and log out, with the app version pinned at the bottom.
 *
 * Reads the user from `useSession()` and routes log-out through `signOut()` (clears
 * the member session + cookie and continues as a fresh guest). Guests get no account
 * actions: a "browsing as a guest" card whose Sign in button opens the auth prompt.
 */
'use client'

import Link from 'next/link'
import { ChevronUpIcon, CircleUserRoundIcon, LogOutIcon, SettingsIcon } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { authPromptStore, useSession } from '@/features/auth'
import { appPromotionStore } from '@/features/app-promotion'
import { useNeedsEmailVerification } from '@/features/profile'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'

import { APP_VERSION } from '../config/shell'

function initials(nickname: string): string {
  return nickname.slice(0, 2).toUpperCase()
}

export function ProfileMenu() {
  const { status, user, signOut } = useSession()
  const dict = useDictionary()
  const { isMobile, setOpenMobile, state } = useSidebar()
  const needsEmailVerification = useNeedsEmailVerification()
  const t = dict.app.profile

  // Selecting an account action dismisses the mobile sidebar sheet (see AppSidebar).
  const closeMobile = () => setOpenMobile(false)

  if (status === 'guest') {
    const signIn = () => {
      authPromptStore.show()
      closeMobile()
    }

    // Collapsed rail: just the entry point, with the card's title as tooltip.
    if (!isMobile && state === 'collapsed') {
      return (
        <SidebarMenuButton size="lg" tooltip={t.guestTitle} onClick={signIn}>
          <CircleUserRoundIcon />
          <span>{dict.app.actions.signIn}</span>
        </SidebarMenuButton>
      )
    }

    return (
      <div className="flex flex-col gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent/30 p-3">
        <p className="text-sm font-medium">{t.guestTitle}</p>
        <p className="text-xs text-muted-foreground">{t.guestDescription}</p>
        <Button size="sm" className="mt-1" onClick={signIn}>
          <CircleUserRoundIcon data-icon="inline-start" />
          {dict.app.actions.signIn}
        </Button>
      </div>
    )
  }

  if (!user) return null

  const avatar = (
    <Avatar className="size-8 rounded-md">
      {user.avatar && <AvatarImage src={user.avatar} alt={user.nickname} />}
      <AvatarFallback className="rounded-md">{initials(user.nickname)}</AvatarFallback>
    </Avatar>
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          aria-label={t.account}
          onClick={() => appPromotionStore.request()}
        >
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
            <span className="truncate text-xs font-normal text-muted-foreground">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/settings" onClick={closeMobile}>
              <SettingsIcon />
              {t.settings}
              {needsEmailVerification && (
                <Badge variant="notification" aria-hidden className="ml-auto size-2 p-0" />
              )}
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
