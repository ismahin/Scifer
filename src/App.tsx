import { NetworkSequence } from './components/NetworkSequence'
import { Logo, Eyebrow } from './components/Identity'
import { Header } from './components/Header'
import { Story } from './components/story/Story'
import { Technologies } from './components/Technologies'
import { Research, HorizontalProjects } from './components/projects/Projects'
import { ProjectVisual } from './components/projects/ProjectVisual'
import { technologyData, projects } from './content/site'
import { Statement, RevealText } from './components/motion/RevealText'
import { MagneticLink } from './components/motion/MagneticLink'
import { ExperienceIntro, InteractionSystem, ScrollProgress, Marquee } from './components/motion/ExperienceUI'
import { motionRuntime } from './animations/runtime'
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { AnimatePresence, LayoutGroup, motion, useInView, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, ArrowRight, Radio, Plus, Minus, RotateCcw, MoveUpRight, X, ChevronRight, Check, Download, Mail, Globe2 } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { componentInfo } from './components/data'

const SciferEnergyField = lazy(() => import('./energy/SciferEnergyField'))
const ExplorerScene = lazy(() => import('./components/Scene').then(m => ({ default: m.ExplorerScene })))

gsap.registerPlugin(ScrollTrigger)

function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion()
  return <motion.div className={className} initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>
}

function Explorer({ reduced }: { reduced: boolean }) {
  const [selected, setSelected] = useState<number | null>(null)
  const [resetKey, setResetKey] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const entry = useRef({ value: 0 })
  const [interactive, setInteractive] = useState(false)
  const interactiveRef = useRef(false)
  useEffect(() => { const trigger = ScrollTrigger.create({ trigger: ref.current, start: 'top bottom', end: 'center center', onUpdate: self => { entry.current.value = self.progress; const next = self.progress > .9; if (next !== interactiveRef.current) { interactiveRef.current = next; setInteractive(next) } } }); return () => trigger.kill() }, [])
  const visible = useInView(ref, { margin: '100px' })
  const loaded = useInView(ref, { once: true, margin: '400px' })
  const item = selected === null ? null : componentInfo[selected]
  useEffect(() => { const reset = (e: KeyboardEvent) => { if (e.key === 'Escape') { setSelected(null); setResetKey(k => k + 1) } }; window.addEventListener('keydown', reset); return () => window.removeEventListener('keydown', reset) }, [])
  return <section id="explorer" className="explorer-section section-padding">
    <Reveal className="explorer-header"><Eyebrow number="06">A CLOSER LOOK</Eyebrow><div className="section-heading"><h2>Meet the mind<br /><span>inside the machine.</span></h2><p>Good engineering invites a closer look.<br />Go inside the SCIFER Core.</p></div></Reveal>
    <div ref={ref} className="explorer-shell"><div className="explorer-topbar"><span><span className="status-dot" />LIVE PRODUCT EXPLORER</span><span>SCIFER CORE — S01</span></div><div className="explorer-canvas" data-lenis-prevent>{loaded && <Suspense fallback={<div className="scene-loader">Loading product explorer</div>}><ExplorerScene selected={selected} onSelect={setSelected} resetKey={resetKey} visible={visible} reduced={reduced} entry={entry} /></Suspense>}</div><div className="explorer-panel"><span className="micro-label">EXPLORE THE COMPONENTS</span><div className="component-list">{componentInfo.map((c, i) => <button key={c.name} className={selected === i ? 'active' : ''} onClick={() => setSelected(selected === i ? null : i)} aria-expanded={selected === i}><span className="component-number">0{i + 1}</span><span>{c.name}</span>{selected === i ? <Minus size={16} /> : <Plus size={16} />}</button>)}</div><AnimatePresence mode="wait"><motion.div key={selected ?? 'none'} className="component-description" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}><span className="micro-label">{item?.detail ?? 'UNIFIED INTELLIGENCE'}</span><h3>{item?.subtitle ?? 'Explore from every angle.'}</h3><p>{item?.description ?? 'Select a blue hotspot or a component from the list to discover the engineering behind our intelligent architecture.'}</p></motion.div></AnimatePresence></div><div className="explorer-bottom"><span><MoveUpRight size={15} />{interactive || reduced ? 'Drag to explore' : 'Scroll to reveal'} <i />Scroll to zoom</span><button onClick={() => { setSelected(null); setResetKey(k => k + 1) }}><RotateCcw size={14} />Reset view</button></div></div>
  </section>
}

