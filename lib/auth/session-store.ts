/**
 * Client-side working copy of the session (the JS-readable half of the hybrid).
 *
 * Holds only `{ id, accessToken }` — the short-lived (~2h) access token the
 * browser needs to authenticate its direct-to-backend calls via the
 * `Authorization` header. Persisted to localStorage so a page reload within the
 * token's lifetime costs ZERO network (we read it back and check `exp`). The
 * ~6-month refresh token is NOT here; it stays in the httpOnly cookie.
 *
 * A module-level memory cache mirrors localStorage to avoid repeated reads and
 * to keep working during the same tab session even if storage is unavailable.
 */
const STORAGE_KEY = "jg.session";

export interface ClientSession {
  id: string;
  accessToken: string;
}

let memory: ClientSession | null = null;

function read(): ClientSession | null {
  if (memory) return memory;
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    memory = JSON.parse(raw) as ClientSession;
    return memory;
  } catch {
    return null;
  }
}

export const sessionStore = {
  get: read,
  getAccessToken: (): string | null => read()?.accessToken ?? null,
  getId: (): string | null => read()?.id ?? null,
  set(session: ClientSession): void {
    memory = session;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
  },
  clear(): void {
    memory = null;
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  },
};
