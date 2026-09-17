import { lazy, Suspense, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { useInView } from 'framer-motion'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const ContinuityScene = lazy(() => import('./Scene').then(m => ({ default: m.ContinuityScene })))
export function NetworkSequence({ children, reduced }: { children: ReactNode; reduced: boolean }) {
  const root = useRef<HTMLDivElement>(null)
  const progress = useRef({ value: 0, entry: 0 })
  const visible = useInView(root, { margin: '100px' })
  const loaded = useInView(root, { margin: '400px', once: true })
  useEffect(() => {
    const trigger = ScrollTrigger.create({ trigger: root.current, start: 'top top', end: 'bottom bottom', onUpdate: () => { progress.current.value = 0 } })
    const entry = ScrollTrigger.create({ trigger: root.current, start: 'top bottom', end: 'top top', onUpdate: self => { progress.current.entry = self.progress } })
    return () => { trigger.kill(); entry.kill() }
  }, [])
  return <div className="network-sequence" ref={root}><div className="network-stage"><div className="network-webgl" role="img" aria-label="A three-dimensional globe connects people, machines, and environments.">{loaded && <Suspense fallback={null}><ContinuityScene progress={progress} visible={visible} reduced={reduced} /></Suspense>}</div></div>{children}</div>
}
