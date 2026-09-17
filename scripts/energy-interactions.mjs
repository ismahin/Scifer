import {chromium} from '@playwright/test'
import fs from 'node:fs/promises'
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist']})
const page=await browser.newPage({viewport:{width:1440,height:900}})
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())})
await page.goto('http://localhost:5174');await page.locator('.experience-ready').waitFor({timeout:20000});await page.waitForTimeout(700)
const go=async(selector,progress=0)=>{await page.evaluate(({selector,progress})=>{const e=document.querySelector(selector);window.scrollTo(0,e.getBoundingClientRect().top+scrollY+(e.offsetHeight-innerHeight)*progress)},{selector,progress});await page.waitForTimeout(1700)}
await go('#technology',.1);await page.screenshot({path:'.artifacts/energy/liquid-rest.png'})
await page.mouse.move(1090,470);await page.waitForTimeout(1800);await page.screenshot({path:'.artifacts/energy/liquid-touch.png'});console.log('liquid',await page.locator('.scifer-energy-field canvas').evaluate(e=>({...e.dataset})))
await go('#technology',.49);await page.mouse.move(1010,350);await page.waitForTimeout(1600);console.log('robot',await page.locator('.scifer-energy-field canvas').evaluate(e=>({...e.dataset})));await page.screenshot({path:'.artifacts/energy/robot-hover.png'})
await go('#technology',.86);await page.mouse.move(1080,450);await page.waitForTimeout(1600);console.log('blockchain',await page.locator('.scifer-energy-field canvas').evaluate(e=>({...e.dataset})))
await go('#about',.1);await page.screenshot({path:'.artifacts/energy/globe.png'})
await go('#future',.6);await page.screenshot({path:'.artifacts/energy/future-current.png'})
await go('footer',1);await page.screenshot({path:'.artifacts/energy/footer-rest.png'})
await page.mouse.move(480,620);await page.waitForTimeout(1800);await page.screenshot({path:'.artifacts/energy/footer-magnet.png'})
console.log('footer',await page.locator('.scifer-energy-field canvas').evaluate(e=>({...e.dataset})))
console.log('overflow',await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),'errors',errors)
await fs.writeFile('.artifacts/energy/interaction-errors.json',JSON.stringify(errors,null,2));await browser.close()
