import { useMemo } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils, PerspectiveCamera, Vector3 } from 'three'
import type { StoryState } from '../Scene'

type Shot = { name: string; at: number; position: [number, number, number]; target: [number, number, number]; fov: number }
export const cameraShots: Shot[] = [
  { name: 'Establish', at: 0, position: [5.6, 4.8, 7.7], target: [0, 0, 0], fov: 34 },
  { name: 'Approach', at: 0.95, position: [4.5, 4.5, 7.8], target: [0, 0.12, 0], fov: 33 },
  { name: 'Architecture', at: 1.9, position: [5.7, 3.8, 8.6], target: [0, 0.05, 0], fov: 37 },
  { name: 'Core', at: 2.8, position: [3.0, 3.1, 4.6], target: [0, 0.36, 0], fov: 33 },
  { name: 'Enter intelligence', at: 3.18, position: [1.4, 2.6, 3.6], target: [0, 0.36, 0], fov: 32 },
  { name: 'Information field', at: 4, position: [3.8, 3.5, 8.2], target: [0, 0, 0], fov: 39 },
]

export function CinematicCamera({ story }: { story: RefObject<StoryState> }) {
  const vectors = useMemo(() => ({ position: new Vector3(), target: new Vector3(), look: new Vector3(), offset: new Vector3() }), [])
  useFrame(({ camera, size }, delta) => {
    const p = story.current.progress
    const reduced = story.current.reduced
    const next = Math.max(1, cameraShots.findIndex(s => s.at >= p))
    const a = cameraShots[next - 1], b = cameraShots[next]
    const t = MathUtils.smoothstep(p, a.at, b.at)
    vectors.position.set(...a.position).lerp(vectors.offset.set(...b.position), t)
    vectors.target.set(...a.target).lerp(vectors.offset.set(...b.target), t)
    let fov = MathUtils.lerp(a.fov, b.fov, t)
    if (reduced) { vectors.position.set(5.6, 4.8, 7.7); vectors.target.set(0, 0, 0); fov = 38 }
    if (size.width < 600) { vectors.position.multiplyScalar(1.13); fov += 3 }
    if (story.current.selected != null && story.current.focusPoint) {
      vectors.target.set(...story.current.focusPoint)
      vectors.position.copy(vectors.target).add(vectors.offset.set(4.2, 3.0, 5.3))
    }
    const damping = reduced ? 1 : 1 - Math.exp(-Math.min(delta, 0.05) * 4.5)
    camera.position.lerp(vectors.position, damping)
    vectors.look.lerp(vectors.target, damping)
    camera.lookAt(vectors.look)
    const perspective = camera as PerspectiveCamera
    const nextFov = MathUtils.lerp(perspective.fov, fov, damping)
    if (Math.abs(nextFov - perspective.fov) > 0.001) { perspective.fov = nextFov; perspective.updateProjectionMatrix() }
  })
  return null
}
