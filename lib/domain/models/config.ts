/**
 * App config output DTO (§4.4). `GET /config/startup` should be the first
 * business call after obtaining a session: it drives the force-update gate and
 * the verify-email nudge.
 *
 * On WEB (`jg-origin: WEB`) `version` is omitted (no store / force-update
 * concept) — only `needVerifiedEmail` applies. Modeled as optional accordingly.
 */
import { z } from 'zod'

import { appVersionStatusSchema, platformSchema } from '../enums'

export const startupSchema = z.object({
  version: z
    .object({
      status: appVersionStatusSchema,
      platform: platformSchema,
      min: z.string().optional(),
      latest: z.string().optional(),
      mockup: z.string().optional(),
      storeLink: z.string().optional(),
    })
    .optional(),
  needVerifiedEmail: z.boolean(),
})
export type Startup = z.infer<typeof startupSchema>
