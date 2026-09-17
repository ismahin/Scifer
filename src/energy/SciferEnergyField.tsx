import { Component, Suspense, useEffect, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'
import { Studio } from '../components/Scene'
import { cameraShots, energy, installEnergyInput, smooth } from './runtime'
import { apertureFragment, apertureVertex, fieldFragment, fieldVertex } from './shaders'
import { IonSimulation } from './IonSimulation'
import { MorphAssembly } from './MorphAssembly'

function GraphicsFallback() {
  useEffect(() => { document.documentElement.classList.add('energy-unavailable'); return () => document.documentElement.classList.remove('energy-unavailable') }, [])
  return <p className="graphics-fallback" role="status">Interactive graphics are unavailable on this device. All page content remains available.</p>
}
class EnergyBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? <GraphicsFallback /> : this.props.children }
}

function useDirector(reduced: boolean) {
  useEffect(() => {
    const input = installEnergyInput()
    const elements = {
      understanding: document.getElementById('understanding'),
      technology: document.getElementById('technology'),
      future: document.getElementById('future'),
      footer: document.querySelector('footer'),
    }
    const bounds = { understanding: [0, 1], technology: [0, 1], future: [0, 1], footer: [0, 1] }
    const measure = () => {
      for (const key of Object.keys(elements) as (keyof typeof elements)[]) {
        const box = elements[key]?.getBoundingClientRect()
        if (box) bounds[key] = [box.top + scrollY, box.height]
      }
      update()
    }
    const update = () => {
      const y = scrollY, h = innerHeight
      // Pinned galleries can move later sections without resizing the footer itself.
      for (const key of Object.keys(elements) as (keyof typeof elements)[]) {
        const box = elements[key]?.getBoundingClientRect()
        if (box) bounds[key] = [box.top + y, box.height]
      }
      energy.understanding = (y - bounds.understanding[0]) / Math.max(1, bounds.understanding[1] - h)
      energy.technology = (y - bounds.technology[0]) / Math.max(1, bounds.technology[1] - h)
      energy.future = (y + h * .45 - bounds.future[0]) / Math.max(1, bounds.future[1] - h * .55)
      energy.footer = 1 - (bounds.footer[0] - y) / h
      document.documentElement.dataset.energyDark = energy.understanding > -.13 && energy.understanding < .88 ? 'true' : 'false'
      const lines = elements.understanding?.querySelectorAll<HTMLElement>('.understanding-line > span')
      lines?.forEach((line, i) => { const reveal = reduced ? 1 : smooth(i * .14 - .02, i * .14 + .15, energy.understanding); line.style.transform = `translateY(${(1 - reveal) * 110}%)` })
      elements.understanding?.querySelectorAll<HTMLElement>('.understanding-note').forEach((note, i) => {
        const reveal = reduced ? 1 : smooth(.13 + i * .16, .26 + i * .16, energy.understanding)
        note.style.opacity = String(reveal * (1 - smooth(.74, .88, energy.understanding)))
      })
      const copy = elements.understanding?.querySelector<HTMLElement>('.understanding-copy')
      if (copy) copy.style.opacity = String(1 - smooth(.73, .87, energy.understanding))
    }
    const observer = new ResizeObserver(measure)
    Object.values(elements).forEach(element => { if (element) observer.observe(element) })
    window.addEventListener('scroll', update, { passive: true }); window.addEventListener('resize', measure)
    ScrollTrigger.addEventListener('refresh', measure)
    measure()
    return () => { input(); observer.disconnect(); window.removeEventListener('scroll', update); window.removeEventListener('resize', measure); ScrollTrigger.removeEventListener('refresh', measure); delete document.documentElement.dataset.energyDark }
  }, [reduced])
}

