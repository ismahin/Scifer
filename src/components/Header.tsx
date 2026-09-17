import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Plus, X } from 'lucide-react'
import { MenuPreview } from './MenuPreview'
import { Logo } from './Identity'
import { MagneticLink } from './motion/MagneticLink'
import { motionRuntime, scrollToPosition } from '../animations/runtime'

const links = [['Technology', '#technology'], ['Research', '#research'], ['Projects', '#projects'], ['Company', '#about']]

export function Header({ onContact, ready = true }: { onContact: () => void; ready?: boolean }) {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')
  const navState = useRef({ scrolled: false, active: '' })
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState(0)
  const reduced = useReducedMotion()
  const panel = useRef<HTMLDivElement>(null)
  const toggle = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const handler = () => {
      const next = window.scrollY > 36
      if (next !== navState.current.scrolled) { navState.current.scrolled = next; setScrolled(next) }
      let section = ''
      for (const [, href] of links) { const element = document.querySelector(href); if (element && element.getBoundingClientRect().top < innerHeight * .35) section = href }
      if (section !== navState.current.active) { navState.current.active = section; setActive(section) }
    }
    handler(); window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'; motionRuntime.lenis?.stop()
    const main = document.querySelector('main'), footer = document.querySelector('footer')
    main?.setAttribute('inert', ''); footer?.setAttribute('inert', '')
    const focusTimer = window.setTimeout(() => panel.current?.querySelector<HTMLAnchorElement>('a')?.focus(), reduced ? 0 : 200)
    const keyboard = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
      if (e.key === 'Tab') {
        const items = panel.current?.querySelectorAll<HTMLElement>('a, button')
        if (!items?.length) return
        const first = items[0], last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    window.addEventListener('keydown', keyboard)
    return () => {
      clearTimeout(focusTimer); window.removeEventListener('keydown', keyboard)
      document.body.style.overflow = previous; motionRuntime.lenis?.start()
      main?.removeAttribute('inert'); footer?.removeAttribute('inert'); toggle.current?.focus()
    }
  }, [open, reduced])
  const navigate = (href: string) => { setOpen(false); window.setTimeout(() => scrollToPosition(href, !!reduced), reduced ? 0 : 60) }
  return <>
    <motion.header className={`site-header editorial-header ${scrolled ? 'is-scrolled' : ''}`} initial={{ opacity: 0, y: -12 }} animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : -12 }} transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 0.45 }} inert={!ready}>
      <a className="logo-link" href="#home" aria-label="SCIFER home"><Logo /></a>
      <span className="header-discipline">RESEARCH.<br />ENGINEERING. POSSIBILITY.</span>
      <nav className="desktop-navigation" aria-label="Main navigation">{links.slice(0, 3).map(([label, href]) => <a key={label} href={href} aria-current={active === href ? 'location' : undefined}><span>{label}</span><i /></a>)}</nav>
      <div className="header-actions"><MagneticLink onClick={onContact} className="header-contact">Contact us</MagneticLink><button ref={toggle} className="menu-toggle editorial-menu-toggle" aria-label={open ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={open} aria-controls="navigation-index" onClick={() => setOpen(!open)}><span>Menu</span><Plus size={18} /></button></div>
    </motion.header>
    <AnimatePresence>{open && <motion.div ref={panel} id="navigation-index" className="navigation-index" role="dialog" aria-modal="true" aria-label="Navigation index" data-lenis-prevent initial={{ clipPath: reduced ? 'inset(0)' : 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0)' }} exit={{ clipPath: reduced ? 'inset(0)' : 'inset(0 0 100% 0)', opacity: reduced ? 0 : 1 }} transition={{ duration: reduced ? 0.05 : 0.6, ease: [0.76, 0, 0.24, 1] }}>
      <div className="menu-top"><a href="#home" onClick={e => { e.preventDefault(); navigate('#home') }} aria-label="SCIFER home"><Logo /></a><span>AN INDEX OF POSSIBILITIES</span><button onClick={() => setOpen(false)} aria-label="Close navigation">Close <X size={19} /></button></div>
      <div className="menu-main"><div className="menu-aside"><span className="micro-label">SCIFER / {new Date().getFullYear()}</span><p>Independent thinking.<br />Connected intelligence.</p><MenuPreview index={preview} /></div><nav aria-label="Navigation index">{[...links, ['Contact', '#contact']].map(([label, href], i) => <span className="menu-line-mask" key={label}><motion.a onPointerEnter={() => setPreview(i)} onFocus={() => setPreview(i)} href={href} initial={{ y: reduced ? 0 : '110%' }} animate={{ y: 0 }} transition={{ delay: reduced ? 0 : 0.18 + i * 0.06, duration: 0.65, ease: [0.16, 1, 0.3, 1] }} onClick={e => { e.preventDefault(); if (href === '#contact') { setOpen(false); setTimeout(onContact, 150) } else navigate(href) }}><span className="menu-link-index">0{i + 1}</span><span>{label}</span><ArrowUpRight /></motion.a></span>)}</nav></div>
      <div className="menu-bottom"><span>23.8103° N / 90.4125° E</span><span>PRECISION. INTELLIGENCE. INNOVATION.</span><span>OPEN TO WHAT COMES NEXT ↗</span></div>
    </motion.div>}</AnimatePresence>
  </>
}