function Connected() {
  return <section id="about" className="connected-section section-padding"><Reveal className="connected-copy"><Eyebrow number="08">A SHARED INTELLIGENT FUTURE</Eyebrow><RevealText lines={['Intelligence,', 'without limits.']} /><p>Creating intelligent systems that connect people, machines, and environments.</p><p className="connected-secondary">We are a technology and research company working across disciplines, turning ambitious ideas into thoughtfully engineered systems.</p><div className="connected-values"><span><Globe2 size={18} />Built to connect</span><span><Radio size={18} />Designed for impact</span></div></Reveal><div className="globe-wrap"><span className="globe-caption"><span className="status-dot" />LOCAL INTELLIGENCE. GLOBAL POSSIBILITY.</span><div className="globe-coordinate">01 — ∞<span>CONNECTED BY POSSIBILITY</span></div></div></section>
}

function FinalSection({ reduced, onContact }: { reduced: boolean; onContact: () => void }) {
  return <><section id="future" className={`future-sequence ${reduced ? 'is-reduced' : ''}`}><div className="final-section section-padding">
    <div className="future-copy"><Eyebrow>THE NEXT CHAPTER STARTS WITH AN IDEA</Eyebrow><h2>Build<br />what comes<br /><em>next.</em></h2><p>Transform ideas into intelligent systems.</p><div className="final-buttons"><MagneticLink onClick={onContact}>Start a project</MagneticLink><a href="#projects" className="button button-text">Explore our work <ArrowRight size={17} /></a></div></div>
    <span className="final-bottom-note"><span className="status-dot" />POSSIBILITY, TAKING SHAPE.</span><span className="future-coordinate micro-label">SC / SYSTEM BLUEPRINT<br />EVERYTHING RECONNECTS.</span>
  </div></section><div className="footer-descent" aria-hidden="true"><span className="micro-label">ENERGY NEVER ENDS. IT TRANSFORMS.</span></div></>
}

function Footer({ onContact }: { onContact: () => void }) {
  return <footer className="site-footer section-padding"><div className="footer-main"><div className="footer-brand"><a href="#home" aria-label="SCIFER home"><Logo /></a><p>Precision. Intelligence.<br />A better tomorrow.</p></div><div className="footer-links"><div><span>EXPLORE</span><a href="#technology">Technology</a><a href="#research">Research</a><a href="#projects">Projects</a></div><div><span>COMPANY</span><a href="#about">About SCIFER</a><button onClick={onContact}>Contact <ArrowUpRight size={13} /></button><a href="#explorer">Inside the core</a></div><div><span>CONNECT</span><a href={import.meta.env.VITE_LINKEDIN_URL || "https://www.linkedin.com/"} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={13} /></a><a href={import.meta.env.VITE_GITHUB_URL || "https://github.com/"} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={13} /></a><a href={import.meta.env.VITE_X_URL || "https://x.com/"} target="_blank" rel="noreferrer">X <ArrowUpRight size={13} /></a></div></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} SCIFER. All rights reserved.</span><span className="footer-signoff"><span className="status-dot" />ENGINEERING THE INTELLIGENT FUTURE.</span><a href="#home">Back to top <ArrowUpRight size={14} /></a></div></footer>
}

