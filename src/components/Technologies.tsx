import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { technologyData } from '../content/site'
import { scrollToPosition } from '../animations/runtime'
import { Eyebrow } from './Identity'
import { MagneticLink } from './motion/MagneticLink'

export function Technologies({ reduced, onDetail }: { reduced: boolean; onDetail: (index: number) => void }) {
  const [selected, setSelected] = useState(0)
  const ref = useRef<HTMLElement>(null), current = useRef(0)
  useEffect(() => {
    const trigger = ScrollTrigger.create({ trigger: ref.current, start: 'top top', end: 'bottom bottom', onUpdate: self => {
      const next = self.progress < .33 ? 0 : self.progress < .69 ? 1 : 2
      if (current.current !== next) { current.current = next; setSelected(next) }
    } })
    return () => trigger.kill()
  }, [])
  const select = (index: number) => {
    const root = ref.current!
    current.current = index; setSelected(index)
    scrollToPosition(root.getBoundingClientRect().top + scrollY + (root.offsetHeight - innerHeight) * [.08, .48, .85][index], reduced)
  }
  const tech = technologyData[selected]
  return <section id="technology" ref={ref} className="technology-exhibition energy-technology">
    <div className="technology-stage section-padding">
      <div className="exhibition-heading"><Eyebrow number="05">ONE INTELLIGENCE. MANY FORMS.</Eyebrow><h2>Ideas acquire<br /><em>form.</em></h2></div>
      <div className="technology-tabs" role="tablist" aria-label="Explore our technologies" aria-orientation="vertical">{technologyData.map((item, i) => <button key={item.type} id={`tech-tab-${i}`} role="tab" aria-selected={i === selected} aria-controls="technology-panel" tabIndex={i === selected ? 0 : -1} className={selected === i ? 'is-active' : ''} onClick={() => select(i)} onKeyDown={e => {
        if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
          e.preventDefault(); const next = e.key === 'Home' ? 0 : e.key === 'End' ? 2 : (selected + (e.key === 'ArrowDown' ? 1 : 2)) % 3
          select(next); document.getElementById(`tech-tab-${next}`)?.focus({ preventScroll: true })
        }
      }}><span className="technology-tab-index">0{i + 1}</span><span>{item.title}</span><ArrowUpRight size={21} /></button>)}</div>
      <div className="technology-panel" id="technology-panel" role="tabpanel" tabIndex={0} aria-labelledby={`tech-tab-${selected}`}>
        <div className="exhibition-canvas" aria-label={`${tech.title}: interactive three-dimensional material`} role="img" />
        <div className="technology-explanation"><p>{tech.copy}</p><div className="exhibition-tags">{tech.tags.map(tag => <span key={tag}>{tag}</span>)}</div><MagneticLink onClick={() => onDetail(selected)} label={`Explore the discipline: ${tech.title}`}>Explore the discipline</MagneticLink></div>
      </div>
      <div className="exhibition-stamp"><span>SC / 0{selected + 1}</span><span>{selected === 0 ? 'TOUCH THE SURFACE. DISTURB THE FIELD.' : selected === 1 ? 'EXPLORE THE JOINTS. INTELLIGENCE IN MOTION.' : 'TOUCH A BLOCK. FOLLOW THE VERIFICATION.'}</span></div>
    </div>
  </section>
}

