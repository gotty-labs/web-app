import { AppImage } from '@/components/app-image'
import { cn } from '@/lib/utils'

const BRAND_MARK_SRC = '/assets/images/app-icon-logo.png'

export function BrandMark({
  className,
  wrapperClassName,
  priority = false,
  sizes = '48px',
}: {
  className?: string
  wrapperClassName?: string
  priority?: boolean
  sizes?: string
}) {
  return (
    <AppImage
      src={BRAND_MARK_SRC}
      alt=""
      fill
      priority={priority}
      sizes={sizes}
      className={cn('object-contain', className)}
      wrapperClassName={cn('shrink-0 bg-transparent', wrapperClassName)}
    />
  )
}
