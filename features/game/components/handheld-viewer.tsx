/**
 * The feed hero's interactive console (lazy chunk: only `FeedHero` imports it, through
 * `next/dynamic` with `ssr: false`, so three.js stays out of the server and every other
 * bundle). A drag turns it freely in any direction with inertia; the arrow keys turn it
 * in steps while it is focused. The wheel is never intercepted: over the hero it
 * scrolls the page like anywhere else.
 *
 * Renders on demand: a frame is drawn when the model loads, the viewport resizes, a
 * drag moves, or a spin is running — the rAF loop exists only while a spin does.
 */
'use client'

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'

import { useDictionary } from '@/lib/i18n/hooks/use-i18n'
import type { GameFeedSection } from '@/lib/domain/models'
import { cn } from '@/lib/utils'

import { HANDHELD_ANCHOR_ORDER } from '../config/handheld'
import { HandheldScene, type LoadedHandheld } from '../services/handheld-scene'
import { boundingRadius, createHandheldCamera } from '../utils/handheld-camera'
import {
  INITIAL_ROTATION,
  beginDrag,
  dragAngles,
  dragBy,
  endDrag,
  nudge,
  orientationAt,
  settle,
  spinEnd,
  type HandheldRotation,
  type Quat,
  type ScreenAngles,
} from '../utils/handheld-rotation'
import { layoutHeroCallouts, type HeroPin } from '../utils/hero-callouts'

import { FeedHeroCallouts } from './feed-hero-callouts'

/** One arrow-key press turns the console a twelfth of a half turn. */
const KEY_STEP = Math.PI / 12
const KEY_STEPS: Record<string, ScreenAngles> = {
  ArrowLeft: [-KEY_STEP, 0],
  ArrowRight: [KEY_STEP, 0],
  ArrowUp: [0, -KEY_STEP],
  ArrowDown: [0, KEY_STEP],
}
/** Release velocity is measured over the drag's last moments only. */
const VELOCITY_WINDOW_MS = 100

interface PointerSample {
  x: number
  y: number
  t: number
}

interface Drag {
  pointerId: number
  origin: PointerSample
  samples: PointerSample[]
}

export type HandheldStatus = 'ready' | 'failed'

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Sections with more games, in feed order, each on the next anchor of the console. */
function sectionPins(
  sections: readonly GameFeedSection[],
  anchors: LoadedHandheld['anchors'],
): HeroPin<GameFeedSection>[] {
  const pins: HeroPin<GameFeedSection>[] = []
  const withMore = sections.filter((section) => section.nextCursor)
  HANDHELD_ANCHOR_ORDER.forEach((name, index) => {
    const section = withMore[index]
    const anchor = anchors[name]
    if (section && anchor) pins.push({ id: name, anchor, value: section })
  })
  return pins
}

