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

import { type CSSProperties, type ReactNode, type Ref } from 'react'
import { MenuIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'
import { cn } from '@/lib/utils'

export function AppTopBar({
  children,
  panel,
  balanced = false,
  className,
  contentClassName,
  contentStyle,
  headerRef,
}: {
  children?: ReactNode
  panel?: ReactNode
  balanced?: boolean
  className?: string
  contentClassName?: string
  contentStyle?: CSSProperties
  headerRef?: Ref<HTMLElement>
}) {
  const { toggleSidebar } = useSidebar()
  const dict = useDictionary()

  return (
    <header
      ref={headerRef}
      className={cn(
        'bg-background/95 sticky top-0 z-30 border-b pt-[env(safe-area-inset-top)] backdrop-blur-sm',
        className,
      )}
    >
      <div
        className={cn(
          'flex min-h-14 items-center gap-2 px-3 transition-[min-height,padding] duration-200 md:px-4',
          contentClassName,
        )}
        style={contentStyle}
      >
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
        {balanced && <span aria-hidden className="hidden size-8 shrink-0 sm:block" />}
      </div>
      {panel && <div className="absolute inset-x-0 top-full">{panel}</div>}
    </header>
  )
}