function Field({ reduced }: { reduced: boolean }) {
  const points = useRef<THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>>(null)
  const connections = useRef<THREE.LineSegments<THREE.BufferGeometry, THREE.ShaderMaterial>>(null)
  const aperture = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>>(null)
  const { size, gl, camera, scene } = useThree()
  useEffect(() => {
    const timer = window.setTimeout(() => { void gl.compileAsync(scene, camera).catch(() => undefined) }, 1800)
    return () => clearTimeout(timer)
  }, [gl, scene, camera])
  const count = reduced ? 1800 : size.width < 700 ? 6500 : size.width < 1100 ? 12000 : 24000
  const simulation = useMemo(() => new IonSimulation(), [])
  const originVersion = useRef(-1), diagnostics = useRef({ start: 0, frames: 0 })
  const worldPointer = useMemo(() => new THREE.Vector2(), [])
  const footerText = useMemo(() => [...document.querySelectorAll('.footer-brand p, .footer-links > div, .footer-bottom, .footer-brand .brand')], [])
  const shotPosition = useMemo(() => new THREE.Vector3(), [])
  const shotTarget = useMemo(() => new THREE.Vector3(), [])
  const textMask = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = Math.ceil(size.width / 2); canvas.height = Math.ceil(size.height / 2)
    const texture = new THREE.CanvasTexture(canvas); texture.minFilter = THREE.LinearFilter; texture.generateMipmaps = false
    return { canvas, texture, painted: false }
  }, [size])
  useEffect(() => () => textMask.texture.dispose(), [textMask])
  const geometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry(), origins = new Float32Array(count * 3), seeds = new Float32Array(count * 4)
    let seed = 71239
    const random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296 }
    for (let i = 0; i < count; i++) {
      seeds.set([random(), random(), random(), i % 4096], i * 4)
      origins.set([(random() - .5) * 1.3, (random() - .5) * .3, (random() - .5) * 1.3], i * 3)
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
    geometry.setAttribute('aOrigin', new THREE.BufferAttribute(origins, 3))
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4))
    geometry.setAttribute('aAnchor', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
    return geometry
  }, [count])
  const lineGeometry = useMemo(() => {
    const line = new THREE.BufferGeometry(), n = 320
    const seeds = new Float32Array(n * 4)
    for (let i = 0; i < n; i++) {
      const pair = Math.floor(i / 2), x = (pair * .618033) % .95, y = (pair * .317) % 1, z = (pair * .713) % 1
      seeds.set([x + (i % 2) * .043, y, z, i], i * 4)
    }
    line.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
    line.setAttribute('aOrigin', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
    line.setAttribute('aAnchor', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
    line.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4))
    return line
  }, [])
  useEffect(() => () => lineGeometry.dispose(), [lineGeometry])
  const uniforms = useMemo(() => ({
    uTime: { value: 0 }, uStory: { value: 0 }, uBlack: { value: -1 }, uTech: { value: -1 }, uFuture: { value: -1 }, uFooter: { value: -1 },
    uReduced: { value: reduced ? 1 : 0 }, uDpr: { value: 1 }, uActive: { value: 0 },
    uSize: { value: new THREE.Vector2(size.width, size.height) }, uPointer: { value: new THREE.Vector2() }, uSpring: { value: simulation.texture }, uTextMask: { value: textMask.texture },
    uExclusions: { value: Array.from({ length: 8 }, () => new THREE.Vector4(2,2,3,3)) },
  }), [reduced, size, simulation, textMask])
  const apertureUniforms = useMemo(() => ({ uEntry: { value: 0 }, uExit: { value: 0 }, uAspect: { value: size.width / size.height }, uTime: { value: 0 }, uReduced: { value: reduced ? 1 : 0 } }), [size, reduced])
  useEffect(() => {
    const footer = document.querySelector('footer')
    if (!footer) return
    const updateAnchors = () => {
      const bounds = footer.getBoundingClientRect(), halfWidth = size.width / size.height * 3.08
      const excludes = [...footer.querySelectorAll('a, button, p, .footer-links span, .footer-bottom span')].map(element => element.getBoundingClientRect())
      const positions = geometry.attributes.aAnchor as THREE.BufferAttribute
      const data = simulation.anchors.image.data as Float32Array
      for (let i = 0; i < 4096; i++) {
        const f = ((i * 0.61803398875) % 1), row = i % 6
        let x = row < 2 ? (row ? .96 : .04) * size.width : size.width * (.04 + f * .92)
        let y = row < 2 ? f * bounds.height : row === 2 ? 16 : row === 3 ? bounds.height - 20 : bounds.height * .64 + (i % 13 - 6) * 2.2
        if (row === 4) {
          const logo = footer.querySelector('.footer-brand .brand')?.getBoundingClientRect()
          if (logo) { x = logo.left - 24 + (logo.width + 48) * f; y = logo.top - bounds.top - 22 }
        }
        if (row === 5) { const rule = footer.querySelector('.footer-bottom')?.getBoundingClientRect(); if (rule) y = rule.top - bounds.top - 5 }
        x += Math.sin(i * 1.731) * 7; y += Math.cos(i * 1.318) * 7
        if (excludes.some(box => x > box.left - 16 && x < box.right + 16 && y > box.top - bounds.top - 13 && y < box.bottom - bounds.top + 13)) y = i % 2 ? 13 : bounds.height - 12
        data.set([(x / size.width * 2 - 1) * halfWidth, 3.08 - y / size.height * 6.16, 0, 0], i * 4)
      }
      for (let i = 0; i < count; i++) { const j = (i % 4096) * 4; positions.setXYZ(i, data[j], data[j + 1], 0) }
      const links = lineGeometry.attributes.aAnchor as THREE.BufferAttribute
      const seeds = lineGeometry.attributes.aSeed as THREE.BufferAttribute
      for (let i = 0; i < 160; i++) {
        const a = i * 4
        let nearest = (i + 1) % 512, distance = Infinity
        for (let j = 0; j < 512; j++) {
          const d = Math.hypot(data[a] - data[j * 4], data[a + 1] - data[j * 4 + 1])
          if (j !== i && d > .025 && d < distance) { nearest = j; distance = d }
        }
        links.setXYZ(i * 2, data[a], data[a + 1], 0); links.setXYZ(i * 2 + 1, data[nearest * 4], data[nearest * 4 + 1], 0)
        seeds.setW(i * 2, i); seeds.setW(i * 2 + 1, nearest)
      }
      links.needsUpdate = true; seeds.needsUpdate = true
      positions.needsUpdate = true; simulation.anchors.needsUpdate = true
    }
    updateAnchors()
    const observer = new ResizeObserver(updateAnchors); observer.observe(footer)
    footer.querySelectorAll('.footer-main, .footer-bottom').forEach(element => observer.observe(element))
    void document.fonts.ready.then(updateAnchors)
    return () => observer.disconnect()
  }, [size, geometry, count, simulation, lineGeometry])
  useEffect(() => () => { geometry.dispose() }, [geometry])
  useEffect(() => () => simulation.dispose(), [simulation])

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, .05), previousX = energy.pointer.x, previousY = energy.pointer.y
    if (energy.future > .30 && !textMask.painted) {
      const context = textMask.canvas.getContext('2d')!
      context.clearRect(0, 0, textMask.canvas.width, textMask.canvas.height)
      context.save(); context.scale(.5, .5); context.fillStyle = '#fff'; context.shadowColor = '#fff'; context.shadowBlur = 14
      const heading = document.querySelector('#future h2')
      if (heading) {
        const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT)
        let node: Node | null
        while ((node = walker.nextNode())) {
          const range = document.createRange(); range.selectNodeContents(node)
          const box = range.getBoundingClientRect(), style = getComputedStyle(node.parentElement!)
          context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
          context.fillText(node.textContent ?? '', box.left, box.bottom - parseFloat(style.fontSize) * .18)
        }
      }
      context.restore(); textMask.texture.needsUpdate = true; textMask.painted = true
    } else if (energy.future < 0) textMask.painted = false
    energy.pointer.lerp(energy.target, 1 - Math.exp(-8 * dt))
    energy.velocity.set((energy.pointer.x - previousX) / Math.max(.001, dt), (energy.pointer.y - previousY) / Math.max(.001, dt))
    if (energy.velocity.lengthSq() > .0001) energy.direction.copy(energy.velocity).normalize()
    if (energy.originVersion !== originVersion.current && energy.originCount) {
      const attr = geometry.attributes.aOrigin as THREE.BufferAttribute
      for (let i = 0; i < count; i++) { const j = Math.floor(i / count * energy.originCount) * 3; attr.setXYZ(i, energy.origins[j], energy.origins[j + 1], energy.origins[j + 2]) }
      attr.needsUpdate = true; originVersion.current = energy.originVersion
    }
    const active = energy.story > 2.96 && energy.technology < 1.4 || energy.future > -.01
    if (points.current) {
      points.current.visible = active
      const u = points.current.material.uniforms
      u.uTime.value = clock.elapsedTime; u.uStory.value = energy.story; u.uBlack.value = energy.understanding
      u.uTech.value = energy.technology; u.uFuture.value = energy.future; u.uFooter.value = energy.footer
      u.uPointer.value.copy(energy.pointer); u.uActive.value = energy.active ? 1 : 0; u.uDpr.value = gl.getPixelRatio()
      worldPointer.copy(energy.pointer).multiply(new THREE.Vector2(size.width / size.height * 3.08, 3.08))
      energy.world.set(worldPointer.x, worldPointer.y, 0)
      if (energy.footer > -.3 && !reduced) simulation.step(gl, dt, worldPointer, energy.active, -(1 - energy.footer) * 6.16, energy.pressed)
      u.uSpring.value = simulation.texture
      if (energy.footer > -.1) footerText.forEach((element,i) => {
        const box = element.getBoundingClientRect()
        u.uExclusions.value[i].set((box.left-12)/size.width,1-(box.bottom+10)/size.height,(box.right+12)/size.width,1-(box.top-10)/size.height)
      })
      if (connections.current) {
        connections.current.material.uniforms = u
        connections.current.visible = energy.future > .50 || energy.understanding > .3 && energy.understanding < .72
      }
    }
    if (aperture.current) {
      const u = aperture.current.material.uniforms
      u.uEntry.value = smooth(-.50, .03, energy.understanding)
      u.uExit.value = smooth(.77, 1.02, energy.understanding)
      u.uTime.value = reduced ? 0 : clock.elapsedTime
      aperture.current.visible = energy.understanding > -.5 && energy.understanding < 1.04
    }
    const burstDolly = Math.sin(smooth(3.06, 3.95, energy.story) * Math.PI) * (1 - smooth(-.5, 0, energy.understanding))
    const futureDolly = smooth(.1, .8, energy.future) * (1 - smooth(.86, 1.3, energy.future))
    const shot = energy.footer > -.2 ? cameraShots.footerDescent : energy.future > 0 ? cameraShots.futureField : energy.technology > .65 ? cameraShots.blockchainWide : energy.technology > .3 ? cameraShots.roboticsThreeQuarter : energy.technology > -.2 ? cameraShots.liquidHero : energy.understanding > -.5 ? cameraShots.blackVoid : energy.story > 3.6 ? cameraShots.waveWide : cameraShots.explosionInside
    const weight = reduced ? 0 : energy.footer > -.2 ? smooth(-.2,.3,energy.footer) : energy.future > 0 ? futureDolly : energy.technology >= 0 && energy.technology < 1.3 ? .6 : burstDolly
    shotPosition.set(0,0,8).lerp(shotTarget.fromArray(shot.position),weight)
    camera.position.copy(shotPosition)
    shotTarget.fromArray(shot.target).multiplyScalar(weight); camera.lookAt(shotTarget)
    const perspective = camera as THREE.PerspectiveCamera
    const fov = THREE.MathUtils.lerp(42,shot.fov,weight)
    if (Math.abs(perspective.fov-fov)>.001) { perspective.fov=fov; perspective.updateProjectionMatrix() }
    camera.userData.focusDistance = THREE.MathUtils.lerp(8,shot.focus,weight)
    const d = diagnostics.current
    d.frames++
    if (clock.elapsedTime - d.start > 1.5) {
      gl.domElement.dataset.fps = String(Math.round(d.frames / (clock.elapsedTime - d.start)))
      gl.domElement.dataset.particles = String(count)
      gl.domElement.dataset.phase = energy.footer > 0 ? 'footer' : energy.future > 0 ? 'future' : energy.technology >= 0 && energy.technology < 1.3 ? 'technology' : energy.understanding > -.5 && energy.understanding < 1 ? 'understanding' : energy.story > 3 ? 'release' : 'standby'
      gl.domElement.dataset.liquidForce = energy.liquidForce.toFixed(2)
      gl.domElement.dataset.magnet = energy.footer > 0 && energy.active && !reduced ? 'active' : 'rest'
      gl.domElement.dataset.hover = energy.hover
      d.frames = 0; d.start = clock.elapsedTime
    }
  }, -1)
  return <>
    <mesh ref={aperture} frustumCulled={false} renderOrder={-100}><planeGeometry args={[2, 2]} /><shaderMaterial uniforms={apertureUniforms} vertexShader={apertureVertex} fragmentShader={apertureFragment} transparent depthTest={false} depthWrite={false} toneMapped={false} /></mesh>
    <points ref={points} geometry={geometry} frustumCulled={false} renderOrder={3}><shaderMaterial uniforms={uniforms} vertexShader={fieldVertex} fragmentShader={fieldFragment} transparent depthWrite={false} toneMapped={false} /></points>
    <lineSegments ref={connections} geometry={lineGeometry} frustumCulled={false} renderOrder={2}><shaderMaterial uniforms={uniforms} vertexShader={fieldVertex} fragmentShader="varying vec3 vColor;varying float vAlpha;uniform float uTime,uFuture,uFooter;void main(){float pulse=pow(.5+.5*sin(uTime*.65+gl_FragCoord.x*.007),5.);float a=uFooter>0.?pulse*.4:smoothstep(.5,.7,uFuture)*.17;if(uFuture<0.)a=.12;gl_FragColor=vec4(vColor,vAlpha*a);}" transparent depthWrite={false} toneMapped={false} /></lineSegments>
    <MorphAssembly reduced={reduced} />
  </>
}

export default function SciferEnergyField({ reduced }: { reduced: boolean }) {
  useDirector(reduced)
  return <EnergyBoundary><div className="scifer-energy-field" aria-hidden="true"><Canvas fallback={<GraphicsFallback />} eventSource={document.body} eventPrefix="client" dpr={[1, innerWidth < 700 ? 1.15 : 1.5]} camera={{ position: [0, 0, 8], fov: 42, near: .1, far: 60 }} gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }} onCreated={({ gl }) => { gl.transmissionResolutionScale = .5 }}><Suspense fallback={null}><Studio /><Field reduced={reduced} /></Suspense></Canvas></div></EnergyBoundary>
}
