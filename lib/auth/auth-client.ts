/**
 * Client-side auth use-cases (Phase 2 core). These talk to our BFF routes via the
 * `bffRequest` contract (NOT the backend directly), so the refresh token stays
 * server-side. On success they stash the working access token in the session store.
 *
 * Errors surface as `BffError` — branch on `BffError.internalCode` in the UI (§3):
 * e.g. 50040 INVALID_CREDENTIALS → inline form error; 50046 INVALID_OAUTH_CREDENTIALS
 * → route to OAuth register.
 *
 * Still TODO (next slice): forgot-password, reset-password, delete-account, and a
 * React session context that wires `setOnSessionExpired` to the router.
 */
import { z } from "zod";

import { bffRequest } from "@/lib/api/bff-client";
import { userProfileSchema, type UserProfile } from "@/lib/domain/models";

import { sessionStore } from "./session-store";

const sessionPayloadSchema = z.object({
  id: z.string(),
  accessToken: z.string(),
  user: userProfileSchema,
});
type SessionPayload = z.infer<typeof sessionPayloadSchema>;

function persist(payload: SessionPayload): UserProfile {
  sessionStore.set({ id: payload.id, accessToken: payload.accessToken });
  return payload.user;
}

export async function loginEmail(
  email: string,
  password: string,
): Promise<UserProfile> {
  return persist(
    await bffRequest({
      path: "/api/auth/login",
      body: { provider: "email", email, password },
      schema: sessionPayloadSchema,
    }),
  );
}

export async function loginOAuth(
  provider: "google" | "apple",
  token: string,
): Promise<UserProfile> {
  return persist(
    await bffRequest({
      path: "/api/auth/login",
      body: { provider, token },
      schema: sessionPayloadSchema,
    }),
  );
}

export async function registerEmail(
  email: string,
  nickname: string,
  password: string,
): Promise<UserProfile> {
  return persist(
    await bffRequest({
      path: "/api/auth/register",
      body: { provider: "email", email, nickname, password },
      schema: sessionPayloadSchema,
    }),
  );
}

export async function registerOAuth(
  provider: "google" | "apple",
  token: string,
  nickname: string,
): Promise<UserProfile> {
  return persist(
    await bffRequest({
      path: "/api/auth/register",
      body: { provider, token, nickname },
      schema: sessionPayloadSchema,
    }),
  );
}

export async function logout(): Promise<void> {
  try {
    await bffRequest({ path: "/api/auth/logout" });
  } finally {
    sessionStore.clear();
  }
}
