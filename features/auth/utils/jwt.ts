/**
 * Minimal JWT payload decoding — NO signature verification.
 *
 * We only decode our own session token to read `exp` (and `guest`) so the client
 * can tell, after a reload, whether the stored access token is still usable
 * WITHOUT a network round-trip. Trust comes from the fact that the token was
 * issued through our own auth flow; the backend verifies it for real on each call.
 */
export interface JwtPayload {
  id?: string;
  guest?: boolean;
  exp?: number; // seconds since epoch
  iat?: number;
}

function base64UrlDecode(input: string): string {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  // atob is available both in the browser and in the Node/Next server runtime.
  return atob(normalized);
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    return JSON.parse(base64UrlDecode(payload)) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * True if the access token is missing an `exp`, is malformed, or expires within
 * `skewSeconds`. The skew triggers a refresh slightly early to avoid racing a 401.
 */
export function isAccessTokenExpired(token: string, skewSeconds = 30): boolean {
  const payload = decodeJwt(token);
  if (!payload?.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp - skewSeconds <= now;
}
