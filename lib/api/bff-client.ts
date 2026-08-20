/**
 * Contract for calling our OWN Next.js BFF route handlers (`/api/*`), as the
 * sibling of `apiRequest` (which is the contract for the Gotty backend).
 *
 * Differences from `apiRequest`, and why this exists instead of reusing it:
 *  - Same-origin, relative paths — NOT under `env.apiBaseUrl` (`/api/v1`).
 *  - No `gt-*` headers / no `Authorization` (the httpOnly cookie travels on its own).
 *  - BFF responses are plain JSON (`{ ... }` on success, `{ error, internalCode }`
 *    on failure) — NOT the backend's `ApiResponse`/`ApiError` envelope.
 *
 * On a non-2xx it throws a typed `BffError` carrying the stable `internalCode`
 * forwarded by the route handler, so callers can branch on it (§3) just like with
 * `ApiException`.
 */
import { z } from 'zod'

export class BffError extends Error {
  constructor(
    readonly status: number,
    readonly internalCode?: number,
    readonly errorType?: string,
    message?: string,
  ) {
    super(message ?? `BFF request failed (${status})`)
    this.name = 'BffError'
  }
}

export interface BffRequestOptions<T> {
  /** Same-origin path, e.g. `/api/auth/login`. */
  path: string
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  /** Optional schema to validate the success payload. */
  schema?: z.ZodType<T>
  signal?: AbortSignal
}

export async function bffRequest<T>(options: BffRequestOptions<T>): Promise<T> {
  const { path, method = 'POST', body, schema, signal } = options
  const hasBody = body !== undefined

  const response = await fetch(path, {
    method,
    headers: hasBody ? { 'content-type': 'application/json' } : undefined,
    body: hasBody ? JSON.stringify(body) : undefined,
    signal,
  })

  const data = (await response.json().catch(() => null)) as
    (Record<string, unknown> & { error?: string; internalCode?: number; reason?: string }) | null

  if (!response.ok || data === null) {
    throw new BffError(response.status, data?.internalCode, data?.error, data?.reason)
  }

  return schema ? schema.parse(data) : (data as T)
}
