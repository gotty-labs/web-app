/**
 * Backoff-with-jitter retry for rate limiting (§1.6). The backend throttles
 * (3/s, 20/10s, 100/60s) and returns 429; retrying blindly makes it worse, so we
 * wait with exponential backoff + jitter and only retry 429s (and optionally 5xx).
 *
 * Opt-in: wrap a call with `retryOn429(() => apiRequest(...))`. It is NOT baked
 * into `apiRequest` so the caller decides what's safe to retry (GETs, idempotent
 * writes) — never blindly retry a non-idempotent mutation.
 */
import { ApiException } from "./envelope";

export interface RetryOptions {
  maxAttempts?: number; // total attempts including the first (default 3)
  baseDelayMs?: number; // first backoff step (default 500ms)
  maxDelayMs?: number; // cap per wait (default 8s)
  retryServerErrors?: boolean; // also retry 5xx (default false)
}

function isRetryable(error: unknown, retryServerErrors: boolean): boolean {
  if (!(error instanceof ApiException)) return false;
  if (error.status === 429) return true;
  return retryServerErrors && error.status >= 500;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function retryOn429<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelayMs = 500,
    maxDelayMs = 8000,
    retryServerErrors = false,
  } = options;

  let attempt = 0;
  for (;;) {
    attempt += 1;
    try {
      return await fn();
    } catch (error) {
      if (attempt >= maxAttempts || !isRetryable(error, retryServerErrors)) {
        throw error;
      }
      // Exponential backoff with full jitter.
      const exp = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1));
      await sleep(Math.random() * exp);
    }
  }
}