export function HandheldViewer({
  sections,
  topInset,
  onOpenSection,
  onStatusChange,
}: {
  sections: readonly GameFeedSection[]
  /** Height of the header floating over the top of the hero: chips stay below it. */
  topInset: number
  onOpenSection: (section: GameFeedSection) => void
  onStatusChange: (status: HandheldStatus) => void
}) {
  const t = useDictionary().app.feed.hero
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<HandheldScene | null>(null)
  const rotationRef = useRef<HandheldRotation>(INITIAL_ROTATION)
  const dragRef = useRef<Drag | null>(null)
  const frameRef = useRef<number | null>(null)
  const [model, setModel] = useState<LoadedHandheld | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [orientation, setOrientation] = useState<Quat>(INITIAL_ROTATION.resting)
  const [dragging, setDragging] = useState(false)

  // Scene lifetime: create the renderer, load the model, release the GPU on unmount.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const scene = HandheldScene.create(canvas)
    if (!scene) {
      onStatusChange('failed')
      return
    }
    sceneRef.current = scene
    scene.onContextLost(() => onStatusChange('failed'))
    const controller = new AbortController()
    scene
      .load(controller.signal)
      .then((loaded) => {
        setModel(loaded)
        onStatusChange('ready')
      })
      .catch(() => {
        if (!controller.signal.aborted) onStatusChange('failed')
      })
    return () => {
      controller.abort()
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
      frameRef.current = null
      sceneRef.current = null
      scene.dispose()
    }
  }, [onStatusChange])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize((current) =>
        current.width === width && current.height === height ? current : { width, height },
      )
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  const camera = useMemo(
    () =>
      model ? createHandheldCamera(size.width, size.height, boundingRadius(model.extents)) : null,
    [model, size.width, size.height],
  )

  // The only place a frame is drawn: after React commits the matching callouts, so the
  // console and its chips land in the same paint.
  useLayoutEffect(() => {
    if (camera) sceneRef.current?.render(camera.width, camera.height, orientation, camera.distance)
  }, [camera, orientation])

  /** Runs while a spin does, then settles it and stops. */
  const animate = useCallback(() => {
    if (frameRef.current !== null) return
    const step = (now: number) => {
      const rotation = rotationRef.current
      if (!rotation.spin) {
        frameRef.current = null
        return
      }
      if (now >= spinEnd(rotation.spin)) {
        rotationRef.current = settle(rotation)
        frameRef.current = null
        setOrientation(rotationRef.current.resting)
        return
      }
      setOrientation(orientationAt(rotation, now))
      frameRef.current = requestAnimationFrame(step)
    }
    frameRef.current = requestAnimationFrame(step)
  }, [])

  function stopAnimation() {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    frameRef.current = null
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!model || dragRef.current) return
    if (event.pointerType === 'mouse' && event.button !== 0) return
    // Chips take their own clicks; a drag only starts on the console's surface.
    if ((event.target as Element).closest('button')) return
    event.currentTarget.setPointerCapture(event.pointerId)
    const sample = { x: event.clientX, y: event.clientY, t: event.timeStamp }
    dragRef.current = { pointerId: event.pointerId, origin: sample, samples: [sample] }
    stopAnimation()
    rotationRef.current = beginDrag(rotationRef.current, event.timeStamp)
    setOrientation(rotationRef.current.resting)
    setDragging(true)
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const sample = { x: event.clientX, y: event.clientY, t: event.timeStamp }
    drag.samples = [...drag.samples.filter((s) => sample.t - s.t <= VELOCITY_WINDOW_MS), sample]
    const angles = dragAngles(sample.x - drag.origin.x, sample.y - drag.origin.y, size.height)
    rotationRef.current = dragBy(rotationRef.current, angles)
    setOrientation(rotationRef.current.resting)
  }

  function handlePointerEnd(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    dragRef.current = null
    setDragging(false)

    // px/s over the last moments; a pointer held still before release has no velocity.
    const recent = drag.samples.filter((s) => event.timeStamp - s.t <= VELOCITY_WINDOW_MS)
    const first = recent[0]
    const elapsed = first ? (event.timeStamp - first.t) / 1000 : 0
    const velocity: ScreenAngles =
      event.type === 'pointerup' && first && elapsed > 0
        ? dragAngles(
            (event.clientX - first.x) / elapsed,
            (event.clientY - first.y) / elapsed,
            size.height,
          )
        : [0, 0]
    rotationRef.current = endDrag(
      rotationRef.current,
      velocity,
      event.timeStamp,
      !prefersReducedMotion(),
    )
    if (rotationRef.current.spin) animate()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const angles = KEY_STEPS[event.key]
    if (!angles || !model) return
    event.preventDefault()
    stopAnimation()
    const animated = !prefersReducedMotion()
    rotationRef.current = nudge(rotationRef.current, angles, event.timeStamp, animated)
    if (rotationRef.current.spin) animate()
    else setOrientation(rotationRef.current.resting)
  }

  const callouts = useMemo(() => {
    if (!camera || !model) return []
    return layoutHeroCallouts({
      camera,
      orientation,
      pins: sectionPins(sections, model.anchors),
      viewportOffset: topInset,
      bounds: { width: size.width, height: Math.max(size.height - topInset, 0) },
    })
  }, [camera, model, orientation, sections, size.width, size.height, topInset])

  return (
    <div
      ref={containerRef}
      className={cn(
        'absolute inset-0 select-none',
        // Only once there is a console to turn: a touch drag on it rotates and never
        // scrolls. Before that (or on the fallback) the hero scrolls like the page.
        model && 'touch-none',
        model && (dragging ? 'cursor-grabbing' : 'cursor-grab'),
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onLostPointerCapture={handlePointerEnd}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        className={cn(
          'absolute inset-0 size-full transition-opacity duration-300 motion-reduce:transition-none',
          !model && 'opacity-0',
        )}
      />
      {/* The keyboard handle: the area below the header, where its focus ring shows. */}
      <div
        role="img"
        aria-label={t.consoleLabel}
        tabIndex={model ? 0 : -1}
        onKeyDown={handleKeyDown}
        style={{ top: topInset }}
        className="absolute inset-x-0 bottom-0 rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
      />
      {callouts.length > 0 && (
        <FeedHeroCallouts
          callouts={callouts}
          topInset={topInset}
          onOpen={(pin) => onOpenSection(pin.value)}
        />
      )}
    </div>
  )
}
