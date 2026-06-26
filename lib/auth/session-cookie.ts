/**
 * Server-side session cookie (the secure half of the hybrid model).
 *
 * The FULL session `{ id, sessionToken, refreshToken }` lives here in an
 * httpOnly cookie that JavaScript cannot read — so an XSS can never exfiltrate
 * the ~6-month refresh token. The browser keeps only a working copy of the
 * short-lived access token in localStorage (see `session-store.ts`) for its
 * direct-to-backend calls.
 *
 * This module is server-only by construction: it imports `cookies` from
 * `next/headers`, which fails to build if pulled into a Client Component.
 */
import { cookies } from "next/headers";
import { z } from "zod";

const COOKIE_NAME = "jg_session";
/** ~6 months, matching the backend refresh-token lifetime (§2.1). */
const MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

const storedSessionSchema = z.object({
  id: z.string(),
  sessionToken: z.string(),
  refreshToken: z.string(),
});
export type StoredSession = z.infer<typeof storedSessionSchema>;

export async function persistSession(session: StoredSession): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    // localhost is http in dev; `secure` would drop the cookie there.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function readSession(): Promise<StoredSession | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    return storedSessionSchema.parse(JSON.parse(raw));
  } catch {
    return null; // tampered / malformed cookie → treat as no session
  }
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
