/**
 * Auth input schemas (§4.1). Constraints are enforced client-side too for UX:
 *  - password: 8–16 chars, trimmed.
 *  - nickname: non-empty, max 32 (trimmed).
 *  - email: valid email.
 *  - resetId: UUID (comes from the reset link).
 */
import { z } from 'zod'

const passwordSchema = z.string().trim().min(8).max(16)
const nicknameSchema = z.string().trim().min(1).max(32)
const emailSchema = z.email()

export const autologinBodySchema = z.object({
  sessionToken: z.string(),
  refreshToken: z.string(),
})
export type AutologinBody = z.infer<typeof autologinBodySchema>

export const loginEmailInputSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})
export type LoginEmailInput = z.infer<typeof loginEmailInputSchema>

export const registerEmailInputSchema = z.object({
  email: emailSchema,
  nickname: nicknameSchema,
  password: passwordSchema,
})
export type RegisterEmailInput = z.infer<typeof registerEmailInputSchema>

/** Apple/Google login share the same `{ token }` body. */
export const oauthLoginInputSchema = z.object({
  token: z.string(),
})
export type OAuthLoginInput = z.infer<typeof oauthLoginInputSchema>

/** Apple/Google register add a chosen nickname. */
export const oauthRegisterInputSchema = z.object({
  token: z.string(),
  nickname: nicknameSchema,
})
export type OAuthRegisterInput = z.infer<typeof oauthRegisterInputSchema>

export const forgotPasswordInputSchema = z.object({
  email: emailSchema,
})
export type ForgotPasswordInput = z.infer<typeof forgotPasswordInputSchema>

export const resetPasswordInputSchema = z.object({
  resetId: z.uuid(),
  password: passwordSchema,
})
export type ResetPasswordInput = z.infer<typeof resetPasswordInputSchema>
