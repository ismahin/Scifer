import * as THREE from 'three'
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js'
import { energy } from './runtime'

/** Samples the rendered hardware, including its world transform and screen framing. */
export function captureProcessor(root: THREE.Object3D, camera: THREE.Camera, canvas: HTMLCanvasElement) {
  root.updateWorldMatrix(true, true)
  const meshes: THREE.Mesh[] = []
  root.traverseVisible(object => {
    if (object instanceof THREE.Mesh && !(object instanceof THREE.InstancedMesh) && object.geometry.attributes.position && object.geometry.attributes.normal) meshes.push(object)
  })
  if (!meshes.length) return
  const samplers = meshes.map(mesh => new MeshSurfaceSampler(mesh).build())
  const weights = meshes.map(mesh => {
    const attr = mesh.geometry.attributes.position, index = mesh.geometry.index
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3()
    let area = 0
    for (let i = 0; i < (index?.count ?? attr.count); i += 3) {
      a.fromBufferAttribute(attr, index ? index.getX(i) : i)
      b.fromBufferAttribute(attr, index ? index.getX(i + 1) : i + 1)
      c.fromBufferAttribute(attr, index ? index.getX(i + 2) : i + 2)
      area += b.sub(a).cross(c.sub(a)).length() * .5
    }
    return area
  })
  const total = weights.reduce((a, b) => a + b, 0)
  const bounds = canvas.getBoundingClientRect(), point = new THREE.Vector3(), world = new THREE.Vector3()
  const origin = root.getWorldPosition(new THREE.Vector3()).applyMatrix4(camera.matrixWorldInverse)
  const height = 8 * Math.tan(42 * Math.PI / 360)
  for (let i = 0; i < 24000; i++) {
    let value = (i / 24000) * total, selected = 0
    while (selected < weights.length - 1 && value > weights[selected]) value -= weights[selected++]
    samplers[selected].sample(point)
    world.copy(point).applyMatrix4(meshes[selected].matrixWorld)
    const z = THREE.MathUtils.clamp(world.clone().applyMatrix4(camera.matrixWorldInverse).z - origin.z, -1.6, 1.6)
    point.copy(world).project(camera)
    const x = (bounds.left + (point.x + 1) * .5 * bounds.width) / innerWidth * 2 - 1
    const y = 1 - (bounds.top + (1 - point.y) * .5 * bounds.height) / innerHeight * 2
    energy.origins.set([x * height * innerWidth / innerHeight * (8 - z) / 8, y * height * (8 - z) / 8, z], i * 3)
  }
  energy.originCount = 24000
  energy.originVersion++
}
