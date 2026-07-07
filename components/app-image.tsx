/**
 * The app's image primitive — wraps `next/image` and shows a violet spinner while the
 * image loads (and fades the image in), for a consistent "loading" feel. Use this
 * everywhere instead of `next/image`/`<img>` directly (see AGENTS.md).
 *
 * Same props as `next/image`, plus `wrapperClassName` to size the wrapper. For `fill`
 * images pass a sized wrapper (e.g. `wrapperClassName="absolute inset-0"` inside a
 * positioned parent); for fixed `width`/`height` the wrapper hugs the image.
 */
'use client'

import { useState } from 'react'
import Image, { type ImageProps } from 'next/image'

import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

export function AppImage({
  className,
  wrapperClassName,
  alt,
  ...props
}: ImageProps & { wrapperClassName?: string }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <span className={cn('bg-muted relative block overflow-hidden', wrapperClassName)}>
      {!loaded && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner className="text-primary size-5" />
        </span>
      )}
      <Image
        alt={alt}
        {...props}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={cn(
          'transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
          className,
        )}
      />
    </span>
  )
}
