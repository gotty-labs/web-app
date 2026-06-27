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
export { SessionProvider, useSession } from "./ui/session-provider";
export { RequireAuth } from "./ui/require-auth";
export {
  authedRequest,
  SessionExpiredError,
  setOnSessionExpired,
} from "./authed-request";
export { sessionStore } from "./session-store";
export { LOGIN_PATH } from "./config";
export {
  loginEmail,
  loginOAuth,
  registerEmail,
  registerOAuth,
  logout,
  forgotPassword,
  resetPassword,
  deleteAccount,
} from "./auth-client";
