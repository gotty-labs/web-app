'use client'

import { AppImage } from '@/components/app-image'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDictionary, useLocale } from '@/lib/i18n/hooks/use-i18n'

import { MAINTENANCE_HEADER_IMAGE } from '../config/maintenance'
import { formatMaintenanceEnd } from '../utils/format-maintenance-end'

export function MaintenanceModal({ open }: { open: boolean }) {
  const locale = useLocale()
  const t = useDictionary().app.maintenance
  const expectedReturn = formatMaintenanceEnd(locale)

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
        className="max-h-[calc(100svh-2rem)] max-w-md gap-0 overflow-y-auto p-0"
      >
        <div className="h-52">
          <AppImage
            src={MAINTENANCE_HEADER_IMAGE}
            alt=""
            fill
            priority
            sizes="28rem"
            className="object-contain p-4"
            wrapperClassName="size-full bg-transparent"
          />
        </div>
        <div className="flex flex-col gap-6 px-6 pb-6">
          <DialogHeader className="items-center gap-3 text-center sm:text-center">
            <DialogTitle>{t.title}</DialogTitle>
            <DialogDescription>
              {t.description} {t.availability.replace('{time}', expectedReturn)}
            </DialogDescription>
          </DialogHeader>
          <Button size="lg" className="w-full" onClick={() => window.location.reload()}>
            {t.retry}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
