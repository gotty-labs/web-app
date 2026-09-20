import Link from 'next/link'

import { Separator } from '@/components/ui/separator'
import type { Dictionary } from '@/lib/i18n'

import { PrivacySettingsLink } from './privacy-settings-link'

type LegalDocument = Dictionary['app']['legal']['privacy']

export function LegalPage({
  document,
  legal,
  prefix = '',
  privacySettingsAnchor = false,
}: {
  document: LegalDocument
  legal: Dictionary['app']['legal']
  prefix?: '' | '/es'
  privacySettingsAnchor?: boolean
}) {
  const links = {
    privacy: `${prefix}/privacy`,
    terms: `${prefix}/terms`,
    cookies: `${prefix}/cookies`,
    accountDeletion: `${prefix}/account-deletion`,
    support: `${prefix}/support`,
  }
  const labels = legal.links

  return (
    <main className="flex-1 px-6 py-16 sm:py-24">
      <article className="mx-auto flex w-full max-w-3xl flex-col gap-10">
        <header className="flex flex-col gap-4">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{document.label}</p>
          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">{document.title}</h1>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">{document.description}</p>
          <p className="text-sm text-muted-foreground">{document.lastUpdated}</p>
        </header>

        <Separator className="bg-border/40" />

        <div className="flex flex-col gap-10">
          {document.sections.map((section) => (
            <section key={section.heading} className="flex flex-col gap-4">
              <h2 className="font-heading text-2xl font-semibold tracking-tight">{section.heading}</h2>
              <div className="flex flex-col gap-4 text-base leading-7 text-muted-foreground">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {section.bullets?.length ? (
                <ul className="flex list-disc flex-col gap-3 pl-6 text-base leading-7 text-muted-foreground">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        <Separator className="bg-border/40" />

        <nav
          id={privacySettingsAnchor ? 'privacy-settings' : undefined}
          aria-label={document.label}
          className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground"
        >
          <Link href={links.privacy} className="transition-colors hover:text-foreground">
            {labels.privacy}
          </Link>
          <Link href={links.terms} className="transition-colors hover:text-foreground">
            {labels.terms}
          </Link>
          <Link href={links.cookies} className="transition-colors hover:text-foreground">
            {labels.cookies}
          </Link>
          <Link href={links.accountDeletion} className="transition-colors hover:text-foreground">
            {labels.accountDeletion}
          </Link>
          <Link href={links.support} className="transition-colors hover:text-foreground">
            {labels.support}
          </Link>
          <PrivacySettingsLink
            label={labels.privacySettings}
            fallbackHref={`${links.cookies}#privacy-settings`}
          />
        </nav>
      </article>
    </main>
  )
}
