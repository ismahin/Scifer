import { ProjectVisual } from './projects/ProjectVisual'
export function MenuPreview({ index }: { index: number }) {
  return <div className="menu-context" aria-hidden="true"><ProjectVisual type={['edge','environment','vision','water','edge'][index]} /><span>{['SYSTEM ARCHITECTURE','QUESTIONS INTO POSSIBILITIES','IDEAS IN THE REAL WORLD','CONNECTED INTELLIGENCE','THE START OF SOMETHING'][index]}</span></div>
}
