import { chromium } from '@playwright/test'
import fs from 'node:fs/promises'
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist']})
const report=[]
for(const [width,height] of [[1440,900],[390,844]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,isMobile:width<700,hasTouch:width<700})
  await page.goto('http://localhost:5174');await page.locator('.experience-ready').waitFor({timeout:20000})
  for(const [name,selector,progress] of [['explosion','#intelligence',1.6],['wave','#data',0],['understanding','#understanding',.65],['liquid','#technology',.1],['robotics','#technology',.49],['blockchain','#technology',.86],['globe','#about',.1],['future','#future',.6],['footer','footer',1]]){
    await page.evaluate(({selector,progress})=>{const e=document.querySelector(selector);window.scrollTo(0,e.getBoundingClientRect().top+scrollY+(e.offsetHeight-innerHeight)*progress)},{selector,progress})
    await page.waitForTimeout(1400)
    const timing=await page.evaluate(()=>new Promise(resolve=>{
      const start=performance.now(),frames=[];let previous=start
      const tick=now=>{frames.push(now-previous);previous=now;if(now-start<2500)requestAnimationFrame(tick);else{frames.shift();frames.sort((a,b)=>a-b);resolve({fps:Math.round(1000/(frames.reduce((a,b)=>a+b,0)/frames.length)*10)/10,p95:Math.round(frames[Math.floor(frames.length*.95)]*10)/10})}}
      requestAnimationFrame(tick)
    }))
    const rendering=await page.locator('.scifer-energy-field canvas').evaluate(canvas=>{const gl=canvas.getContext('webgl2');const debug=gl.getExtension('WEBGL_debug_renderer_info');return {renderer:debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),particles:canvas.dataset.particles,framebuffer:[canvas.width,canvas.height]}})
    const sample={width,height,name,...timing,...rendering};report.push(sample);console.log(JSON.stringify(sample))
  }
  await page.close()
}
await fs.writeFile('.artifacts/energy/performance.json',JSON.stringify(report,null,2));await browser.close()
