/**
 * Home feed loader (Phase 5, Slice C). Fetches the Netflix-style sections once on
 * mount via `getFeed()` (authed, client-side — the access token lives in
 * localStorage, so the feed can't be fetched on the server).
 *
 * setState happens only inside the async `.then`/`.catch` (and the `reload` event
 * handler), never synchronously in the effect body — that's what keeps the React 19
 * `set-state-in-effect` rule happy (same pattern as `useStartup`). `reload` bumps a
 * nonce to re-run the effect.
 */
'use client'

import { useEffect, useState } from 'react'

import type { GameFeedSection } from '@/lib/domain/models'

import { getFeed } from '../services/catalog'

export interface FeedState {
  loading: boolean
  sections: GameFeedSection[]
  error: unknown
}

export function useFeed(): FeedState & { reload: () => void } {
  const [state, setState] = useState<FeedState>({ loading: true, sections: [], error: null })
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    let active = true
    getFeed()
      .then((sections) => {
        if (active) setState({ loading: false, sections, error: null })
      })
      .catch((error) => {
        if (active) setState({ loading: false, sections: [], error })
      })
    return () => {
      active = false
    }
  }, [nonce])

  function reload() {
    setState({ loading: true, sections: [], error: null })
    setNonce((n) => n + 1)
  }

  return { ...state, reload }
}
