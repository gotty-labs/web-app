/**
 * Header above the feed sheet: the brand handheld console in 3D, over an elliptical
 * gradient from the primary color to the background (the apps' `FeedHero`). Each
 * section with more games pins one of the console's anchors with a callout that opens
 * that section.
 *
 * This shell stays in the home bundle and has a fixed size from the first paint (no
 * layout shift); the console itself (`HandheldViewer`, three.js) is a lazy client-only
 * chunk. The flat brand logo stands in while it loads, without WebGL, or on failure.
 */
'use client'

import { useCallback, useState } from 'react'
import dynamic from 'next/dynamic'

import { BrandMark } from '@/components/brand-mark'
import type { GameFeedSection } from '@/lib/domain/models'

import type { HandheldStatus } from './handheld-viewer'

const HandheldViewer = dynamic(() => import('./handheld-viewer').then((m) => m.HandheldViewer), {
  ssr: false,
})

export function FeedHero({
  sections,
  topInset,
  onOpenSection,
}: {
  sections: readonly GameFeedSection[]
  /** Height of the header floating over the hero's top: the model may use the space
   *  behind it, the callout chips and the fallback logo stay below it. */
  topInset: number
  onOpenSection: (section: GameFeedSection) => void
}) {
  const [status, setStatus] = useState<HandheldStatus | 'loading'>('loading')
  const handleStatusChange = useCallback((next: HandheldStatus) => setStatus(next), [])

  return (
    <div
      data-testid="feed.hero"
      className="relative size-full overflow-hidden bg-radial-[closest-side] from-primary to-background"
    >
      {status !== 'ready' && (
        <div className="absolute inset-x-0 top-(--feed-header-height) bottom-0 p-10">
          <BrandMark pixelated priority sizes="50vw" wrapperClassName="relative size-full" />
        </div>
      )}
      {status !== 'failed' && (
        <HandheldViewer
          sections={sections}
          topInset={topInset}
          onOpenSection={onOpenSection}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  )
}
