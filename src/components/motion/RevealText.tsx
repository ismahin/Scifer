import { useRef } from 'react'
import type { ReactNode } from 'react'
import { motion, useReducedMotion, useInView } from 'framer-motion'

export function RevealText({ lines, className = '', as = 'h2' }: { lines: ReactNode[]; className?: string; as?: 'h2' | 'h3' }) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLHeadingElement>(null)
  const visible = useInView(ref, { once: true, amount: 0.15 })
  const Tag = as
  return <Tag ref={ref} className={`reveal-heading ${className}`}>
    {lines.map((line, i) => <span className="line-mask" key={i}><motion.span initial={{ y: reduced ? '0%' : '110%' }} animate={{ y: reduced || visible ? '0%' : '110%' }} transition={{ duration: reduced ? 0 : 0.9, delay: reduced ? 0 : i * 0.085, ease: [0.16, 1, 0.3, 1] }}>{line}</motion.span></span>)}
  </Tag>
}

export function MaskReveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion()
  return <motion.div className={`mask-reveal ${className}`} initial={{ clipPath: reduced ? 'inset(0% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)' }} whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>
}

export function Statement({ reduced }: { reduced: boolean }) {
  return <section id="understanding" className={`understanding-section ${reduced ? 'is-reduced' : ''}`} aria-labelledby="statement-title">
    <div className="understanding-stage section-padding">
      <div className="understanding-copy"><span className="micro-label">A SIMPLE CONVICTION / 04</span>
        <h2 id="statement-title"><span className="sr-only">Intelligence means nothing without understanding.</span><span aria-hidden="true">{['Intelligence', 'means nothing', 'without', 'understanding.'].map((line, i) => <span className={`understanding-line line-${i}`} key={line}><span>{line}</span></span>)}</span></h2>
      </div>
      <div className="understanding-note perception"><span>01 / PERCEPTION</span><p>Context before reaction.</p></div>
      <div className="understanding-note reasoning"><span>02 / REASONING</span><p>Patterns become meaning.</p></div>
      <div className="understanding-note adaptation"><span>03 / ADAPTATION</span><p>Learning becomes action.</p></div>
      <span className="understanding-bottom micro-label">THINK DEEPER. BUILD WITH PURPOSE.</span>
    </div>
  </section>
}
