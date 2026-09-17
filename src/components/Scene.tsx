import { componentInfo } from './data'
import { Component, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber'
import { AdaptiveDpr, ContactShadows, Html, Line, OrbitControls, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { CinematicCamera } from './three/CinematicCamera'
import { ConnectedGlobe } from './three/ConnectedGlobe'
import { sceneInteraction, setSceneHover } from '../animations/interaction'
import type { ThreeEvent } from '@react-three/fiber'
import { energy } from '../energy/runtime'
import { captureProcessor } from '../energy/geometry'

export type StoryState = { progress: number; reduced: boolean; intro?: boolean; pointerX?: number; pointerY?: number; velocity?: number; selected?: number | null; focusPoint?: [number, number, number] }
type Point = [number, number, number]
const BLUE = '#1268e8'
useLoader.preload(THREE.TextureLoader, '/studio-environment.png')
const smooth = (a: number, b: number, value: number) => THREE.MathUtils.smoothstep(value, a, b)

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? <div className="scene-fallback"><span className="status-dot" />3D preview unavailable on this device.<br />Explore the architecture below.</div> : this.props.children }
}

export function Studio({ shadows = false, story }: { shadows?: boolean; story?: RefObject<StoryState> }) {
  const setDpr = useThree(state => state.setDpr)
  const scene = useThree(state => state.scene)
  const environment = useLoader(THREE.TextureLoader, '/studio-environment.png')
  useLayoutEffect(() => {
    const previous = scene.environment, intensity = scene.environmentIntensity
    environment.mapping = THREE.CubeUVReflectionMapping
    environment.colorSpace = THREE.LinearSRGBColorSpace
    environment.flipY = false
    environment.generateMipmaps = false
    environment.minFilter = environment.magFilter = THREE.LinearFilter
    environment.needsUpdate = true
    scene.environment = environment
    scene.environmentIntensity = 4
    return () => { scene.environment = previous; scene.environmentIntensity = intensity }
  }, [scene, environment])
  const rim = useRef<THREE.DirectionalLight>(null)
  const ground = useRef<THREE.Group>(null)
  useFrame(() => { if (story && ground.current) { const fade = 1 - smooth(1.9, 2.75, story.current.progress); ground.current.visible = fade > .01; ground.current.traverse(object => { const mat = (object as THREE.Mesh).material; if (mat instanceof THREE.MeshBasicMaterial && mat.transparent) { if (mat.userData.baseOpacity === undefined) mat.userData.baseOpacity = mat.opacity; mat.opacity = mat.userData.baseOpacity * fade } }) } })
  useFrame(() => { if (rim.current && story) rim.current.intensity = 1.8 + smooth(0.6, 2.8, story.current.progress) * 1.2 })
  return <>
    <PerformanceMonitor flipflops={2} onDecline={() => setDpr(1)} onFallback={() => setDpr(1)} />
    <ambientLight intensity={0.8} />
    <directionalLight position={[4, 8, 5]} intensity={3.2} color="#fffdfa" />
    <directionalLight ref={rim} position={[-5, 3, -3]} intensity={2} color="#a1caff" />
    <directionalLight position={[1, -3, 5]} intensity={0.7} color="#ffffff" />
    {shadows && <group ref={ground}><ContactShadows position={[0, -1.65, 0]} opacity={0.2} scale={10} blur={2.8} far={5} resolution={256} frames={1} color="#7894b3" /></group>}
    <AdaptiveDpr pixelated />
  </>
}

function SoftBox({ position, size, radius, children }: { position: Point; size: Point; radius: number; children: ReactNode }) {
  const [width, height, depth] = size
  const geometry = useMemo(() => new RoundedBoxGeometry(width, height, depth, 2, radius), [width, height, depth, radius])
  useEffect(() => () => geometry.dispose(), [geometry])
  return <mesh position={position} geometry={geometry}>{children}</mesh>
}

