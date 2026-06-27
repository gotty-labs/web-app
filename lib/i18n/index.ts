/**
 * Public surface of the i18n layer (non-UI). Server-only `getServerLocale` is in
 * `./server`; the React provider/hooks are in `./ui/i18n-provider`.
 */
export {
  type Locale,
  locales,
  defaultLocale,
  resolveLocale,
  getClientLocale,
} from "./locales";
export {
  type Dictionary,
  type ErrorByCodeKey,
  dictionarySchema,
  getDictionary,
} from "./dictionary";
export {
  type ErrorKind,
  type ClassifiedError,
  classifyError,
  getErrorMessage,
} from "./errors";
