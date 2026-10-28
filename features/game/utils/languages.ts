import type { GameLanguageCategory, GameLanguageType } from '@/lib/domain/enums'
import { gameLanguagesSchema } from '@/lib/domain/models/game'
import type { Dictionary, Locale } from '@/lib/i18n'

export const LANGUAGE_CATEGORIES = ['AUDIO', 'SUBTITLES', 'INTERFACE'] as const

/** Route locale alone determines the preferred variant on the cacheable web page. */
export function buildGameLanguages(input: unknown, locale: Locale, dict: Dictionary) {
  const variants: readonly GameLanguageType[] =
    locale === 'es' ? ['SPANISH_SPAIN', 'SPANISH_MEXICO'] : ['ENGLISH_US', 'ENGLISH_UK']
  const merged = new Map<GameLanguageType, Set<GameLanguageCategory>>()
  for (const language of gameLanguagesSchema.parse(input ?? [])) {
    const categories = merged.get(language.type) ?? new Set<GameLanguageCategory>()
    for (const category of language.categories) categories.add(category)
    merged.set(language.type, categories)
  }
  const collator = new Intl.Collator(locale)
  const list = new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' })
  const t = dict.games.languages
  const names = {
    AUDIO: t.categoryVoices,
    SUBTITLES: dict.games.languageCategory.SUBTITLES,
    INTERFACE: dict.games.languageCategory.INTERFACE,
  }
  const a11yNames = {
    AUDIO: t.a11yCategoryVoices,
    SUBTITLES: t.a11yCategorySubtitles,
    INTERFACE: t.a11yCategoryInterface,
  }
  const rows = [...merged]
    .map(([type, owned]) => {
      const categories = LANGUAGE_CATEGORIES.filter((category) => owned.has(category))
      const name = dict.games.language[type]
      const isYourLanguage = variants.includes(type)
      return {
        type,
        name,
        categories,
        isYourLanguage,
        accessibleLabel: fillLanguageText(isYourLanguage ? t.a11yRowYourLanguage : t.a11yRow, {
          language: name,
          categories: list.format(categories.map((category) => a11yNames[category])),
        }),
      }
    })
    .sort((a, b) => {
      if (a.isYourLanguage || b.isYourLanguage) {
        if (a.isYourLanguage !== b.isYourLanguage) return a.isYourLanguage ? -1 : 1
        return variants.indexOf(a.type) - variants.indexOf(b.type)
      }
      return (
        b.categories.length - a.categories.length ||
        Number(b.categories.includes('AUDIO')) - Number(a.categories.includes('AUDIO')) ||
        collator.compare(a.name, b.name) ||
        a.type.localeCompare(b.type)
      )
    })
  const ownRows = rows.filter((row) => row.isYourLanguage)
  const own = new Set(ownRows.flatMap((row) => row.categories))
  const level =
    own.size === 3
      ? 'complete'
      : own.has('AUDIO')
        ? 'audio'
        : own.has('SUBTITLES')
          ? 'subtitles'
          : own.has('INTERFACE')
            ? 'interface_only'
            : 'unavailable'
  const levelLabels = {
    complete: t.levelComplete,
    audio: t.levelAudio,
    subtitles: t.levelSubtitles,
    interface_only: t.levelInterfaceOnly,
    unavailable: t.levelUnavailable,
  }
  const indicators = LANGUAGE_CATEGORIES.map((category) => ({
    category,
    label: names[category],
    available: own.has(category),
    count: rows.filter((row) => row.categories.includes(category)).length,
  }))
  const categoryList = (predicate: (indicator: (typeof indicators)[number]) => boolean) =>
    list.format(indicators.filter(predicate).map(({ category }) => a11yNames[category]))
  const accessibleCard = [
    fillLanguageText(level === 'unavailable' ? t.a11yCardUnavailable : t.a11yCard, {
      language: t.yourLanguageName,
      level: levelLabels[level].toLocaleLowerCase(locale),
    }),
    ...(level === 'unavailable'
      ? []
      : [
          [t.a11yAvailable, categoryList((item) => item.available)],
          [t.a11yUnavailable, categoryList((item) => !item.available && item.count > 0)],
        ]
          .filter(([, categories]) => categories)
          .map(([template, categories]) => fillLanguageText(template, { categories }))),
    ...[categoryList((item) => item.count === 0)]
      .filter(Boolean)
      .map((categories) => fillLanguageText(t.a11yNoData, { categories })),
  ].join(' ')
  const summaryTemplates = {
    AUDIO: t.a11ySummaryVoices,
    SUBTITLES: t.a11ySummarySubtitles,
    INTERFACE: t.a11ySummaryInterface,
  }
  const summary = indicators.filter((item) => item.count > 0)
  const accessibleSummary = list.format(
    summary.map(({ category, count }) =>
      fillLanguageText(summaryTemplates[category][count === 1 ? 'one' : 'other'], { count }),
    ),
  )
  const others = rows.filter((row) => !row.isYourLanguage)
  const chips = others.slice(0, 4)
  const more = others.length - chips.length
  return {
    rows,
    level,
    levelLabel: levelLabels[level],
    indicators,
    summary,
    chips,
    more,
    inlineRows: rows.filter((row) => !row.isYourLanguage || ownRows.length === 2),
    accessibleCard,
    accessibleSummary:
      accessibleSummary.charAt(0).toLocaleUpperCase(locale) + accessibleSummary.slice(1),
    accessibleChips: [
      list.format(chips.map((chip) => chip.name)),
      ...(more
        ? [fillLanguageText(t.a11yMore[more === 1 ? 'one' : 'other'], { count: more })]
        : []),
    ].join(' '),
    title: fillLanguageText(t.yourLanguageTitle, { language: t.yourLanguageDisplayName }),
    showAll: fillLanguageText(t.showAll, { count: rows.length }),
    sheetTitle: fillLanguageText(t.sheetTitle, { count: rows.length }),
    moreLabel: fillLanguageText(t.more, { count: more }),
  }
}

export function fillLanguageText(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match))
}

export type GameLanguagesView = ReturnType<typeof buildGameLanguages>
export type GameLanguageRow = GameLanguagesView['rows'][number]
