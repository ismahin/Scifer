import { chromium } from '@playwright/test'
import fs from 'node:fs/promises'

// Builds a reusable CubeUV reflection atlas from the site's original three studio panels.
// Requires the Vite development server. The device itself remains procedural and real-time.
await fs.mkdir('.artifacts', { recursive: true })
const html = `<!doctype html><script type="module">
import * as T from '/node_modules/three/build/three.module.js';
const renderer=new T.WebGLRenderer({antialias:false});
const room=new T.Scene();
for(const [position,rotation,scale,color,intensity] of [
 [[0,6,0],[Math.PI/2,0,0],[10,10],'#ffffff',3],
 [[4,2,5],[0,-Math.PI/4,0],[5,8],'#ffffff',2],
 [[-5,2,-3],[0,Math.PI/2,0],[6,6],'#9ecaff',2]
]) {const mesh=new T.Mesh(new T.PlaneGeometry(...scale),new T.MeshBasicMaterial({color:new T.Color(color).multiplyScalar(intensity),side:T.DoubleSide}));mesh.position.set(...position);mesh.rotation.set(...rotation);room.add(mesh)}
const generator=new T.PMREMGenerator(renderer),env=generator.fromScene(room,0,.1,100,{size:128});
const width=env.width,height=env.height;
const output=new T.WebGLRenderTarget(width,height,{type:T.UnsignedByteType,depthBuffer:false});
const scene=new T.Scene(),camera=new T.OrthographicCamera(-1,1,1,-1,0,1);
scene.add(new T.Mesh(new T.PlaneGeometry(2,2),new T.ShaderMaterial({uniforms:{map:{value:env.texture}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:'uniform sampler2D map;varying vec2 vUv;void main(){gl_FragColor=vec4(texture2D(map,vUv).rgb/4.,1.);}'})));
renderer.setRenderTarget(output);renderer.render(scene,camera);
const pixels=new Uint8Array(width*height*4);renderer.readRenderTargetPixels(output,0,0,width,height,pixels);
const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;canvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(pixels),width,height),0,0);
window.baked={url:canvas.toDataURL('image/png'),width,height};
generator.dispose();env.dispose();output.dispose();renderer.dispose();
</script>`
await fs.writeFile('.artifacts/bake-environment.html', html)
const browser=await chromium.launch({channel:'chrome',headless:true})
const page=await browser.newPage()
page.on('pageerror',e=>console.error(e.message))
await page.goto((process.env.SCIFER_DEV_URL || 'http://127.0.0.1:5173')+'/.artifacts/bake-environment.html')
await page.waitForFunction(()=>window.baked,{timeout:30000})
const {url,width,height}=await page.evaluate(()=>window.baked)
await fs.writeFile('public/studio-environment.png',Buffer.from(url.split(',')[1],'base64'))
console.log('Studio reflection atlas:',width,'×',height,(await fs.stat('public/studio-environment.png')).size,'bytes')
await browser.close()
