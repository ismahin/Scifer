import { chromium } from '@playwright/test'
import fs from 'node:fs/promises'

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-webgl', '--ignore-gpu-blocklist'] })
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } })
await page.goto(process.env.SCIFER_PREVIEW_URL || 'http://127.0.0.1:5174')
await page.locator('.experience-ready').waitFor({ timeout: 15000 })
await page.waitForTimeout(1800)
const samples=[]
for (const selector of ['#home','#engineering','#data','#technology','#explorer','#about','.final-section']) {
  await page.locator(selector).scrollIntoViewIfNeeded()
  await page.waitForTimeout(1500)
  const sample=await page.evaluate(async selector=>{
    const deltas=[]
    await new Promise(resolve=>{let last=performance.now(),start=last;function frame(now){deltas.push(now-last);last=now;if(now-start<2500)requestAnimationFrame(frame);else resolve(null)}requestAnimationFrame(frame)})
    deltas.shift();deltas.sort((a,b)=>a-b)
    const visibleCanvases=[...document.querySelectorAll('canvas')].filter(c=>{const b=c.getBoundingClientRect();return b.bottom>0&&b.top<innerHeight})
    return {section:selector,fps:Number((1000/(deltas.reduce((a,b)=>a+b,0)/deltas.length)).toFixed(1)),p95FrameMs:Number(deltas[Math.floor(deltas.length*.95)].toFixed(1)),liveCanvases:visibleCanvases.map(c=>({...c.dataset})),totalCanvases:document.querySelectorAll('canvas').length}
  },selector)
  samples.push(sample)
}
const hardware=await page.locator('canvas').first().evaluate(c=>{const gl=c.getContext('webgl2'),ext=gl.getExtension('WEBGL_debug_renderer_info');return {renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):'Not exposed',dpr:devicePixelRatio}})
const report={date:new Date().toISOString(),browser:browser.version(),viewport:'1440 × 960',hardware,samples}
await fs.writeFile('.artifacts/performance.json',JSON.stringify(report,null,2))
console.log(JSON.stringify(report,null,2))
await browser.close()
