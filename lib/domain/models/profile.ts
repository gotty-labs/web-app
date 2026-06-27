/**
 * Profile output DTOs (§4.2). Most profile mutations return `void` (the client
 * substitutes `{ success: true }`); only start-verify-email returns a payload.
 */
import { z } from 'zod'

/** `GET /profile/start-verify-email` → where the OTP was sent. */
export const startVerifyEmailSchema = z.object({
  recipient: z.string(),
})
export type StartVerifyEmail = z.infer<typeof startVerifyEmailSchema>
