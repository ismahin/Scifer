import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowDown, ArrowUpRight, Cpu, Scan, Network, Activity, ArrowRight } from 'lucide-react'
import { Eyebrow } from '../Identity'
import { RevealText } from '../motion/RevealText'
import { MagneticLink } from '../motion/MagneticLink'
import { createStoryTimeline } from '../../animations/storyTimeline'
import type { StoryState } from '../Scene'
import { componentInfo } from '../data'

const StoryScene = lazy(() => import('../Scene').then(m => ({ default: m.StoryScene })))
const chapters = ['Introduction', 'Architecture', 'Engineering', 'Intelligence', 'Data systems']

export function Story({ reduced, ready, onSceneReady }: { reduced: boolean; ready: boolean; onSceneReady: () => void }) {
  const wrapper = useRef<HTMLDivElement>(null)
  const story = useRef<StoryState>({ progress: 0, reduced, intro: !ready })
  const [active, setActive] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  useEffect(() => { story.current.selected = selected }, [selected])
  useEffect(() => {
    if (selected === null) return
    const origin = window.scrollY
    const release = () => { if (Math.abs(window.scrollY - origin) > innerHeight * .4) setSelected(null) }
    window.addEventListener('scroll', release, { passive: true })
    return () => window.removeEventListener('scroll', release)
  }, [selected])
  useEffect(() => { const reset = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null) }; window.addEventListener('keydown', reset); return () => window.removeEventListener('keydown', reset) }, [])
  const activeRef = useRef(0)
  const visible = useInView(wrapper)
  useEffect(() => { story.current.reduced = reduced }, [reduced])
  useEffect(() => { story.current.intro = !ready }, [ready])
  useEffect(() => {
    const ctx = createStoryTimeline(wrapper.current!, story.current, reduced, next => {
      if (activeRef.current !== next) { activeRef.current = next; setActive(next) }
    })
    return () => ctx.revert()
  }, [reduced])
  const enter = (delay: number) => ({ duration: reduced ? 0 : 1.1, delay: reduced ? 0 : delay, ease: [0.16, 1, 0.3, 1] as const })
  return <div ref={wrapper} className={`story editorial-story scene-${active} ${ready ? 'experience-ready' : ''}`}>
    <div className="story-stage">
      <div className="stage-grid" />
      <div className="orbital orbital-one" /><div className="orbital orbital-two" />
      <div className="webgl-area" role="img" aria-label="Interactive Scifer neural processing core. Components can also be selected from the architecture controls below."><Suspense fallback={<div className="scene-loading-label">PREPARING THE CORE</div>}><StoryScene story={story} reduced={reduced} visible={visible} onReady={onSceneReady} selected={selected} onSelect={setSelected} /></Suspense></div>
      <div className={`device-annotation annotation-top ${active === 0 ? 'is-visible' : ''}`}><span className="annotation-dot" />SC / NEURAL ENGINE<span className="annotation-line" /></div>
      <div className={`device-caption ${active < 4 ? 'is-visible' : ''}`}><span className="caption-cross">+</span><span>SCIFER CORE<span>A STUDY IN CONNECTED INTELLIGENCE</span></span><span className="caption-version">S — 01</span></div>
      {selected !== null && <div className="story-inspection" role="status"><span className="micro-label">COMPONENT / 0{selected + 1}</span><strong>{componentInfo[selected].name}</strong><p>{componentInfo[selected].description}</p><button onClick={() => setSelected(null)}>Reset view <span>ESC ↙</span></button></div>}
      <div className="scene-index"><span>0{active + 1}</span><div>{chapters.map((name, i) => <i key={name} className={active === i ? 'active' : ''} />)}</div><span className="index-end">05</span></div>
    </div>
    <section id="home" className="story-section hero editorial-hero">
      <motion.div className="hero-meta" initial={{ opacity: 0 }} animate={{ opacity: ready ? 1 : 0 }} transition={enter(0.4)}><Eyebrow>ADVANCED INTELLIGENT SYSTEMS</Eyebrow><span>INDEPENDENT THINKING.<br />REAL-WORLD POSSIBILITIES.</span><span>R&D / {new Date().getFullYear()}<br />23.8103° N — 90.4125° E</span></motion.div>
      <h1 className="hero-title" aria-label="Engineering intelligence."><span className="hero-line hero-line-back" aria-hidden="true"><motion.span initial={{ y: '110%' }} animate={{ y: ready ? '0%' : '110%' }} transition={enter(0.05)}>Engineering</motion.span></span><span className="hero-line hero-line-front" aria-hidden="true"><motion.span initial={{ y: '110%' }} animate={{ y: ready ? '0%' : '110%' }} transition={enter(0.18)}>intelligence<span className="hero-stop">.</span></motion.span></span></h1>
      <motion.div className="hero-bottom" initial={{ opacity: 0, y: 12 }} animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 12 }} transition={enter(0.5)}>
        <p className="hero-description">We bring artificial intelligence, robotics, and connected systems together.<br /><span>To build what comes next.</span></p>
        <div className="hero-actions"><MagneticLink href="#technology">Explore technology</MagneticLink><a href="#research" className="text-link">Our research <ArrowUpRight size={15} /></a></div>
        <a href="#architecture" className="editorial-scroll"><span>SCROLL TO DISCOVER</span><span className="scroll-chapter">01 <i /> 09 <ArrowDown size={19} /></span></a>
      </motion.div>
      <div className="hero-baseline"><span>PRECISION IN EVERY POSSIBILITY.</span><span>AI / ROBOTICS / CONNECTED SYSTEMS</span><span>SCIFER®</span></div>
    </section>
    <section id="architecture" className="story-section chapter-section chapter-architecture">
      <svg className="chapter-display-index" viewBox="0 0 400 350" aria-hidden="true"><text x="0" y="280" fontSize="320" fill="currentColor">01</text></svg>
      <div className="chapter-copy"><Eyebrow number="01">ONE ARCHITECTURE. ENDLESS POSSIBILITY.</Eyebrow><RevealText lines={['A new core.', 'A new perspective.']} /><p>Built to sense, understand, and act. Meet the foundation of a more intelligent world.</p><div className="spec-list">{[['Neural computing', Cpu], ['Sensor fusion', Scan], ['Edge intelligence', Network], ['Adaptive control', Activity]].map(([label, Icon], i) => { const I = Icon as typeof Cpu; return <div key={i}><I size={16} /><span>{label as string}</span><span className="spec-index">0{i + 1}</span></div> })}</div></div>
      <span className="chapter-side-note micro-label">SYSTEM OVERVIEW / SC–01</span>
    </section>
    <section id="engineering" className="story-section chapter-section chapter-engineering">
      <div className="architecture-controls" aria-label="Inspect the architecture">{componentInfo.map((part, i) => <button key={part.name} onClick={() => setSelected(i)} aria-pressed={selected === i}>{part.name}</button>)}</div>
      <svg className="chapter-display-index" viewBox="0 0 400 350" aria-hidden="true"><text x="0" y="280" fontSize="320" fill="currentColor">02</text></svg>
      <div className="chapter-copy"><Eyebrow number="02">NOTHING HERE IS BY CHANCE</Eyebrow><RevealText lines={['Precision.', 'Layer by', <em>layer.</em>]} /><div className="chapter-note"><span className="chapter-note-rule" /><p>Six specialized systems. One shared purpose. Every layer brings sensing, computation, and communication closer together.</p></div><MagneticLink href="#explorer">Look inside the core</MagneticLink></div>
      <span className="chapter-side-note micro-label">ASSEMBLED → EXPOSED → UNDERSTOOD</span>
    </section>
    <section id="intelligence" className="story-section chapter-section chapter-intelligence">
      <svg className="chapter-display-index" viewBox="0 0 400 350" aria-hidden="true"><text x="0" y="280" fontSize="320" fill="currentColor">03</text></svg>
      <div className="chapter-copy"><Eyebrow number="03">THINK CLOSER TO THE SOURCE</Eyebrow><RevealText lines={['A machine.', 'With a mind.']} /><p>Intelligence belongs where the action happens. Live inputs become considered decisions, right at the edge.</p><div className="intelligence-features"><span><i />Real-time processing</span><span><i />Edge intelligence</span><span><i />Multi-sensor fusion</span><span><i />Autonomous decision systems</span></div></div>
      <span className="chapter-side-note micro-label">PERCEPTION / COMPUTATION / DECISION</span>
    </section>
    <section id="data" className="story-section chapter-section chapter-data">
      <svg className="chapter-display-index" viewBox="0 0 400 350" aria-hidden="true"><text x="0" y="280" fontSize="320" fill="currentColor">04</text></svg>
      <div className="chapter-copy"><Eyebrow number="04">FROM SIGNAL TO SIGNIFICANCE</Eyebrow><RevealText lines={['From data.', <em>To decision.</em>]} /><p>Individual signals. Shared understanding. We find the patterns that help intelligent systems make their next move.</p><div className="data-flow"><span>Sense</span><ArrowRight size={14} /><span>Understand</span><ArrowRight size={14} /><span>Act</span></div></div>
      <span className="chapter-side-note micro-label">A LIVE STUDY IN CONNECTED INFORMATION</span>
    </section>
  </div>
}
