/**
 * Sticky translucent top bar for the landing: brand, anchor nav (desktop) and
 * the CTAs into the `(app)` zone. Server Component — copy comes from the dict.
 */
import Link from 'next/link'

import { BrandMark } from '@/components/brand-mark'
import { Button } from '@/components/ui/button'
import { localizedPath, type Dictionary, type Locale } from '@/lib/i18n'
import { discoveryPath } from '@/features/game/utils/discovery-path'

export function LandingHeader({
  dict,
  locale = 'en',
  sectionBase = '',
}: {
  dict: Dictionary
  locale?: Locale
  sectionBase?: string
}) {
  const { brand, landing, actions } = dict.app

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href={localizedPath('/', locale)} className="flex items-center gap-2.5">
          <BrandMark wrapperClassName="h-10 w-14" sizes="56px" priority />
          <span className="font-heading text-lg font-bold tracking-tight">{brand.name}</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href={`${sectionBase}#features`} className="transition-colors hover:text-foreground">
            {landing.nav.features}
          </a>
          <a
            href={`${sectionBase}#how-it-works`}
            className="transition-colors hover:text-foreground"
          >
            {landing.nav.how}
          </a>
          <Link href={discoveryPath(locale)} className="transition-colors hover:text-foreground">
            {landing.nav.discover}
          </Link>
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
