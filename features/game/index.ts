/** Public surface of the game feature (catalog + user library clients). */
export {
  getFeed,
  getFilterOptions,
  searchGames,
  getGamesBySection,
  getGame,
} from "./services/catalog";
export {
  getLibraryLists,
  createLibraryList,
  getLibrary,
  updateLibraryList,
  deleteLibraryList,
  storeGameInLibrary,
} from "./services/library";
