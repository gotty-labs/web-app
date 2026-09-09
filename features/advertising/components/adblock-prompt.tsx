/** Global AdBlock notice: bottom sheet on mobile, compact centered dialog on desktop. */
'use client'

import { useSyncExternalStore } from 'react'

import { AppImage } from '@/components/app-image'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useIsMobile } from '@/hooks/use-mobile'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'
import { cn } from '@/lib/utils'

import { ADBLOCK_SUPPORT_HEADER_IMAGE } from '../config/adblock'
import { useAdBlockStatus } from '../hooks/use-adblock-status'
import { useAdvertising } from '../hooks/use-advertising'
import { adBlockPreferenceStore } from '../stores/adblock-store'

function AdBlockPromptBody({ mobile = false }: { mobile?: boolean }) {
  const t = useDictionary().app.adBlockPrompt

  return (
    <>
      <div className={cn('h-52', mobile && 'h-48')}>
        <AppImage
          src={ADBLOCK_SUPPORT_HEADER_IMAGE}
          alt=""
          fill
          priority
          sizes={mobile ? '100vw' : '28rem'}
          className="object-contain p-4"
          wrapperClassName="size-full bg-transparent"
        />
      </div>
      <div className="flex flex-col gap-6 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="flex flex-col gap-3 text-center">
          {mobile ? (
            <SheetHeader className="items-center gap-3 p-0">
              <SheetTitle className="font-heading text-2xl leading-tight font-semibold">
                {t.title}
              </SheetTitle>
              <SheetDescription className="text-base leading-relaxed">
                {t.description}
              </SheetDescription>
            </SheetHeader>
          ) : (
            <DialogHeader className="items-center gap-3">
              <DialogTitle className="font-heading text-2xl leading-tight font-semibold">
                {t.title}
              </DialogTitle>
              <DialogDescription className="text-base leading-relaxed">
                {t.description}
              </DialogDescription>
            </DialogHeader>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <Button size="lg" className="w-full" onClick={() => window.location.reload()}>
            {t.reload}
          </Button>
          <Button variant="ghost" className="w-full" onClick={adBlockPreferenceStore.continue}>
            {t.continue}
          </Button>
        </div>
      </div>
    </>
  )
}

export function AdBlockPrompt() {
  const advertising = useAdvertising()
  const isMobile = useIsMobile()
  const status = useAdBlockStatus(advertising.enabled)
  const continued = useSyncExternalStore(
    adBlockPreferenceStore.subscribe,
    adBlockPreferenceStore.getSnapshot,
    adBlockPreferenceStore.getServerSnapshot,
  )
  const open = advertising.enabled && status === 'blocked' && !continued

  if (isMobile) {
    return (
      <Sheet open={open}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          onEscapeKeyDown={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
          className="max-h-[92svh] gap-0 overflow-y-auto rounded-t-3xl p-0"
        >
          <AdBlockPromptBody mobile />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
        className="max-h-[calc(100svh-2rem)] max-w-md gap-0 overflow-y-auto p-0"
      >
        <AdBlockPromptBody />
      </DialogContent>
    </Dialog>
  )
}
