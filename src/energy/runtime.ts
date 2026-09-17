import { Vector2, Vector3 } from 'three'

/** One input and scroll clock for every cinematic material. No React frame updates. */
export const energy = {
  story: 0, understanding: -1, technology: -1, future: -1, footer: -1,
  pointer: new Vector2(-10, -10), target: new Vector2(-10, -10), velocity: new Vector2(),
  world: new Vector3(), direction: new Vector2(),
  client: new Vector2(-1000, -1000), active: false, pressed: false,
  origins: new Float32Array(24000 * 3), originVersion: 0, originCount: 0,
  hover: '', liquidForce: 0, quality: 1,
}

export function installEnergyInput() {
  let touchRelease: number | undefined
  const move = (event: PointerEvent) => {
    energy.client.set(event.clientX, event.clientY)
    energy.target.set(event.clientX / innerWidth * 2 - 1, 1 - event.clientY / innerHeight * 2)
    energy.active = true
    window.dispatchEvent(new CustomEvent('scifer:pointer', { detail: event }))
  }
  const down = (event: PointerEvent) => { clearTimeout(touchRelease); move(event); energy.pressed = true }
  const up = (event: PointerEvent) => { energy.pressed = false; if (event.pointerType !== 'mouse') touchRelease = window.setTimeout(() => { energy.active = false }, 450) }
  const leave = () => { energy.active = false }
  window.addEventListener('pointermove', move, { passive: true })
  window.addEventListener('pointerdown', down, { passive: true })
  window.addEventListener('pointerup', up, { passive: true })
  document.documentElement.addEventListener('pointerleave', leave)
  return () => {
    clearTimeout(touchRelease)
    window.removeEventListener('pointermove', move); window.removeEventListener('pointerdown', down)
    window.removeEventListener('pointerup', up); document.documentElement.removeEventListener('pointerleave', leave)
  }
}

export const smooth = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

export const cameraShots = {
  processorCore: { position: [0, 0, 8], target: [0, 0, 0], fov: 42, focus: 8 },
  explosionInside: { position: [.12, -.08, 6.5], target: [.12, -.08, 0], fov: 46, focus: 5 },
  waveWide: { position: [-.12, .08, 8], target: [-.12, .08, 0], fov: 42, focus: 8 },
  blackVoid: { position: [0, 0, 8], target: [0, 0, 0], fov: 42, focus: 8 },
  liquidHero: { position: [0, 0, 8], target: [0, 0, 0], fov: 42, focus: 8 },
  roboticsThreeQuarter: { position: [.08, 0, 7.9], target: [0, 0, 0], fov: 42, focus: 8 },
  blockchainWide: { position: [0, 0, 8.2], target: [0, 0, 0], fov: 42, focus: 8 },
  futureField: { position: [-.12, .05, 7.6], target: [-.12, .05, 0], fov: 44, focus: 7 },
  footerDescent: { position: [0, -.08, 8], target: [0, -.08, 0], fov: 42, focus: 8 },
} as const
