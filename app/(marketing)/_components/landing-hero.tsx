/**
 * Hero: badge + headline (gradient accent) + CTAs + the CSS-only app mock.
 * Entrance animations are pure CSS (`tw-animate-css` enter utilities on
 * wrapper divs), so the section stays a Server Component. Background = faint
 * grid pattern (masked radially) + a violet glow derived from `--primary`.
 */
import { ArrowRightIcon, SparklesIcon } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import type { Dictionary } from '@/lib/i18n'

import { HeroAppMock } from './hero-app-mock'

export function LandingHero({ dict }: { dict: Dictionary }) {
  const { landing } = dict.app

  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-32 sm:pt-40">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
        <div className="absolute left-1/2 top-[-12rem] h-[36rem] w-[64rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-16">
        <div className="flex max-w-3xl flex-col items-center gap-6 text-center">
          <div className="animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards duration-700">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-xs font-medium">
              <SparklesIcon className="size-3.5 text-primary" />
              {landing.heroBadge}
            </span>
          </div>

          <h1 className="animate-in fade-in slide-in-from-bottom-6 fill-mode-backwards duration-700 animation-delay-100 font-heading text-balance text-4xl font-bold tracking-tight sm:text-6xl">
            {landing.heroTitleLead}{' '}
            <span className="bg-linear-to-r from-primary to-[color-mix(in_oklch,var(--primary),white_45%)] bg-clip-text text-transparent">
              {landing.heroTitleAccent}
            </span>
          </h1>

          <p className="animate-in fade-in slide-in-from-bottom-6 fill-mode-backwards duration-700 animation-delay-200 max-w-xl text-pretty text-lg text-muted-foreground">
            {landing.heroSubtitle}
          </p>

          <div className="animate-in fade-in slide-in-from-bottom-6 fill-mode-backwards duration-700 animation-delay-300 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-11 px-6 text-base">
              <Link href="/home">
                {landing.primaryCta}
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-11 px-6 text-base">
              <a href="#how-it-works">{landing.secondaryCta}</a>
            </Button>
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-8 fill-mode-backwards duration-1000 animation-delay-300 w-full">
          <HeroAppMock dict={dict} />
        </div>
      </div>
    </section>
  )
}
