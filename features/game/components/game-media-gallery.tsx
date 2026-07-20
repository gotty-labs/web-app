/**
 * Media gallery — surfaces everything the detail page used to hide (artworks,
 * screenshots and videos). In-page it shows a preview strip; a "see all" opens a
 * lightbox dialog with a shared stage (a large image, or a YouTube player embedded
 * so videos play WITHOUT leaving the site) plus a category-filterable thumbnail grid.
 *
 * Video ids are normalized on the server (invalid ones dropped) so this component just
 * embeds them. Landscape images use `igdbKind="screenshot"` so the IGDB loader fetches
 * wide presets rather than cropped portrait covers.
 */
'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { PlayIcon } from 'lucide-react'

import { AppImage } from '@/components/app-image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
}

function Thumb({
  item,
  label,
  className,
  onClick,
  overlay,
}: {
  item: MediaItem
  label: string
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
        'group relative aspect-video overflow-hidden rounded-lg bg-muted ring-1 ring-border transition-all hover:ring-primary/50',
        className,
      )}
    >
      <AppImage
        src={thumbSrc}
        alt=""
        fill
        sizes="(max-width: 640px) 33vw, 240px"
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

  const active = items.find((item) => item.key === activeKey) ?? items[0]
  const filtered = filter === 'all' ? items : items.filter((item) => item.category === filter)

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
        <DialogContent className="sm:max-w-3xl lg:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{labels.title}</DialogTitle>
          </DialogHeader>

          {active ? (
            <div className="relative aspect-video overflow-hidden rounded-xl bg-black ring-1 ring-border">
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
                  wrapperClassName="absolute inset-0"
                  className="object-contain"
                />
              )}
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

          <div className="grid max-h-[45svh] grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
            {filtered.map((item) => (
              <Thumb
                key={item.key}
                item={item}
                label={item.kind === 'video' ? labels.play : labels.viewGallery}
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
