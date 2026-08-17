/** Reads filter options shared by the explore controller and its child surfaces. */
'use client'

import { useContext } from 'react'

import { FilterOptionsContext } from '../contexts/filter-options-context'

export function useCurrentFilterOptions() {
  return useContext(FilterOptionsContext)
}
