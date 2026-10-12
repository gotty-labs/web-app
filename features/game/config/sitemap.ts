/**
 * Two localized URLs per game. Keep XML responses small enough for Vercel ISR
 * cache misses: the previous 20,000-game chunk produced ~17 MB and returned
 * 413 CONTENT_TOO_LARGE to Google-InspectionTool in production.
 * 2,000 games produce ~1.7 MB with the current catalogue, preserving all URLs.
 */
export const SITEMAP_CHUNK_SIZE = 2000
