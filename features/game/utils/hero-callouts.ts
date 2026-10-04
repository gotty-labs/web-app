/**
 * Lays the feed hero's callout chips out in two columns beside the console, like
 * callouts on a technical drawing — the web port of the apps' `FeedHeroCalloutLayout`.
 * Each chip goes to the side its anchor is on, columns stay ordered by anchor height,
 * and chips are pushed apart vertically so they never overlap. The side follows the
 * anchor on screen, so a chip changes column only when its anchor crosses the middle.
 */
import { projectAnchor, type HandheldAnchor, type HandheldCamera } from './handheld-camera'
import type { Quat } from './handheld-rotation'

/** A pin shows once its anchor faces the camera past this dot product… */
export const PIN_FACING_HIDDEN = 0.3
/** …and is fully opaque from this one: a narrow band reads as a transition. */
export const PIN_FACING_VISIBLE = 0.4
/** A callout takes clicks and focus only once it is at least half visible. */
export const PIN_INTERACTIVE_VISIBILITY = 0.5

/** Hit diameter of a chip: the 36 px marker plus its padding. */
export const CALLOUT_CHIP_DIAMETER = 44
/** Minimum distance between two chip centers in a column: hit diameter + 4. */
export const CALLOUT_SPACING = 48

export interface HeroPin<T> {
  id: string
  anchor: HandheldAnchor
  value: T
}

export interface Point {
  x: number
  y: number
}

export interface HeroCallout<T> {
  pin: HeroPin<T>
  /** In the chips' area coordinates. */
  anchorPoint: Point
  chipPoint: Point
  /** From `0`, just turned toward the camera, to `1`, clearly facing it. */
  visibility: number
  interactive: boolean
}

export interface HeroCalloutLayoutInput<T> {
  camera: HandheldCamera
  orientation: Quat
  pins: readonly HeroPin<T>[]
  /** How far the camera's viewport starts above the chips' area, in CSS px. */
  viewportOffset: number
  /** The chips' area (`H` is its height). */
  bounds: { width: number; height: number }
  /** Extra horizontal distance between each column and the console, in CSS px. */
  columnGap?: number
}

interface Visible<T> {
  pin: HeroPin<T>
  point: Point
  facing: number
}

/** Chips that fit in one column: `floor((H − 44) / 48) + 1`. */
export function columnCapacity(height: number): number {
  if (height < CALLOUT_CHIP_DIAMETER) return 0
  return Math.floor((height - CALLOUT_CHIP_DIAMETER) / CALLOUT_SPACING) + 1
}

/**
 * Keeps each chip as close to its anchor's height as possible while keeping
 * `CALLOUT_SPACING` between neighbors and staying inside `[22, H − 22]`.
 */
export function spreadColumn(desired: readonly number[], height: number): number[] {
  const top = CALLOUT_CHIP_DIAMETER / 2
  const bottom = height - CALLOUT_CHIP_DIAMETER / 2
  const heights = [...desired]
  for (let i = 0; i < heights.length; i++) {
    const previous = i > 0 ? heights[i - 1] + CALLOUT_SPACING : top
    heights[i] = Math.max(heights[i], previous)
  }
  for (let i = heights.length - 1; i >= 0; i--) {
    const next = i < heights.length - 1 ? heights[i + 1] - CALLOUT_SPACING : bottom
    heights[i] = Math.min(heights[i], next)
  }
  return heights
}

function column<T>(items: Visible<T>[], x: number, height: number): HeroCallout<T>[] {
  const sorted = [...items].sort((a, b) => a.point.y - b.point.y)
  const heights = spreadColumn(
    sorted.map((item) => item.point.y),
    height,
  )
  return sorted.map((item, i) => {
    const progress = (item.facing - PIN_FACING_HIDDEN) / (PIN_FACING_VISIBLE - PIN_FACING_HIDDEN)
    const visibility = Math.min(progress, 1)
    return {
      pin: item.pin,
      anchorPoint: item.point,
      chipPoint: { x, y: heights[i] },
      visibility,
      interactive: visibility >= PIN_INTERACTIVE_VISIBILITY,
    }
  })
}

export function layoutHeroCallouts<T>({
  camera,
  orientation,
  pins,
  viewportOffset,
  bounds,
  columnGap = 0,
}: HeroCalloutLayoutInput<T>): HeroCallout<T>[] {
  const center = { x: camera.width / 2, y: camera.height / 2 - viewportOffset }
  const visible: Visible<T>[] = []
  for (const pin of pins) {
    const projection = projectAnchor(camera, orientation, pin.anchor)
    if (projection.facing <= PIN_FACING_HIDDEN) continue
    visible.push({
      pin,
      point: { x: projection.x, y: projection.y - viewportOffset },
      facing: projection.facing,
    })
  }

  // Outermost anchors first, so balancing moves the most central ones to the other column.
  const capacity = columnCapacity(bounds.height)
  const left = visible.filter((v) => v.point.x < center.x).sort((a, b) => a.point.x - b.point.x)
  const right = visible.filter((v) => v.point.x >= center.x).sort((a, b) => b.point.x - a.point.x)
  const overflow = (from: Visible<T>[], to: Visible<T>[]) => {
    while (from.length > capacity) {
      const moved = from.pop()
      if (moved) to.push(moved)
    }
  }
  overflow(left, right)
  overflow(right, left)

  const radius = CALLOUT_CHIP_DIAMETER / 2
  const columnOffset = camera.screenRadius + radius + columnGap
  const leftX = Math.max(center.x - columnOffset, radius)
  const rightX = Math.min(center.x + columnOffset, bounds.width - radius)
  return [
    ...column(left.slice(0, capacity), leftX, bounds.height),
    ...column(right.slice(0, capacity), rightX, bounds.height),
  ]
}