function Plate({ position = [0, 0, 0], size = [3.45, 0.16, 3.2], color = '#e4eaf0', metalness = 0.7, children }: { position?: Point; size?: Point; color?: string; metalness?: number; children?: ReactNode }) {
  return <SoftBox position={position} size={size} radius={Math.min(0.08, size[1] / 2 - 0.001)}>
    <meshStandardMaterial color={color} roughness={0.28} metalness={metalness} />
    {children}
  </SoftBox>
}

function roundedRect(shape: THREE.Shape | THREE.Path, x: number, y: number, w: number, h: number, r: number) {
  shape.moveTo(x + r, y)
  shape.lineTo(x + w - r, y); shape.quadraticCurveTo(x + w, y, x + w, y + r)
  shape.lineTo(x + w, y + h - r); shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  shape.lineTo(x + r, y + h); shape.quadraticCurveTo(x, y + h, x, y + h - r)
  shape.lineTo(x, y + r); shape.quadraticCurveTo(x, y, x + r, y)
}

function Frame({ color = '#f5f7fa', y = 0, size = 3.45, hole = 2.35, height = 0.18 }: { color?: string; y?: number; size?: number; hole?: number; height?: number }) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    roundedRect(shape, -size / 2, -size / 2, size, size, 0.17)
    const path = new THREE.Path()
    roundedRect(path, -hole / 2, -hole / 2, hole, hole, 0.12)
    shape.holes.push(path)
    const geo = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: true, bevelSize: 0.035, bevelThickness: 0.035, bevelSegments: 2, steps: 1, curveSegments: 10 })
    geo.rotateX(-Math.PI / 2)
    return geo
  }, [size, hole, height])
  useEffect(() => () => geometry.dispose(), [geometry])
  return <mesh geometry={geometry} position-y={y}><meshStandardMaterial color={color} metalness={0.55} roughness={0.21} /></mesh>
}

function Wordmark({ position, small = false }: { position: Point; small?: boolean }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 256
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, 512, 256)
    ctx.fillStyle = small ? '#5b6d81' : '#1767d8'
    if (!small) {
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(256, 25 + i * 29); ctx.lineTo(302, 48 + i * 29); ctx.lineTo(256, 71 + i * 29); ctx.lineTo(210, 48 + i * 29); ctx.closePath(); ctx.fill() }
    }
    ctx.font = `${small ? 400 : 600} ${small ? 42 : 46}px Arial`; ctx.textAlign = 'center'
    ctx.fillText(small ? 'NEURAL ENGINE / 01' : 'S C I F E R', 256, small ? 146 : 197)
    const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [small])
  useEffect(() => () => texture.dispose(), [texture])
  return <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={small ? [1.6, 0.4] : [0.95, 0.48]} /><meshBasicMaterial map={texture} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-2} /></mesh>
}

function RepeatedParts({ type }: { type: 'pins' | 'fins' }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const pins = type === 'pins'
  useLayoutEffect(() => {
    const transform = new THREE.Object3D()
    for (let i = 0; i < (pins ? 56 : 18); i++) {
      if (pins) {
        const side = Math.floor(i / 14), n = i % 14
        transform.position.set(side < 2 ? -0.95 + n * 0.145 : (side === 2 ? 1.02 : -1.02), 0.245, side < 2 ? (side === 0 ? 1.02 : -1.02) : -0.95 + n * 0.145)
        transform.rotation.y = side < 2 ? 0 : Math.PI / 2
      } else transform.position.set(-1.5 + i * 0.177, -0.37, 0)
      transform.updateMatrix()
      mesh.current!.setMatrixAt(i, transform.matrix)
    }
    mesh.current!.instanceMatrix.needsUpdate = true
  }, [pins])
  return <instancedMesh ref={mesh} args={[undefined, undefined, pins ? 56 : 18]}>
    <boxGeometry args={pins ? [0.052, 0.018, 0.21] : [0.072, 0.23, 2.97]} />
    <meshStandardMaterial color={pins ? '#a8c7e2' : '#a9b7c7'} metalness={0.8} roughness={0.26} />
  </instancedMesh>
}

