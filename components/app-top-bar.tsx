/**
 * Sticky top bar for the authenticated zone (QA Chunk 1). Hosts the sidebar toggle
 * (a hamburger with a Ctrl/⌘+B hint on hover — the same shortcut the provider binds)
 * and an optional `children` slot the page fills — on /home that's the search bar, so
 * search shares the row with the toggle instead of living in the sidebar.
 *
 * Lives in top-level `components/` (not a feature) because it's cross-feature chrome:
 * game/profile screens render it, and putting it in `features/shell` would create a
 * shell↔profile↔game import cycle. Must be inside `SidebarProvider` (uses `useSidebar`).
 */
'use client'

import { type ReactNode } from 'react'
import { MenuIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'

export function AppTopBar({ children }: { children?: ReactNode }) {
  const { toggleSidebar } = useSidebar()
  const dict = useDictionary()

  return (
    <header className="bg-background/95 sticky top-0 z-30 flex h-14 items-center gap-2 border-b px-3 backdrop-blur-sm md:px-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            aria-label={dict.app.nav.toggleSidebar}
            className="shrink-0"
          >
            <MenuIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Ctrl / ⌘ + B</TooltipContent>
      </Tooltip>
      {children}
    </header>
  )
}
