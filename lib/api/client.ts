/**
 * Base HTTP client for the JustGame backend.
 *
 * Responsibilities (Phase 1):
 *  - Build the absolute URL from `env.apiBaseUrl` (which already includes /api/v1).
 *  - Serialize query params (cursor pagination, array repeats like `consoleIds`).
 *  - Inject the mandatory `jg-*` headers (and optional Bearer token).
 *  - Expose Next 16's per-request cache controls (`cache`, `next: { revalidate, tags }`).
 *    Next 16 does NOT cache `fetch` by default, so the SEO render passes
 *    `next: { revalidate, tags }` while authenticated app calls leave them unset.
 *  - Funnel every response through `unwrap(schema)` for typed data or a typed throw.
 *
 * NOT in scope here (later phases):
 *  - Single-flight token refresh / 401 interceptor (Phase 2).
 *  - 429 backoff, 5xx/offline handling, retries (Phase 3).
 */
import { z } from 'zod'

import { type JgLanguage } from '@/lib/domain/enums'

import { env } from '../config/env'
import { unwrap } from './envelope'
import { buildHeaders } from './headers'

type QueryPrimitive = string | number | boolean
type QueryValue = QueryPrimitive | QueryPrimitive[] | null | undefined
export type Query = Record<string, QueryValue>

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

export interface ApiRequestOptions<T> {
  /** Path relative to the API base, e.g. `/game/feed` (no `/api/v1` prefix). */
  path: string
  /** Zod schema for the UNWRAPPED `data` payload (use `voidDataSchema` for void). */
  schema: z.ZodType<T>
  method?: HttpMethod
  query?: Query
  /** JSON-serializable request body. */
  body?: unknown
  /** Session JWT for protected routes. */
  token?: string
  language?: JgLanguage
  /** Next.js fetch cache mode (e.g. `force-cache`, `no-store`). */
  cache?: RequestCache
  /** Next.js ISR controls for cacheable (SEO) reads. */
  next?: { revalidate?: number | false; tags?: string[] }
  signal?: AbortSignal
}

function buildUrl(path: string, query?: Query): string {
  const base = env.apiBaseUrl.replace(/\/+$/, '')
  const rel = path.startsWith('/') ? path : `/${path}`
  const url = new URL(base + rel)

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue
      if (Array.isArray(value)) {
        for (const item of value) url.searchParams.append(key, String(item))
      } else {
        url.searchParams.set(key, String(value))
      }
    }
  }
  return url.toString()
}

/**
 * Perform a request and return the typed, unwrapped `data`.
 * Throws `ApiException` for business/error envelopes (branch on `internalCode`),
 * `ZodError` for contract-breaking payloads, or a plain error for non-JSON bodies.
 */
export async function apiRequest<T>(options: ApiRequestOptions<T>): Promise<T> {
  const {
    path,
    schema,
    method = 'GET',
    query,
    body,
    token,
    language,
    cache,
    next,
    signal,
  } = options

  const hasBody = body !== undefined

  const response = await fetch(buildUrl(path, query), {
    method,
    headers: buildHeaders({ token, language, hasBody }),
    body: hasBody ? JSON.stringify(body) : undefined,
    cache,
    next,
    signal,
  })

  let raw: unknown
  try {
    raw = await response.json()
  } catch {
    throw new Error(
      `JG API: expected a JSON envelope but got a non-JSON body (HTTP ${response.status}) from ${method} ${path}`,
    )
  }

  return unwrap(raw, schema)
}
