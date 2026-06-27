/**
 * Builder for the mandatory `jg-*` request headers (§1.2). These are validated by
 * a header DTO on most endpoints — a missing/malformed one is a 400. The simplest
 * correct policy is to send them on EVERY request; extra valid headers are ignored.
 *
 * Per project decisions:
 *  - `jg-origin`            → always WEB.
 *  - `jg-platform-version`  → the app version from package.json (single source).
 *  - `jg-platform-buildnumber` → hardcoded "1" (web has no store build number).
 *  - `jg-language`          → en|es, defaults to es; wired to the language selector later.
 *
 * NOTE: importing `package.json` for `version` pulls it into the bundle. It holds
 * no secrets (a private package), so this is an acceptable trade for a single
 * source of truth; can be moved to a build-time env injection later if desired.
 */
import pkg from "@/package.json";

import { type JgLanguage } from "@/lib/domain/enums";
import { defaultLocale } from "@/lib/i18n/locales";

export const PLATFORM = {
  origin: "WEB",
  version: pkg.version,
  buildNumber: "1",
} as const;

export const DEFAULT_LANGUAGE: JgLanguage = defaultLocale;

export interface HeaderOptions {
  /** Session JWT; when present, sent as `Authorization: Bearer <token>`. */
  token?: string;
  /** Localized content language; defaults to the app default locale (`en`). */
  language?: JgLanguage;
  /** Whether a JSON body is being sent (adds `content-type`). */
  hasBody?: boolean;
}

export function buildHeaders(options: HeaderOptions = {}): Headers {
  const headers = new Headers();
  headers.set("jg-origin", PLATFORM.origin);
  headers.set("jg-platform-version", PLATFORM.version);
  headers.set("jg-platform-buildnumber", PLATFORM.buildNumber);
  headers.set("jg-language", options.language ?? DEFAULT_LANGUAGE);
  if (options.token) headers.set("authorization", `Bearer ${options.token}`);
  if (options.hasBody) headers.set("content-type", "application/json");
  return headers;
}
