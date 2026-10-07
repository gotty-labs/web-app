/**
 * Public surface of the auth feature.
 *
 * UI imports the React pieces (`SessionProvider`, `useSession`, `AuthGate`,
 * `AuthPrompt`) and the use-cases (`loginEmail`, `loginAsGuest`, `logout`, …). Gated
 * features raise the auth modal for guests through `authPromptStore.show()`. Feature
 * data clients (Phase 4) import `authedRequest` to call the backend directly with
 * refresh handling.
 *
 * The server-only cookie helpers (`./server/session-cookie`) are intentionally NOT
 * re-exported here — they're imported directly by the BFF route handlers so they
 * never get pulled into a client bundle through this barrel.
 */
export { SessionProvider } from './contexts/session-provider'
export { useSession } from './hooks/use-session'
export { AuthGate } from './components/auth-gate'
export { AuthModal } from './components/auth-modal'
export { AuthPrompt } from './components/auth-prompt'
export { authedRequest, SessionExpiredError, setOnSessionExpired } from './services/authed-request'
export { authPromptStore } from './stores/auth-prompt-store'
export { sessionStore } from './stores/session-store'
export {
  loginAsGuest,
  loginEmail,
  loginOAuth,
  registerEmail,
  registerOAuth,
  logout,
  forgotPassword,
  resetPassword,
  deleteAccount,
} from './services/auth-client'
