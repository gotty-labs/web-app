import type { Metadata } from 'next'

import { getDictionary } from '@/lib/i18n'

import { LegalPage } from '../../_components/legal-page'

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary('en')
  return { title: dict.app.legal.cookies.title, description: dict.app.legal.cookies.description }
}

export default async function CookiesPage() {
  const dict = await getDictionary('en')
  return (
    <LegalPage
      document={dict.app.legal.cookies}
      legal={dict.app.legal}
      privacySettingsAnchor
    />
  )
}
