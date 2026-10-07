/**
 * The library screen for guests. The library is member-only, so instead of loading it
 * the whole screen becomes an invitation to sign in that opens the auth prompt.
 */
'use client'

import { CircleUserRoundIcon, LibraryBigIcon } from 'lucide-react'

import { AppTopBar } from '@/components/app-top-bar'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { authPromptStore } from '@/features/auth'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'

export function LibraryGuestState() {
  const dict = useDictionary()
  const t = dict.app.library

  return (
    <>
      <AppTopBar />
      <main className="flex flex-col gap-6 p-4 md:p-6">
        <Empty className="min-h-96 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LibraryBigIcon />
            </EmptyMedia>
            <EmptyTitle>{t.guestTitle}</EmptyTitle>
            <EmptyDescription>{t.guestDescription}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={authPromptStore.show}>
              <CircleUserRoundIcon data-icon="inline-start" />
              {dict.app.actions.signIn}
            </Button>
          </EmptyContent>
        </Empty>
      </main>
    </>
  )
}
