/**
 * Authenticated request wrapper with SINGLE-FLIGHT token refresh (§2.4) — the
 * core of the whole session model.
 *
 * Flow per call:
 *   1. Read the access token from the client session store.
 *   2. If it's already expired (decoded `exp`), refresh proactively first.
 *   3. Issue the direct-to-backend call with the token.
 *   4. If the backend answers 401 / `REAUTHENTICATION_REQUIRED_TOKEN` (50042),
 *      refresh and replay the request once.
 *   5. On `INVALID_TOKEN` (50041) or `FORCE_NEW_MANUAL_LOGIN` (50043), the
 *      session is unrecoverable → clear it and signal the app to route to login.
 *
 * SINGLE-FLIGHT is the critical correctness property: many components can hit a
 * 401 at once, but they must share ONE refresh promise and then all replay —
 * never fire N concurrent refreshes (each rotation invalidates the previous
 * pair, so concurrent refreshes would log the user out).
 *
 * The actual refresh goes through our BFF route `/api/auth/refresh`, which reads
 * the httpOnly cookie server-side, calls `autologin/:id`, rotates the pair, and
 * returns the new access token. The refresh token never touches client JS.
 */
import { z } from "zod";

import { bffRequest } from "@/lib/api/bff-client";
import { apiRequest, type ApiRequestOptions } from "@/lib/api/client";
import { ApiException } from "@/lib/api/envelope";
import { InternalCode } from "@/lib/api/error-codes";
import { getClientLocale } from "@/lib/i18n/locales";

import { isAccessTokenExpired } from "../utils/jwt";
import { sessionStore } from "../stores/session-store";

const refreshPayloadSchema = z.object({
  id: z.string(),
  accessToken: z.string(),
});

/** Set by the app shell to redirect to the login screen on hard session loss. */
let onSessionExpired: (() => void) | null = null;
export function setOnSessionExpired(handler: (() => void) | null): void {
  onSessionExpired = handler;
}

/** Thrown when there is no usable session and the caller must re-authenticate. */
export class SessionExpiredError extends Error {
  constructor(message = "Session expired") {
    super(message);
    this.name = "SessionExpiredError";
  }
}

let refreshInFlight: Promise<string> | null = null;

function hardLogout(): void {
  sessionStore.clear();
  onSessionExpired?.();
}

async function performRefresh(): Promise<string> {
  try {
    const data = await bffRequest({
      path: "/api/auth/refresh",
      schema: refreshPayloadSchema,
    });
    sessionStore.setAccess(data);
    return data.accessToken;
  } catch {
    // BFF already cleared the cookie (e.g. FORCE_NEW_MANUAL_LOGIN). Clear client too.
    hardLogout();
    throw new SessionExpiredError();
  }
}

/** Returns the shared in-flight refresh, or starts a new one. */
function refresh(): Promise<string> {
  if (!refreshInFlight) {
    refreshInFlight = performRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

/**
 * Perform an authenticated request. Same options as `apiRequest`, minus `token`
 * (the session store provides it). Throws `SessionExpiredError` when the session
 * cannot be recovered, or the original `ApiException` for other domain errors.
 */
export async function authedRequest<T>(
  options: Omit<ApiRequestOptions<T>, "token">,
): Promise<T> {
  let token = sessionStore.getAccessToken();
  if (!token) {
    hardLogout();
    throw new SessionExpiredError("No active session");
  }

  // Proactive refresh: skip the doomed 401 round-trip when we know it's expired.
  if (isAccessTokenExpired(token)) {
    token = await refresh();
  }

  // Default the content language to the browser's locale (system-driven, no toggle).
  const language = options.language ?? getClientLocale();

  try {
    return await apiRequest({ language, ...options, token });
  } catch (error) {
    if (error instanceof ApiException) {
      if (error.internalCode === InternalCode.REAUTHENTICATION_REQUIRED_TOKEN) {
        const fresh = await refresh();
        return apiRequest({ language, ...options, token: fresh });
      }
      if (
        error.internalCode === InternalCode.INVALID_TOKEN ||
        error.internalCode === InternalCode.FORCE_NEW_MANUAL_LOGIN
      ) {
        hardLogout();
        throw new SessionExpiredError();
      }
    }
    throw error;
  }
}
