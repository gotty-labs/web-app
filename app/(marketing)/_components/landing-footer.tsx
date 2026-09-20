/**
 * Landing footer: brand + tagline, anchor nav mirroring the header, and the
 * copyright line. The year is baked at build time — fine for a static page
 * that redeploys regularly.
 */
import { DateTime } from 'luxon'
import Link from 'next/link'

import { BrandMark } from '@/components/brand-mark'
import { Separator } from '@/components/ui/separator'
import type { Dictionary } from '@/lib/i18n'

import { PrivacySettingsLink } from './privacy-settings-link'

export function LandingFooter({ dict }: { dict: Dictionary }) {
  const { brand, landing, actions, legal } = dict.app
  const year = DateTime.now().year

  return (
    <footer className="border-t border-border/40 px-6 py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <BrandMark wrapperClassName="h-10 w-14" sizes="56px" />
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

        <div className="flex flex-col gap-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/privacy" className="transition-colors hover:text-foreground">
              {legal.links.privacy}
            </Link>
            <Link href="/terms" className="transition-colors hover:text-foreground">
              {legal.links.terms}
            </Link>
            <Link href="/cookies" className="transition-colors hover:text-foreground">
              {legal.links.cookies}
            </Link>
            <Link href="/account-deletion" className="transition-colors hover:text-foreground">
              {legal.links.accountDeletion}
            </Link>
            <Link href="/support" className="transition-colors hover:text-foreground">
              {legal.links.support}
            </Link>
            <PrivacySettingsLink label={legal.links.privacySettings} fallbackHref="/cookies#privacy-settings" />
          </nav>

          <p>
            © {year} {brand.name}. {landing.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  )
}
