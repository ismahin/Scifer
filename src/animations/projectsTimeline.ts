import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function createProjectsTimeline(root: HTMLElement, track: HTMLElement, onProgress: (value: number) => void) {
  const media = gsap.matchMedia()
  let trigger: ScrollTrigger | null = null
  media.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
    const distance = () => Math.max(0, track.scrollWidth - root.clientWidth + 56)
    if (distance() < 5) return
    const tween = gsap.to(track, {
      x: () => -distance(), ease: 'none',
      scrollTrigger: {
        trigger: root, start: 'top top', end: () => `+=${distance()}`,
        pin: true, scrub: 0.55, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: self => onProgress(self.progress),
      },
    })
    trigger = tween.scrollTrigger ?? null
    return () => { trigger = null }
  })
  return { media, getTrigger: () => trigger }
}
