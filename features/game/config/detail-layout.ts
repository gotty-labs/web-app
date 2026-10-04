/**
 * Game detail column geometry, shared by the content layout (with its ad rails) and the
 * sticky library bar so both edges line up at every breakpoint.
 */

/** Centered grid: a single column, plus a 250px ad rail on each side from 90rem. */
export const DETAIL_GRID_CLASS =
  'mx-auto grid w-full max-w-[96rem] grid-cols-1 gap-6 min-[90rem]:grid-cols-[250px_minmax(0,1fr)_250px]'

/** The content column inside `DETAIL_GRID_CLASS`, with its horizontal gutter. */
export const DETAIL_COLUMN_CLASS = 'w-full px-4 xl:px-0 min-[90rem]:col-start-2'