function ComponentLabel({ story, position, name }: { story: RefObject<StoryState>; position: Point; name: string }) {
  const label = useRef<HTMLSpanElement>(null)
  useFrame(() => { if (label.current) label.current.style.opacity = story.current.progress > 1.45 && story.current.progress < 2.35 ? '1' : '0' })
  return <Html position={position} center zIndexRange={[12, 0]} style={{ pointerEvents: 'none' }}><span className="technical-anchor" ref={label}>{name}</span></Html>
}

function ComponentHotspot({ index, part, selected, onSelect, onHover }: { index: number; part: RefObject<THREE.Group | null>; selected: number | null; onSelect?: (index: number) => void; onHover: (index: number | null) => void }) {
  const anchor = useRef<THREE.Group>(null)
  const item = componentInfo[index]
  useFrame(() => { if (anchor.current && part.current) anchor.current.position.copy(part.current.position) })
  return <group ref={anchor}><Html position={item.position} center zIndexRange={[20, 0]}><button className={`hotspot ${selected === index ? 'selected' : ''}`} onPointerEnter={() => { onHover(index); setSceneHover(item.name) }} onPointerLeave={() => { onHover(null); setSceneHover(null) }} onFocus={() => onHover(index)} onBlur={() => onHover(null)} onClick={e => { e.stopPropagation(); onSelect?.(index) }} aria-label={`Inspect ${item.name}`} aria-pressed={selected === index}><span /><span className="hotspot-label">{item.name}</span></button></Html></group>
}

