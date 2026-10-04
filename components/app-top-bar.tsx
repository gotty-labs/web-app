/**
 * Sticky top bar for the authenticated zone (QA Chunk 1). Hosts the sidebar toggle
 * (a hamburger with a Ctrl/⌘+B hint on hover — the same shortcut the provider binds)
 * and an optional `children` slot the page fills — on /home that's the search bar, so
 * search shares the row with the toggle instead of living in the sidebar.
 *
 * Lives in top-level `components/` (not a feature) because it's cross-feature chrome:
 * game/profile screens render it, and putting it in `features/shell` would create a
 * shell↔profile↔game import cycle. Must be inside `SidebarProvider` (uses `useSidebar`)
 * and `ConsoleVisibilityProvider` (both mounted by `AppShell`).
 */
'use client'

import { type CSSProperties, type ReactNode, type Ref } from 'react'
import { MenuIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useConsoleVisibility } from '@/hooks/use-console-visibility'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'
import { cn } from '@/lib/utils'

export function AppTopBar({
  children,
  trailing,
  panel,
  balanced = false,
  className,
  contentClassName,
  contentStyle,
  headerRef,
}: {
  children?: ReactNode
  /** Trailing action; it also balances the leading sidebar toggle. */
  trailing?: ReactNode
  panel?: ReactNode
  balanced?: boolean
  className?: string
  contentClassName?: string
  contentStyle?: CSSProperties
  headerRef?: Ref<HTMLElement>
}) {
  const { toggleSidebar } = useSidebar()
  const { appliedConsoleCount } = useConsoleVisibility()
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
              className="relative shrink-0"
            >
              <MenuIcon />
              {/* While the sidebar is off-canvas, flags that its console visibility item
                  limits the feed (that item shows the count). */}
              {appliedConsoleCount > 0 && (
                <Badge aria-hidden className="absolute top-1 right-1 size-2 p-0 md:hidden" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Ctrl / ⌘ + B</TooltipContent>
        </Tooltip>
        {children}
        {trailing ?? (balanced && <span aria-hidden className="hidden size-8 shrink-0 sm:block" />)}
      </div>
      {panel && <div className="absolute inset-x-0 top-full">{panel}</div>}
    </header>
  )
}
