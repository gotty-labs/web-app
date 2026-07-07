/**
 * Sticky translucent top bar for the landing: brand, anchor nav (desktop) and
 * the CTAs into the `(app)` zone. Server Component — copy comes from the dict.
 */
import { Gamepad2Icon } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import type { Dictionary } from '@/lib/i18n'

export function LandingHeader({ dict }: { dict: Dictionary }) {
  const { brand, landing, actions } = dict.app

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Gamepad2Icon className="size-4.5" />
          </span>
          <span className="font-heading text-lg font-bold tracking-tight">{brand.name}</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#features" className="transition-colors hover:text-foreground">
            {landing.nav.features}
          </a>
          <a href="#how-it-works" className="transition-colors hover:text-foreground">
            {landing.nav.how}
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/home">{actions.signIn}</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/home">{actions.enterApp}</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
