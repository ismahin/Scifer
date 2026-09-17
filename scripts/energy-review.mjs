import { chromium } from '@playwright/test'
import fs from 'node:fs/promises'
await fs.mkdir('.artifacts/energy', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-webgl', '--ignore-gpu-blocklist'] })
const sizes = process.argv.includes('--matrix') ? [[1920,1080],[1440,900],[1366,768],[390,844]] : [[1440,900],[390,844]]
const errors = []
for (const [width,height] of sizes) {
  const page = await browser.newPage({ viewport: { width,height }, deviceScaleFactor: 1, hasTouch: width<700, isMobile: width<700 })
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if(message.type()==='error') errors.push(message.text()) })
  await page.goto(process.env.SCIFER_PREVIEW_URL || 'http://localhost:5174', { waitUntil: 'networkidle' })
  await page.locator('.experience-ready').waitFor({timeout:20000})
  const frames = [ ['hero','#home',0], ['activation','#intelligence',.55], ['release','#intelligence',1.6], ['wave','#data',0], ['black-entry','#understanding',-.12], ['understanding','#understanding',.66], ['condensing','#understanding',.9], ['liquid','#technology',.1], ['solidifying','#technology',.34], ['robotics','#technology',.49], ['distributing','#technology',.69], ['blockchain','#technology',.86], ['globe','#about',.1], ['future','#future',.6], ['descent','.footer-descent',0], ['footer','footer',1] ]
  for(const [name,selector,progress] of frames.filter(frame=>!process.argv.includes('--final')||['hero','understanding','liquid','future','footer'].includes(frame[0]))){
    await page.evaluate(({selector,progress})=>{const element=document.querySelector(selector); const top=element.getBoundingClientRect().top+scrollY; window.scrollTo(0, top+(element.offsetHeight-innerHeight)*progress)}, {selector,progress})
    await page.waitForTimeout(1100)
    await page.screenshot({path:`.artifacts/energy/${width}-${name}.png`})
    if(name==='liquid' && process.argv.includes('--final')) { await page.mouse.move(width<700?width*.53:width*.75,height*.54); await page.waitForTimeout(1000); await page.screenshot({path:`.artifacts/energy/${width}-liquid-interaction.png`}); await page.mouse.move(-5,-5) }
    console.log(JSON.stringify({width,name,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),state:await page.locator('.scifer-energy-field canvas').evaluate(c=>({...c.dataset}))}))
  }
  await page.close()
}
await fs.writeFile('.artifacts/energy/errors.json',JSON.stringify(errors,null,2))
console.log('ERRORS',JSON.stringify(errors))
await browser.close()
