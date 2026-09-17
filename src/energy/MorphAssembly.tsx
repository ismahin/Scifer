import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import * as THREE from 'three'
import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { energy, smooth } from './runtime'

function cutMaterial(color: string, metalness: number, reveal: { value: number }, invert = false) {
  const material = new THREE.MeshPhysicalMaterial({ color, metalness, roughness: .24, clearcoat: .55 })
  material.onBeforeCompile = shader => {
    shader.uniforms.uMorph = reveal
    shader.vertexShader = 'varying vec3 vLocal;\n' + shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvLocal=position;')
    shader.fragmentShader = 'uniform float uMorph;varying vec3 vLocal;\n' + shader.fragmentShader.replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>\nfloat cell=fract(sin(dot(floor(vLocal*19.),vec3(12.9898,78.233,42.11)))*43758.5453);if(${invert ? 'cell<uMorph' : 'cell>uMorph'}) discard;`)
  }
  material.customProgramCacheKey = () => `scifer-solidification-${invert}`
  return material
}

export function MorphAssembly({ reduced }: { reduced: boolean }) {
  const root = useRef<THREE.Group>(null), robot = useRef<THREE.Group>(null), elbow = useRef<THREE.Group>(null)
  const blocks = useRef<THREE.InstancedMesh>(null), paths = useRef<THREE.LineSegments>(null)
  const pointerLight = useRef<THREE.PointLight>(null)
  const filaments = useRef<THREE.Group>(null)
  const size = useThree(state => state.size)
  const mobile = size.width < 700
  const [joint, setJoint] = useState<string | null>(null)
  const activeBlock = useRef(-1), activation = useRef(-100), elapsedTime = useRef(0)
  const touch = useRef(new THREE.Vector3()), hit = useRef(false), ripple = useRef(-100)
  const robotReveal = useMemo(() => ({ value: 0 }), [])
  const robotExit = useMemo(() => ({ value: 0 }), [])
  const liquidCut = useMemo(() => ({ value: 0 }), [])
  const liquid = useMemo(() => {
    const material = new THREE.MeshPhysicalMaterial({ color: '#e3f4ff', metalness: 0, roughness: .07, transmission: .9, thickness: 1.25, ior: 1.32, clearcoat: 1, envMapIntensity: .72, attenuationColor: new THREE.Color('#69b2ef'), attenuationDistance: 4, transparent: true, opacity: .88, depthWrite: false })
    const rippleUniform = { value: new THREE.Vector4(0, 0, 0, 0) }
    material.userData.ripple = rippleUniform
    material.onBeforeCompile = shader => {
      shader.uniforms.uCut = liquidCut; shader.uniforms.uRipple = rippleUniform
      shader.vertexShader = 'uniform vec4 uRipple;varying vec3 vLiquid;\n' + shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvLiquid=position;float d=distance(position,uRipple.xyz);transformed+=normalize(normal)*sin(d*24.-uRipple.w*7.)*exp(-d*4.)*.025*exp(-uRipple.w*1.8);')
      shader.fragmentShader = 'uniform float uCut;varying vec3 vLiquid;\n' + shader.fragmentShader.replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\nfloat cell=fract(sin(dot(floor(vLiquid*24.),vec3(17.13,38.2,89.1)))*41789.1);if(cell<uCut) discard;')
    }
    const surface = new MarchingCubes(mobile ? 34 : 46, material, false, false, 24000)
    surface.isolation = 62; surface.scale.setScalar(2.9); surface.frustumCulled = false
    return surface
  }, [mobile, liquidCut])
  const ceramic = useMemo(() => cutMaterial('#f3f7fc', .48, robotReveal), [robotReveal])
  const metal = useMemo(() => cutMaterial('#a7bacb', .82, robotReveal), [robotReveal])
  const blue = useMemo(() => cutMaterial('#1268e8', .5, robotReveal), [robotReveal])
  useEffect(() => {
    // A second clipped threshold disassembles the same mechanical surfaces into modules.
    for (const material of [ceramic, metal, blue]) {
      const compile = material.onBeforeCompile
      material.onBeforeCompile = (shader, renderer) => {
        compile(shader, renderer); shader.uniforms.uExit = robotExit
        shader.fragmentShader = 'uniform float uExit;\n' + shader.fragmentShader.replace('if(cell>uMorph) discard;', 'if(cell>uMorph || cell<uExit) discard;')
      }
    }
  }, [ceramic, metal, blue, robotExit])
  const box = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 2, .09), [])
  const count = mobile ? 144 : 288
  const lattice = useMemo(() => {
    const positions: THREE.Vector3[] = [], edges: number[] = []
    const nx = mobile ? 6 : 8, ny = 6, nz = mobile ? 4 : 6
    for (let z = 0; z < nz; z++) for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) {
      const position = new THREE.Vector3((x - (nx - 1) / 2) * .43, (y - 2.5) * .43, (z - (nz - 1) / 2) * .43)
      positions.push(position)
      if (x > 0) edges.push(positions.length - 2, positions.length - 1)
      if (y > 0) edges.push(positions.length - 1 - nx, positions.length - 1)
      if (z > 0) edges.push(positions.length - 1 - nx * ny, positions.length - 1)
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(edges.length * 3), 3))
    return { positions, edges, geometry }
  }, [mobile])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const color = useMemo(() => new THREE.Color(), [])
  const pulseColor = useMemo(() => new THREE.Color('#0652e8'), [])
  const internalPaths = useMemo(() => Array.from({ length: 4 }, (_, k) => {
    const points = Array.from({ length: 81 }, (_, i) => {
      const a = i / 80 * Math.PI * 2, r = .68 + Math.sin(a * 3 + k) * .08
      return new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r * .85, Math.sin(a * 2 + k) * .25)
    })
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, true), 80, .006 + k * .001, 5, true)
  }), [])
  useEffect(() => () => internalPaths.forEach(path => path.dispose()), [internalPaths])
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const lastSurfaceUpdate = useRef(-1)
  useEffect(() => () => {
    liquid.geometry.dispose(); (liquid.material as THREE.Material).dispose()
    ceramic.dispose(); metal.dispose(); blue.dispose(); box.dispose(); lattice.geometry.dispose()
  }, [liquid, ceramic, metal, blue, box, lattice])

  useFrame(({ clock, camera }, delta) => {
    if (!root.current) return
    const p = energy.technology, condensation = smooth(.73, 1., energy.understanding)
    root.current.visible = (energy.understanding > .70 && p < 1.28)
    if (!root.current.visible) return
    const t = reduced ? 0 : clock.elapsedTime
    elapsedTime.current = clock.elapsedTime
    const halfWidth = size.width / size.height * 3.08
    root.current.position.set(mobile ? 0 : halfWidth * .47, mobile ? -.45 : .12, 0)
    root.current.scale.setScalar((mobile ? THREE.MathUtils.lerp(.78, .60, smooth(.22, .44, p)) : 1.05) * Math.max(.03, condensation))
    const harden = smooth(.22, .44, p), distribute = smooth(.57, .80, p)
    liquidCut.value = harden
    robotReveal.value = smooth(.25, .44, p); robotExit.value = distribute
    liquid.visible = harden < .998
    if (filaments.current) { filaments.current.visible = harden < .25; filaments.current.rotation.set(Math.sin(t * .12) * .12, Math.sin(t * .09) * .23, t * .035) }
    if (liquid.visible) {
      if (!reduced && energy.active) {
        raycaster.setFromCamera(energy.pointer, camera)
        const intersection = raycaster.intersectObject(liquid, false)[0]
        hit.current = !!intersection
        if (intersection) {
          touch.current.copy(intersection.point); liquid.worldToLocal(touch.current)
          if (clock.elapsedTime - ripple.current > .75) ripple.current = clock.elapsedTime
        }
      } else hit.current = false
      energy.liquidForce = THREE.MathUtils.damp(energy.liquidForce, hit.current ? 1 : 0, 5, delta)
      const uniforms = (liquid.material as THREE.Material).userData.ripple.value as THREE.Vector4
      uniforms.set(touch.current.x, touch.current.y, touch.current.z, clock.elapsedTime - ripple.current)
      if (clock.elapsedTime - lastSurfaceUpdate.current > (mobile ? 1 / 24 : 1 / 30)) {
        liquid.reset()
        for (let i = 0; i < 7; i++) {
          const angle = i / 7 * Math.PI * 2 + t * .07
          const radius = .155 + Math.sin(t * .22 + i * .6) * .019
          const x = .5 + Math.cos(angle) * radius * (1 - harden * .3)
          const y = .5 + Math.sin(angle) * radius * .93
          const z = .5 + Math.sin(angle * 2 + t * .13) * .055
          liquid.addBall(x, y, z, .50 + Math.sin(t * .2 + i) * .045, 12)
        }
        if (energy.liquidForce > .01) liquid.addBall(.5 + touch.current.x * .5, .5 + touch.current.y * .5, .5 + touch.current.z * .5, .34 * energy.liquidForce, 12)
        liquid.update(); liquid.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1.5); lastSurfaceUpdate.current = clock.elapsedTime
      }
      if (pointerLight.current) pointerLight.current.position.copy(touch.current).multiplyScalar(2.3)
    }
    if (robot.current) {
      robot.current.visible = harden > .01 && distribute < .999
      robot.current.rotation.set(.12, -.4 + (reduced ? 0 : energy.pointer.x * .035), -.08)
      robot.current.position.y = -.75
    }
    if (elbow.current) elbow.current.rotation.z = -.55 + (reduced ? 0 : Math.sin(t * .38) * .055 + (joint ? .065 : 0))
    if (blocks.current) {
      blocks.current.visible = distribute > .005 && p < 1.2
      const assembly = distribute, depart = smooth(.94, 1.2, p)
      const current = lattice.geometry.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < count; i++) {
        const target = lattice.positions[i]
        // Start on the actuator, upright linkage, and end-effector volumes.
        const f = i / count, part = i % 3
        dummy.position.set(part === 0 ? Math.cos(i * 2.4) * .44 : part === 1 ? -.35 + f * .5 : .15 + f * .9, part === 0 ? -1.1 + f * .3 : part === 1 ? -.6 + f * 1.8 : 1.05 - f * .2, Math.sin(i * 2.4) * .22)
        dummy.position.lerp(target, assembly)
        dummy.position.x += depart * Math.sin(i * 3.1) * 3
        dummy.position.y += depart * (2 + f * 3)
        dummy.rotation.set(.08 * assembly, .35 * assembly, 0)
        const prominent = i % 37 === 0
        dummy.scale.setScalar((prominent ? .19 : .105) * smooth(0, .22, distribute) * (1 - depart))
        dummy.updateMatrix(); blocks.current.setMatrixAt(i, dummy.matrix)
        const distance = activeBlock.current < 0 ? 100 : target.distanceTo(lattice.positions[activeBlock.current])
        const elapsed = clock.elapsedTime - activation.current
        const pulse = Math.exp(-Math.pow(distance - elapsed * 1.6, 2) * 25) * (1 - smooth(2, 4, elapsed))
        color.set(prominent ? '#175cd3' : '#8bbbe4').lerp(pulseColor, pulse)
        blocks.current.setColorAt(i, color)
      }
      for (let e = 0; e < lattice.edges.length; e++) {
        const point = lattice.positions[lattice.edges[e]]
        current.setXYZ(e, point.x, point.y, point.z)
      }
      current.needsUpdate = true; blocks.current.instanceMatrix.needsUpdate = true; blocks.current.computeBoundingSphere()
      if (blocks.current.instanceColor) blocks.current.instanceColor.needsUpdate = true
      if (paths.current) { paths.current.visible = distribute > .8; (paths.current.material as THREE.LineBasicMaterial).opacity = smooth(.8, 1, distribute) * .25 * (1 - depart) }
    }
  })
  const jointEvents = (name: string) => ({
    onPointerOver: (e: ThreeEvent<PointerEvent>) => { if (energy.technology < .33 || energy.technology > .72) return; e.stopPropagation(); setJoint(name); energy.hover = name },
    onPointerOut: () => { setJoint(null); if (energy.hover === name) energy.hover = '' },
    onClick: (e: ThreeEvent<MouseEvent>) => { if (energy.technology < .33 || energy.technology > .72) return; e.stopPropagation(); setJoint(value => value === name ? null : name) },
  })
  return <group ref={root}>
    <primitive object={liquid} />
    <group ref={filaments}>{internalPaths.map((path, i) => <mesh key={i} geometry={path} rotation={[0, i * .22, i * .12]}><meshBasicMaterial color={i % 2 ? '#45a3ff' : '#0a3d91'} /></mesh>)}</group>
    <pointLight ref={pointerLight} color="#45a3ff" intensity={1.4} distance={3} />
    <group ref={robot}>
      <mesh geometry={box} scale={[1.45, .25, 1.05]} position={[0, -.5, 0]} material={metal} />
      <mesh position={[0, -.2, 0]} material={ceramic}><cylinderGeometry args={[.42, .5, .45, 32]} /></mesh>
      <group {...jointEvents('Motion / shoulder')}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={metal}><cylinderGeometry args={[.34, .34, .65, 32]} /></mesh>
        <mesh position={[0, 0, .34]} material={blue}><torusGeometry args={[.25, joint?.includes('shoulder') ? .027 : .014, 8, 48]} /></mesh>
      </group>
      <mesh geometry={box} position={[-.18, .62, 0]} rotation={[0, 0, .25]} scale={[.38, 1.3, .42]} material={ceramic} />
      <mesh geometry={box} position={[.1, .6, 0]} rotation={[0, 0, .25]} scale={[.065, 1.1, .47]} material={metal} />
      <group ref={elbow} position={[-.34, 1.2, 0]}>
        <group {...jointEvents('Control / elbow')}>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={metal}><cylinderGeometry args={[.27, .27, .55, 32]} /></mesh>
          <mesh position={[0, 0, .29]} material={blue}><torusGeometry args={[.2, joint?.includes('elbow') ? .026 : .012, 8, 48]} /></mesh>
        </group>
        <mesh geometry={box} position={[0, .48, 0]} scale={[.29, .94, .31]} material={ceramic} />
        <group position={[0, 1.02, 0]} {...jointEvents('Perception / end effector')}>
          <mesh geometry={box} scale={[.45, .2, .33]} material={metal} />
          {[-1, 1].map(side => <group key={side} position={[side * .23, .2, 0]} rotation={[0, 0, side * -.15]}><mesh geometry={box} scale={[.085, .45, .18]} material={ceramic} /><mesh geometry={box} position={[-side * .05, .2, 0]} scale={[.16, .065, .18]} material={blue} /></group>)}
        </group>
      </group>
      {joint && <><Line points={[[0, .2, .4], [.7, .6, .4], [1.1, .6, .4]]} color="#1268e8" lineWidth={1} /><Html position={[.8, .7, .4]} className="energy-joint-label" center>{joint}</Html></>}
    </group>
    <instancedMesh ref={blocks} args={[box, undefined, count]} frustumCulled={false} onPointerMove={e => { if (energy.technology < .65 || energy.technology > 1.15 || e.instanceId === undefined) return; energy.hover = 'Verifying connected blocks'; if (activeBlock.current !== e.instanceId) { activeBlock.current = e.instanceId; activation.current = elapsedTime.current } }} onPointerOut={() => { energy.hover = '' }} onClick={e => { if (energy.technology < .65 || energy.technology > 1.15) return; activeBlock.current = e.instanceId ?? 0; activation.current = elapsedTime.current; energy.hover = 'Verifying connected blocks' }}>
      <meshPhysicalMaterial color="white" metalness={.18} roughness={.25} transmission={.2} thickness={.3} clearcoat={.8} />
    </instancedMesh>
    <lineSegments ref={paths} geometry={lattice.geometry}><lineBasicMaterial color="#1268e8" transparent opacity={.25} depthWrite={false} /></lineSegments>
  </group>
}
