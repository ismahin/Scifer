import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Logo } from '../Identity'
import { motionRuntime } from '../../animations/runtime'
import { sceneInteraction } from '../../animations/interaction'

export function ExperienceIntro({ sceneReady, reduced, onComplete }: { sceneReady: boolean; reduced: boolean; onComplete: () => void }) {
  const [fontsReady, setFontsReady] = useState(false)
  const [closed, setClosed] = useState(false)
  const counter = useRef<HTMLSpanElement>(null)
  const line = useRef<HTMLDivElement>(null)
  const number = useRef({ value: 0 })
  const done = useRef(false)
  const callback = useRef(onComplete)
  callback.current = onComplete
  const complete = () => { if (done.current) return; done.current = true; setClosed(true); callback.current() }
  useEffect(() => {
    let live = true
    document.fonts.ready.then(() => { if (live) setFontsReady(true) })
    const fontLimit = setTimeout(() => setFontsReady(true), 2500)
    const failOpen = setTimeout(complete, 6500)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { live = false; clearTimeout(fontLimit); clearTimeout(failOpen); document.body.style.overflow = previous }
  }, [])
  useEffect(() => {
    if (closed) { document.body.style.overflow = ''; return }
    const target = (fontsReady ? 28 : 0) + (sceneReady ? 72 : 0)
    const tween = gsap.to(number.current, { value: target, duration: reduced ? 0 : target === 100 ? 0.45 : 0.25, ease: 'power2.out', onUpdate: () => { if (counter.current) counter.current.textContent = String(Math.round(number.current.value)).padStart(3, '0'); if (line.current) line.current.style.transform = `scaleX(${number.current.value / 100})` }, onComplete: () => { if (target === 100) complete() } })
    return () => { tween.kill() }
  }, [fontsReady, sceneReady, reduced, closed])
  return <AnimatePresence>{!closed && <motion.div className="experience-intro" role="status" aria-label="Initializing the SCIFER experience" initial={false} exit={{ clipPath: reduced ? 'inset(0)' : 'inset(0 0 100% 0)', opacity: reduced ? 0 : 1 }} transition={{ duration: reduced ? 0.1 : 0.65, ease: [0.76, 0, 0.24, 1] }}>
    <div className="intro-top"><Logo /><span>SCIFER / DIGITAL EXHIBITION</span></div><div className="intro-silhouette" aria-hidden="true"><svg viewBox="0 0 320 300"><path d="m30 115 130-70 130 70-130 70zM30 155l130-70 130 70-130 70zM30 195l130-70 130 70-130 70z" fill="none" stroke="currentColor" strokeWidth=".65" /></svg></div><div className="intro-main"><span className="micro-label">INITIALIZING INTELLIGENCE</span><div className="intro-number" aria-hidden="true"><span ref={counter}>000</span><span>%</span></div><div className="intro-track"><div ref={line} /></div><div className="intro-status"><span>{sceneReady ? 'CORE ONLINE' : 'PREPARING THE CORE'}</span><span>{fontsReady ? 'TYPOGRAPHY READY' : 'SETTING THE TYPE'}</span></div></div><div className="intro-bottom"><span>PRECISION IS A WAY OF THINKING.</span><button onClick={complete}>Skip introduction ↗</button></div>
  </motion.div>}</AnimatePresence>
}