function Device({ story, explorer = false, selected = null, onSelect, reduced = false }: { story?: RefObject<StoryState>; explorer?: boolean; selected?: number | null; onSelect?: (index: number) => void; reduced?: boolean }) {
  const root = useRef<THREE.Group>(null)
  const housing = useRef<THREE.Group>(null)
  const thermal = useRef<THREE.Group>(null)
  const circuit = useRef<THREE.Group>(null)
  const base = useRef<THREE.Group>(null)
  const core = useRef<THREE.Group>(null)
  const glow = useRef<THREE.MeshStandardMaterial>(null)
  const guide = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState<number | null>(null)
  useEffect(() => { sceneInteraction.selectedObject = selected === null ? null : componentInfo[selected].name }, [selected])
  const dissolveUniform = useMemo(() => ({ value: 0 }), [])
  const worldFocus = useMemo(() => new THREE.Vector3(), [])
  const highlightColor = useMemo(() => new THREE.Color('#9dd4ff'), [])
  const materials = useRef<{ material: THREE.MeshStandardMaterial; color: THREE.Color }[]>([])
  const captured = useRef(false)
  useLayoutEffect(() => {
    const collected: typeof materials.current = []
    root.current?.traverse(object => {
      const mat = (object as THREE.Mesh).material
      if (mat instanceof THREE.MeshStandardMaterial) {
        collected.push({ material: mat, color: mat.color.clone() })
        if (story) {
          mat.onBeforeCompile = shader => {
            shader.uniforms.uDissolve = dissolveUniform
            shader.vertexShader = 'varying vec3 vDissolvePosition;\n' + shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvDissolvePosition = position;')
            shader.fragmentShader = 'uniform float uDissolve; varying vec3 vDissolvePosition;\n' + shader.fragmentShader.replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
              float grain = fract(sin(dot(floor(vDissolvePosition * 75.0), vec3(12.9898,78.233,43.17))) * 43758.5453);
              float edge = max(abs(vDissolvePosition.x), abs(vDissolvePosition.z));
              float threshold = clamp(edge * .42 + grain * .58, .001, .999);
              if (uDissolve > threshold) discard;`)
          }
          mat.customProgramCacheKey = () => 'scifer-surface-dissolve-v1'
          mat.needsUpdate = true
        }
      }
    })
    materials.current = collected
  }, [story, dissolveUniform])
  useEffect(() => () => setSceneHover(null), [])
  const events = (index: number) => ({
    onPointerOver: (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHovered(index); setSceneHover(componentInfo[index].name) },
    onPointerOut: () => { setHovered(null); setSceneHover(null) },
    onClick: (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); if (e.delta > 5) return; onSelect?.(index); sceneInteraction.selectedObject = componentInfo[index].name },
  })
  useFrame(({ clock, camera, gl }, delta) => {
    if (!root.current) return
    const p = story?.current.progress ?? 0
    const expl = smooth(0.9, 1.9, p) * (1 - smooth(2.2, 2.85, p))
    const focus = smooth(2.1, 2.9, p)
    dissolveUniform.value = smooth(3.12, 3.43, p)
    root.current.visible = p < 3.44
    root.current.scale.setScalar(1 - smooth(2.94, 3.08, p) * .015)
    if (story) { story.current.pointerX = energy.pointer.x; story.current.pointerY = -energy.pointer.y }
    if (p < 2.9) captured.current = false
    if (!explorer) {
      root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, -0.12 + p * 0.15 + (reduced ? 0 : (story?.current.pointerX ?? 0) * 0.055), 4, delta)
      root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, reduced ? 0 : (story?.current.pointerY ?? 0) * 0.025, 4, delta)
      root.current.position.y = reduced ? 0 : Math.sin(clock.elapsedTime * 0.65) * 0.055
      root.current.rotation.z = reduced ? 0 : Math.sin(clock.elapsedTime * 0.3) * 0.012
    }
    const isolation = explorer && selected !== null ? 0.22 : 0
    const lift = (index: number) => hovered === index || selected === index ? 0.055 : 0
    housing.current!.position.y = THREE.MathUtils.damp(housing.current!.position.y, smooth(0.8, 1.6, p) * (1 - focus) * 1.65 + focus * 3 + isolation + lift(1), 7, delta)
    housing.current!.position.x = expl * 0.1 + focus * 4
    thermal.current!.position.y = THREE.MathUtils.damp(thermal.current!.position.y, -smooth(1.1, 1.95, p) * (1 - focus) * 0.7 - focus * 2 - isolation, 7, delta)
    thermal.current!.position.x = -expl * 0.12 - focus * 4
    circuit.current!.position.y = THREE.MathUtils.damp(circuit.current!.position.y, -expl * 0.28 - focus * 1.5 - isolation * 0.4 + lift(2), 7, delta)
    circuit.current!.position.x = expl * 0.08 + focus * 4
    base.current!.position.y = THREE.MathUtils.damp(base.current!.position.y, -smooth(1.25, 2.0, p) * (1 - focus) * 1.25 - focus * 3 - isolation * 1.6 + lift(4), 7, delta)
    base.current!.position.x = -expl * 0.06 - focus * 4
    housing.current!.visible = focus < 0.98
    thermal.current!.visible = focus < 0.98
    circuit.current!.visible = focus < 0.98
    base.current!.visible = focus < 0.98
    if (story && p >= 2.98 && !captured.current) { captureProcessor(root.current, camera, gl.domElement); captured.current = true }
    core.current!.position.y = THREE.MathUtils.damp(core.current!.position.y, lift(0), 7, delta)
    glow.current!.emissiveIntensity = 0.9 + smooth(0, 2.8, p) * 0.65 + smooth(2.94, 3.1, p) * 2.5 + (hovered === 0 || selected === 0 ? 0.45 : 0) + (reduced ? 0 : Math.sin(clock.elapsedTime * 1.7) * 0.06)
    guide.current!.visible = expl > 0.25
    if (story && selected !== null) {
      const part = selected === 0 ? core : selected === 1 ? housing : selected === 4 ? base : selected === 5 ? thermal : circuit
      part.current!.getWorldPosition(worldFocus)
      story.current.focusPoint = [worldFocus.x, worldFocus.y + (selected === 1 ? 0.7 : selected === 4 ? -0.7 : 0.2), worldFocus.z]
    }
    const highlight = hovered ?? selected
    const active = highlight === 0 ? core.current : highlight === 1 ? housing.current : highlight === 4 ? base.current : highlight === 5 ? thermal.current : highlight === null ? null : circuit.current
    materials.current.forEach(({ material, color }) => { material.color.copy(color); material.wireframe = !!story?.current.intro })
    active?.traverse(object => { const mat = (object as THREE.Mesh).material; if (mat instanceof THREE.MeshStandardMaterial) mat.color.lerp(highlightColor, 0.12) })
  })
  const screws: Point[] = [[-1.45, 0, -1.45], [1.45, 0, -1.45], [-1.45, 0, 1.45], [1.45, 0, 1.45]]
  return <group ref={root}>
    <group ref={housing} {...events(1)}>
      <Frame y={0.64} />
      <Frame y={0.59} size={3.37} hole={2.32} height={0.025} color="#8098b1" />
      <Frame y={0.56} size={3.28} hole={2.32} height={0.025} color="#2187ef" />
      <mesh position={[0, 0.69, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[2.35, 2.35]} /><meshPhysicalMaterial color="#c3e4ff" metalness={0.1} roughness={0.1} transparent opacity={0.16} side={THREE.DoubleSide} depthWrite={false} /></mesh>
      <Wordmark small position={[0, 0.864, 1.43]} />
      {screws.map(([x, , z], i) => <group key={i} position={[x, 0.85, z]}><mesh><cylinderGeometry args={[0.072, 0.072, 0.016, 16]} /><meshStandardMaterial color="#76869a" metalness={0.92} roughness={0.23} /></mesh><mesh position-y={0.009}><boxGeometry args={[0.077, 0.008, 0.013]} /><meshStandardMaterial color="#425469" /></mesh></group>)}
      <mesh position={[1.43, 0.89, 0.85]}><sphereGeometry args={[0.047, 12, 12]} /><meshStandardMaterial color="#65adff" emissive={BLUE} emissiveIntensity={1.6} /></mesh>
      {story && <ComponentLabel story={story} position={[1.8, 0.78, 0]} name="01 / Protective housing" />}
    </group>
    <group ref={core} {...events(0)}>
      <Plate position={[0, 0.18, 0]} size={[2.31, 0.10, 2.31]} color="#397bb5" />
      <Plate position={[0, 0.29, 0]} size={[1.85, 0.14, 1.85]} color="#d1e5f5" />
      <SoftBox size={[1.63, 0.055, 1.63]} radius={0.024} position={[0, 0.39, 0]}><meshStandardMaterial ref={glow} color="#228fff" emissive="#147ce8" emissiveIntensity={1.4} roughness={0.28} /></SoftBox>
      <Plate position={[0, 0.46, 0]} size={[1.35, 0.13, 1.35]} color="#edf3f9" metalness={0.3} />
      <Wordmark position={[0, 0.531, 0]} />
      <RepeatedParts type="pins" />
      {story && <ComponentLabel story={story} position={[1.15, 0.46, 0]} name="03 / Neural processor" />}
    </group>
    <group ref={circuit} {...events(2)}>
      <Plate position={[0, 0.07, 0]} size={[3.23, 0.105, 3.08]} color="#a7bdcf" metalness={0.45} />
      {Array.from({ length: 11 }, (_, i) => <group key={i}>
        <Line points={[[-1.48 + i * 0.28, 0.129, -1.48], [-1.48 + i * 0.28, 0.129, -0.9], [-1.2 + i * 0.24, 0.129, -0.65]]} color="#5c95b9" lineWidth={0.65} />
        <Line points={[[-1.48 + i * 0.28, 0.129, 1.48], [-1.48 + i * 0.28, 0.129, 0.9], [-1.2 + i * 0.24, 0.129, 0.65]]} color="#5c95b9" lineWidth={0.65} />
      </group>)}
      {[-1, 1].map(side => <group key={side}>
        {[0, 1, 2, 3].map(i => <Plate key={i} position={[side * 1.34, 0.19, -0.85 + i * 0.5]} size={[0.25, 0.105, 0.3]} color="#738ba2" />)}
      </group>)}
      {story && <ComponentLabel story={story} position={[-1.6, 0.15, 0.65]} name="02 / Sensor interface" />}
      {story && <ComponentLabel story={story} position={[1.6, 0.15, -1.2]} name="06 / Communication" />}
    </group>
    <group ref={thermal} {...events(5)}>
      <Plate position={[0, -0.23, 0]} size={[3.4, 0.11, 3.24]} color="#c7d3e0" />
      <RepeatedParts type="fins" />
      <Plate position={[0, -0.51, 0]} size={[3.4, 0.06, 3.24]} color="#afbecf" />
      {story && <ComponentLabel story={story} position={[1.8, -0.3, 0]} name="04 / Thermal architecture" />}
    </group>
    <group ref={base} {...events(4)}>
      <Plate position={[0, -0.68, 0]} size={[3.52, 0.2, 3.34]} color="#eef2f7" metalness={0.4} />
      <Plate position={[0, -0.81, 0]} size={[3.25, 0.045, 3.08]} color="#93aec9" />
      <mesh position={[0, -0.69, 1.679]}><boxGeometry args={[0.73, 0.045, 0.008]} /><meshStandardMaterial color="#55a5ff" emissive={BLUE} emissiveIntensity={1.5} /></mesh>
      {[-1, 1].map(side => <group key={side}>
        {Array.from({ length: 9 }, (_, i) => <mesh key={i} position={[side * 1.765, -0.68, -0.9 + i * 0.2]}><boxGeometry args={[0.013, 0.063, 0.1]} /><meshStandardMaterial color="#7c8f9f" roughness={0.45} /></mesh>)}
      </group>)}
      {story && <ComponentLabel story={story} position={[1.8, -0.7, 0]} name="05 / Power management" />}
    </group>
    <group ref={guide} visible={false}>{screws.map(([x, , z], i) => <Line key={i} points={[[x, -1.8, z], [x, 2.1, z]]} dashed dashSize={0.04} gapSize={0.07} color="#7faede" transparent opacity={0.5} lineWidth={0.7} />)}</group>
    {explorer && componentInfo.map((item, i) => <ComponentHotspot key={item.name} index={i} part={i === 0 ? core : i === 1 ? housing : i === 4 ? base : i === 5 ? thermal : circuit} selected={selected} onSelect={onSelect} onHover={setHovered} />)}
    {hovered !== null && <Html position={componentInfo[hovered].position} center zIndexRange={[25, 0]} style={{ pointerEvents: 'none' }}><span className="mesh-hover-label">{componentInfo[hovered].name}<small>CLICK TO INSPECT</small></span></Html>}
  </group>
}

function AsyncRender({ onReady }: { onReady?: () => void }) {
  const { gl, scene, camera } = useThree()
  const compiled = useRef(false)
  const frames = useRef(0)
  useEffect(() => {
    let live = true
    // KHR_parallel_shader_compile keeps material compilation off the critical interaction path.
    gl.compileAsync(scene, camera).then(() => { if (live) compiled.current = true }, () => { if (live) compiled.current = true })
    return () => { live = false }
  }, [gl, scene, camera])
  useFrame(() => { if (compiled.current) { gl.render(scene, camera); if (++frames.current === 3 && onReady) queueMicrotask(onReady) } }, 1)
  return null
}

function RendererMetrics() {
  const frames = useRef(0), total = useRef(0)
  useFrame(({ gl }, delta) => {
    if (delta > 0.2) return
    frames.current++; total.current += delta
    if (total.current > 1.5) {
      const element = gl.domElement
      element.dataset.renderCalls = String(gl.info.render.calls)
      element.dataset.triangles = String(gl.info.render.triangles)
      element.dataset.geometries = String(gl.info.memory.geometries)
      element.dataset.textures = String(gl.info.memory.textures)
      element.dataset.sceneFps = (frames.current / total.current).toFixed(1)
      frames.current = 0; total.current = 0
    }
  })
  return null
}

export function StoryScene({ story, reduced, visible, onReady, selected, onSelect }: { story: RefObject<StoryState>; reduced: boolean; visible: boolean; onReady?: () => void; selected: number | null; onSelect: (index: number) => void }) {
  return <SceneBoundary><Canvas className="main-webgl" frameloop={visible ? 'always' : 'never'} dpr={[1, window.innerWidth < 768 ? 1.25 : 1.6]} camera={{ position: [5.6, 4.8, 7.7], fov: 34 }} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }} fallback={<div className="scene-fallback">Explore our intelligent architecture below.</div>}>
    <Suspense fallback={null}><Studio shadows story={story} /><Device story={story} reduced={reduced} selected={selected} onSelect={onSelect} /><CinematicCamera story={story} /><RendererMetrics /><AsyncRender onReady={onReady} /></Suspense>
  </Canvas></SceneBoundary>
}

function ExplorerRig({ selected, resetKey, reduced = false, entry }: { selected: number | null; resetKey: number; reduced?: boolean; entry: RefObject<{ value: number }> }) {
  const controls = useRef<OrbitControlsImpl>(null)
  const { camera } = useThree()
  const desired = useRef(new THREE.Vector3(5.6, 4.8, 7.7))
  const target = useRef(new THREE.Vector3())
  const moving = useRef(false)
  useEffect(() => {
    if (selected === null) { desired.current.set(5.6, 4.8, 7.7); target.current.set(0, 0, 0) }
    else { const p = componentInfo[selected].position; target.current.set(p[0] * 0.5, p[1] * 0.5, p[2] * 0.5); desired.current.set(p[0] + 4, 3.6 + p[1], 5.8 + p[2]) }
    moving.current = true
    if (reduced && controls.current) { camera.position.copy(desired.current); controls.current.target.copy(target.current); controls.current.update(); moving.current = false }
  }, [selected, resetKey, reduced, camera])
  useFrame((_, delta) => {
    if (controls.current) controls.current.enabled = reduced || entry.current.value > .9
    if (!reduced && entry.current.value < .98 && controls.current) { camera.position.set(5.6, 4.8, 7.7); controls.current.target.set(0, (1 - entry.current.value) * 1.6, 0); controls.current.update(); moving.current = true; return }
    if (!moving.current || !controls.current) return
    camera.position.lerp(desired.current, 1 - Math.exp(-delta * 4))
    controls.current.target.lerp(target.current, 1 - Math.exp(-delta * 4))
    controls.current.update()
    if (camera.position.distanceTo(desired.current) < 0.015) moving.current = false
  })
  return <OrbitControls ref={controls} makeDefault enablePan={false} minDistance={5.7} maxDistance={11.5} minAzimuthAngle={0.02} maxAzimuthAngle={1.24} minPolarAngle={0.93} maxPolarAngle={1.35} enableDamping={!reduced} dampingFactor={0.08} onStart={() => { moving.current = false }} />
}

export function ExplorerScene({ selected, onSelect, resetKey, visible, reduced = false, entry }: { selected: number | null; onSelect: (index: number) => void; resetKey: number; visible: boolean; reduced?: boolean; entry: RefObject<{ value: number }> }) {
  return <SceneBoundary><Canvas dpr={[1, 1.5]} frameloop={visible ? 'always' : 'never'} camera={{ position: [5.6, 4.8, 7.7], fov: 36 }} gl={{ alpha: true, antialias: true }}>
    <Suspense fallback={null}><Studio shadows /><Device explorer selected={selected} onSelect={onSelect} reduced={reduced} /><ExplorerRig selected={selected} resetKey={resetKey} reduced={reduced} entry={entry} /><AsyncRender /></Suspense>
  </Canvas></SceneBoundary>
}

export function ContinuityScene({ visible, progress, reduced }: { visible: boolean; progress: RefObject<{ value: number }>; reduced: boolean }) {
  return <SceneBoundary><Canvas dpr={[1, window.innerWidth < 768 ? 1.2 : 1.5]} frameloop={visible ? 'always' : 'never'} camera={{ position: [0, .3, 6.8], fov: 42 }} gl={{ alpha: true, antialias: true }}><Suspense fallback={null}><Studio /><ConnectedGlobe reduced={reduced} progress={progress} /><RendererMetrics /><AsyncRender /></Suspense></Canvas></SceneBoundary>
}

