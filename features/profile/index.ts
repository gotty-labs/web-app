/** Public surface of the profile feature. */
export {
  startVerifyEmail,
  verifyEmail,
  changePassword,
  setConsoleExclusions,
} from './services/profile'

// UI (Phase 5, Slice G).
export { SettingsView } from './components/settings-view'
export { ConsoleVisibilityModal } from './components/console-visibility-modal'
export { VerifyEmailNudge } from './components/verify-email-nudge'
