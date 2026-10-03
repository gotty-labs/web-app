/**
 * Client island for the static SEO game page (Phase 5, Slice E).
 *
 * The `/games/[slug]` page is statically generated in the marketing zone, which has
 * NONE of the app providers. This island re-mounts just what the library actions
 * need — `I18nProvider` (dict passed as a prop, so no re-detection and no dynamic
 * rendering), `SessionProvider` (hydrates the token from localStorage), a dark
 * `Toaster` for action feedback, and the app-download sheet guests reach from Save —
 * scoped to this widget. The page stays static; the island hydrates on the client.
 */
'use client'

import { Toaster } from '@/components/ui/sonner'
import { ErrorProvider } from '@/contexts/error-provider'
import { AppDownloadPrompt } from '@/features/app-promotion'
import { SessionProvider } from '@/features/auth'
import type { Dictionary, Locale } from '@/lib/i18n'
import { I18nProvider } from '@/lib/i18n/contexts/i18n-provider'

import type { GameAddedMetadata } from '../utils/analytics'

import { GameLibraryActions } from './game-library-actions'

export function GameDetailIsland({
  game,
  slug,
  cover,
  rating,
  locale,
  dictionary,
}: {
  game: GameAddedMetadata
  slug: string
  /** Cover and formatted score for the sticky bar. */
  cover: string
  rating?: string
  locale: Locale
  dictionary: Dictionary
}) {
  return (
    <I18nProvider locale={locale} dictionary={dictionary}>
      <ErrorProvider>
        <SessionProvider>
          <GameLibraryActions game={game} slug={slug} cover={cover} rating={rating} />
          <Toaster theme="dark" position="top-center" />
          <AppDownloadPrompt />
        </SessionProvider>
      </ErrorProvider>
    </I18nProvider>
  )
}
