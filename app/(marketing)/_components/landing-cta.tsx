/**
 * Final call-to-action band: a bordered gradient panel with a centered glow,
 * closing headline and the big CTA into the `(app)` zone.
 */
import { ArrowRightIcon } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import type { Dictionary } from '@/lib/i18n'

import { Reveal } from './reveal'

export function LandingCta({ dict }: { dict: Dictionary }) {
  const { cta } = dict.app.landing

  return (
    <section className="px-6 pb-24 pt-8">
      <Reveal className="mx-auto w-full max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-linear-to-br from-primary/25 via-primary/10 to-transparent px-6 py-16 text-center sm:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 -z-10 h-64 w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/30 blur-[100px]"
          />
          <div className="mx-auto flex max-w-xl flex-col items-center gap-6">
            <h2 className="font-heading text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              {cta.title}
            </h2>
            <p className="text-pretty text-lg text-muted-foreground">{cta.subtitle}</p>
            <Button asChild size="lg" className="h-11 px-6 text-base">
              <Link href="/home">
                {cta.button}
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
