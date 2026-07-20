/**
 * IGDB image CDN helper — a custom `next/image` loader that serves IGDB covers
 * STRAIGHT from IGDB's CDN (bypassing Vercel Image Optimization) by rewriting the
 * size token in the URL, instead of proxying through `/_next/image`.
 *
 * IGDB (Twitch) image URLs embed the size as a `t_*` token in the path:
 *   https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7f.jpg
 *                                             ^^^^^^^^^^^^  size token
 * The loader swaps that token for the smallest one whose pixel width covers the
 * width `next/image` asks for (per srcset entry), so the browser fetches an
 * appropriately-sized, already-optimized asset directly from IGDB.
 *
 * Applied per-image (only when the src is an IGDB URL) via `AppImage`, so non-IGDB
 * images keep Next's default optimizer. See `components/app-image.tsx`.
 *
 * NOTE (backend migration): today the backend stores the FULL IGDB URL, so the
 * loader rewrites the existing token. When the backend switches to storing only the
 * image identifier (`co1r7f`), `buildIgdbUrl` composes the URL from id + token.
 */

/** One IGDB size preset: the token that goes in the URL + its output dimensions (px). */
type IgdbSize = { token: string; width: number; height: number }

/**
 * The FULL IGDB size vocabulary (Twitch image service). Grouped by family; only the
 * cover family is used for the app's covers today — screenshot/logo/thumb presets are
 * here as the complete reference for future use (screenshots, artworks in the apps).
 * Dimensions per IGDB's documented presets; `_2x` = retina (double resolution).
 */
export const IGDB_IMAGE_SIZES = {
  // Squares / tiny
  micro: { token: 't_micro', width: 35, height: 35 },
  micro_2x: { token: 't_micro_2x', width: 70, height: 70 },
  thumb: { token: 't_thumb', width: 90, height: 90 },
  thumb_2x: { token: 't_thumb_2x', width: 180, height: 180 },
  // Covers (portrait 3:4) — what the web renders
  cover_small: { token: 't_cover_small', width: 90, height: 128 },
  cover_small_2x: { token: 't_cover_small_2x', width: 180, height: 256 },
  cover_big: { token: 't_cover_big', width: 264, height: 374 },
  cover_big_2x: { token: 't_cover_big_2x', width: 528, height: 748 },
  // Logos (landscape)
  logo_med: { token: 't_logo_med', width: 284, height: 160 },
  logo_med_2x: { token: 't_logo_med_2x', width: 568, height: 320 },
  // Screenshots / artworks (landscape 16:9-ish)
  screenshot_med: { token: 't_screenshot_med', width: 569, height: 320 },
  screenshot_med_2x: { token: 't_screenshot_med_2x', width: 1138, height: 640 },
  screenshot_big: { token: 't_screenshot_big', width: 889, height: 500 },
  screenshot_big_2x: { token: 't_screenshot_big_2x', width: 1778, height: 1000 },
  screenshot_huge: { token: 't_screenshot_huge', width: 1280, height: 720 },
  screenshot_huge_2x: { token: 't_screenshot_huge_2x', width: 2560, height: 1440 },
  // Full-res presets (keep source aspect; cap output box)
  '720p': { token: 't_720p', width: 1280, height: 720 },
  '720p_2x': { token: 't_720p_2x', width: 2560, height: 1440 },
  '1080p': { token: 't_1080p', width: 1920, height: 1080 },
  '1080p_2x': { token: 't_1080p_2x', width: 3840, height: 2160 },
} as const satisfies Record<string, IgdbSize>

/**
 * Ascending width ladder used to satisfy a requested render width for COVERS. Capped
 * at `cover_big_2x` (528px): covers never display larger than ~264 CSS px (≤240px on
 * the detail page), so 528px covers even retina — asking IGDB for 720p/1080p would
 * waste bytes AND distort the portrait aspect (those presets are landscape boxes).
 */
const COVER_LADDER: readonly IgdbSize[] = [
  IGDB_IMAGE_SIZES.cover_small,
  IGDB_IMAGE_SIZES.cover_small_2x,
  IGDB_IMAGE_SIZES.cover_big,
  IGDB_IMAGE_SIZES.cover_big_2x,
]

/**
 * Ascending width ladder for LANDSCAPE media (artworks + screenshots), which the
 * detail page renders full-bleed (blurred hero background) or in a gallery. Unlike
 * covers, these keep IGDB's 16:9-ish box, so we climb into the `screenshot_*`/`1080p`
 * presets instead of the portrait cover tokens. Capped at 1080p (1920px): a hero
 * background never needs more, and going to 4K would waste bandwidth on a dimmed,
 * blurred layer.
 */
const SCREENSHOT_LADDER: readonly IgdbSize[] = [
  IGDB_IMAGE_SIZES.screenshot_med,
  IGDB_IMAGE_SIZES.screenshot_big,
  IGDB_IMAGE_SIZES.screenshot_huge,
  IGDB_IMAGE_SIZES['1080p'],
]

/** IGDB CDN base path — the invariant prefix every image URL shares. */
const IGDB_UPLOAD_PATH = '/igdb/image/upload/'

/** True when `src` is an IGDB CDN image URL (the gate for applying the loader). */
export function isIgdbImageUrl(src: string): boolean {
  return src.includes(`images.igdb.com${IGDB_UPLOAD_PATH}`)
}

/** Smallest preset in a ladder whose width ≥ the requested width (largest if none fits). */
function pickSize(ladder: readonly IgdbSize[], width: number): IgdbSize {
  return ladder.find((size) => size.width >= width) ?? ladder[ladder.length - 1]
}

/** Rewrite (or insert) the `t_*` size token in an IGDB URL to a chosen preset. */
function withToken(src: string, token: string): string {
  return src.replace(
    /(\/igdb\/image\/upload\/)(t_[^/]+\/)?/,
    (_match, prefix: string) => `${prefix}${token}/`,
  )
}

/**
 * `next/image` custom loader for IGDB covers: rewrites the `t_*` size token in the
 * URL to the best-fit cover preset for `width`. Matches an existing token or inserts
 * one right after `/upload/` when absent. `quality` is unused (IGDB presets are fixed).
 */
export function igdbImageLoader({ src, width }: { src: string; width: number }): string {
  return withToken(src, pickSize(COVER_LADDER, width).token)
}

/**
 * `next/image` custom loader for IGDB landscape media (artworks + screenshots) —
 * climbs the `screenshot_*`/`1080p` ladder so a full-bleed hero or a gallery frame
 * fetches an appropriately-sized wide asset instead of a cropped portrait cover.
 */
export function igdbScreenshotLoader({ src, width }: { src: string; width: number }): string {
  return withToken(src, pickSize(SCREENSHOT_LADDER, width).token)
}

/**
 * Compose an IGDB CDN URL from an image IDENTIFIER (e.g. `co1r7f`) and a size preset.
 * For the backend migration to identifier-only storage: once the backend sends the
 * id instead of the full URL, build the src with this (`buildIgdbUrl(id)`), and the
 * loader keeps swapping tokens per srcset width as usual.
 */
export function buildIgdbUrl(imageId: string, size: keyof typeof IGDB_IMAGE_SIZES = 'cover_big'): string {
  return `https://images.igdb.com${IGDB_UPLOAD_PATH}${IGDB_IMAGE_SIZES[size].token}/${imageId}.jpg`
}
