/**
 * Shared helpers for the auth BFF route handlers.
 *
 * The underscore prefix keeps this file non-routable (it's colocated under
 * `app/api/auth` but is not a `route.ts`, so it never becomes an endpoint).
 */
import { NextResponse } from "next/server";

import { ApiException } from "@/lib/api/envelope";
import { persistSession } from "@/lib/auth/session-cookie";
import type { User } from "@/lib/domain/models";

/**
 * Persist the full session in the httpOnly cookie and return the client-facing
 * payload: the working access token + id, plus the profile (without tokens).
 */
export async function sessionResponse(user: User): Promise<NextResponse> {
  await persistSession({
    id: user.id,
    sessionToken: user.sessionToken,
    refreshToken: user.refreshToken,
  });

  const { sessionToken, refreshToken: _refresh, ...profile } = user;
  void _refresh;

  return NextResponse.json({
    id: user.id,
    accessToken: sessionToken,
    user: profile,
  });
}

/** Map any thrown error to the same `{ error, internalCode }` shape + status. */
export function errorResponse(error: unknown): NextResponse {
  if (error instanceof ApiException) {
    return NextResponse.json(
      { error: error.error, internalCode: error.internalCode, reason: error.reason },
      { status: error.status },
    );
  }
  return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
}
