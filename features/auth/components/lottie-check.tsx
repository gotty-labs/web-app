/**
 * Success check animation (§4.1 QA) — plays `completed_check.json` once. Used by the
 * "reset link sent" view so it feels like a real confirmation instead of plain text.
 *
 * The dotLottie player is canvas/WASM and can't run during SSR, so it's pulled in with
 * `next/dynamic` (`ssr: false`, allowed inside this client component). The animation is
 * served from `/public` via `src` rather than bundled into the JS.
 */
'use client'

import dynamic from 'next/dynamic'

const DotLottieReact = dynamic(
  () => import('@lottiefiles/dotlottie-react').then((m) => m.DotLottieReact),
  { ssr: false },
)

export function LottieCheck({ className }: { className?: string }) {
  return (
    <DotLottieReact
      src="/assets/animations/completed_check.json"
      autoplay
      loop={false}
      className={className}
    />
  )
}
