import { useEffect, useRef } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'
import gsap from 'gsap'
import { sceneInteraction } from '../animations/interaction'

const points = [[40,145],[180,70],[290,150],[415,50],[550,120],[695,40],[830,140],[975,75]]
export function FooterField() {
  const ref = useRef<SVGSVGElement>(null)
  const visible = useInView(ref)
  const reduced = useReducedMotion()
  useEffect(() => {
    if (!visible || reduced || !matchMedia('(pointer: fine)').matches) return
    const svg = ref.current!, nodes = Array.from(svg.querySelectorAll('circle'))
    const tick = () => {
      const b = svg.getBoundingClientRect()
      const x = (sceneInteraction.pointerX-b.left)/b.width*1000, y = (sceneInteraction.pointerY-b.top)/b.height*200
      nodes.forEach((node,i) => { const dx=x-points[i][0],dy=y-points[i][1],d=Math.hypot(dx,dy),weight=Math.max(0,1-d/180); node.style.transform=`translate(${dx/Math.max(1,d)*weight*3}px,${dy/Math.max(1,d)*weight*3}px)` })
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [visible,reduced])
  return <svg ref={ref} className="footer-network" viewBox="0 0 1000 200" fill="none" aria-hidden="true"><path d="M40 145 180 70 290 150 415 50 550 120 695 40 830 140 975 75M180 70 415 50 550 120 830 140M290 150 550 120 695 40" stroke="#7cb3e7" strokeWidth=".6" />{points.map(([x,y],i)=><circle key={x} cx={x} cy={y} r="2.5" fill="#1268e8" style={{animationDelay:`${i*.7}s`}} />)}</svg>
}
