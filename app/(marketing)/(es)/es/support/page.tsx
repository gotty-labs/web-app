import type { Metadata } from 'next'

import { getDictionary } from '@/lib/i18n'

import { LegalPage } from '../../../_components/legal-page'

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary('es')
  return { title: dict.app.legal.support.title, description: dict.app.legal.support.description }
}

export default async function SupportPage() {
  const dict = await getDictionary('es')
  return <LegalPage document={dict.app.legal.support} legal={dict.app.legal} prefix="/es" />
}
