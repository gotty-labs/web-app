/**
 * Public landing (`/`) — the static, SEO-friendly entry point (marketing zone).
 *
 * A Server Component that reads the dictionary at the DEFAULT locale only: it must
 * NOT call `getServerLocale()` (that reads `headers()` and would force dynamic
 * rendering, breaking SSG of this zone — see AGENTS.md i18n). All CTAs link into
 * the `(app)` zone (`/home`), where `AuthGate` handles authentication via the modal.
 *
 * Sections live in `_components/` (non-routable): sticky header → hero with a
 * CSS-only app mock → genre marquee → features bento → how-it-works → CTA → footer.
 */
import type { Metadata } from 'next'

import { getDictionary, defaultLocale } from '@/lib/i18n'

import { GenreMarquee } from './_components/genre-marquee'
import { LandingCta } from './_components/landing-cta'
import { LandingFeatures } from './_components/landing-features'
import { LandingFooter } from './_components/landing-footer'
import { LandingHeader } from './_components/landing-header'
import { LandingHero } from './_components/landing-hero'
import { LandingHowItWorks } from './_components/landing-how-it-works'

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(defaultLocale)
  return { description: dict.app.landing.heroSubtitle }
}

export default async function LandingPage() {
  const dict = await getDictionary(defaultLocale)

  return (
    <div className="relative flex min-h-svh flex-col">
      <LandingHeader dict={dict} />
      <main className="flex-1">
        <LandingHero dict={dict} />
        <GenreMarquee dict={dict} />
        <LandingFeatures dict={dict} />
        <LandingHowItWorks dict={dict} />
        <LandingCta dict={dict} />
      </main>
      <LandingFooter dict={dict} />
    </div>
  )
}
