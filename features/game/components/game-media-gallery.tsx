/**
 * Media gallery — surfaces everything the detail page used to hide (artworks,
 * screenshots and videos). In-page it shows a preview strip; a "see all" opens a
 * lightbox dialog with a shared stage (a large image, or a YouTube player embedded
 * so videos play WITHOUT leaving the site) plus a category-filterable thumbnail grid.
 *
 * The dialog is height-capped to the viewport (only the thumbnail rail scrolls, so it
 * never overflows the screen); the stage has prev/next arrows (also ← / → keyboard) and
 * a fullscreen control for images. Video ids are normalized on the server. Landscape
 * images use `igdbKind="screenshot"` so the loader fetches wide presets.
 */
'use client'

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, ExpandIcon, PlayIcon, ShrinkIcon } from 'lucide-react'

import { AppImage } from '@/components/app-image'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

import { youtubeEmbedUrl, youtubeThumbUrl } from '../utils/media'

type Category = 'artworks' | 'screenshots' | 'videos'

type MediaItem = { key: string; category: Category; kind: 'image' | 'video'; src: string }

type Labels = {
  title: string
  viewGallery: string
  all: string
  artworks: string
  screenshots: string
  videos: string
  play: string
  fullscreen: string
  previous: string
  next: string
}

function Thumb({
  item,
  label,
  sizeClass = 'aspect-video',
  className,
  onClick,
  overlay,
}: {
  item: MediaItem
  label: string
  /** Sizing utility for the tile. Fixed height in the scrollable dialog grid (an
   *  `aspect-ratio` box with a `fill` image collapses grid `auto` rows → overlap). */
  sizeClass?: string
  className?: string
  onClick: () => void
  overlay?: ReactNode
}) {
  const thumbSrc = item.kind === 'video' ? youtubeThumbUrl(item.src) : item.src
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'group relative overflow-hidden rounded-lg bg-muted ring-1 ring-border transition-all hover:ring-primary/50',
        sizeClass,
        className,
      )}
    >
      <AppImage
        src={thumbSrc}
        alt=""
        fill
        sizes="(max-width: 640px) 33vw, 200px"
        igdbKind="screenshot"
        wrapperClassName="absolute inset-0"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
      {item.kind === 'video' ? (
        <span className="absolute inset-0 flex items-center justify-center bg-black/25">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg">
            <PlayIcon className="size-4.5 translate-x-px fill-current" />
          </span>
        </span>
      ) : null}
      {overlay}
    </button>
  )
}

