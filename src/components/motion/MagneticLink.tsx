import { useRef } from 'react'
import type { ReactNode, MouseEvent } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

export function MagneticLink({ children, href, onClick, className = '', label }: { children: ReactNode; href?: string; onClick?: () => void; className?: string; label?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const x = useMotionValue(0), y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 180, damping: 23 }), springY = useSpring(y, { stiffness: 180, damping: 23 })
  const reduced = useReducedMotion()
  const move = (event: MouseEvent) => {
    if (reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const bounds = ref.current!.getBoundingClientRect()
    x.set(Math.max(-5, Math.min(5, (event.clientX - bounds.left - bounds.width / 2) * 0.08)))
    y.set(Math.max(-4, Math.min(4, (event.clientY - bounds.top - bounds.height / 2) * 0.1)))
  }
  const content = <><span className="magnetic-copy">{children}</span><span className="magnetic-arrow"><ArrowUpRight size={19} /></span></>
  return <motion.span className="magnetic-wrap" ref={ref} style={{ x: springX, y: springY }} onMouseMove={move} onMouseLeave={() => { x.set(0); y.set(0) }}>{href ? <a href={href} className={`magnetic-link ${className}`} aria-label={label}>{content}</a> : <button type="button" onClick={onClick} className={`magnetic-link ${className}`} aria-label={label}>{content}</button>}</motion.span>
}
