/**
 * Pinned hero with the feed in a sheet over it — the web translation of the apps'
 * `FeedSheetLayout`, built on the document's own scroll so the wheel, trackpad momentum,
 * touch and keyboard all stay native (nothing here listens to wheel or touch, and no
 * scroll is ever prevented or re-timed).
 *
 * - The hero is `sticky` at the top of the page, under the floating `FilterHeader`.
 * - The sheet follows it in normal flow, so it rises over the hero exactly 1:1 with the
 *   scroll until its top reaches the header's bottom; past that, the feed keeps
 *   scrolling under the header. Scrolling back reverses it.
 * - The layout pulls itself up by the header's live height, so it always starts at the
 *   top of the document: the header compressing on scroll never moves the sheet.
 * - A passive scroll listener (one rAF per frame, no React render) only fades the hero
 *   out during the last header-height of travel and lets the header turn transparent
 *   while the hero is behind it.
 * - On touch-only devices, CSS `scroll-snap-type: y proximity` (globals.css) settles the
 *   sheet on its collapsed or expanded position after a fling; wheels and trackpads never
 *   snap.
 */
'use client'

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

import { useFilterHeaderRef } from '../hooks/use-filter-header-ref'

export function FeedSheetLayout({
  hero,
  children,
}: {
  /** Receives the header's height, which floats over the top of the hero. */
  hero: (headerHeight: number) => ReactNode
  children: ReactNode
}) {
  const headerRef = useFilterHeaderRef()
  const rootRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLElement>(null)
  const [headerHeight, setHeaderHeight] = useState(0)

  // Layout effect: the first measurement lands before the first paint (no shift).
  useLayoutEffect(() => {
    const header = headerRef?.current
    const root = rootRef.current
    const heroElement = heroRef.current
    const sheet = sheetRef.current
    if (!header || !root || !heroElement || !sheet) return

    let frame: number | null = null
    const update = () => {
      frame = null
      const headerBox = header.getBoundingClientRect()
      const sheetTop = sheet.getBoundingClientRect().top
      // Fully opaque until the sheet is one header height away from the header, then
      // fades out linearly, so nothing of the hero shows behind the header.
      const distance = sheetTop - headerBox.bottom
      const opacity =
        headerBox.height > 0 ? Math.min(Math.max(distance / headerBox.height, 0), 1) : 1
      heroElement.style.opacity = String(opacity)
      // Hidden also takes the faded hero's chips out of the tab order.
      heroElement.style.visibility = opacity > 0 ? '' : 'hidden'
      header.toggleAttribute('data-over-hero', distance > 0)
    }
    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(update)
    }

    const observer = new ResizeObserver(([entry]) => {
      // Fractional (not `offsetHeight`, which rounds): the offset must cancel exactly.
      const height = entry.borderBoxSize[0]?.blockSize ?? header.getBoundingClientRect().height
      root.style.setProperty('--feed-header-height', `${height}px`)
      setHeaderHeight(height)
      update()
    })
    observer.observe(header, { box: 'border-box' })
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    update()

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame !== null) cancelAnimationFrame(frame)
      header.removeAttribute('data-over-hero')
    }
  }, [headerRef])

  return (
    <div
      ref={rootRef}
      data-slot="feed-sheet-layout"
      // Hero height: 35% of the (small) viewport on mobile, like the apps; on desktop
      // the same share clamped to 20–28rem, so a short window still frames the console
      // and its callouts and a tall one keeps the first carousels above the fold.
      // `svh` never changes while mobile browser bars collapse, so nothing jumps.
      // `overflow-anchor: none`: the layout keeps its own place while the header
      // compresses; scroll anchoring would otherwise "correct" the scroll for the frame
      // in which the header shrank before the offset follows, breaking the 1:1 rise.
      className="relative -mt-(--feed-header-height) [overflow-anchor:none] [--feed-header-height:calc(var(--filter-header-expanded-height)+1px)] [--feed-hero-height:35svh] md:[--feed-hero-height:clamp(--spacing(80),35svh,--spacing(112))]"
    >
      <div ref={heroRef} className="sticky top-0 h-(--feed-hero-height)">
        {hero(headerHeight)}
      </div>

      <section
        ref={sheetRef}
        data-slot="feed-sheet"
        // At least one (large) viewport tall, so it always rises up to the header, even
        // while loading, empty or in error.
        className="relative z-10 flex min-h-lvh flex-col rounded-t-2xl bg-background"
      >
        {/* Shadow on the top edge only: clipped at the sides and the bottom, no seam. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 rounded-t-2xl shadow-sheet [clip-path:inset(-100%_0_0_0)]"
        />
        {/* Decorative grabber, only where the sheet is dragged with a finger. */}
        <div
          aria-hidden
          className="mx-auto my-3 hidden h-1.25 w-9 shrink-0 rounded-full bg-input pointer-coarse:block"
        />
        {children}
      </section>
    </div>
  )
}
