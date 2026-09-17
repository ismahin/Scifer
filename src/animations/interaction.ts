/** Shared transient interaction state. Animation frames never trigger React renders. */
export const sceneInteraction = {
  hoveredObject: null as string | null,
  selectedObject: null as string | null,
  pointerMode: 'default' as 'default' | 'inspect' | 'drag',
  pointerX: -1000,
  pointerY: -1000,
}
export function setSceneHover(name: string | null) {
  sceneInteraction.hoveredObject = name
  sceneInteraction.pointerMode = name ? 'inspect' : 'default'
  window.dispatchEvent(new Event('scifer:interaction'))
}
