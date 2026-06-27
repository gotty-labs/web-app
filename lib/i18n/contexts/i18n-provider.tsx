/**
 * Client-side i18n provider + context. A Server Component (the zone layout)
 * detects the locale and loads the dictionary, then passes both here as PROPS so
 * every Client Component reads translations without re-loading or re-detecting.
 *
 * Hooks (`useI18n`/`useLocale`/`useDictionary`, `useErrorMessage`) live in
 * `../hooks/` per the hooks/ convention; the raw `I18nContext` is exported here.
 *
 * IMPORTANT (SSR/SEO): the dictionary is a PROP, not loaded here, so mounting this
 * provider does NOT force dynamic rendering. Mount it in the `(app)` layout
 * (dynamic, locale from `Accept-Language`); the static marketing/SEO zone passes
 * the SEO-strategy locale (default `en` for now).
 */
"use client";

import { createContext, useMemo, type ReactNode } from "react";

import type { Dictionary } from "../dictionary";
import type { Locale } from "../locales";

export interface I18nContextValue {
  locale: Locale;
  dictionary: Dictionary;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: ReactNode;
}) {
  const value = useMemo(() => ({ locale, dictionary }), [locale, dictionary]);
  return <I18nContext value={value}>{children}</I18nContext>;
}
