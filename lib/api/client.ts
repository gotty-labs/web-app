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
 */
import { z } from 'zod'

import { type JgLanguage } from '@/lib/domain/enums'

import { env } from '../config/env'
import { ApiException, unwrap } from './envelope'
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

  let raw: unknown = null
  let jsonParseFailed = false
  try {
    raw = await response.json()
  } catch {
    jsonParseFailed = true
  }

  // Enveloped error (carries a stable internalCode) → typed ApiException via unwrap.
  const isEnvelopedError =
    typeof raw === 'object' &&
    raw !== null &&
    (raw as { success?: unknown }).success === false
  if (isEnvelopedError) return unwrap(raw, schema)

  // Non-2xx WITHOUT our envelope (e.g. 429 throttler, 5xx, gateway/proxy) → synthesize an
  // ApiException from the HTTP status, so the classifier (rateLimit/server) and retryOn429 work.
  if (!response.ok) {
    throw new ApiException({
      success: false,
      status: response.status,
      error: response.status >= 500 ? 'INTERNAL_ERROR' : 'BAD_REQUEST',
      errorInfo: { reason: `HTTP ${response.status} from ${method} ${path}` },
    })
  }

  if (jsonParseFailed) {
    throw new Error(
      `JG API: expected a JSON envelope but got a non-JSON body (HTTP ${response.status}) from ${method} ${path}`,
    )
  }

  return unwrap(raw, schema)
}
