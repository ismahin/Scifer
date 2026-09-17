import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { setSceneHover } from '../../animations/interaction'

/** One persistent set of nodes and connections across all three disciplines. */
export function TechnologyField({ mode, reduced }: { mode: number; reduced: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null), lines = useRef<THREE.LineSegments>(null), root = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState<number | null>(null)
  const data = useMemo(() => {
    const sphere: THREE.Vector3[] = [], robot: THREE.Vector3[] = [], network: THREE.Vector3[] = []
    const hubs = [[0,0,0], [-1.2,.6,0], [1.2,.7,.1], [-.6,-.9,.7], [.9,-.65,.8], [0,.85,-.9], [0,-.4,-1.1]]
    for (let i = 0; i < 70; i++) {
      const y = 1 - i / 69 * 2, r = Math.sqrt(1-y*y)
      sphere.push(new THREE.Vector3(Math.cos(i*2.4)*r*1.3, y*1.3, Math.sin(i*2.4)*r*1.3))
      const u = i / 69
      robot.push(new THREE.Vector3(u < .55 ? -.3 * u : (u-.55)*2.1-.15, -1+u*2.2, Math.sin(i*2.4)*.15))
      const hub = hubs[i % 7]
      network.push(new THREE.Vector3(hub[0]+Math.sin(i*3.7)*.09, hub[1]+Math.cos(i*2.3)*.09, hub[2]+Math.sin(i*5.1)*.09))
    }
    const edges: [number, number][] = []
    for (let i=0;i<70;i++) for(let j=i+1;j<70;j++) if(sphere[i].distanceTo(sphere[j])<.66) edges.push([i,j])
    return { targets: [sphere,robot,network], current: sphere.map(p=>p.clone()), edges, linePositions: new Float32Array(edges.length*6), object: new THREE.Object3D(), blue: new THREE.Color('#1268e8'), pale: new THREE.Color('#689ac7'), dark: new THREE.Color('#0a3d91') }
  }, [])
  useEffect(() => { setHovered(null); setSceneHover(null) }, [mode])
  useFrame(({ clock, pointer }, delta) => {
    const k = reduced ? 1 : 1-Math.exp(-delta*5)
    data.current.forEach((p,i) => {
      p.lerp(data.targets[mode][i], k)
      data.object.position.copy(p)
      data.object.scale.setScalar((i%7===0 ? .072 : .034) * (i===hovered ? 1.55 : 1))
      data.object.updateMatrix(); mesh.current!.setMatrixAt(i,data.object.matrix)
      mesh.current!.setColorAt(i,i===hovered ? data.dark : i%7===0 ? data.blue : data.pale)
    })
    mesh.current!.instanceMatrix.needsUpdate=true
    if(mesh.current!.instanceColor) mesh.current!.instanceColor.needsUpdate=true
    data.edges.forEach(([a,b],i)=>{data.current[a].toArray(data.linePositions,i*6);data.current[b].toArray(data.linePositions,i*6+3)})
    lines.current!.geometry.attributes.position.needsUpdate=true
    root.current!.rotation.y= reduced ? 0 : Math.sin(clock.elapsedTime*.12)*.15+pointer.x*.12
  })
  return <group ref={root}>
    <lineSegments ref={lines}><bufferGeometry><bufferAttribute attach="attributes-position" args={[data.linePositions,3]} /></bufferGeometry><lineBasicMaterial color="#639ad0" transparent opacity={mode===0?.46:.22} /></lineSegments>
    <instancedMesh ref={mesh} args={[undefined,undefined,70]} onPointerMove={e=>{e.stopPropagation();const id=e.instanceId??null;if(id!==hovered){setHovered(id);setSceneHover('Intelligence node')}}} onPointerOut={()=>{setHovered(null);setSceneHover(null)}}><sphereGeometry args={[1,10,10]} /><meshStandardMaterial metalness={.4} roughness={.25} /></instancedMesh>
    {hovered!==null && <Html position={data.current[hovered]} center style={{pointerEvents:'none'}}><span className="mesh-hover-label">Node {String(hovered+1).padStart(2,'0')}<small>{['NEURAL CONNECTION','ADAPTIVE CONTROL','CONNECTED SENSING'][mode]}</small></span></Html>}
  </group>
}
