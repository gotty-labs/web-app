/**
 * App-shell configuration (Phase 5, Slice B).
 *
 * Nav items are data, not markup: each carries its dictionary key (resolved to copy
 * at render via `dict.app.nav[key]`), its route, and a lucide icon. Keeping this as a
 * typed list lets the sidebar map over it and lets active-state detection live in one
 * place.
 */
import { HomeIcon, LibraryIcon, type LucideIcon } from 'lucide-react'

import type { Dictionary } from '@/lib/i18n'

export type NavKey = keyof Dictionary['app']['nav']

export interface NavItem {
  key: Extract<NavKey, 'feed' | 'library'>
  href: string
  icon: LucideIcon
}

export const NAV_ITEMS: readonly NavItem[] = [
  { key: 'feed', href: '/home', icon: HomeIcon },
  { key: 'library', href: '/library', icon: LibraryIcon },
]

/**
 * Shown in the profile menu. NOTE: hardcoded for now — wire to the real package
 * version at build (e.g. `next.config` `env: { NEXT_PUBLIC_APP_VERSION }`) so it
 * doesn't drift.
 */
export const APP_VERSION = '0.1.0'
