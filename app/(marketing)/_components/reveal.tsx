'use client'

/**
 * Scroll-reveal wrapper for below-the-fold landing sections — FAIL-OPEN by
 * design (SEO is the priority): the server HTML renders children fully
 * visible, and only after hydration do we hide elements that are still below
 * the viewport (the user can't see them, so there's no flash) and reveal them
 * on first intersection. If JS never runs (crawler snapshot, JS disabled,
 * broken hydration), the page simply shows everything. Styling is applied
 * imperatively via `classList` — it's purely presentational, needs no
 * re-render, and keeps the `react-hooks/set-state-in-effect` rule happy.
 */
import { useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

const HIDDEN_CLASSES = ['opacity-0', 'translate-y-6']

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  /** Stagger offset in ms, applied as a transition delay. */
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Already (partially) on screen → leave it visible, nothing to animate.
    if (node.getBoundingClientRect().top < window.innerHeight - 40) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.remove(...HIDDEN_CLASSES)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    )
    node.classList.add(...HIDDEN_CLASSES)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn('transition-all duration-700 ease-out', className)}
    >
      {children}
    </div>
  )
}
