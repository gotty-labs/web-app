/**
 * Client providers for the static SEO game page. The `/games/[slug]` page is statically
 * generated in the marketing zone, which has NONE of the app providers; this shell
 * re-mounts just what its interactive pieces need around the server-rendered content —
 * `I18nProvider` (dict passed as a prop, so no re-detection and no dynamic rendering),
 * `SessionProvider` (hydrates the token from localStorage), the shared library state of
 * this game (read by the library actions and the achievements block), a dark `Toaster`
 * for action feedback, and the auth prompt guests reach from "Sign in to save" or an
 * achievement toggle. No guest session is bootstrapped here: SEO visitors only become
 * guests if they choose to in that prompt. The page stays static; this hydrates on the
 * client.
 */
'use client'

import type { ReactNode } from 'react'

import { Toaster } from '@/components/ui/sonner'
import { ErrorProvider } from '@/contexts/error-provider'
import { AuthPrompt, SessionProvider } from '@/features/auth'
import type { Dictionary, Locale } from '@/lib/i18n'
import { I18nProvider } from '@/lib/i18n/contexts/i18n-provider'

import { GameLibraryStateProvider } from '../contexts/game-library-state-provider'

export function GameDetailProviders({
  slug,
  locale,
  dictionary,
  children,
}: {
  slug: string
  locale: Locale
  dictionary: Dictionary
  children: ReactNode
}) {
  return (
    <I18nProvider locale={locale} dictionary={dictionary}>
      <ErrorProvider>
        <SessionProvider>
          <GameLibraryStateProvider slug={slug}>{children}</GameLibraryStateProvider>
          <Toaster theme="dark" position="top-center" />
          <AuthPrompt />
        </SessionProvider>
      </ErrorProvider>
    </I18nProvider>
  )
}
