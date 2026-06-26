/**
 * Response envelopes (§1.3, §1.4) and the typed `unwrap` that every API call
 * funnels through.
 *
 * Success responses are wrapped as `{ success: true, status, data }` and the
 * caller only ever wants `.data`. Errors are wrapped as `{ success: false, ...,
 * errorInfo: { internalCode, reason } }`. `unwrap`:
 *   1. throws a typed `ApiException` for any error envelope (or malformed body),
 *   2. validates `.data` against the endpoint's Zod schema,
 *   3. returns the parsed, fully-typed payload.
 *
 * Validating `.data` here is the whole point of using Zod: a backend that breaks
 * the contract fails loudly at the boundary instead of corrupting UI deep down
 * (and, for the SEO build, fails the page generation rather than shipping junk).
 */
import { z } from "zod";

import { jgErrorTypeSchema, type InternalCode, type JgErrorType } from "./error-codes";

/** Error envelope shape (§1.4). `stack` is only present off-production. */
export const apiErrorSchema = z.object({
  responseId: z.string().optional(),
  success: z.literal(false),
  status: z.number(),
  error: jgErrorTypeSchema,
  errorInfo: z.object({
    reason: z.string(),
    additionalInfo: z.string().optional(),
    internalCode: z.number().optional(),
    stack: z.string().optional(),
  }),
});
export type ApiErrorEnvelope = z.infer<typeof apiErrorSchema>;

/** Success envelope shape (§1.3), parameterized by the data schema. */
export const apiResponseSchema = <T extends z.ZodTypeAny>(data: T) =>
  z.object({
    responseId: z.string().optional(),
    success: z.literal(true),
    status: z.number(),
    data,
  });

/**
 * Typed error thrown for any non-success envelope. Carries the stable
 * `internalCode` so callers can `switch` on it (§3) without touching `reason`.
 */
export class ApiException extends Error {
  readonly status: number;
  readonly error: JgErrorType;
  readonly internalCode?: InternalCode | number;
  readonly reason: string;
  readonly responseId?: string;
  readonly additionalInfo?: string;

  constructor(envelope: ApiErrorEnvelope) {
    super(envelope.errorInfo.reason);
    this.name = "ApiException";
    this.status = envelope.status;
    this.error = envelope.error;
    this.internalCode = envelope.errorInfo.internalCode;
    this.reason = envelope.errorInfo.reason;
    this.responseId = envelope.responseId;
    this.additionalInfo = envelope.errorInfo.additionalInfo;
  }
}

/** Discriminate an error body without fully parsing it first. */
function looksLikeError(raw: unknown): boolean {
  return (
    typeof raw === "object" &&
    raw !== null &&
    (raw as { success?: unknown }).success === false
  );
}

/**
 * Unwrap a raw (already JSON-parsed) response body into typed `data`, or throw
 * `ApiException`. `dataSchema` is the endpoint's payload schema.
 */
export function unwrap<T>(raw: unknown, dataSchema: z.ZodType<T>): T {
  if (looksLikeError(raw)) {
    throw new ApiException(apiErrorSchema.parse(raw));
  }
  return apiResponseSchema(dataSchema).parse(raw).data;
}

/**
 * Payload schema for `void` endpoints. The API substitutes `data: { success: true }`
 * when an endpoint returns nothing (§1.3); use this as the `dataSchema`.
 */
export const voidDataSchema = z.object({ success: z.literal(true) });
export type VoidData = z.infer<typeof voidDataSchema>;
