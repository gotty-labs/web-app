/** Feedback Sheet: bottom on mobile, right on desktop. */
'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
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
import { useSession } from '@/features/auth'
import { sendFeedback } from '@/features/profile'
import { useIsMobile } from '@/hooks/use-mobile'
import { useReportError } from '@/hooks/use-report-error'
import { feedbackInputSchema } from '@/lib/domain/inputs'
import { feedbackTypeSchema, type FeedbackType } from '@/lib/domain/enums'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'
import { cn } from '@/lib/utils'

const MAX_LENGTH = 1000
const TYPES = feedbackTypeSchema.options

export function FeedbackModal({ onClose }: { onClose: () => void }) {
  const dict = useDictionary()
  const t = dict.app.feedback
  const isMobile = useIsMobile()
  const report = useReportError()
  const { user } = useSession()

  const [type, setType] = useState<FeedbackType>(feedbackTypeSchema.enum.improvement)
  const [message, setMessage] = useState('')
  const [wantsReply, setWantsReply] = useState(true)
  const [email, setEmail] = useState(user?.email ?? '')
  const [emailInvalid, setEmailInvalid] = useState(false)
  const [pending, setPending] = useState(false)

  const typeLabels: Record<FeedbackType, string> = {
    idea: t.typeIdea,
    improvement: t.typeImprovement,
    problem: t.typeProblem,
    other: t.typeOther,
  }

  async function submit() {
    if (pending) return

    const normalizedEmail = email.trim()
    const input = feedbackInputSchema.safeParse({
      type,
      message,
      wantsReply,
      ...(wantsReply && normalizedEmail ? { email: normalizedEmail } : {}),
    })
    if (!input.success) {
      setEmailInvalid(input.error.issues.some((issue) => issue.path[0] === 'email'))
      return
    }
    setEmailInvalid(false)

    setPending(true)
    try {
      await sendFeedback(input.data)
      toast.success(t.sentToast)
      onClose()
    } catch (error) {
      report(error)
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

            <Field data-invalid={emailInvalid || undefined}>
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="feedback-reply" className="font-normal">
                  {t.replyLabel}
                </Label>
                <Switch
                  id="feedback-reply"
                  checked={wantsReply}
                  onCheckedChange={(checked) => {
                    setWantsReply(checked)
                    if (!checked) setEmailInvalid(false)
                  }}
                />
              </div>
              {wantsReply && (
                <>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder={t.emailPlaceholder}
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value)
                      setEmailInvalid(false)
                    }}
                    aria-label={t.emailPlaceholder}
                    aria-invalid={emailInvalid || undefined}
                  />
                  {emailInvalid && <FieldError>{t.emailInvalid}</FieldError>}
                </>
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
