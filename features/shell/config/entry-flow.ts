/**
 * Temporary public entry during the initial AdSense review, for every visitor.
 * AuthGate still creates a regular guest session and member-only actions still
 * request sign-in. Skipping these prompts must not mark onboarding as completed.
 *
 * Restore to false only after crawler login has been implemented, configured in
 * AdSense and verified against the catalogue. See README.md for the handover.
 */
export const TEMPORARILY_SKIP_ENTRY_PROMPTS_FOR_ADSENSE = true
