'use client'

import { useSyncExternalStore } from 'react'

import { maintenanceStore } from '@/lib/api/maintenance'

export function useMaintenanceStatus(): boolean {
  return useSyncExternalStore(
    maintenanceStore.subscribe,
    maintenanceStore.getSnapshot,
    maintenanceStore.getServerSnapshot,
  )
}