function Modal({ children, onClose, title, project = false }: { children: ReactNode; onClose: () => void; title: string; project?: boolean }) {
  const panel = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const focused = document.activeElement as HTMLElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    motionRuntime.lenis?.stop()
    document.querySelector('main')?.setAttribute('inert', '')
    document.querySelector('header')?.setAttribute('inert', '')
    document.querySelector('footer')?.setAttribute('inert', '')
    panel.current?.focus()
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab') {
        const elements = panel.current?.querySelectorAll<HTMLElement>('button, a[href], input, textarea, select, [tabindex="0"]')
        if (!elements?.length) return
        const first = elements[0], last = elements[elements.length - 1]
        if (e.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) { last.focus(); e.preventDefault() }
        else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault() }
      }
    }
    window.addEventListener('keydown', keyHandler)
    return () => { document.body.style.overflow = previousOverflow; motionRuntime.lenis?.start(); document.querySelector('main')?.removeAttribute('inert'); document.querySelector('header')?.removeAttribute('inert'); document.querySelector('footer')?.removeAttribute('inert'); window.removeEventListener('keydown', keyHandler); focused?.focus({ preventScroll: true }) }
  }, [onClose])
  return <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} data-lenis-prevent><motion.div ref={panel} className={`modal-panel ${project ? 'project-detail-modal' : ''}`} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 12, opacity: 0 }} onClick={e => e.stopPropagation()}><button className="modal-close" aria-label="Close dialog" onClick={onClose}><X size={21} /></button>{children}</motion.div></motion.div>
}

