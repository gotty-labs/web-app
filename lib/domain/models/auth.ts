/**
 * Auth output DTOs (§2.2). Two session shapes exist:
 *  - `userSessionSchema`  — guest login + autologin (refresh).
 *  - `userSchema`         — email / OAuth login + register (full user).
 *
 * On every successful auth call, persist `{ id, sessionToken, refreshToken }`
 * (and, for the full user, cache the profile fields).
 */
import { z } from "zod";

export const userSessionSchema = z.object({
  id: z.string(),
  sessionToken: z.string(),
  refreshToken: z.string(),
});
export type UserSession = z.infer<typeof userSessionSchema>;

export const userSchema = z.object({
  id: z.string(),
  nickname: z.string(),
  email: z.string(),
  avatar: z.string().optional(),
  twoFa: z.object({ verifiedEmail: z.boolean() }),
  sessionToken: z.string(),
  refreshToken: z.string(),
});
export type User = z.infer<typeof userSchema>;

/**
 * Public profile = `UserDto` without the tokens. This is what the BFF returns to
 * the browser (the tokens stay in the httpOnly cookie / are handed over as the
 * working access token separately).
 */
export const userProfileSchema = userSchema.omit({
  sessionToken: true,
  refreshToken: true,
});
export type UserProfile = z.infer<typeof userProfileSchema>;
