import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { StoryState } from '../components/Scene'
import { energy } from '../energy/runtime'

gsap.registerPlugin(ScrollTrigger)

export function createStoryTimeline(root: HTMLElement, state: StoryState, reduced: boolean, onChapter: (index: number) => void) {
  return gsap.context(() => {
    const sections = Array.from(root.querySelectorAll<HTMLElement>('.story-section'))
    const playhead = { value: 0 }
    let stops = [0, .25, .5, .75, 1]
    const measure = () => { const distance = Math.max(1, root.offsetHeight - innerHeight); stops = sections.map(section => Math.min(1, section.offsetTop / distance)) }
    measure()
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: root, start: 'top top', end: 'bottom bottom', scrub: reduced ? true : 0.55,
        invalidateOnRefresh: true,
        onRefresh: measure,
        onUpdate: self => { state.velocity = reduced ? 0 : Math.max(-1, Math.min(1, self.getVelocity() / 3500)) },
      },
      onUpdate: () => {
        let segment = 0
        for (let i = 1; i < 4; i++) if (playhead.value >= stops[i]) segment = i
        state.progress = Math.min(4, segment + Math.max(0, Math.min(1, (playhead.value - stops[segment]) / Math.max(.001, stops[segment + 1] - stops[segment]))))
        onChapter(Math.min(4, Math.floor(state.progress + 0.28)))
        energy.story = state.progress
        root.style.setProperty('--story-tint', String(Math.sin(state.progress / 4 * Math.PI) * 0.65))
      },
    })
    timeline.to(playhead, { value: 1, duration: 1, ease: 'none' }, 0)
    if (!reduced) {
      gsap.to('.hero-line-back', { xPercent: -5, yPercent: -15, ease: 'none', scrollTrigger: { trigger: sections[0], start: 'top top', end: 'bottom top', scrub: true } })
      gsap.to('.hero-line-front', { xPercent: 6, yPercent: -8, ease: 'none', scrollTrigger: { trigger: sections[0], start: 'top top', end: 'bottom top', scrub: true } })
      gsap.to('.hero-bottom, .hero-meta', { opacity: 0, y: -24, ease: 'none', scrollTrigger: { trigger: sections[0], start: '30% top', end: '85% top', scrub: true } })
      gsap.to('.stage-grid', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: true } })
      sections.slice(1).forEach(section => {
        gsap.fromTo(section.querySelector('.chapter-display-index'), { y: 65 }, { y: -45, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true } })
      })
    }
  }, root)
}
