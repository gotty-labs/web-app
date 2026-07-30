import { createElement, type ComponentProps } from 'react'

import { getLibraryListIcon } from '../config/library-icons'

export function LibraryListIcon({
  icon,
  ...props
}: { icon: string } & Omit<ComponentProps<'svg'>, 'children'>) {
  const Icon = getLibraryListIcon(icon)
  return Icon ? (
    createElement(Icon, { 'aria-hidden': true, ...props })
  ) : (
    <span aria-hidden className="size-4 shrink-0" />
  )
}
