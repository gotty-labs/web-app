/**
 * Error model (§1.5, §3). The golden rule for the frontend: branch on the stable
 * numeric `internalCode`, NEVER on the free-text `reason`.
 *
 * `JgErrorType` is the coarse category (telemetry / grouping). `InternalCode` is
 * the precise, stable signal each screen reacts to. The localized UI copy lives
 * in a single dictionary (built in a later phase) keyed by `InternalCode`.
 */
import { z } from 'zod'

/** High-level error category (§1.5). */
export const jgErrorTypeSchema = z.enum([
  'INTERNAL_ERROR',
  'BAD_REQUEST',
  'AUTH_ERROR',
  'DB_ERROR',
  'MAIL_PROVIDER_ERROR',
  'RESTFUL_EXTERNAL_PROVIDER_ERROR',
  'GAME_ERROR',
  'PLATFORM_ERROR',
])
export type JgErrorType = z.infer<typeof jgErrorTypeSchema>

/**
 * Stable numeric error codes (§3). Named constants so call-sites read as intent
 * (`InternalCode.REAUTHENTICATION_REQUIRED_TOKEN`) instead of magic numbers.
 */
export const InternalCode = {
  // Auth / session
  INVALID_CREDENTIALS: 50040,
  INVALID_TOKEN: 50041,
  REAUTHENTICATION_REQUIRED_TOKEN: 50042,
  FORCE_NEW_MANUAL_LOGIN: 50043,
  RESET_LINK_TIME_EXCEEDED: 50044,
  USER_NOT_FOUND: 50045,
  INVALID_OAUTH_CREDENTIALS: 50046,
  GUEST_USER_NOT_ALLOWED: 50047,
  // Register
  UNAVAILABLE_REGISTER_FOR_DATA_PROVIDED: 50050,
  UNAVAILABLE_OAUTH_REGISTER: 50051,
  // Profile
  INVALID_EMAIL_VERIFICATION_CODE: 50060,
  // Game
  GAME_NOT_FOUND: 50070,
  UNSUPPORTED_GAME_SECTION: 50071,
  LIBRARY_LIST_NAME_ALREADY_EXISTS: 50072,
  // Platform
  WEB_PLATFORM_NOT_ALLOWED: 50080,
  // Request / validation
  REQUEST_DATA_INVALID: 50020,
  // Persistence
  MONGO_WRITE_VALIDATION_ERROR: 50030,
  MONGO_WRITE_DUPLICATE_FIELD: 50031,
} as const

export type InternalCode = (typeof InternalCode)[keyof typeof InternalCode]
