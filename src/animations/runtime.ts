import type Lenis from 'lenis'

/** Shared transient values; animation updates do not trigger React renders. */
export const motionRuntime = {
  velocity: 0,
  direction: 1,
  progress: 0,
  lenis: null as Lenis | null,
}

export function scrollToPosition(target: string | number, immediate = false) {
  if (motionRuntime.lenis) motionRuntime.lenis.scrollTo(target, { offset: typeof target === 'string' ? -100 : 0, immediate, force: true })
  else if (typeof target === 'number') window.scrollTo({ top: target, behavior: immediate ? 'instant' : 'smooth' })
  else document.querySelector(target)?.scrollIntoView({ behavior: immediate ? 'instant' : 'smooth' })
}
