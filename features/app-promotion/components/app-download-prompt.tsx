/** Mobile-web promotion shown once per tab session from selected high-intent flows. */
'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { XIcon } from 'lucide-react'

import { AppImage } from '@/components/app-image'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'

import {
  APP_DOWNLOAD_HEADER_IMAGE,
  APP_STORE_BADGE_IMAGE,
  APP_STORE_URL,
  GOOGLE_PLAY_BADGE_IMAGE,
  GOOGLE_PLAY_URL,
} from '../config/app-download'
import { useAppPromotion } from '../hooks/use-app-promotion'
import { appPromotionStore } from '../stores/app-promotion-store'

export function AppDownloadPrompt() {
  const pathname = usePathname()
  const dict = useDictionary()
  const t = dict.app.appDownloadPrompt
  const { open, dismiss } = useAppPromotion()

  // Covers both client navigation and opening /library directly in a mobile tab.
  useEffect(() => {
    if (pathname === '/library') appPromotionStore.request()
  }, [pathname])

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => !nextOpen && dismiss()}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="max-h-[92svh] gap-0 overflow-y-auto rounded-t-3xl p-0"
      >
        <div className="relative h-52 shrink-0 overflow-hidden sm:h-64">
          <AppImage
            src={APP_DOWNLOAD_HEADER_IMAGE}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
            wrapperClassName="absolute inset-0"
          />
          <SheetClose asChild>
            <Button
              variant="secondary"
              size="pill-icon"
              className="absolute top-4 right-4"
              aria-label={dict.app.actions.close}
            >
              <XIcon />
            </Button>
          </SheetClose>
        </div>

        <SheetHeader className="items-center gap-3 px-6 pt-7 text-center">
          <SheetTitle className="font-heading text-2xl leading-tight font-semibold">
            {t.title}
          </SheetTitle>
          <SheetDescription className="max-w-md text-base leading-relaxed">
            {t.description}
          </SheetDescription>
        </SheetHeader>

        <SheetFooter className="mt-2 flex-row justify-center gap-4 px-6 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <Button asChild variant="ghost" className="h-11 w-32 shrink-0 p-0">
            <a href={APP_STORE_URL} target="_blank" rel="noreferrer" aria-label={t.appStoreLabel}>
              <AppImage
                src={APP_STORE_BADGE_IMAGE}
                alt={t.appStoreLabel}
                width={128}
                height={44}
                className="size-full"
                wrapperClassName="size-full bg-transparent"
              />
            </a>
          </Button>
          <Button asChild variant="ghost" className="h-11 w-32 shrink-0 p-0">
            <a
              href={GOOGLE_PLAY_URL}
              target="_blank"
              rel="noreferrer"
              aria-label={t.googlePlayLabel}
            >
              <AppImage
                src={GOOGLE_PLAY_BADGE_IMAGE}
                alt={t.googlePlayLabel}
                width={128}
                height={44}
                className="size-full"
                wrapperClassName="size-full bg-transparent"
              />
            </a>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
