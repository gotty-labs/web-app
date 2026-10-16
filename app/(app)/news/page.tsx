/**
 * News — gaming news from the main Spanish and English outlets, resolved by the backend
 * for the user's language and source filter. Private zone (noindex via the `(app)`
 * layout); thin mount of the news feature's `NewsView`.
 */
import type { Metadata } from 'next'

import { NewsView } from '@/features/news'
import { getDictionary } from '@/lib/i18n'
import { getServerLocale } from '@/lib/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getDictionary(await getServerLocale())
  // `absolute`: the copy already carries the "· Gotty" suffix the root template would add.
  return { title: { absolute: dictionary.app.news.page.documentTitle } }
}

export default function NewsPage() {
  return <NewsView />
}
