/**
 * Top navigation over the detail hero: the Gotty mark, linking into the app (`/home`).
 * Without it a visitor landing on a game from search had no way into the rest of the
 * catalog. Server-safe: a plain link, copy from the dict.
 */
import Link from 'next/link'

import { BrandMark } from '@/components/brand-mark'
import type { Dictionary } from '@/lib/i18n'

export function GameDetailHeader({ dict }: { dict: Dictionary }) {
  return (
    <nav className="absolute inset-x-0 top-0 z-10 pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-16 max-w-5xl items-center px-4 md:px-8">
        <Link
          href="/home"
          aria-label={dict.app.detail.backToHome}
          className="flex items-center gap-2.5"
        >
          <BrandMark wrapperClassName="h-10 w-14" sizes="56px" priority />
          <span className="font-heading text-lg font-bold tracking-tight">
            {dict.app.brand.name}
          </span>
        </Link>
      </div>
    </nav>
  )
}
