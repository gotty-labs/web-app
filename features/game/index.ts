/** Public surface of the game feature (catalog + user library clients). */
export {
  getFeed,
  getFilterOptions,
  searchGames,
  getGamesBySection,
  getGame,
} from './services/catalog'
export {
  getLibraryLists,
  createLibraryList,
  getLibrary,
  updateLibraryList,
  deleteLibraryList,
  storeGameInLibrary,
} from './services/library'
export { getSitemapEntries, getPublicGame, SEO_REVALIDATE_SECONDS } from './services/seo'

// UI (Phase 5). Domain card/badge components stay imported by path within the
// feature; `GameFeed` is the page-level surface the (app) routes mount.
export { GameFeed } from './components/game-feed'
export { GameSearch } from './components/game-search'
