/**
 * Public landing (`/`) — the static, SEO-friendly entry point (marketing zone).
 *
 * A Server Component that reads the dictionary at the DEFAULT locale only: it must
 * NOT call `getServerLocale()` (that reads `headers()` and would force dynamic
 * rendering, breaking SSG of this zone — see AGENTS.md i18n). The CTA links into the
 * `(app)` zone (`/home`), where `AuthGate` handles authentication via the modal.
 */
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { getDictionary, defaultLocale } from '@/lib/i18n'

export default async function LandingPage() {
  const dict = await getDictionary(defaultLocale)
  const { brand, landing, actions } = dict.app

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between px-6 py-4 sm:px-10">
        <span className="font-heading text-lg font-semibold tracking-tight">{brand.name}</span>
        <Button asChild size="sm">
          <Link href="/home">{actions.enterApp}</Link>
        </Button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
        <div className="flex max-w-2xl flex-col items-center gap-5">
          <h1 className="font-heading text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            {landing.heroTitle}
          </h1>
          <p className="max-w-xl text-pretty text-lg text-muted-foreground">
            {landing.heroSubtitle}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/home">{landing.primaryCta}</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/home">{landing.secondaryCta}</Link>
          </Button>
        </div>
      </main>

      <footer className="px-6 py-6 text-center text-sm text-muted-foreground">
        {brand.tagline}
      </footer>
    </div>
  )
}
