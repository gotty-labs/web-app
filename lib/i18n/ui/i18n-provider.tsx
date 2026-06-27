/**
 * Client-side i18n surface. A Server Component (the zone layout) detects the
 * locale and loads the dictionary, then passes both here so every Client
 * Component can read translations without re-loading or re-detecting.
 *
 * `useDictionary()` → the active dictionary (for UI copy, once we add namespaces).
 * `useErrorMessage()` → a ready `(error) => string` bound to the active dictionary,
 * so error handling everywhere goes through the same JSON source.
 *
 * IMPORTANT (SSR/SEO): the dictionary is provided as a PROP, not loaded here, so
 * mounting this provider does NOT force dynamic rendering. Mount it in the
 * `(app)` layout (dynamic, locale from `Accept-Language`) and, for the static
 * marketing/SEO zone, pass the locale decided by the SEO strategy (default `en`
 * for now) — see the localization-strategy notes.
 */
"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import type { Dictionary } from "../dictionary";
import { getErrorMessage } from "../errors";
import type { Locale } from "../locales";

interface I18nContextValue {
  locale: Locale;
  dictionary: Dictionary;
}

const I18nContext = createContext<I18nContextValue | null>(null);

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

function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n hooks must be used within an <I18nProvider>");
  }
  return ctx;
}

export function useLocale(): Locale {
  return useI18n().locale;
}

export function useDictionary(): Dictionary {
  return useI18n().dictionary;
}

/** Returns a translator for errors bound to the active dictionary. */
export function useErrorMessage(): (error: unknown) => string {
  const { dictionary } = useI18n();
  return (error: unknown) => getErrorMessage(error, dictionary);
}
