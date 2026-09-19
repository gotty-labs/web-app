/**
 * Video helpers for the media gallery. IGDB stores game videos as YouTube video
 * ids, but the backend may hand us either a bare id (`dQw4w9WgXcQ`) or a full URL —
 * `youtubeId` normalizes both so the gallery can embed the player and show a poster.
 */

/** Extract a YouTube video id from a bare id or any common URL form (null if none). */
export function youtubeId(value: string): string | null {
  const trimmed = value.trim()
  // Bare id: 11 chars of the YouTube id alphabet.
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed
  const patterns = [
    /[?&]v=([\w-]{11})/, // watch?v=ID
    /youtu\.be\/([\w-]{11})/, // youtu.be/ID
    /\/embed\/([\w-]{11})/, // /embed/ID
    /\/shorts\/([\w-]{11})/, // /shorts/ID
  ]
  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match) return match[1]
  }
  return null
}

/** Privacy-friendly embed URL (no cookies until playback). */
export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0`
}

/** Poster thumbnail (hqdefault always exists for a valid id). */
export function youtubeThumbUrl(id: string): string {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
}
