/**
 * Turn ANY thrown error into a user-facing message, pulled from a loaded
 * `Dictionary` (JSON) — the single place the UI maps errors to copy (§3 + the
 * code-less cases: 429, 5xx, network/offline, validation).
 *
 * Branching is on the numeric `internalCode` / HTTP status / error kind, NEVER on
 * the backend's free-text `reason`. `getErrorMessage` takes the dictionary (not a
 * locale) so it's decoupled from how/where the dictionary was loaded — server
 * components pass `await getDictionary(locale)`, client code uses `useErrorMessage`.
 *
 * Lives in `lib/` (shared) so it must not import from `features/*`; the one
 * feature error we care about (`SessionExpiredError`) is matched by `name`.
 */
import { ZodError } from "zod";

import { BffError } from "@/lib/api/bff-client";
import { ApiException } from "@/lib/api/envelope";
import { InternalCode } from "@/lib/api/error-codes";

import type { Dictionary, ErrorByCodeKey } from "./dictionary";

export type ErrorKind =
  | "auth"
  | "validation"
  | "rateLimit"
  | "server"
  | "network"
  | "domain"
  | "unknown";

export interface ClassifiedError {
  kind: ErrorKind;
  status?: number;
  internalCode?: number;
}

/** Maps stable backend `internalCode`s to the dictionary's semantic copy keys. */
const codeToKey: Partial<Record<number, ErrorByCodeKey>> = {
  [InternalCode.INVALID_CREDENTIALS]: "invalidCredentials",
  [InternalCode.RESET_LINK_TIME_EXCEEDED]: "resetLinkExpired",
  [InternalCode.USER_NOT_FOUND]: "userNotFound",
  [InternalCode.INVALID_OAUTH_CREDENTIALS]: "invalidOAuthCredentials",
  [InternalCode.GUEST_USER_NOT_ALLOWED]: "guestNotAllowed",
  [InternalCode.UNAVAILABLE_REGISTER_FOR_DATA_PROVIDED]: "registerUnavailable",
  [InternalCode.UNAVAILABLE_OAUTH_REGISTER]: "oauthAlreadyRegistered",
  [InternalCode.INVALID_EMAIL_VERIFICATION_CODE]: "invalidVerificationCode",
  [InternalCode.GAME_NOT_FOUND]: "gameNotFound",
  [InternalCode.LIBRARY_LIST_NAME_ALREADY_EXISTS]: "listNameExists",
  [InternalCode.WEB_PLATFORM_NOT_ALLOWED]: "webNotAllowed",
};

export function classifyError(error: unknown): ClassifiedError {
  if (error instanceof ApiException || error instanceof BffError) {
    const { status, internalCode } = error;
    if (status === 429) return { kind: "rateLimit", status, internalCode };
    if (status >= 500) return { kind: "server", status, internalCode };
    if (status === 401 || status === 403)
      return { kind: "auth", status, internalCode };
    return { kind: "domain", status, internalCode };
  }
  if (error instanceof ZodError) return { kind: "validation" };
  // Our SessionExpiredError (matched by name to avoid a lib → features import).
  if (error instanceof Error && error.name === "SessionExpiredError") {
    return { kind: "auth" };
  }
  // fetch() rejects with a TypeError on network failure / offline.
  if (error instanceof TypeError) return { kind: "network" };
  return { kind: "unknown" };
}

export function getErrorMessage(error: unknown, dict: Dictionary): string {
  const classified = classifyError(error);

  if (classified.internalCode != null) {
    const key = codeToKey[classified.internalCode];
    if (key) return dict.errors.byCode[key];
  }

  switch (classified.kind) {
    case "rateLimit":
      return dict.errors.generic.rateLimit;
    case "server":
      return dict.errors.generic.server;
    case "network":
      return dict.errors.generic.network;
    case "validation":
      return dict.errors.generic.validation;
    case "auth":
      return dict.errors.generic.sessionExpired;
    default:
      return dict.errors.generic.unknown;
  }
}
