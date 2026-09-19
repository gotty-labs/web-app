/**
 * Stable frames selected from the onboarding film. These timings match the four
 * approved visual states and avoid pausing while an element is still transforming.
 * The final checkpoint stops one frame before the media boundary so browsers keep
 * the last image painted instead of switching to the ended state.
 */
export const ONBOARDING_VIDEO_SRC = '/assets/videos/gotty-onboarding.mp4'

export const ONBOARDING_VIDEO_CHECKPOINTS = [1, 2.57, 6.4, 7.97] as const
