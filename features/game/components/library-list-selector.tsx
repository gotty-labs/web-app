'use client'

import { useRef, type MouseEvent, type PointerEvent } from 'react'
import { Layers3Icon, PlusIcon, Trash2Icon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { GameLibraryList } from '@/lib/domain/models'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'
import { cn } from '@/lib/utils'

import { LibraryListIcon } from './library-list-icon'

interface DragState {
  active: boolean
  moved: boolean
  pointerId: number
  scrollLeft: number
  startX: number
}

export function LibraryListSelector({
  lists,
  selectedListId,
  loading,
  onSelect,
  onCreate,
  onDelete,
}: {
  lists: GameLibraryList[]
  selectedListId?: string
  loading: boolean
  onSelect: (listId?: string) => void
  onCreate: () => void
  onDelete: (list: GameLibraryList) => void
}) {
  const t = useDictionary().app.library
  const scrollRef = useRef<HTMLDivElement>(null)
  const suppressClickRef = useRef(false)
  const dragRef = useRef<DragState>({
    active: false,
    moved: false,
    pointerId: -1,
    scrollLeft: 0,
    startX: 0,
  })

  function startDragging(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse' || event.button !== 0) return
    dragRef.current = {
      active: true,
      moved: false,
      pointerId: event.pointerId,
      scrollLeft: event.currentTarget.scrollLeft,
      startX: event.clientX,
    }
  }

  function dragScroll(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag.active || drag.pointerId !== event.pointerId) return
    const distance = event.clientX - drag.startX
    if (!drag.moved && Math.abs(distance) > 4) {
      drag.moved = true
      suppressClickRef.current = true
      event.currentTarget.setPointerCapture(event.pointerId)
    }
    if (drag.moved) {
      event.preventDefault()
      event.currentTarget.scrollLeft = drag.scrollLeft - distance
    }
  }

  function stopDragging(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag.active || drag.pointerId !== event.pointerId) return
    drag.active = false
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    if (drag.moved) {
      window.setTimeout(() => {
        suppressClickRef.current = false
      }, 0)
    }
  }

  function suppressDraggedClick(event: MouseEvent<HTMLDivElement>) {
    if (!suppressClickRef.current) return
    event.preventDefault()
    event.stopPropagation()
    suppressClickRef.current = false
  }

  return (
    <div
      ref={scrollRef}
      onClickCapture={suppressDraggedClick}
      onPointerDown={startDragging}
      onPointerMove={dragScroll}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      className="-mx-4 cursor-grab touch-pan-x overflow-x-auto px-4 py-1 select-none active:cursor-grabbing [scrollbar-width:none] md:-mx-6 md:px-6 [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex min-w-max items-center gap-2" role="group" aria-label={t.listsLabel}>
        {loading ? (
          <>
            <Skeleton className="h-8 w-28 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </>
        ) : null}

        {!loading ? (
          <Button
            type="button"
            size="sm"
            variant={selectedListId ? 'secondary' : 'default'}
            aria-pressed={!selectedListId}
            onClick={() => onSelect(undefined)}
            className={cn('rounded-full transition-transform', !selectedListId && 'scale-[1.03]')}
          >
            <Layers3Icon data-icon="inline-start" />
            {t.allLists}
          </Button>
        ) : null}

        {!loading &&
          lists.map((list) => {
            const selected = selectedListId === list.id
            return (
              <div
                key={list.id}
                className={cn(
                  'group/list flex items-center rounded-full border-2 bg-muted transition-transform',
                  selected ? 'scale-[1.03]' : 'border-transparent',
                )}
                style={{
                  borderColor: selected ? list.hexColor : undefined,
                  backgroundColor: selected ? `${list.hexColor}1A` : undefined,
                }}
              >
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  aria-pressed={selected}
                  onClick={() => onSelect(list.id)}
                  className="rounded-full"
                >
                  <span
                    aria-hidden
                    className="size-2 rounded-full"
                    style={{ backgroundColor: list.hexColor }}
                  />
                  <LibraryListIcon icon={list.icon} />
                  {list.name}
                </Button>
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  aria-label={`${t.deleteList}: ${list.name}`}
                  onClick={() => onDelete(list)}
                  className={cn(
                    'mr-0.5 rounded-full opacity-0 transition-opacity group-focus-within/list:opacity-100 group-hover/list:opacity-100',
                    selected && 'opacity-100',
                  )}
                >
                  <Trash2Icon />
                </Button>
              </div>
            )
          })}

        {!loading ? (
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            className="rounded-full"
            aria-label={t.newList}
            onClick={onCreate}
          >
            <PlusIcon />
          </Button>
        ) : null}
      </div>
    </div>
  )
}