export function GameMediaGallery({
  artworks,
  screenshots,
  videoIds,
  labels,
}: {
  artworks: string[]
  screenshots: string[]
  videoIds: string[]
  labels: Labels
}) {
  const items = useMemo<MediaItem[]>(() => {
    const built: MediaItem[] = []
    screenshots.forEach((src, i) => built.push({ key: `s${i}`, category: 'screenshots', kind: 'image', src }))
    artworks.forEach((src, i) => built.push({ key: `a${i}`, category: 'artworks', kind: 'image', src }))
    videoIds.forEach((src, i) => built.push({ key: `v${i}`, category: 'videos', kind: 'video', src }))
    return built
  }, [artworks, screenshots, videoIds])

  const [open, setOpen] = useState(false)
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [filter, setFilter] = useState<Category | 'all'>('all')

  const filtered = useMemo(
    () => (filter === 'all' ? items : items.filter((item) => item.category === filter)),
    [items, filter],
  )
  const active = items.find((item) => item.key === activeKey) ?? items[0]

  const go = useCallback(
    (delta: number) => {
      if (filtered.length === 0) return
      const current = filtered.findIndex((item) => item.key === active?.key)
      const nextIndex = (((current === -1 ? 0 : current) + delta) % filtered.length + filtered.length) % filtered.length
      setActiveKey(filtered[nextIndex].key)
    },
    [filtered, active],
  )

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        go(1)
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        go(-1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, go])

  const [stage, setStage] = useState<HTMLDivElement | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === stage)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [stage])

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void stage?.requestFullscreen?.()
  }

  const categories: { id: Category | 'all'; label: string }[] = [
    { id: 'all', label: labels.all },
    ...(screenshots.length ? [{ id: 'screenshots' as const, label: labels.screenshots }] : []),
    ...(artworks.length ? [{ id: 'artworks' as const, label: labels.artworks }] : []),
    ...(videoIds.length ? [{ id: 'videos' as const, label: labels.videos }] : []),
  ]

  function openAt(key: string) {
    setActiveKey(key)
    setFilter('all')
    setOpen(true)
  }

  const preview = items.slice(0, 5)
  const remaining = items.length - preview.length

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {preview.map((item, index) => {
          const isLast = index === preview.length - 1
          return (
            <Thumb
              key={item.key}
              item={item}
              label={labels.viewGallery}
              onClick={() => openAt(item.key)}
              overlay={
                isLast && remaining > 0 ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-lg font-semibold text-white">
                    +{remaining}
                  </span>
                ) : undefined
              }
            />
          )
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[90svh] flex-col gap-3 sm:max-w-3xl lg:max-w-5xl">
          <DialogHeader>
            <DialogTitle>{labels.title}</DialogTitle>
          </DialogHeader>

          {active ? (
            <div
              ref={setStage}
              className="relative h-[40svh] shrink-0 overflow-hidden rounded-xl bg-black ring-1 ring-border sm:h-[46svh]"
            >
              {active.kind === 'video' ? (
                <iframe
                  key={active.key}
                  src={youtubeEmbedUrl(active.src)}
                  title={labels.play}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 size-full"
                />
              ) : (
                <AppImage
                  key={active.key}
                  src={active.src}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  igdbKind="screenshot"
                  wrapperClassName="absolute inset-0 !bg-transparent"
                  className="object-contain"
                />
              )}

              {active.kind === 'image' ? (
                <button
                  type="button"
                  aria-label={labels.fullscreen}
                  aria-pressed={isFullscreen}
                  onClick={toggleFullscreen}
                  className="absolute top-2 right-2 z-10 flex size-8 items-center justify-center rounded-lg bg-black/50 text-white ring-1 ring-white/20 transition-colors hover:bg-black/70"
                >
                  {isFullscreen ? (
                    <ShrinkIcon className="size-4" />
                  ) : (
                    <ExpandIcon className="size-4" />
                  )}
                </button>
              ) : null}

              {filtered.length > 1 ? (
                <>
                  <button
                    type="button"
                    aria-label={labels.previous}
                    onClick={() => go(-1)}
                    className="absolute top-1/2 left-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white ring-1 ring-white/20 transition-colors hover:bg-black/70"
                  >
                    <ChevronLeftIcon className="size-5" />
                  </button>
                  <button
                    type="button"
                    aria-label={labels.next}
                    onClick={() => go(1)}
                    className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white ring-1 ring-white/20 transition-colors hover:bg-black/70"
                  >
                    <ChevronRightIcon className="size-5" />
                  </button>
                </>
              ) : null}
            </div>
          ) : null}

          {categories.length > 2 ? (
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setFilter(category.id)}
                  className={cn(
                    'rounded-full px-3 py-1 text-sm font-medium ring-1 transition-colors',
                    filter === category.id
                      ? 'bg-primary text-primary-foreground ring-primary'
                      : 'bg-card text-muted-foreground ring-border hover:text-foreground',
                  )}
                >
                  {category.label}
                </button>
              ))}
            </div>
          ) : null}

          <div className="grid min-h-0 flex-1 grid-cols-3 content-start gap-2 overflow-y-auto overscroll-contain p-1 sm:grid-cols-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {filtered.map((item) => (
              <Thumb
                key={item.key}
                item={item}
                label={item.kind === 'video' ? labels.play : labels.viewGallery}
                sizeClass="h-20 sm:h-24"
                className={cn(active?.key === item.key && 'ring-2 ring-primary')}
                onClick={() => setActiveKey(item.key)}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
