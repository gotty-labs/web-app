import type { Metadata } from 'next'

import { getDictionary } from '@/lib/i18n'

import { LegalPage } from '../../_components/legal-page'

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary('en')
  return {
    title: dict.app.legal.accountDeletion.title,
    description: dict.app.legal.accountDeletion.description,
  }
}

export default async function AccountDeletionPage() {
  const dict = await getDictionary('en')
  return <LegalPage document={dict.app.legal.accountDeletion} legal={dict.app.legal} />
}
