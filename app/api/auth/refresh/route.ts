/**
 * BFF refresh = autologin (§2.3). The single source of token rotation.
 *
 * Reads the full session from the httpOnly cookie, re-calls `autologin/:id` with
 * the current pair (the backend accepts an expired sessionToken here, comparing
 * by string equality against the active session), rotates BOTH tokens, re-stows
 * the new pair in the cookie, and returns the new access token to the client.
 *
 * On any failure (notably FORCE_NEW_MANUAL_LOGIN, 50043) the cookie is cleared so
 * the client treats the session as unrecoverable and routes to login.
 *
 * The client side guarantees single-flight, so this route is hit once per refresh.
 */
import { NextResponse } from "next/server";

import { apiRequest } from "@/lib/api/client";
import { clearSession, persistSession, readSession } from "@/features/auth/server/session-cookie";
import { userSessionSchema } from "@/lib/domain/models";

import { errorResponse } from "../_shared";

export async function POST(): Promise<NextResponse> {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "NO_SESSION" }, { status: 401 });
  }

  try {
    const rotated = await apiRequest({
      method: "POST",
      path: `/auth/autologin/${session.id}`,
      body: {
        sessionToken: session.sessionToken,
        refreshToken: session.refreshToken,
      },
      schema: userSessionSchema,
    });

    await persistSession(rotated);
    return NextResponse.json({ id: rotated.id, accessToken: rotated.sessionToken });
  } catch (error) {
    await clearSession();
    return errorResponse(error);
  }
}
