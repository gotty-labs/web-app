/**
 * Pure rules of the News screen (badge, empty kind, source filter draft, "Also in"
 * copy, safe URLs). Kept free of React so the screen's components stay thin.
 */
import type { NewsAlsoInSource, NewsSource } from '@/lib/domain/models'

/**
 * Parses the hidden-source slugs saved on the device. Anything that isn't a JSON array
 * of strings is corrupt and counts as "nothing hidden".
 */
export function parseHiddenSources(raw: string | null): string[] {
  if (!raw) return []
  try {
    const value: unknown = JSON.parse(raw)
    if (!Array.isArray(value) || !value.every((slug) => typeof slug === 'string')) return []
    return [...new Set(value)]
  } catch {
    return []
  }
}

/** Saved hidden slugs that are still in the catalog (stale ones never count). */
function hiddenInCatalog(catalog: readonly NewsSource[], hidden: readonly string[]): string[] {
  const hiddenSet = new Set(hidden)
  return catalog.filter((source) => hiddenSet.has(source.slug)).map((source) => source.slug)
}

/**
 * Number on the filter badge = visible catalog sources, or `null` for no badge. Only
 * members with a loaded catalog and at least one catalog source hidden get one
 * (including `0` when every source is hidden).
 */
export function filterBadgeCount({
  isMember,
  catalog,
  hidden,
}: {
  isMember: boolean
  catalog: readonly NewsSource[] | null
  hidden: readonly string[]
}): number | null {
  if (!isMember || !catalog) return null
  const hiddenCount = hiddenInCatalog(catalog, hidden).length
  return hiddenCount === 0 ? null : catalog.length - hiddenCount
}

export type NewsEmptyKind = 'all-hidden' | 'generic'

/**
 * Which empty state an empty first page shows: "you hid every source" only for a
 * member whose loaded (non-empty) catalog is entirely hidden; anything else is generic.
 */
export function newsEmptyKind({
  isMember,
  catalog,
  hidden,
}: {
  isMember: boolean
  catalog: readonly NewsSource[] | null
  hidden: readonly string[]
}): NewsEmptyKind {
  if (!isMember || !catalog || catalog.length === 0) return 'generic'
  return hiddenInCatalog(catalog, hidden).length === catalog.length ? 'all-hidden' : 'generic'
}

/** The filter draft's initial visible set: every catalog source except the saved hidden. */
export function initialVisibleSources(
  catalog: readonly NewsSource[],
  hidden: readonly string[],
): Set<string> {
  const hiddenSet = new Set(hidden)
  return new Set(catalog.filter((source) => !hiddenSet.has(source.slug)).map((s) => s.slug))
}

export function allSourcesVisible(catalog: readonly NewsSource[], visible: ReadonlySet<string>) {
  return catalog.length > 0 && catalog.every((source) => visible.has(source.slug))
}

/** "Hide all" when everything is on, otherwise "Show all" — returns the next visible set. */
export function toggleAllSources(
  catalog: readonly NewsSource[],
  visible: ReadonlySet<string>,
): Set<string> {
  return allSourcesVisible(catalog, visible)
    ? new Set()
    : new Set(catalog.map((source) => source.slug))
}

/**
 * What a save writes: the HIDDEN catalog sources (so a new source shows by default).
 * Stale saved slugs are dropped here.
 */
export function hiddenSourcesToSave(
  catalog: readonly NewsSource[],
  visible: ReadonlySet<string>,
): string[] {
  return catalog.filter((source) => !visible.has(source.slug)).map((source) => source.slug)
}

/** "Save" is enabled only when the draft differs from what's saved (stale slugs included). */
export function isSourceDraftDirty(
  catalog: readonly NewsSource[],
  visible: ReadonlySet<string>,
  saved: readonly string[],
): boolean {
  const next = hiddenSourcesToSave(catalog, visible)
  const savedSet = new Set(saved)
  return next.length !== savedSet.size || next.some((slug) => !savedSet.has(slug))
}

/**
 * The "Also in" button copy parts: the first two names, plus how many more (`0` → use
 * the plain label, otherwise the "+N" one). `allNames` feeds the accessible label.
 */
export function alsoInSummary(alsoIn: readonly Pick<NewsAlsoInSource, 'name'>[]): {
  names: string
  more: number
  allNames: string
} {
  return {
    names: alsoIn
      .slice(0, 2)
      .map((source) => source.name)
      .join(', '),
    more: Math.max(alsoIn.length - 2, 0),
    allNames: alsoIn.map((source) => source.name).join(', '),
  }
}

/** Only `https` article URLs are ever opened. */
export function isSafeArticleUrl(url: string): boolean {
  try {
    return new URL(url).protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Monogram for a source whose logo didn't load (up to 3 characters): short all-caps
 * names as-is ("IGN", "VGC"), initials of multi-word names ("Nintendo Life" → "NL"),
 * the capitals/digits of camel-case names ("HobbyConsolas" → "HC", "3DJuegos" → "3D"),
 * otherwise the first letter ("Vandal" → "V").
 */
export function sourceMonogram(name: string): string {
  const trimmed = name.trim()
  if (trimmed.length <= 3) return trimmed.toUpperCase()
  const words = trimmed.split(/\s+/).filter(Boolean)
  if (words.length > 1) {
    return words
      .slice(0, 3)
      .map((word) => word[0])
      .join('')
      .toUpperCase()
  }
  const marks = trimmed.match(/[A-Z0-9]/g) ?? []
  return marks.length > 1 ? marks.slice(0, 2).join('') : trimmed[0].toUpperCase()
}

/** Replaces `{key}` placeholders in a dictionary template. */
export function fillTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  )
}
