/**
 * Profile input schemas (§4.2).
 *
 * `push-token` is intentionally omitted: it is blocked on WEB (50080,
 * WEB_PLATFORM_NOT_ALLOWED) — no web push in this iteration, so we never call it.
 */
import { z } from 'zod'

/** `PATCH /profile/verify-email` — 6-digit OTP (100000–999999). */
export const verifyEmailInputSchema = z.object({
  otp: z.number().int().min(100000).max(999999),
})
export type VerifyEmailInput = z.infer<typeof verifyEmailInputSchema>

/** `PATCH /profile/console-exclusions` — Mongo console ids to exclude. */
export const consoleExclusionsInputSchema = z.object({
  consoleIds: z.array(z.string()),
})
export type ConsoleExclusionsInput = z.infer<typeof consoleExclusionsInputSchema>
