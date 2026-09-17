import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { PNG } from 'pngjs'

async function open(page: Page) {
  await page.goto('/')
  await expect(page.locator('.experience-ready')).toBeVisible({ timeout: 20000 })
  await expect(page.locator('.experience-intro')).toHaveCount(0, { timeout: 10000 })
}
async function shot(page: Page, selector: string, progress: number) {
  await page.evaluate(({ selector, progress }) => {
    const element = document.querySelector<HTMLElement>(selector)!
    window.scrollTo(0, element.getBoundingClientRect().top + scrollY + (element.offsetHeight - innerHeight) * progress)
  }, { selector, progress })
  await page.waitForTimeout(1100)
}
function bluePixels(image: PNG, left = 0, top = 0, right = image.width, bottom = image.height) {
  let total = 0
  for (let y = top; y < bottom; y++) for (let x = left; x < right; x++) {
    const i = (y * image.width + x) * 4
    if (image.data[i + 2] - image.data[i] > 30 && image.data[i + 2] - image.data[i + 1] > 8) total++
  }
  return total
}

test('one persistent energy canvas covers the viewport and reverses the black aperture', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  await open(page)
  const canvas = page.locator('.scifer-energy-field canvas')
  await canvas.evaluate(element => { element.dataset.identity = 'persistent' })
  // Reach the burst between the processor and data chapters, including anticipation.
  await page.evaluate(() => {
    const core = document.getElementById('intelligence')!, wave = document.getElementById('data')!
    window.scrollTo(0, core.getBoundingClientRect().top + scrollY + (wave.offsetTop - core.offsetTop) * .49)
  })
  await page.waitForTimeout(1400)
  const burst = PNG.sync.read(await canvas.screenshot())
  for (const [left, top] of [[0, 100], [burst.width - 220, 100], [0, burst.height - 220], [burst.width - 220, burst.height - 220]]) expect(bluePixels(burst, left, top, left + 220, top + 120)).toBeGreaterThan(20)
  await shot(page, '#understanding', .66)
  await expect(page.locator('html')).toHaveAttribute('data-energy-dark', 'true')
  const reveal = await page.locator('.line-3 > span').evaluate(element => getComputedStyle(element).transform)
  expect(reveal).toBe('matrix(1, 0, 0, 1, 0, 0)')
  await shot(page, '#technology', .86)
  await expect(page.getByRole('tab', { name: /Blockchain/ })).toHaveAttribute('aria-selected', 'true')
  await shot(page, '#understanding', .10)
  expect(await page.locator('.line-3 > span').evaluate(element => new DOMMatrix(getComputedStyle(element).transform).m42)).toBeGreaterThan(50)
  await expect(canvas).toHaveAttribute('data-identity', 'persistent')
  expect(errors).toEqual([])
})

test('understanding uses a rendered black matte with readable text and accessible structure', async ({ page }) => {
  await open(page); await shot(page, '#understanding', .66)
  const image = PNG.sync.read(await page.screenshot())
  const pixel = (image.width * 500 + 35) * 4
  expect(Math.max(...image.data.subarray(pixel, pixel + 3))).toBeLessThan(35)
  const colors = await page.locator('.understanding-line').evaluateAll(elements => elements.map(element => getComputedStyle(element).color))
  expect(colors[0]).toBe('rgb(248, 251, 255)')
  expect(colors[3]).toBe('rgb(112, 184, 255)')
  // Both colors exceed WCAG AA against the measured #050608 matte.
  const result = await new AxeBuilder({ page }).include('#understanding').disableRules(['color-contrast']).withTags(['wcag2a', 'wcag2aa']).analyze()
  expect(result.violations).toEqual([])
})

test('liquid raycasting deforms locally; robot and blockchain accept geometry interaction', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await open(page); await shot(page, '#technology', .1)
  const canvas = page.locator('.scifer-energy-field canvas')
  await page.mouse.move(1090, 470); await page.waitForTimeout(1800)
  expect(Number(await canvas.getAttribute('data-liquid-force'))).toBeGreaterThan(.25)
  const image = PNG.sync.read(await canvas.screenshot())
  expect(bluePixels(image, 800, 180, 1390, 720)).toBeGreaterThan(1500)
  await shot(page, '#technology', .49)
  let joint = false
  for (const [x, y] of [[1010, 350], [1040, 540], [1020, 380], [1050, 560]]) {
    await page.mouse.move(x, y); await page.waitForTimeout(120)
    if (await page.locator('.energy-joint-label').count()) { joint = true; break }
  }
  expect(joint).toBeTruthy()
  await shot(page, '#technology', .86)
  let block = false
  for (const [x,y] of [[1080,450],[1100,430],[1040,430],[1120,470],[990,510],[1180,510]]) {
    await page.mouse.move(x,y); await page.waitForTimeout(1600)
    if (await canvas.getAttribute('data-hover') === 'Verifying connected blocks') { block = true; break }
  }
  expect(block).toBeTruthy()
})

test('future material settles at footer anchors and responds to a local magnetic field', async ({ page }) => {
  await open(page); await shot(page, '#future', .6)
  const canvas = page.locator('.scifer-energy-field canvas')
  const future = PNG.sync.read(await canvas.screenshot())
  expect(bluePixels(future)).toBeGreaterThan(1800)
  await shot(page, 'footer', 1)
  const footer = await page.locator('footer').boundingBox()
  await page.mouse.move(480, footer!.y + 22); await page.waitForTimeout(1800)
  await expect(canvas).toHaveAttribute('data-magnet', 'active')
  const ions = PNG.sync.read(await canvas.screenshot())
  expect(bluePixels(ions, 0, Math.max(0, Math.round(footer!.y)), ions.width, ions.height)).toBeGreaterThan(450)
  await page.mouse.move(-5, -5); await page.waitForTimeout(1900)
  await expect(canvas).toHaveAttribute('data-magnet', 'rest')
  await expect(page.getByRole('link', { name: 'Back to top', exact: true })).toBeVisible()
})

test('mobile keeps liquid and blockchain visible; reduced motion keeps all narrative text', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await open(page)
  for (const [selector, progress] of [['#understanding', .45], ['#technology', .1], ['#technology', .85], ['#future', .6], ['footer', 1]] as const) {
    await shot(page, selector, progress)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
    await expect(page.locator('.scifer-energy-field canvas')).toBeVisible()
  }
  await expect(page.locator('.scifer-energy-field canvas')).toHaveAttribute('data-particles', '1800')
})
