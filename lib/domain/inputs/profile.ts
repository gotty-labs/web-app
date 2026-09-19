/**
 * Profile input schemas (§4.2).
 *
 * `push-token` is intentionally omitted: it is blocked on WEB (50080,
 * WEB_PLATFORM_NOT_ALLOWED) — no web push in this iteration, so we never call it.
 */
import { z } from 'zod'

import { feedbackTypeSchema } from '../enums'

/** `POST /profile/feedback` — optional reply email must never be an empty string. */
export const feedbackInputSchema = z.object({
  type: feedbackTypeSchema,
  message: z.string().trim().min(1).max(1000),
  wantsReply: z.boolean(),
  email: z.email().optional(),
})
export type FeedbackInput = z.infer<typeof feedbackInputSchema>

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
