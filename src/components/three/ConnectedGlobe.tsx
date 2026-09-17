import { useMemo, useRef, useState, useEffect } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { energy, smooth } from '../../energy/runtime'

const concepts = ['Perception', 'Research', 'Autonomy', 'Communication', 'Environment', 'Edge intelligence', 'Shared understanding', 'Sensing']
const locations = [[46,-32],[18,-57],[-28,-38],[52,32],[10,48],[-35,40],[5,2],[-10,128]]
function spherical(latitude: number, longitude: number, radius = 2) {
  const lat=latitude*Math.PI/180, lon=longitude*Math.PI/180
  return new THREE.Vector3(radius*Math.cos(lat)*Math.sin(lon),radius*Math.sin(lat),radius*Math.cos(lat)*Math.cos(lon))
}

export function ConnectedGlobe({ reduced, progress }: { reduced: boolean; progress: RefObject<{ value: number; entry?: number }> }) {
  const root=useRef<THREE.Group>(null), routes=useRef<THREE.Group>(null), nodes=useRef<THREE.Group>(null)
  const [selected,setSelected]=useState<number|null>(null)
  const objects=useMemo(()=>{
    const vertices:number[]=[]
    for(let ring=0;ring<18;ring++) for(let s=0;s<128;s++) {
      const lon=ring*Math.PI/18, a=s/128*Math.PI*2,b=(s+1)/128*Math.PI*2
      vertices.push(Math.sin(a)*Math.sin(lon)*2,Math.cos(a)*2,Math.sin(a)*Math.cos(lon)*2,Math.sin(b)*Math.sin(lon)*2,Math.cos(b)*2,Math.sin(b)*Math.cos(lon)*2)
    }
    for(let ring=-5;ring<=5;ring++) for(let s=0;s<128;s++) {
      const lat=ring*Math.PI/13,r=Math.cos(lat)*2,y=Math.sin(lat)*2,a=s/128*Math.PI*2,b=(s+1)/128*Math.PI*2
      vertices.push(Math.sin(a)*r,y,Math.cos(a)*r,Math.sin(b)*r,y,Math.cos(b)*r)
    }
    const grid=new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(vertices,3))
    const positions=locations.map(([lat,lon])=>spherical(lat,lon))
    const links=[[0,6],[0,1],[1,2],[2,6],[3,6],[3,4],[4,5],[5,6],[4,7],[0,3],[2,5]]
    const curves=links.map(([a,b])=>{
      const points=Array.from({length:65},(_,i)=>positions[a].clone().lerp(positions[b],i/64).normalize().multiplyScalar(2.015+Math.sin(i/64*Math.PI)*.42))
      return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),80,.009,5,false)
    })
    return {grid,positions,curves,links}
  },[])
  useEffect(()=>()=>{objects.grid.dispose();objects.curves.forEach(geometry=>geometry.dispose())},[objects])
  useFrame(({clock},delta)=>{
    if(!root.current) return
    const entry=smooth(.15,.92,progress.current.entry??1)
    root.current.scale.setScalar(.84+entry*.16)
    root.current.rotation.y=THREE.MathUtils.damp(root.current.rotation.y,reduced?0:Math.sin(clock.elapsedTime*.055)*.16+Math.max(-1,Math.min(1,energy.pointer.x))*.065,3,delta)
    root.current.rotation.z=-.105
    routes.current?.children.forEach((object,i)=>{
      const material=(object as THREE.Mesh).material as THREE.ShaderMaterial
      material.uniforms.uTime.value=reduced?i*.19:clock.elapsedTime
      material.uniforms.uActive.value=selected!==null && objects.links[i].includes(selected)?1:0
    })
    nodes.current?.children.forEach((object,i)=>{object.scale.setScalar(i===selected?1.25:1)})
  })
  return <group ref={root}>
    <mesh><sphereGeometry args={[1.99,64,48]}/><meshPhysicalMaterial color="#ecf6ff" metalness={.08} roughness={.32} transparent opacity={.33} depthWrite={false}/></mesh>
    <mesh><sphereGeometry args={[2.005,64,48]}/><shaderMaterial transparent depthWrite={false} vertexShader="varying vec3 vN,vV;void main(){vec4 p=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-p.xyz);gl_Position=projectionMatrix*p;}" fragmentShader="varying vec3 vN,vV;void main(){float f=pow(1.-abs(dot(normalize(vN),normalize(vV))),3.);gl_FragColor=vec4(.38,.67,.95,f*.22);}"/></mesh>
    <lineSegments geometry={objects.grid}><lineBasicMaterial color="#8eb9df" transparent opacity={.3} depthWrite={false}/></lineSegments>
    <group ref={routes}>{objects.curves.map((geometry,i)=><mesh geometry={geometry} key={i}><shaderMaterial transparent depthWrite={false} uniforms={{uTime:{value:0},uActive:{value:0},uSeed:{value:i*.163}}} vertexShader="varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}" fragmentShader="varying vec2 vUv;uniform float uTime,uActive,uSeed;void main(){float head=fract(uTime*.11+uSeed);float d=mod(head-vUv.x+1.,1.);float pulse=exp(-d*35.)*smoothstep(0.,.025,vUv.x)*smoothstep(1.,.96,vUv.x);vec3 c=mix(vec3(.19,.49,.84),vec3(.035,.29,.78),uActive);gl_FragColor=vec4(c,.3+pulse*.7+uActive*.2);}"/></mesh>)}</group>
    <group ref={nodes}>{objects.positions.map((point,i)=><group key={i} position={point} onPointerOver={e=>{e.stopPropagation();setSelected(i)}} onPointerOut={()=>setSelected(null)} onClick={e=>{e.stopPropagation();setSelected(value=>value===i?null:i)}}>
      <mesh><sphereGeometry args={[.045,16,12]}/><meshBasicMaterial color={selected===i?'#0a3d91':'#1268e8'}/></mesh>
      <mesh rotation={[0,Math.atan2(point.x,point.z),-Math.asin(point.y/2)]}><ringGeometry args={[.073,.084,32]}/><meshBasicMaterial color="#45a3ff" transparent opacity={selected===i?.85:.35} side={THREE.DoubleSide}/></mesh>
      {selected===i&&<Html center position={[0,.19,0]} zIndexRange={[20,0]} style={{pointerEvents:'none'}}><span className="mesh-hover-label">{concepts[i]}<small>CONNECTED INTELLIGENCE</small></span></Html>}
    </group>)}</group>
  </group>
}
