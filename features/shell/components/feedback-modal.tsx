/**
 * Feedback (QA Chunk 1) — a Sheet opened from the sidebar "Options" group: bottom on
 * mobile, right on desktop. Type + free text with the app/system/locale auto-attached,
 * plus an optional reply email.
 *
 * NOTE (backend): there is NO feedback endpoint yet. `submit` is stubbed — it shows the
 * success toast and closes, but nothing is sent. Wire it to the real endpoint (e.g.
 * `POST /feedback` via `authedRequest`) once the contract exists.
 */
'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useIsMobile } from '@/hooks/use-mobile'
import { useSession } from '@/features/auth'
import { useDictionary, useLocale } from '@/lib/i18n/hooks/use-i18n'
import { cn } from '@/lib/utils'

import { APP_VERSION } from '../config/shell'

const MAX_LENGTH = 1000
const TYPES = ['idea', 'improvement', 'problem', 'other'] as const
type FeedbackType = (typeof TYPES)[number]

export function FeedbackModal({ onClose }: { onClose: () => void }) {
  const dict = useDictionary()
  const t = dict.app.feedback
  const locale = useLocale()
  const isMobile = useIsMobile()
  const { user } = useSession()

  const [type, setType] = useState<FeedbackType>('improvement')
  const [message, setMessage] = useState('')
  const [wantsReply, setWantsReply] = useState(true)
  const [email, setEmail] = useState(user?.email ?? '')
  const [pending, setPending] = useState(false)

  const system = typeof navigator !== 'undefined' ? navigator.userAgent : '—'

  const typeLabels: Record<FeedbackType, string> = {
    idea: t.typeIdea,
    improvement: t.typeImprovement,
    problem: t.typeProblem,
    other: t.typeOther,
  }

  async function submit() {
    setPending(true)
    try {
      // TODO(backend): send { type, message, wantsReply, email, meta:{app,system,locale} }
      // to the feedback endpoint. Stubbed until the contract exists.
      await Promise.resolve()
      toast.success(t.sentToast)
      onClose()
    } finally {
      setPending(false)
    }
  }

  return (
    <Sheet
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        // Cap height only on the mobile (bottom) sheet; the desktop (right) sheet is full height.
        className={cn('flex flex-col gap-0 sm:max-w-lg', isMobile && 'max-h-[90svh]')}
      >
        <SheetHeader>
          <SheetTitle>{t.title}</SheetTitle>
          <SheetDescription>{t.description}</SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4">
          <FieldGroup>
            <Field>
              <FieldLabel>{t.typeLabel}</FieldLabel>
              <ToggleGroup
                type="single"
                value={type}
                onValueChange={(value) => {
                  if (value) setType(value as FeedbackType)
                }}
                variant="outline"
                className="flex-wrap justify-start"
              >
                {TYPES.map((option) => (
                  <ToggleGroupItem key={option} value={option}>
                    {typeLabels[option]}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>

            <Field>
              <FieldLabel htmlFor="feedback-message">{t.messageLabel}</FieldLabel>
              <Textarea
                id="feedback-message"
                rows={5}
                maxLength={MAX_LENGTH}
                placeholder={t.messagePlaceholder}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <p className="text-muted-foreground self-end text-xs tabular-nums">
                {message.length} / {MAX_LENGTH}
              </p>
            </Field>

            <div className="rounded-lg border p-3">
              <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
                {t.metadataLabel}
              </p>
              <dl className="flex flex-col gap-1.5 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground shrink-0">{t.appField}</dt>
                  <dd className="truncate">{APP_VERSION}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground shrink-0">{t.systemField}</dt>
                  <dd className="truncate">{system}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground shrink-0">{t.localeField}</dt>
                  <dd className="truncate">{locale}</dd>
                </div>
              </dl>
              <p className="text-muted-foreground mt-2 text-xs">{t.privacyNote}</p>
            </div>

            <Field>
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="feedback-reply" className="font-normal">
                  {t.replyLabel}
                </Label>
                <Switch id="feedback-reply" checked={wantsReply} onCheckedChange={setWantsReply} />
              </div>
              {wantsReply && (
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label={t.emailPlaceholder}
                />
              )}
            </Field>
          </FieldGroup>
        </div>

        <SheetFooter>
          <Button onClick={submit} disabled={pending || message.trim().length === 0}>
            {pending && <Spinner data-icon="inline-start" />}
            {t.submit}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