function ContactForm() {
  const [brief, setBrief] = useState('')
  const [name, setName] = useState('')
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    setName(String(data.get('name')))
    setBrief(`SCIFER — Project inquiry\n\nName: ${data.get('name')}\nEmail: ${data.get('email')}\nOrganization: ${data.get('company') || 'Not specified'}\nArea of interest: ${data.get('interest')}\n\nProject idea\n${data.get('message')}\n`)
  }
  function download() { const url = URL.createObjectURL(new Blob([brief], { type: 'text/plain;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = 'scifer-project-brief.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000) }
  if (brief) return <div className="contact-success"><span className="success-icon"><Check size={27} /></span><Eyebrow>AN IDEA WORTH EXPLORING</Eyebrow><h2>Your next chapter,<br />ready to begin.</h2><p>Thanks, {name.split(' ')[0]}. Your project brief is ready. Download a copy or open it in your email app to share with your SCIFER contact.</p><div className="contact-success-actions"><button className="button button-primary" onClick={download}>Download brief <Download size={17} /></button><a className="button button-outline" href={`mailto:${import.meta.env.VITE_CONTACT_EMAIL || ''}?subject=${encodeURIComponent('SCIFER — New project inquiry')}&body=${encodeURIComponent(brief)}`}>Open email draft <Mail size={16} /></a></div><span className="form-note">Your information stays in your browser. No inquiry has been sent automatically.</span><button className="text-link" onClick={() => setBrief('')}>Prepare another brief <ArrowRight size={15} /></button></div>
  return <><Eyebrow>LET’S CREATE SOMETHING MEANINGFUL</Eyebrow><h2>What comes next<br />starts with <span>you.</span></h2><p className="modal-intro">Tell us a little about your idea. Let’s find the possibilities together.</p><form className="contact-form" onSubmit={submit}><div className="form-row"><label>Your name<input name="name" autoComplete="name" placeholder="Alex Morgan" required maxLength={100} /></label><label>Work email<input name="email" type="email" autoComplete="email" placeholder="alex@company.com" required maxLength={200} /></label></div><label>Organization <span>(optional)</span><input name="company" autoComplete="organization" placeholder="Company or institution" maxLength={150} /></label><label>Area of interest<select name="interest" defaultValue="Artificial intelligence"><option>Artificial intelligence</option><option>Robotics</option><option>Connected systems</option><option>Research collaboration</option><option>Something new</option></select></label><label>What are you thinking about?<textarea name="message" placeholder="A challenge to solve, an idea to explore, a future to build…" required minLength={15} maxLength={4000} rows={4} /></label><button className="button button-primary" type="submit">Prepare project inquiry <ArrowUpRight size={18} /></button><p className="form-note">Create a project brief to download or send through your email app.</p></form></>
}

export default function App() {
  const reduced = !!useReducedMotion()
  const [sceneReady, setSceneReady] = useState(false)
  const [ready, setReady] = useState(false)
  const onSceneReady = useCallback(() => setSceneReady(true), [])
  const onIntroComplete = useCallback(() => setReady(true), [])
  const [modal, setModal] = useState<{ type: 'contact' | 'technology' | 'project'; index?: number } | null>(null)
  const closeModal = useCallback(() => setModal(null), [])
  useEffect(() => {
    if (reduced) return
    const lenis = new Lenis({ duration: 0.85, smoothWheel: true, anchors: { offset: -94 } })
    motionRuntime.lenis = lenis
    lenis.on('scroll', (instance: Lenis) => { ScrollTrigger.update(); motionRuntime.velocity = instance.velocity; if (Math.abs(instance.velocity) > 0.05) motionRuntime.direction = instance.velocity > 0 ? 1 : -1 })
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    return () => { gsap.ticker.remove(tick); lenis.destroy(); motionRuntime.lenis = null }
  }, [reduced])
  const onContact = () => setModal({ type: 'contact' })
  return <LayoutGroup><a className="skip-link" href="#technology">Skip to technology</a><Header onContact={onContact} ready={ready} /><Suspense fallback={null}><SciferEnergyField reduced={reduced} /></Suspense><main inert={!ready}><Story reduced={reduced} ready={ready} onSceneReady={onSceneReady} /><Statement reduced={reduced} /><Technologies reduced={reduced} onDetail={index => setModal({ type: 'technology', index })} /><Marquee reduced={reduced} /><Explorer reduced={reduced} /><Research onProject={index => setModal({ type: 'project', index })} /><HorizontalProjects onProject={index => setModal({ type: 'project', index })} /><NetworkSequence reduced={reduced}><Connected /></NetworkSequence><FinalSection reduced={reduced} onContact={onContact} /></main><Footer onContact={onContact} /><ScrollProgress /><InteractionSystem reduced={reduced} ready={ready} /><ExperienceIntro sceneReady={sceneReady} reduced={reduced} onComplete={onIntroComplete} /><AnimatePresence>{modal && <Modal project={modal.type === 'project'} onClose={closeModal} title={modal.type === 'contact' ? 'Start a project' : modal.type === 'technology' ? technologyData[modal.index!].title : projects[modal.index!].title}>{modal.type === 'contact' ? <ContactForm /> : modal.type === 'technology' ? <><Eyebrow>OUR CORE TECHNOLOGIES</Eyebrow><h2>{technologyData[modal.index!].title}</h2><p className="detail-copy">{technologyData[modal.index!].detail}</p><div className="tech-tags">{technologyData[modal.index!].tags.map(t => <span key={t}>{t}</span>)}</div><div className="detail-actions"><button className="button button-primary" onClick={onContact}>Explore a collaboration <ArrowUpRight size={17} /></button></div></> : <><Eyebrow>{projects[modal.index!].category}</Eyebrow><h2>{projects[modal.index!].title}</h2><motion.div className="project-shared-detail" layoutId={`project-visual-${projects[modal.index!].number}`}><ProjectVisual type={projects[modal.index!].type} /></motion.div><p className="detail-copy">{projects[modal.index!].description}</p><span className="micro-label">AREAS OF EXPLORATION</span><ul className="project-focus">{projects[modal.index!].focus.map(f => <li key={f}><ChevronRight size={15} />{f}</li>)}</ul><button className="button button-primary" onClick={onContact}>Discuss this research <ArrowUpRight size={17} /></button></>}</Modal>}</AnimatePresence></LayoutGroup>
}