export function InteractionSystem({ reduced, ready }: { reduced: boolean; ready: boolean }) {
  const cursor = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (reduced || !ready) return
    const media = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (!media.matches) return
    const dot = cursor.current!, text = label.current!
    const x = gsap.quickTo(dot, 'x', { duration: 0.25, ease: 'power3.out' }), y = gsap.quickTo(dot, 'y', { duration: 0.25, ease: 'power3.out' })
    let mode = ''
    const inspect = () => { if (sceneInteraction.hoveredObject) { mode = 'inspect'; dot.dataset.mode = mode; text.textContent = 'INSPECT' } else if (mode === 'inspect') { mode = ''; dot.dataset.mode = ''; text.textContent = '' } }
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      sceneInteraction.pointerX = event.clientX; sceneInteraction.pointerY = event.clientY
      document.documentElement.classList.add('custom-pointer')
      dot.style.opacity = '1'; x(event.clientX); y(event.clientY)
      const target = event.target as HTMLElement
      const next = sceneInteraction.hoveredObject && target.tagName === 'CANVAS' ? 'inspect' : target.closest('[data-cursor="view"]') ? 'view' : target.closest('.explorer-canvas') ? 'drag' : target.closest('a[target="_blank"]') ? 'external' : target.closest('a, button, [role="tab"]') ? 'link' : target.closest('input, textarea, select') ? 'input' : ''
      if (next !== mode) { mode = next; dot.dataset.mode = next; text.textContent = next === 'inspect' ? 'INSPECT' : next === 'view' ? 'VIEW' : next === 'drag' ? 'DRAG' : next === 'external' ? '↗' : '' }
    }
    const forwarded = (event: Event) => move((event as CustomEvent<PointerEvent>).detail)
    const hide = () => { dot.style.opacity = '0'; document.documentElement.classList.remove('custom-pointer') }
    const key = (e: KeyboardEvent) => { if (e.key === 'Tab') hide() }
    window.addEventListener('scifer:pointer', forwarded); document.addEventListener('pointerleave', hide); window.addEventListener('keydown', key)
    const onMedia = () => { if (!media.matches) hide() }
    media.addEventListener('change', onMedia)
    window.addEventListener('scifer:interaction', inspect)
    return () => { window.removeEventListener('scifer:interaction', inspect); window.removeEventListener('scifer:pointer', forwarded); document.removeEventListener('pointerleave', hide); window.removeEventListener('keydown', key); media.removeEventListener('change', onMedia); gsap.killTweensOf(dot); hide() }
  }, [ready, reduced])
  return <div ref={cursor} className="custom-cursor" aria-hidden="true"><span ref={label} /></div>
}

const progressSections = [['home', 'INTRODUCTION'], ['architecture', 'THE CORE'], ['engineering', 'ENGINEERING'], ['intelligence', 'INTELLIGENCE'], ['data', 'INFORMATION'], ['technology', 'DISCIPLINES'], ['research', 'RESEARCH'], ['projects', 'SELECTED WORK'], ['about', 'CONNECTION']]

export function ScrollProgress() {
  const [active, setActive] = useState(0)
  const [shown, setShown] = useState(false)
  const line = useRef<HTMLSpanElement>(null)
  const last = useRef(0)
  const shownRef = useRef(false)
  useEffect(() => {
    const triggers = progressSections.map(([id], i) => ScrollTrigger.create({ trigger: `#${id}`, start: 'top 45%', end: 'bottom 45%', onEnter: () => { last.current = i; setActive(i) }, onEnterBack: () => { last.current = i; setActive(i) } }))
    const total = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: self => { motionRuntime.progress = self.progress; if (line.current) line.current.style.transform = `scaleY(${self.progress})`; const next = self.scroll() > innerHeight * 0.6; if (next !== shownRef.current) { shownRef.current = next; setShown(next) } } })
    return () => { total.kill(); triggers.forEach(t => t.kill()) }
  }, [])
  return <a href="#home" className={`global-progress ${shown ? 'is-visible' : ''}`} aria-label={`Current chapter ${active + 1}: ${progressSections[active][1]}. Back to top.`}><span className="global-progress-number">0{active + 1}</span><span className="global-progress-track"><span ref={line} /></span><span className="global-progress-label">{progressSections[active][1]}</span></a>
}

export function Marquee({ reduced }: { reduced: boolean }) {
  const wrap = useRef<HTMLDivElement>(null), track = useRef<HTMLDivElement>(null)
  const visible = useInView(wrap)
  useEffect(() => {
    if (reduced || !visible) return
    let position = 0, speed = 0
    const tick = (_time: number, delta: number) => { const dt = Math.min(delta, 50) / 1000; const target = Math.min(75, Math.abs(motionRuntime.velocity) * 1.8) * motionRuntime.direction; speed += (target - speed) * (1 - Math.exp(-dt * 3)); position += dt * speed; const width = (track.current?.scrollWidth ?? 1) / 2; position = ((position % width) + width) % width; if (track.current) track.current.style.transform = `translateX(${-position}px)` }
    gsap.ticker.add(tick)
    return () => { gsap.ticker.remove(tick) }
  }, [reduced, visible])
  return <div ref={wrap} className="intelligence-marquee" role="img" aria-label="Sense. Understand. Act."><div ref={track} aria-hidden="true">{[0, 1].map(i => <span key={i}>SENSE <i>↗</i> UNDERSTAND <i>↗</i> ACT <i>↗</i>&nbsp;</span>)}</div></div>
}
