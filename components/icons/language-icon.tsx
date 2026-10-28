import type { GameLanguageCategory } from '@/lib/domain/enums'
import { cn } from '@/lib/utils'

/** Shared Moki Icon/language silhouettes, with state applied through currentColor. */
export function LanguageIcon({
  category,
  className,
}: {
  category: GameLanguageCategory
  className?: string
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-4 shrink-0', className)}
    >
      {category === 'AUDIO' ? (
        <>
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3" />
        </>
      ) : category === 'SUBTITLES' ? (
        <>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M7 15h4M15 15h2M7 11h2M13 11h4" />
        </>
      ) : (
        <>
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M2 8h20M6 4v4M10 4v4" />
        </>
      )}
    </svg>
  )
}
