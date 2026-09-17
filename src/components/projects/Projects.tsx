import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowRight, ArrowUpRight, List, Grid2X2 } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects } from '../../content/site'
import { Eyebrow } from '../Identity'
import { RevealText } from '../motion/RevealText'
import { ProjectVisual } from './ProjectVisual'
import { createProjectsTimeline } from '../../animations/projectsTimeline'
import { scrollToPosition } from '../../animations/runtime'

export function Research({ onProject }: { onProject: (index: number) => void }) {
  const [preview, setPreview] = useState<number | null>(null)
  const floating = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const moveRef = useRef<{ x: (value: number) => void; y: (value: number) => void } | null>(null)
  useEffect(() => {
    if (reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const el = floating.current!
    moveRef.current = { x: gsap.quickTo(el, 'x', { duration: 0.55, ease: 'power3.out' }), y: gsap.quickTo(el, 'y', { duration: 0.55, ease: 'power3.out' }) }
    return () => { gsap.killTweensOf(el); moveRef.current = null }
  }, [reduced])
  const research = [
    { title: 'Machine intelligence', index: 0, caption: 'Perception, learning, and real-world understanding.' },
    { title: 'Autonomous systems', index: 1, caption: 'Bringing perception, planning, and control together.' },
    { title: 'Environmental intelligence', index: 3, caption: 'Reading the signals of a changing world.' },
    { title: 'Connected infrastructure', index: 4, caption: 'Intelligence at the source. Possibility at every node.' },
  ]
  return <section id="research" className="research-index-section section-padding">
    <div className="research-index-intro"><Eyebrow number="07">AN OPEN FIELD OF INQUIRY</Eyebrow><RevealText lines={['Better questions.', 'New possibilities.']} /><p>Research begins with curiosity.<br />Progress begins when we act on it.</p><span className="micro-label">RESEARCH DIRECTIONS / {new Date().getFullYear()}</span></div>
    <div className="research-index-list" onPointerLeave={() => setPreview(null)}>{research.map((item, i) => <button key={item.title} className="research-row" data-cursor="view" onClick={() => { setPreview(null); onProject(item.index) }} onPointerEnter={e => { if (e.pointerType === 'mouse' && moveRef.current) setPreview(item.index) }} onPointerMove={e => { moveRef.current?.x(Math.min(innerWidth - 300, e.clientX + 25)); moveRef.current?.y(Math.max(90, Math.min(innerHeight - 220, e.clientY - 160))) }}><span className="research-row-number">0{i + 1}</span><span className="research-row-copy"><span>{item.title}</span><span className="research-row-description">{item.caption}</span></span><ArrowUpRight size={23} /></button>)}<div className="research-index-bottom"><span>EXPLORATION WITHOUT SILOS.</span><a href="#projects">View selected projects <ArrowRight size={15} /></a></div></div>
    <div ref={floating} className={`floating-project-preview ${preview !== null ? 'preview-visible' : ''}`} aria-hidden="true">{preview !== null && <><ProjectVisual type={projects[preview].type} /><span>{projects[preview].title} <ArrowUpRight size={13} /></span></>}</div>
  </section>
}

export function HorizontalProjects({ onProject }: { onProject: (index: number) => void }) {
  const [filter, setFilter] = useState('Featured')
  const [view, setView] = useState<'gallery' | 'index'>('gallery')
  const [active, setActive] = useState(0)
  const root = useRef<HTMLElement>(null), track = useRef<HTMLDivElement>(null), progress = useRef<HTMLSpanElement>(null)
  const activeRef = useRef(0)
  const controller = useRef<ReturnType<typeof createProjectsTimeline> | null>(null)
  const reduced = !!useReducedMotion()
  const shown = filter === 'Featured' ? projects : filter === 'Artificial intelligence' ? [projects[0], projects[4]] : filter === 'Robotics' ? [projects[1]] : [projects[2], projects[3]]
  useLayoutEffect(() => {
    if (view === 'index') return
    controller.current = createProjectsTimeline(root.current!, track.current!, value => {
      if (progress.current) progress.current.style.transform = `scaleX(${value})`
      const next = Math.round(value * (shown.length - 1))
      if (next !== activeRef.current) { activeRef.current = next; setActive(next) }
    })
    const refresh = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => { cancelAnimationFrame(refresh); controller.current?.media.revert(); controller.current = null }
  }, [filter, view, shown.length])
  const resetScroll = () => {
    const trigger = controller.current?.getTrigger()
    if (trigger?.isActive) scrollToPosition(trigger.start, true)
    activeRef.current = 0; setActive(0)
  }
  const goTo = (index: number) => {
    const next = Math.max(0, Math.min(shown.length - 1, index))
    const trigger = controller.current?.getTrigger()
    if (trigger) scrollToPosition(trigger.start + (trigger.end - trigger.start) * next / Math.max(1, shown.length - 1), reduced)
    else track.current?.children[next]?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'center', inline: 'center' })
  }
  return <section id="projects" ref={root} className={`projects-exhibition ${view === 'index' ? 'is-index-view' : ''}`}>
    <div className="projects-exhibition-header section-padding"><div><Eyebrow>SELECTED EXPLORATIONS / 2026</Eyebrow><h2>Ideas in the <em>real world.</em></h2></div><div className="project-view-switch" role="group" aria-label="Project display"><button onClick={() => { resetScroll(); setView('gallery') }} aria-pressed={view === 'gallery'}><Grid2X2 size={14} />Gallery</button><span>/</span><button onClick={() => { resetScroll(); setView('index') }} aria-pressed={view === 'index'}><List size={15} />Index</button></div></div>
    <div className="project-filter-bar section-padding"><div className="project-filters" role="group" aria-label="Filter projects">{['Featured', 'Artificial intelligence', 'Robotics', 'Connected systems'].map(name => <button key={name} onClick={() => { resetScroll(); setFilter(name) }} className={filter === name ? 'active' : ''} aria-pressed={filter === name}>{name}</button>)}</div><span className="micro-label">0{shown.length} EXPLORATIONS</span></div>
    <div className="project-viewport"><motion.div layout ref={track} className="project-track"><AnimatePresence mode="popLayout">{shown.map((project, i) => <motion.button layout key={project.number} className={`project-card exhibition-project project-tone-${project.type}`} data-cursor="view" onPointerMove={e => { if (reduced || e.pointerType !== 'mouse') return; const b = e.currentTarget.getBoundingClientRect(); gsap.to(e.currentTarget, { '--pointer-x': (e.clientX-b.left)/b.width-.5, '--pointer-y': (e.clientY-b.top)/b.height-.5, duration: .7, overwrite: 'auto' }) }} onPointerLeave={e => { gsap.to(e.currentTarget, { '--pointer-x': 0, '--pointer-y': 0, duration: .8, overwrite: 'auto' }) }} onClick={() => onProject(projects.indexOf(project))} onFocus={e => { if (e.currentTarget.matches(':focus-visible')) goTo(i) }} initial={{ opacity: 0, clipPath: reduced ? 'inset(0)' : 'inset(0 0 15% 0)' }} animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.55, ease: [0.16, 1, 0.3, 1] }}>
      <svg className="project-display-number" viewBox="0 0 400 350" aria-hidden="true"><text x="0" y="280" fontSize="320" fill="currentColor">{project.number}</text></svg><div className="project-frame-meta"><span>SC / {project.number}</span><span>RESEARCH CONCEPT</span><span>{new Date().getFullYear()}</span></div>
      <motion.div className="project-shared-visual" layoutId={`project-visual-${project.number}`} transition={{ duration: reduced ? 0 : 0.55, ease: [0.16, 1, 0.3, 1] }}><ProjectVisual type={project.type} /></motion.div>
      <div className="exhibition-project-copy"><span className="project-discipline">{project.category}</span><div className="exhibition-project-title"><h3>{project.title}</h3><span className="project-arrow"><ArrowUpRight size={32} /></span></div><div className="project-hover-details"><span>{project.copy}</span><span>{project.tags.join(' / ')}</span></div></div>
    </motion.button>)}</AnimatePresence></motion.div></div>
    <div className="project-navigation section-padding"><span className="project-gallery-hint">{view === 'index' ? 'A COLLECTION OF POSSIBILITIES' : 'SCROLL TO EXPLORE THE COLLECTION'}<ArrowRight size={16} /></span><div className="project-position"><span>0{active + 1}</span><span className="project-progress-track"><span ref={progress} /></span><span>0{shown.length}</span></div><div className="project-directions"><button onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Previous project"><ArrowLeft size={18} /></button><button onClick={() => goTo(active + 1)} disabled={active === shown.length - 1} aria-label="Next project"><ArrowRight size={18} /></button></div></div>
  </section>
}
