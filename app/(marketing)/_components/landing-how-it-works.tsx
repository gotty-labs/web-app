/**
 * "How it works" — three numbered steps with a fading connector line between
 * step markers on desktop. Steps come from the dictionary as an array (schema
 * enforces exactly 3), staggered in via `Reveal`.
 */
import type { Dictionary } from '@/lib/i18n'

import { Reveal } from './reveal'

export function LandingHowItWorks({ dict }: { dict: Dictionary }) {
  const { how } = dict.app.landing

  return (
    <section id="how-it-works" className="scroll-mt-24 border-t border-border/40 px-6 py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-14">
        <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="font-heading text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            {how.title}
          </h2>
          <p className="text-pretty text-lg text-muted-foreground">{how.subtitle}</p>
        </Reveal>

        <div className="grid gap-12 md:grid-cols-3 md:gap-8">
          {how.steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 120}>
              <div className="relative flex flex-col gap-4">
                {index < how.steps.length - 1 && (
                  <div
                    aria-hidden
                    className="absolute left-14 top-5 hidden h-px w-[calc(100%-2rem)] bg-linear-to-r from-border to-transparent md:block"
                  />
                )}
                <span className="flex size-10 items-center justify-center rounded-full border border-primary/40 bg-primary/10 font-heading text-sm font-bold text-primary">
                  {`0${index + 1}`}
                </span>
                <div className="flex flex-col gap-2">
                  <h3 className="font-heading text-lg font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
