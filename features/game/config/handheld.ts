/**
 * The feed hero's handheld console: its asset, the order in which feed sections claim
 * its anchors, and the scene's lights. The node and pin names are a cross-platform
 * contract with the iOS and Android apps (`gotty_handheld.pins.json`): never rename
 * them here only.
 */
import type { Vec3 } from '../utils/handheld-rotation'

/** Uncompressed by design (no `extensionsRequired`): any glTF 2.0 loader opens it. */
export const HANDHELD_MODEL_URL = '/models/gotty_handheld.glb'
/** Anchor positions and normals in model space, shared with the apps. */
export const HANDHELD_PINS_URL = '/models/gotty_handheld.pins.json'

/**
 * Anchors in the order feed sections with more games (a `nextCursor`) claim them, in
 * feed order: the controls first, then the edges.
 * NOTE: provisional mapping (same as the apps) — change it here only.
 */
export const HANDHELD_ANCHOR_ORDER = [
  'pin_button_yellow',
  'pin_button_green',
  'pin_button_blue',
  'pin_dpad',
  'pin_shoulder',
  'pin_screen',
  'pin_light_left',
  'pin_light_right',
] as const

/** Caps the canvas resolution: sharper than this costs fill rate for no visible gain. */
export const HANDHELD_MAX_PIXEL_RATIO = 2

/**
 * Key, fill and rim directional lights aimed at the origin, fixed in the world so the
 * console's faces shade as it turns. Intensities are tuned to match the apps' renders
 * (three.js and RealityKit light units differ); the positions match the apps.
 */
export const HANDHELD_LIGHTS: readonly { position: Vec3; intensity: number }[] = [
  { position: [-1, 1.5, 2], intensity: 2.6 },
  { position: [1.5, 0.2, 1], intensity: 1 },
  { position: [0, 1, -2], intensity: 0.8 },
]
