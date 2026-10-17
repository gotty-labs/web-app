/**
 * "English / Español" switcher for the bilingual marketing pages. Plain links
 * (crawlable, no JS, no detection or redirects): each points to the same page
 * in the other language. Server Component.
 */
import Link from 'next/link'

import { locales, localizedPath, type Dictionary, type Locale } from '@/lib/i18n'

export function LanguageSwitcher({
  dict,
  locale,
  path,
}: {
  dict: Dictionary
  locale: Locale
  /** Unprefixed (English) path of the current page, e.g. `/` or `/discover`. */
  path: string
}) {
  const { language } = dict.app.landing

  return (
    <nav aria-label={language.label} className="flex items-center gap-2">
      {locales.map((target, index) => (
        <span key={target} className="flex items-center gap-2">
          {index > 0 && <span aria-hidden>/</span>}
          {target === locale ? (
            <span aria-current="page" lang={target} className="font-medium text-foreground">
              {language[target]}
            </span>
          ) : (
            <Link
              href={localizedPath(path, target)}
              hrefLang={target}
              lang={target}
              className="transition-colors hover:text-foreground"
            >
              {language[target]}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
