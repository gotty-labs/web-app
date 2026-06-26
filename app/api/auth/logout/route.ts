/**
 * BFF logout (§4.1). Best-effort: tell the backend to kill the server session,
 * then clear the httpOnly cookie regardless of the backend's response (a failed
 * or expired logout must never leave a dangling local session).
 */
import { NextResponse } from "next/server";

import { apiRequest } from "@/lib/api/client";
import { voidDataSchema } from "@/lib/api/envelope";
import { clearSession, readSession } from "@/lib/auth/session-cookie";

export async function POST(): Promise<NextResponse> {
  const session = await readSession();

  if (session) {
    try {
      await apiRequest({
        method: "POST",
        path: "/auth/logout",
        token: session.sessionToken,
        schema: voidDataSchema,
      });
    } catch {
      // Ignore backend errors — we still clear the local session below.
    }
  }

  await clearSession();
  return NextResponse.json({ success: true });
}
