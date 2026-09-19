/**
 * The app's image primitive — wraps `next/image` and shows a violet spinner while the
 * image loads (and fades the image in), for a consistent "loading" feel. Use this
 * everywhere instead of `next/image`/`<img>` directly (see AGENTS.md).
 *
 * Same props as `next/image`, plus `wrapperClassName` to size the wrapper. For `fill`
 * images pass a sized wrapper (e.g. `wrapperClassName="absolute inset-0"` inside a
 * positioned parent); for fixed `width`/`height` the wrapper hugs the image. Use
 * `wrapperStyle` when the wrapper itself needs an inline style, such as a media color.
 */
'use client'

import { useState, type CSSProperties } from 'react'
import Image, { type ImageProps } from 'next/image'

import { Spinner } from '@/components/ui/spinner'
import { igdbImageLoader, igdbScreenshotLoader, isIgdbImageUrl } from '@/lib/images/igdb'
import { cn } from '@/lib/utils'

export function AppImage({
  className,
  wrapperClassName,
  wrapperStyle,
  alt,
  igdbKind = 'cover',
  ...props
}: ImageProps & {
  wrapperClassName?: string
  wrapperStyle?: CSSProperties
  igdbKind?: 'cover' | 'screenshot'
}) {
  const [loaded, setLoaded] = useState(false)

  // IGDB assets are served straight from IGDB's CDN via a token-rewriting loader
  // (skips Vercel Image Optimization). `igdbKind` picks the size vocabulary: covers
  // (portrait) vs. landscape artworks/screenshots. Any other host keeps Next's optimizer.
  const loader =
    typeof props.src === 'string' && isIgdbImageUrl(props.src)
      ? igdbKind === 'screenshot'
        ? igdbScreenshotLoader
        : igdbImageLoader
      : undefined

  return (
    <span
      style={wrapperStyle}
      className={cn('bg-muted relative block overflow-hidden', wrapperClassName)}
    >
      {!loaded && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner className="text-primary size-5" />
        </span>
      )}
      <Image
        alt={alt}
        {...props}
        loader={loader}
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
