/**
 * Public surface of the auth feature.
 *
 * UI imports the React pieces (`SessionProvider`, `useSession`, `RequireAuth`) and
 * the use-cases (`loginEmail`, `logout`, …). Feature data clients (Phase 4) import
 * `authedRequest` to call the backend directly with refresh handling.
 *
 * The server-only cookie helpers (`./server/session-cookie`) are intentionally NOT
 * re-exported here — they're imported directly by the BFF route handlers so they
 * never get pulled into a client bundle through this barrel.
 */
export { SessionProvider } from "./contexts/session-provider";
export { useSession } from "./hooks/use-session";
export { RequireAuth } from "./components/require-auth";
export {
  authedRequest,
  SessionExpiredError,
  setOnSessionExpired,
} from "./services/authed-request";
export { sessionStore } from "./stores/session-store";
export { LOGIN_PATH } from "./config/config";
export {
  loginEmail,
  loginOAuth,
  registerEmail,
  registerOAuth,
  logout,
  forgotPassword,
  resetPassword,
  deleteAccount,
} from "./services/auth-client";
