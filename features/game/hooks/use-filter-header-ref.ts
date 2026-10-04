/** The sticky `FilterHeader` element's ref, or `null` outside the explore controller. */
'use client'

import { useContext } from 'react'

import { FilterHeaderContext } from '../contexts/filter-header-provider'

export function useFilterHeaderRef() {
  return useContext(FilterHeaderContext)
}
