/**
 * Public game detail shared by the en/es SEO pages (Option B). Server Component (no
 * token): fetches the public game + the dictionary, both statically cacheable (no
 * `headers()`), so the page stays SSG.
 *
 * It renders a full-bleed hero (artwork background + framed cover) and a stack of
 * content sections. The server resolves every enum/date to a localized string and
 * hands the interactive pieces (library actions, media gallery, release calendar,
 * storyline, DLC) compact plain-object view-models — so those client components ship
 * behavior, not the whole dictionary. Authed writes still live in `GameDetailIsland`.
 */
import { notFound } from 'next/navigation'

import { getDictionary, type Locale } from '@/lib/i18n'

import type { GameReleaseDate } from '@/lib/domain/models'

import { findPublicGame } from '../services/seo'
import { gameRegionLabel, gameReleaseStatusLabel } from '../utils/labels'
import {
  formatFullDate,
  formatMediumDate,
  formatTimeToBeat,
  formatYear,
  parseIsoDate,
} from '../utils/format'
import { youtubeId } from '../utils/media'

import { DetailSection } from './detail-section'
import { ExpandableText } from './expandable-text'
import { GameAdditionalContent, type DlcItem } from './game-additional-content'
import { GameDetailIsland } from './game-detail-island'
import { GameEngines } from './game-engines'
import { GameHero } from './game-hero'
import { GameLanguages } from './game-languages'
import { GameMediaGallery } from './game-media-gallery'
import { GamePlatforms } from './game-platforms'
import { GameReleaseDates, type ReleaseRow } from './game-release-dates'
import { GameTags } from './game-tags'
import { GameTimeToBeat, type TimeToBeatEntry } from './game-time-to-beat'
import { StorylineDialog } from './storyline-dialog'

/** Earliest release across consoles/regions — the date a visitor asks about. */
function earliestRelease(releases: GameReleaseDate[]): string | undefined {
  const dated = releases
    .map((release) => ({ iso: release.date, time: parseIsoDate(release.date)?.toMillis() }))
    .filter((entry): entry is { iso: string; time: number } => entry.time !== undefined)
  if (dated.length === 0) return undefined
  return dated.reduce((min, entry) => (entry.time < min.time ? entry : min)).iso
}

/** Ascending by date (undated last), for release lists. */
function byDateAsc(a: GameReleaseDate, b: GameReleaseDate): number {
  return (
    (parseIsoDate(a.date)?.toMillis() ?? Infinity) - (parseIsoDate(b.date)?.toMillis() ?? Infinity)
  )
}

