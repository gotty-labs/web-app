/**
 * Public landing, shared by `/` (English) and `/es` (Spanish). Each route passes
 * a FIXED locale: never `getServerLocale()` (it reads `headers()` and would make
 * the page dynamic — see AGENTS.md i18n). All CTAs link into the `(app)` zone
 * (`/home`), which visitors enter as guests (see `AuthGate`).
 */
import type { Metadata } from 'next'

import { getDictionary, languageAlternates, localizedPath, type Locale } from '@/lib/i18n'

import { GenreMarquee } from './genre-marquee'
import { LandingCta } from './landing-cta'
import { LandingFeatures } from './landing-features'
import { LandingFooter } from './landing-footer'
import { LandingHeader } from './landing-header'
import { LandingHero } from './landing-hero'
import { LandingHowItWorks } from './landing-how-it-works'

export async function buildLandingMetadata(locale: Locale): Promise<Metadata> {
  const { landing } = (await getDictionary(locale)).app
  return {
    title: { absolute: landing.metaTitle },
    description: landing.heroSubtitle,
    alternates: { canonical: localizedPath('/', locale), languages: languageAlternates('/') },
  }
}

export async function LandingPage({ locale }: { locale: Locale }) {
  const dict = await getDictionary(locale)

  return (
    <div className="relative flex min-h-svh flex-col">
      <LandingHeader dict={dict} locale={locale} />
      <main className="flex-1">
        <LandingHero dict={dict} />
        <GenreMarquee dict={dict} />
        <LandingFeatures dict={dict} />
        <LandingHowItWorks dict={dict} />
        <LandingCta dict={dict} />
      </main>
      <LandingFooter dict={dict} locale={locale} path="/" />
    </div>
  )
}
