/**
 * The feed hero's three.js scene — the web port of the apps' `HandheldScene`: the
 * handheld console on a transparent canvas, a perspective camera on +Z and three
 * directional lights. It only draws when asked (`render`), never in a loop: rotation
 * state and callouts live in the hero component.
 *
 * Client-only and lazy: it is imported solely by the lazily loaded `HandheldViewer`, so
 * three.js never reaches the server or other routes' bundles.
 */
import {
  Box3,
  DirectionalLight,
  Group,
  Mesh,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
  type Material,
  type Texture,
} from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { z } from 'zod'

import {
  HANDHELD_LIGHTS,
  HANDHELD_MAX_PIXEL_RATIO,
  HANDHELD_MODEL_URL,
  HANDHELD_PINS_URL,
} from '../config/handheld'
import { FIELD_OF_VIEW_DEGREES, type HandheldAnchor } from '../utils/handheld-camera'
import type { Quat, Vec3 } from '../utils/handheld-rotation'

const vec3Schema = z.tuple([z.number(), z.number(), z.number()])
/** `gotty_handheld.pins.json`: anchor name → model-space position and normal. */
const pinsManifestSchema = z.record(
  z.string(),
  z.object({ position: vec3Schema, normal: vec3Schema }),
)

export interface LoadedHandheld {
  /** Bounding-box extents, in model units. */
  extents: Vec3
  /** Anchors by pin name, in the recentered model space the scene renders. */
  anchors: Record<string, HandheldAnchor>
}

/**
 * Anchors from the shared manifest. Like the apps, a missing or malformed manifest only
 * costs the callouts: the console still renders.
 */
async function loadAnchors(signal: AbortSignal): Promise<Record<string, HandheldAnchor>> {
  try {
    const response = await fetch(HANDHELD_PINS_URL, { signal })
    if (!response.ok) return {}
    return pinsManifestSchema.parse(await response.json())
  } catch (error) {
    if (signal.aborted) throw error
    return {}
  }
}

export class HandheldScene {
  private readonly renderer: WebGLRenderer
  private readonly scene = new Scene()
  private readonly camera = new PerspectiveCamera(FIELD_OF_VIEW_DEGREES)
  private readonly pivot = new Group()
  private width = 0
  private height = 0

  private constructor(renderer: WebGLRenderer) {
    this.renderer = renderer
    renderer.setClearAlpha(0)
    this.scene.add(this.pivot)
    for (const light of HANDHELD_LIGHTS) {
      // A directional light shines from its position toward its target, the origin.
      const directional = new DirectionalLight(undefined, light.intensity)
      directional.position.set(...light.position)
      this.scene.add(directional)
    }
  }

  /** `null` when the browser has no usable WebGL. */
  static create(canvas: HTMLCanvasElement): HandheldScene | null {
    try {
      return new HandheldScene(
        new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' }),
      )
    } catch {
      return null
    }
  }

  /**
   * Loads the console and its anchors. The model is recentered on its bounding box (and
   * the anchors with it) so it turns around its own center: `R = |extents| / 2` then
   * bounds it in every orientation.
   */
  async load(signal: AbortSignal): Promise<LoadedHandheld> {
    const [gltf, manifest] = await Promise.all([
      new GLTFLoader().loadAsync(HANDHELD_MODEL_URL),
      loadAnchors(signal),
    ])
    if (signal.aborted) throw signal.reason

    const model = gltf.scene
    const box = new Box3().setFromObject(model)
    const center = box.getCenter(new Vector3())
    const size = box.getSize(new Vector3())
    model.position.sub(center)
    this.pivot.add(model)

    const anchors: Record<string, HandheldAnchor> = {}
    for (const [name, anchor] of Object.entries(manifest)) {
      anchors[name] = {
        position: [
          anchor.position[0] - center.x,
          anchor.position[1] - center.y,
          anchor.position[2] - center.z,
        ],
        normal: anchor.normal,
      }
    }
    return { extents: [size.x, size.y, size.z], anchors }
  }

  /** Called when the GPU drops the context (driver reset, too many contexts). */
  onContextLost(listener: () => void): void {
    this.renderer.domElement.addEventListener('webglcontextlost', listener, { once: true })
  }

  render(width: number, height: number, orientation: Quat, distance: number): void {
    if (width <= 0 || height <= 0) return
    if (width !== this.width || height !== this.height) {
      this.width = width
      this.height = height
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, HANDHELD_MAX_PIXEL_RATIO))
      // `false`: CSS sizes the canvas; only its drawing buffer follows the viewport.
      this.renderer.setSize(width, height, false)
      this.camera.aspect = width / height
    }
    this.camera.position.set(0, 0, distance)
    this.camera.near = distance / 10
    this.camera.far = distance * 10
    this.camera.updateProjectionMatrix()
    this.pivot.quaternion.set(...orientation)
    this.renderer.render(this.scene, this.camera)
  }

  dispose(): void {
    const textures = new Set<Texture>()
    this.pivot.traverse((object) => {
      if (!(object instanceof Mesh)) return
      object.geometry.dispose()
      const materials: Material[] = Array.isArray(object.material)
        ? object.material
        : [object.material]
      for (const material of materials) {
        for (const value of Object.values(material)) {
          if (value && typeof value === 'object' && 'isTexture' in value) {
            textures.add(value as Texture)
          }
        }
        material.dispose()
      }
    })
    for (const texture of textures) texture.dispose()
    this.renderer.dispose()
  }
}
