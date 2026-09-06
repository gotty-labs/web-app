/**
 * Profile clients (§4.2, Member-access). All go through `authedRequest`.
 *
 * `push-token` is intentionally omitted: blocked on WEB (50080) — no web push in
 * this iteration. (Profile routes are not guest-friendly → guests get 50047, but
 * web is always authenticated so that doesn't arise.)
 */
import { authedRequest } from '@/features/auth'
import { voidDataSchema } from '@/lib/api/envelope'
import {
  consoleExclusionsInputSchema,
  feedbackInputSchema,
  verifyEmailInputSchema,
  type ConsoleExclusionsInput,
  type FeedbackInput,
  type VerifyEmailInput,
} from '@/lib/domain/inputs'
import { startVerifyEmailSchema, type StartVerifyEmail } from '@/lib/domain/models'

/** Send product feedback, omitting the optional email unless a reply is requested. */
export async function sendFeedback(input: FeedbackInput): Promise<void> {
  const email = input.email?.trim()
  const body = feedbackInputSchema.parse({
    type: input.type,
    message: input.message,
    wantsReply: input.wantsReply,
    ...(input.wantsReply && email ? { email } : {}),
  })

  await authedRequest({
    method: 'POST',
    path: '/profile/feedback',
    body,
    schema: voidDataSchema,
  })
}

/** Begin email verification; backend sends an OTP and returns the recipient. */
export function startVerifyEmail(): Promise<StartVerifyEmail> {
  return authedRequest({
    method: 'GET',
    path: '/profile/start-verify-email',
    schema: startVerifyEmailSchema,
  })
}

/** Confirm the 6-digit OTP. */
export async function verifyEmail(input: VerifyEmailInput): Promise<void> {
  await authedRequest({
    method: 'PATCH',
    path: '/profile/verify-email',
    body: verifyEmailInputSchema.parse(input),
    schema: voidDataSchema,
  })
}

/** Trigger the change-password flow (backend sends a reset email). */
export async function changePassword(): Promise<void> {
  await authedRequest({
    method: 'POST',
    path: '/profile/change-password',
    schema: voidDataSchema,
  })
}

/** Set the consoles to exclude from the catalog. */
export async function setConsoleExclusions(input: ConsoleExclusionsInput): Promise<void> {
  await authedRequest({
    method: 'PATCH',
    path: '/profile/console-exclusions',
    body: consoleExclusionsInputSchema.parse(input),
    schema: voidDataSchema,
  })
}
