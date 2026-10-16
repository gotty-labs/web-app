/**
 * A news outlet's logo tile (from Gotty's bucket): the logo fills the whole rounded tile
 * (no backdrop showing around it), or — when the logo is missing or fails to load — the
 * outlet's monogram on a light tile (design: Paper "30 · Card · Nueva funcionalidad
 * noticias"). Radius and monogram size scale with the tile (16px in the source line,
 * 32px in the sheets, 56px on the image fallback).
 *
 * Logos are tiny badge-like icons, so this uses `next/image` directly (AppImage's
 * spinner would overflow them — see AGENTS.md "Images"), `unoptimized` so the file is
 * linked as-is instead of being proxied through Gotty's image optimizer.
 */
'use client'

import { useState } from 'react'
import Image from 'next/image'

import { cn } from '@/lib/utils'

import { sourceMonogram } from '../utils/rules'

export function SourceLogo({
  name,
  logoUrl,
  size,
  decorative = false,
  className,
}: {
  name: string
  logoUrl: string
  /** Tile size in px (square). */
  size: number
  /** Next to the visible name the logo adds nothing for screen readers. */
  decorative?: boolean
  className?: string
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const failed = !logoUrl || failedUrl === logoUrl
  const label = decorative ? undefined : name

  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ width: size, height: size, borderRadius: Math.round(size / 4) }}
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden leading-none font-extrabold',
        failed && 'bg-foreground text-background',
        className,
      )}
    >
      {failed ? (
        <span style={{ fontSize: Math.max(Math.round(size * 0.38), 6) }}>
          {sourceMonogram(name)}
        </span>
      ) : (
        <Image
          src={logoUrl}
          alt=""
          fill
          unoptimized
          sizes={`${size}px`}
          onError={() => setFailedUrl(logoUrl)}
          className="object-cover"
        />
      )}
    </span>
  )
}
