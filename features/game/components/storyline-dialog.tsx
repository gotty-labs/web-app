/**
 * Storyline behind an info button: the description reads inline on the page, but the
 * (often long, spoiler-ish) storyline opens in a dialog so it doesn't flood the layout.
 * Uncontrolled Dialog (trigger-driven) — no local state, no effects.
 */
'use client'

import { BookOpenIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function StorylineDialog({
  storyline,
  title,
  triggerLabel,
}: {
  storyline: string
  title: string
  triggerLabel: string
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <BookOpenIcon data-icon="inline-start" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70svh] overflow-y-auto">
          <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
            {storyline}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
