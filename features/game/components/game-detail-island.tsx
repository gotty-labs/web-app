/**
 * Client island for the static SEO game page (Phase 5, Slice E).
 *
 * The `/games/[slug]` page is statically generated in the marketing zone, which has
 * NONE of the app providers. This island re-mounts just what the authed library
 * actions need — `I18nProvider` (dict passed as a prop, so no re-detection and no
 * dynamic rendering), `SessionProvider` (hydrates the token from localStorage), and a
 * dark `Toaster` for action feedback — scoped to this widget. The page stays static;
 * the island hydrates on the client.
 */
'use client'

import { Toaster } from '@/components/ui/sonner'
import { SessionProvider } from '@/features/auth'
import type { Dictionary, Locale } from '@/lib/i18n'
import { I18nProvider } from '@/lib/i18n/contexts/i18n-provider'

import { GameLibraryActions } from './game-library-actions'

export function GameDetailIsland({
  gameId,
  locale,
  dictionary,
}: {
  gameId: string
  locale: Locale
  dictionary: Dictionary
}) {
  return (
    <I18nProvider locale={locale} dictionary={dictionary}>
      <SessionProvider>
        <GameLibraryActions gameId={gameId} />
        <Toaster theme="dark" position="top-center" />
      </SessionProvider>
    </I18nProvider>
  )
}
