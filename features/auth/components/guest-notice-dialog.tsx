/**
 * Notice shown before continuing as a guest: what a guest gives up (more ads, no
 * library, lists, wishlist or progress) and a one-tap way to create a free account
 * instead. Stacks over the auth modal; dismissible unless the guest login is running.
 */
'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'

export function GuestNoticeDialog({
  open,
  pending,
  onOpenChange,
  onCreateAccount,
  onContinue,
}: {
  open: boolean
  pending: boolean
  onOpenChange: (open: boolean) => void
  onCreateAccount: () => void
  onContinue: () => void
}) {
  const t = useDictionary().app.auth.guestNotice

  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent showCloseButton={!pending} className="gap-6 sm:max-w-sm">
        <DialogHeader className="gap-3">
          <DialogTitle className="text-xl">{t.title}</DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
          <p className="text-sm font-semibold text-foreground">{t.accountBenefit}</p>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Button className="h-11 w-full rounded-xl" disabled={pending} onClick={onCreateAccount}>
            {t.createAccount}
          </Button>
          <Button variant="link" disabled={pending} onClick={onContinue}>
            {pending && <Spinner data-icon="inline-start" />}
            {t.continue}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
