/**
 * "EN" / "ES" chip for a source written in another language (shown only when the
 * backend sets `showLanguageLabel`). A language icon, never a flag: flags stand for
 * countries, not languages.
 */
import { LanguagesIcon } from 'lucide-react'

import type { GtLanguage } from '@/lib/domain/enums'
import type { Dictionary } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export function languageA11yLabel(t: Dictionary['app']['news'], language: GtLanguage): string {
  return language === 'es' ? t.language.a11yEs : t.language.a11yEn
}

export function LanguageBadge({
  t,
  language,
  testId,
  className,
}: {
  t: Dictionary['app']['news']
  language: GtLanguage
  testId?: string
  className?: string
}) {
  return (
    <span
      role="img"
      aria-label={languageA11yLabel(t, language)}
      data-testid={testId}
      className={cn(
        'text-muted-foreground border-input inline-flex h-[1.125rem] shrink-0 items-center gap-[3px] rounded-full border px-1.5 text-[0.625rem] leading-none font-semibold',
        className,
      )}
    >
      <LanguagesIcon aria-hidden className="size-[11px]" />
      {language === 'es' ? t.language.badgeEs : t.language.badgeEn}
    </span>
  )
}
