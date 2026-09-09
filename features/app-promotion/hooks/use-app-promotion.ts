'use client'

import { useSyncExternalStore } from 'react'

import { appPromotionStore } from '../stores/app-promotion-store'

export function useAppPromotion() {
  const open = useSyncExternalStore(
    appPromotionStore.subscribe,
    appPromotionStore.getSnapshot,
    appPromotionStore.getServerSnapshot,
  )

  return {
    open,
    dismiss: appPromotionStore.dismiss,
  }
}
