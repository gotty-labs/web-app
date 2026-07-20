/**
 * Supported languages as a matrix (language × Audio / Subtitles / Interface) rather
 * than a flat list — at a glance you see whether a language is dubbed, subtitled, or
 * only in the menus. Scrolls within a fixed height (games ship dozens of languages),
 * with a sticky header. Presentational + server-safe.
 */
import { CheckIcon } from 'lucide-react'

import type { GameLanguageCategory, GameLanguageType } from '@/lib/domain/enums'
import type { Dictionary } from '@/lib/i18n'

import { gameLanguageCategoryLabel, gameLanguageLabel } from '../utils/labels'

const CATEGORY_ORDER: GameLanguageCategory[] = ['AUDIO', 'SUBTITLES', 'INTERFACE']

export function GameLanguages({
  dict,
  languages,
}: {
  dict: Dictionary
  languages: { type: GameLanguageType; categories: GameLanguageCategory[] }[]
}) {
  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-border">
      <div className="max-h-96 overflow-y-auto [scrollbar-width:thin]">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-card">
            <tr className="border-b border-border">
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                {dict.app.detail.languages}
              </th>
              {CATEGORY_ORDER.map((category) => (
                <th
                  key={category}
                  className="px-3 py-2.5 text-center font-medium text-muted-foreground"
                >
                  {gameLanguageCategoryLabel(dict, category)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {languages.map((language) => {
              const owned = new Set(language.categories)
              return (
                <tr key={language.type} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-2 font-medium whitespace-nowrap">
                    {gameLanguageLabel(dict, language.type)}
                  </td>
                  {CATEGORY_ORDER.map((category) => (
                    <td key={category} className="px-3 py-2 text-center">
                      {owned.has(category) ? (
                        <CheckIcon className="mx-auto size-4 text-primary" />
                      ) : (
                        <span className="text-muted-foreground/40" aria-hidden>
                          –
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
