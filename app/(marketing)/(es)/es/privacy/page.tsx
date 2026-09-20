import type { Metadata } from 'next'

import { getDictionary } from '@/lib/i18n'

import { LegalPage } from '../../../_components/legal-page'

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary('es')
  return { title: dict.app.legal.privacy.title, description: dict.app.legal.privacy.description }
}

export default async function PrivacyPage() {
  const dict = await getDictionary('es')
  return <LegalPage document={dict.app.legal.privacy} legal={dict.app.legal} prefix="/es" />
}
