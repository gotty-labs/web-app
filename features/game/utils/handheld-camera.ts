/**
 * The feed hero's camera — the web port of the apps' `HandheldCamera`: a perspective
 * camera on +Z looking at the origin, placed so the model's bounding sphere fits the
 * narrower field of view in any orientation, plus the projection the callouts use. The
 * callouts are projected here, from the same orientation the scene renders, so they
 * follow the model on every frame.
 */
import { rotateVector, type Quat, type Vec3 } from './handheld-rotation'

/** Vertical field of view: narrow enough to keep the voxel edges straight. */
export const FIELD_OF_VIEW_DEGREES = 30
const HALF_VERTICAL_FOV = (FIELD_OF_VIEW_DEGREES * Math.PI) / 360

/** A pin anchor in model space. The normal is the direction its element is seen from. */
export interface HandheldAnchor {
  position: Vec3
  normal: Vec3
}

export interface HandheldCamera {
  /** Viewport size in CSS px. */
  width: number
  height: number
  /** Radius of the model's bounding sphere: `|extents| / 2`. */
  radius: number
  /** Distance from the origin at which the sphere fits the narrower field of view. */
  distance: number
  /** The sphere's radius on screen, in CSS px: the model never draws farther than this. */
  screenRadius: number
}

/** `R = |extents| / 2`: the model never reaches past it, however it turns. */
export function boundingRadius(extents: Vec3): number {
  return Math.hypot(extents[0], extents[1], extents[2]) / 2
}

export function createHandheldCamera(
  width: number,
  height: number,
  radius: number,
): HandheldCamera {
  const aspect = height > 0 ? width / height : 1
  const halfHorizontal = Math.atan(Math.tan(HALF_VERTICAL_FOV) * aspect)
  const distance = radius / Math.sin(Math.min(HALF_VERTICAL_FOV, halfHorizontal))
  const screenRadius =
    (Math.tan(Math.asin(radius / distance)) / Math.tan(HALF_VERTICAL_FOV)) * (height / 2)
  return { width, height, radius, distance, screenRadius }
}

export interface AnchorProjection {
  /** Viewport position in CSS px, origin top-left, +y down. */
  x: number
  y: number
  /** How much the anchor faces the camera: `1` straight on, `0` edge-on, negative away. */
  facing: number
}

export function projectAnchor(
  camera: HandheldCamera,
  orientation: Quat,
  anchor: HandheldAnchor,
): AnchorProjection {
  const [px, py, pz] = rotateVector(orientation, anchor.position)
  const aspect = camera.height > 0 ? camera.width / camera.height : 1
  const tangent = Math.tan(HALF_VERTICAL_FOV)
  const depth = camera.distance - pz
  // Normalized device coordinates: -1…1 across the view, +y up.
  const deviceX = px / (depth * tangent * aspect)
  const deviceY = py / (depth * tangent)

  const toCamera: Vec3 = [-px, -py, camera.distance - pz]
  const toCameraLength = Math.hypot(toCamera[0], toCamera[1], toCamera[2]) || 1
  const [nx, ny, nz] = rotateVector(orientation, anchor.normal)
  const facing = (nx * toCamera[0] + ny * toCamera[1] + nz * toCamera[2]) / toCameraLength

  return {
    x: ((deviceX + 1) / 2) * camera.width,
    y: ((1 - deviceY) / 2) * camera.height,
    facing,
  }
}
