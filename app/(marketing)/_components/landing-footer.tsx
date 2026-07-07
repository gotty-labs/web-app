/**
 * Landing footer: brand + tagline, anchor nav mirroring the header, and the
 * copyright line. The year is baked at build time — fine for a static page
 * that redeploys regularly.
 */
import { Gamepad2Icon } from 'lucide-react'
import { DateTime } from 'luxon'
import Link from 'next/link'

import { Separator } from '@/components/ui/separator'
import type { Dictionary } from '@/lib/i18n'

export function LandingFooter({ dict }: { dict: Dictionary }) {
  const { brand, landing, actions } = dict.app
  const year = DateTime.now().year

  return (
    <footer className="border-t border-border/40 px-6 py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Gamepad2Icon className="size-4.5" />
              </span>
              <span className="font-heading text-lg font-bold tracking-tight">{brand.name}</span>
            </div>
            <p className="text-sm text-muted-foreground">{brand.tagline}</p>
          </div>

          <nav className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="transition-colors hover:text-foreground">
              {landing.nav.features}
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-foreground">
              {landing.nav.how}
            </a>
            <Link href="/home" className="transition-colors hover:text-foreground">
              {actions.enterApp}
            </Link>
          </nav>
        </div>

        <Separator className="bg-border/40" />

        <p className="text-xs text-muted-foreground">
          © {year} {brand.name}. {landing.footer.rights}
        </p>
      </div>
    </footer>
  )
}
