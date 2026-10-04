/**
 * Free trackball rotation for the feed hero's handheld console, with inertia — the web
 * port of the apps' `HandheldRotation` (same constants and closed forms). Pure and
 * immutable: every transition returns a new state, and a spin's orientation at any time
 * has a closed form, so animation needs no per-frame state beyond a timestamp.
 *
 * Times are `performance.now()` / rAF timestamps in milliseconds (never `Date`); speeds
 * are radians per second. Screen axes: +x right, +y down.
 */

/** A 3D vector `[x, y, z]`. */
export type Vec3 = readonly [number, number, number]
/** A unit quaternion `[x, y, z, w]`. */
export type Quat = readonly [number, number, number, number]
/** Angles (or angular speeds) along the screen axes: `[x, y]`. */
export type ScreenAngles = readonly [number, number]

const IDENTITY: Quat = [0, 0, 0, 1]

export function quatFromAxisAngle(axis: Vec3, angle: number): Quat {
  const half = angle / 2
  const s = Math.sin(half)
  return [axis[0] * s, axis[1] * s, axis[2] * s, Math.cos(half)]
}

/** `a · b`: applies `b` first, then `a`. */
export function quatMultiply(a: Quat, b: Quat): Quat {
  const [ax, ay, az, aw] = a
  const [bx, by, bz, bw] = b
  return [
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
    aw * bw - ax * bx - ay * by - az * bz,
  ]
}

export function quatNormalize(q: Quat): Quat {
  const length = Math.hypot(q[0], q[1], q[2], q[3])
  return length > 0 ? [q[0] / length, q[1] / length, q[2] / length, q[3] / length] : IDENTITY
}

/** Rotates `v` by the unit quaternion `q`. */
export function rotateVector(q: Quat, v: Vec3): Vec3 {
  const [qx, qy, qz, qw] = q
  // t = 2 · (q.xyz × v); v' = v + w·t + q.xyz × t
  const tx = 2 * (qy * v[2] - qz * v[1])
  const ty = 2 * (qz * v[0] - qx * v[2])
  const tz = 2 * (qx * v[1] - qy * v[0])
  return [
    v[0] + qw * tx + (qy * tz - qz * ty),
    v[1] + qw * ty + (qz * tx - qx * tz),
    v[2] + qw * tz + (qx * ty - qy * tx),
  ]
}

/** A slight downward look and turn show the console's depth before the first interaction. */
export const INITIAL_ORIENTATION: Quat = quatMultiply(
  quatFromAxisAngle([1, 0, 0], Math.PI / 15),
  quatFromAxisAngle([0, 1, 0], -Math.PI / 9),
)
/** Exponential decay rate of a spin, per second. */
export const SPIN_FRICTION = 3
/** Below this angular speed the console is at rest. */
export const RESTING_SPEED = 0.05
/** Fastest spin a fling can start. */
export const MAXIMUM_SPEED = 4 * Math.PI

/**
 * Rotation for a screen-space movement: sideways turns around the vertical axis,
 * downward tips the top toward the viewer, and a diagonal combines both around one axis.
 */
export function turn(angles: ScreenAngles): Quat {
  const angle = Math.hypot(angles[0], angles[1])
  if (angle === 0) return IDENTITY
  return quatFromAxisAngle([angles[1] / angle, angles[0] / angle, 0], angle)
}

/** A drag across the viewport's height turns the console half a turn, in any direction. */
export function dragAngles(dx: number, dy: number, viewportHeight: number): ScreenAngles {
  const radiansPerPixel = viewportHeight > 0 ? Math.PI / viewportHeight : 0
  return [dx * radiansPerPixel, dy * radiansPerPixel]
}

export interface Spin {
  /** Timestamp in ms. */
  start: number
  orientation: Quat
  /** Angular velocity along the screen axes. */
  velocity: ScreenAngles
}

/** Seconds until the spin slows down to `RESTING_SPEED`. */
export function spinDuration(spin: Spin): number {
  const speed = Math.hypot(spin.velocity[0], spin.velocity[1])
  return speed > RESTING_SPEED ? Math.log(speed / RESTING_SPEED) / SPIN_FRICTION : 0
}

/** Timestamp, in ms, at which the spin settles. */
export function spinEnd(spin: Spin): number {
  return spin.start + spinDuration(spin) * 1000
}

export function spinOrientation(spin: Spin, now: number): Quat {
  const elapsed = Math.min(Math.max((now - spin.start) / 1000, 0), spinDuration(spin))
  const decay = (1 - Math.exp(-SPIN_FRICTION * elapsed)) / SPIN_FRICTION
  return quatMultiply(turn([spin.velocity[0] * decay, spin.velocity[1] * decay]), spin.orientation)
}

export interface HandheldRotation {
  resting: Quat
  spin: Spin | null
  dragStart: Quat | null
}

export const INITIAL_ROTATION: HandheldRotation = {
  resting: INITIAL_ORIENTATION,
  spin: null,
  dragStart: null,
}

export function orientationAt(rotation: HandheldRotation, now: number): Quat {
  return rotation.spin ? spinOrientation(rotation.spin, now) : rotation.resting
}

/** Catches the console where it is, stopping any spin. */
export function beginDrag(rotation: HandheldRotation, now: number): HandheldRotation {
  const current = quatNormalize(orientationAt(rotation, now))
  return { resting: current, spin: null, dragStart: current }
}

/** Turns the console by the drag's total screen translation, as angles. */
export function dragBy(rotation: HandheldRotation, angles: ScreenAngles): HandheldRotation {
  const start = rotation.dragStart ?? rotation.resting
  return { ...rotation, resting: quatNormalize(quatMultiply(turn(angles), start)) }
}

/** Releases the drag; a fast enough release velocity starts an inertia spin. */
export function endDrag(
  rotation: HandheldRotation,
  velocity: ScreenAngles,
  now: number,
  inertia = true,
): HandheldRotation {
  const released = { ...rotation, dragStart: null }
  const speed = Math.hypot(velocity[0], velocity[1])
  if (!inertia || speed <= RESTING_SPEED) return released
  const scale = speed > MAXIMUM_SPEED ? MAXIMUM_SPEED / speed : 1
  return {
    ...released,
    spin: {
      start: now,
      orientation: released.resting,
      velocity: [velocity[0] * scale, velocity[1] * scale],
    },
  }
}

/**
 * Turns the console by `angles` from wherever it is (the keyboard alternative to a
 * drag). Animated, it starts a spin whose closed form lands exactly on the step: a spin
 * travels `(speed − RESTING_SPEED) / SPIN_FRICTION`, so it starts at
 * `step · SPIN_FRICTION + RESTING_SPEED`.
 */
export function nudge(
  rotation: HandheldRotation,
  angles: ScreenAngles,
  now: number,
  animated: boolean,
): HandheldRotation {
  const caught = beginDrag(rotation, now)
  const step = Math.hypot(angles[0], angles[1])
  if (step === 0) return { ...caught, dragStart: null }
  if (!animated) return { ...dragBy(caught, angles), dragStart: null }
  const speed = step * SPIN_FRICTION + RESTING_SPEED
  return {
    resting: caught.resting,
    dragStart: null,
    spin: {
      start: now,
      orientation: caught.resting,
      velocity: [(angles[0] / step) * speed, (angles[1] / step) * speed],
    },
  }
}

/** Ends a finished spin at its final orientation. */
export function settle(rotation: HandheldRotation): HandheldRotation {
  if (!rotation.spin) return rotation
  return {
    ...rotation,
    resting: quatNormalize(spinOrientation(rotation.spin, spinEnd(rotation.spin))),
    spin: null,
  }
}
