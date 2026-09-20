import type { Metadata } from 'next'

import { getDictionary } from '@/lib/i18n'

import { LegalPage } from '../../../_components/legal-page'

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary('es')
  return { title: dict.app.legal.terms.title, description: dict.app.legal.terms.description }
}

export default async function TermsPage() {
  const dict = await getDictionary('es')
  return <LegalPage document={dict.app.legal.terms} legal={dict.app.legal} prefix="/es" />
}
