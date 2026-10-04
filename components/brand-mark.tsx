import { AppImage } from '@/components/app-image'
import { cn } from '@/lib/utils'

const BRAND_MARK_SRC = '/assets/images/app-icon-logo.png'

export function BrandMark({
  className,
  wrapperClassName,
  priority = false,
  sizes = '48px',
  pixelated = false,
}: {
  className?: string
  wrapperClassName?: string
  priority?: boolean
  sizes?: string
  /** Pixel art at its source pixels, scaled nearest-neighbor (no resampling blur). */
  pixelated?: boolean
}) {
  return (
    <AppImage
      src={BRAND_MARK_SRC}
      alt=""
      fill
      priority={priority}
      sizes={sizes}
      unoptimized={pixelated}
      className={cn('object-contain', pixelated && '[image-rendering:pixelated]', className)}
      wrapperClassName={cn('shrink-0 bg-transparent', wrapperClassName)}
    />
  )
}
