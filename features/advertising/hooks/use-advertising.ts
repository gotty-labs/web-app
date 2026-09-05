'use client'

import { useContext } from 'react'

import { AdvertisingContext } from '../contexts/advertising-provider'

export function useAdvertising() {
  return useContext(AdvertisingContext)
}