export async function GameDetail({ slug, locale }: { slug: string; locale: Locale }) {
  const [game, dict] = await Promise.all([findPublicGame(slug, locale), getDictionary(locale)])
  if (!game) notFound()

  const t = dict.app.detail
  const releaseIso = earliestRelease(game.releaseDates)

  // --- view-models for the client islands (localized strings, plain objects) ---
  const releaseRows: ReleaseRow[] = [...game.releaseDates]
    .sort(byDateAsc)
    .map((release, index) => ({
      id: String(index),
      dateIso: release.date,
      dateLabel: formatMediumDate(release.date, locale) || release.date,
      consoleName: release.console.name,
      consoleImage: release.console.media.image,
      regionLabel: gameRegionLabel(dict, release.region),
      statusLabel: release.status ? gameReleaseStatusLabel(dict, release.status) : undefined,
    }))

  const buildDlcItems = (source: typeof game.dlcs): DlcItem[] =>
    source.map((item, index) => ({
      id: String(index),
      name: item.name,
      cover: item.cover,
      releases: [...item.releases].sort(byDateAsc).map((release, j) => ({
        id: String(j),
        dateIso: release.date,
        dateLabel: formatMediumDate(release.date, locale) || release.date,
        consoleName: release.console.name,
        regionLabel: gameRegionLabel(dict, release.region),
        statusLabel: release.status ? gameReleaseStatusLabel(dict, release.status) : undefined,
      })),
    }))
  const expansions = buildDlcItems(game.expansions)
  const dlcs = buildDlcItems(game.dlcs)

  const ttb = game.timeToBeat
  const timeToBeatEntries: TimeToBeatEntry[] = [
    ttb?.quick ? { kind: 'quick' as const, label: t.timeToBeatQuick, seconds: ttb.quick } : null,
    ttb?.average
      ? { kind: 'average' as const, label: t.timeToBeatAverage, seconds: ttb.average }
      : null,
    ttb?.total ? { kind: 'total' as const, label: t.timeToBeatTotal, seconds: ttb.total } : null,
  ]
    .filter((entry): entry is Omit<TimeToBeatEntry, 'value'> => entry !== null)
    .map((entry) => ({ ...entry, value: formatTimeToBeat(entry.seconds) }))

  const artworks = game.media?.artworks ?? []
  const screenshots = game.media?.screenshots ?? []
  const videoIds = (game.media?.videos ?? [])
    .map(youtubeId)
    .filter((id): id is string => id !== null)
  const hasMedia = artworks.length + screenshots.length + videoIds.length > 0

  const facts = [
    releaseIso ? { label: t.releaseDate, value: formatFullDate(releaseIso, locale) } : null,
    game.companies.develop.length > 0
      ? { label: t.developer, value: game.companies.develop.join(', ') }
      : null,
    game.companies.publish.length > 0
      ? { label: t.publisher, value: game.companies.publish.join(', ') }
      : null,
  ].filter((fact): fact is { label: string; value: string } => fact !== null)

  return (
    <main>
      <GameHero game={game} dict={dict} releaseYear={formatYear(releaseIso)} />

      <div className="mx-auto max-w-5xl px-4 pb-20 md:px-8">
        {/* Library actions (authed only) — hidden entirely for signed-out visitors. */}
        <div className="mb-8 flex justify-center md:justify-start">
          <GameDetailIsland gameId={game.id} slug={slug} locale={locale} dictionary={dict} />
        </div>

        <div className="flex flex-col gap-10">
          {(game.description || game.storyline) && (
            <DetailSection
              title={t.about}
              action={
                game.storyline ? (
                  <StorylineDialog
                    storyline={game.storyline}
                    title={t.storyline}
                    triggerLabel={t.readStoryline}
                  />
                ) : undefined
              }
            >
              {game.description ? (
                <ExpandableText
                  text={game.description}
                  moreLabel={t.showMore}
                  lessLabel={t.showLess}
                />
              ) : null}
            </DetailSection>
          )}

          {facts.length > 0 && (
            <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
              {facts.map((fact) => (
                <div key={fact.label} className="flex flex-col gap-0.5">
                  <dt className="text-xs text-muted-foreground">{fact.label}</dt>
                  <dd className="font-medium">{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {(game.genres.length > 0 || game.themes.length > 0 || game.ageRating.length > 0) && (
            <GameTags
              dict={dict}
              genres={game.genres}
              themes={game.themes}
              ageRatings={game.ageRating}
            />
          )}

          {game.platforms.length > 0 && (
            <DetailSection title={t.platforms}>
              <GamePlatforms platforms={game.platforms} />
            </DetailSection>
          )}

          {releaseRows.length > 0 && (
            <DetailSection title={t.releases}>
              <GameReleaseDates
                rows={releaseRows}
                labels={{
                  gameName: game.name,
                  releasesTitle: t.releases,
                  seeAll: t.seeAll,
                  addToCalendar: t.addToCalendar,
                  appleCalendar: t.appleCalendar,
                  googleCalendar: t.googleCalendar,
                }}
              />
            </DetailSection>
          )}

          {game.engines.length > 0 && (
            <DetailSection title={t.engines}>
              <GameEngines engines={game.engines} />
            </DetailSection>
          )}

          {timeToBeatEntries.length > 0 && (
            <DetailSection title={t.timeToBeat}>
              <GameTimeToBeat entries={timeToBeatEntries} />
            </DetailSection>
          )}

          {hasMedia && (
            <DetailSection title={t.media}>
              <GameMediaGallery
                artworks={artworks}
                screenshots={screenshots}
                videoIds={videoIds}
                labels={{
                  title: t.media,
                  viewGallery: t.viewGallery,
                  all: dict.app.search.all,
                  artworks: t.mediaArtworks,
                  screenshots: t.mediaScreenshots,
                  videos: t.mediaVideos,
                  play: t.playVideo,
                  fullscreen: t.fullscreen,
                  previous: t.previous,
                  next: t.next,
                }}
              />
            </DetailSection>
          )}

          {(expansions.length > 0 || dlcs.length > 0) && (
            <GameAdditionalContent
              expansions={expansions}
              dlcs={dlcs}
              labels={{
                expansions: t.expansions,
                dlcs: t.dlcs,
                releasesTitle: t.releases,
                addToCalendar: t.addToCalendar,
                appleCalendar: t.appleCalendar,
                googleCalendar: t.googleCalendar,
              }}
            />
          )}

          {game.languages.length > 0 && (
            <DetailSection title={t.languages}>
              <GameLanguages dict={dict} languages={game.languages} />
            </DetailSection>
          )}
        </div>
      </div>
    </main>
  )
}
