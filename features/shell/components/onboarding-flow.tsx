/**
 * Mandatory first-run onboarding. It uses Dialog for its focus trap and inert
 * background, but presents as a full-screen takeover on mobile and a large,
 * editorial split view on desktop.
 *
 * The user can only finish from the fourth step. Escape, overlay clicks and other
 * dismissal gestures are intentionally blocked; the persisted flag is written by
 * the final CTA only.
 */
'use client'

import { useRef, useState, useSyncExternalStore, type SyntheticEvent } from 'react'
import { ArrowRightIcon } from 'lucide-react'

import { BrandMark } from '@/components/brand-mark'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'

import { ONBOARDING_VIDEO_CHECKPOINTS, ONBOARDING_VIDEO_SRC } from '../config/onboarding'
import { onboardingStore } from '../stores/onboarding-store'

const LAST_STEP_INDEX = ONBOARDING_VIDEO_CHECKPOINTS.length - 1
type VideoLoadState = 'loading' | 'ready' | 'failed'

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function OnboardingFlow() {
  const dict = useDictionary()
  const t = dict.app.onboarding
  const videoRef = useRef<HTMLVideoElement>(null)
  const targetTimeRef = useRef<number>(ONBOARDING_VIDEO_CHECKPOINTS[0])
  const [stepIndex, setStepIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const [videoLoadState, setVideoLoadState] = useState<VideoLoadState>('loading')
  const seen = useSyncExternalStore(
    onboardingStore.subscribe,
    onboardingStore.getSnapshot,
    onboardingStore.getServerSnapshot,
  )

  if (seen) return null

  const step = t.steps[stepIndex]
  const isLastStep = stepIndex === LAST_STEP_INDEX
  const progress = ((stepIndex + 1) / t.steps.length) * 100
  const stepLabel = t.stepLabel
    .replace('{current}', String(stepIndex + 1))
    .replace('{total}', String(t.steps.length))

  function showCheckpoint(video: HTMLVideoElement, targetTime: number) {
    targetTimeRef.current = targetTime

    if (prefersReducedMotion()) {
      video.currentTime = targetTime
      setIsTransitioning(false)
      return
    }

    setIsTransitioning(true)
    void video.play().catch(() => {
      video.currentTime = targetTime
      setIsTransitioning(false)
    })
  }

  function handleLoadedMetadata(event: SyntheticEvent<HTMLVideoElement>) {
    const video = event.currentTarget
    video.currentTime = 0
    showCheckpoint(video, ONBOARDING_VIDEO_CHECKPOINTS[0])
  }

  function handleTimeUpdate(event: SyntheticEvent<HTMLVideoElement>) {
    const video = event.currentTarget
    if (!isTransitioning || video.currentTime < targetTimeRef.current - 0.04) return

    video.pause()
    video.currentTime = targetTimeRef.current
    setIsTransitioning(false)
  }

  function handleVideoError() {
    setVideoLoadState('failed')
    setIsTransitioning(false)
  }

  function handleContinue() {
    if (isLastStep) {
      onboardingStore.markSeen()
      return
    }

    const nextStepIndex = stepIndex + 1
    setStepIndex(nextStepIndex)

    const video = videoRef.current
    if (!video) {
      setIsTransitioning(false)
      return
    }

    showCheckpoint(video, ONBOARDING_VIDEO_CHECKPOINTS[nextStepIndex])
  }

  return (
    <Dialog open>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
        className="bg-onboarding-media-background inset-0 top-0 left-0 h-svh max-h-none w-screen max-w-none translate-x-0 translate-y-0 gap-0 overflow-hidden rounded-none p-0 sm:top-1/2 sm:left-1/2 sm:h-[min(90svh,48rem)] sm:w-[min(calc(100vw-3rem),70rem)] sm:max-w-6xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{step.title}</DialogTitle>
          <DialogDescription>{step.description}</DialogDescription>
        </DialogHeader>

        <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)] md:grid-rows-1">
          <div className="bg-onboarding-media-background relative isolate flex min-h-0 items-center justify-center overflow-hidden">
            <div className="absolute inset-[15%] rounded-full bg-primary/10 blur-3xl" />
            <video
              ref={videoRef}
              aria-hidden="true"
              tabIndex={-1}
              muted
              playsInline
              preload="auto"
              className="relative h-full w-full object-contain"
              onLoadedMetadata={handleLoadedMetadata}
              onLoadedData={() => setVideoLoadState('ready')}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsTransitioning(false)}
              onError={handleVideoError}
            >
              <source src={ONBOARDING_VIDEO_SRC} type="video/mp4" />
            </video>

            {videoLoadState !== 'ready' ? (
              <div className="bg-onboarding-media-background absolute inset-0 z-10 flex items-center justify-center">
                {videoLoadState === 'loading' ? (
                  <Spinner className="text-primary size-7" />
                ) : (
                  <BrandMark priority wrapperClassName="size-16" sizes="64px" />
                )}
              </div>
            ) : null}
          </div>

          <section className="bg-onboarding-media-background flex min-h-0 flex-col gap-6 px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8 sm:py-8 md:justify-between md:px-10 md:py-10">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <BrandMark priority wrapperClassName="size-8" sizes="32px" />
                <span className="font-pixel text-lg leading-none">Gotty</span>
              </div>
              <span className="text-xs font-medium text-muted-foreground">{stepLabel}</span>
            </div>

            <div className="flex min-h-0 flex-1 flex-col justify-center" aria-live="polite">
              <div
                key={stepIndex}
                className="flex flex-col gap-3 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2"
              >
                <p className="font-pixel text-sm tracking-wide text-primary uppercase">
                  {step.eyebrow}
                </p>
                <h2 className="max-w-lg font-heading text-3xl leading-tight font-semibold text-balance sm:text-4xl">
                  {step.title}
                </h2>
                <p className="max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {step.description}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Progress value={progress} aria-label={stepLabel} />
              <Button
                size="pill"
                disabled={isTransitioning}
                onClick={handleContinue}
                className="w-full md:w-auto md:self-end"
              >
                {isLastStep ? t.finish : t.next}
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
