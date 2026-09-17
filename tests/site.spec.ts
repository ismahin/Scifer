import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { PNG } from 'pngjs'

async function openSite(page: Page) {
  await page.goto('/')
  await expect(page.locator('.experience-ready')).toBeVisible({ timeout: 15000 })
  await expect(page.locator('.experience-intro')).toHaveCount(0, { timeout: 10000 })
}

test('renders real WebGL and scrolls through the engineering story without runtime errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', e => errors.push(e.message))
  await openSite(page)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Engineering')
  await expect(page.locator('.main-webgl canvas')).toBeVisible()
  const glVersion = await page.locator('.main-webgl canvas').evaluate((element: HTMLCanvasElement) => {
    const gl = element.getContext('webgl2')
    return gl?.getParameter(gl.VERSION)
  })
  expect(glVersion).toContain('WebGL 2.0')
  for (const id of ['engineering', 'intelligence', 'data']) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded()
    await page.waitForTimeout(800)
    await expect(page.locator(`#${id} h2`)).toBeVisible()
  }
  expect(errors).toEqual([])
})

test('product explorer selects components, supports drag, and resets its view', async ({ page }) => {
  await openSite(page)
  await page.locator('#explorer').scrollIntoViewIfNeeded()
  await expect(page.locator('.explorer-canvas canvas')).toBeVisible()
  await page.getByRole('button', { name: '02 Optical Sensor' }).click()
  await expect(page.getByRole('heading', { name: 'A clearer understanding.' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Inspect Optical Sensor', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Inspect AI Processor', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Intelligence, at the edge.' })).toBeVisible()
  const box = await page.locator('.explorer-canvas canvas').boundingBox()
  await page.mouse.move(box!.x + 120, box!.y + 140)
  await page.mouse.down()
  await page.mouse.move(box!.x + 250, box!.y + 180, { steps: 15 })
  await page.mouse.up()
  await page.getByRole('button', { name: 'Reset view' }).click()
  await expect(page.getByRole('heading', { name: 'Explore from every angle.' })).toBeVisible()
  await expect(page.locator('.component-list button[aria-expanded="true"]')).toHaveCount(0)
})

test('research filters and project details work with keyboard focus restored', async ({ page }) => {
  await openSite(page)
  await page.locator('#projects').scrollIntoViewIfNeeded()
  const filters = page.getByRole('group', { name: 'Filter projects' })
  await filters.getByRole('button', { name: 'Connected systems' }).click()
  await expect(page.locator('.project-card')).toHaveCount(2)
  await page.locator('.project-card').filter({ hasText: 'Smart Water Monitoring' }).click()
  const dialog = page.getByRole('dialog', { name: 'Smart Water Monitoring' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByText('Distributed water quality sensing')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(page.locator('.project-card').filter({ hasText: 'Smart Water Monitoring' })).toBeFocused()
  await filters.getByRole('button', { name: 'Artificial intelligence' }).click()
  await expect(page.locator('.project-card')).toHaveCount(2)
  await expect(page.locator('.project-card').filter({ hasText: 'Edge AI Platform' })).toHaveCount(1)
})

test('project inquiry validates inputs and produces a downloadable brief', async ({ page }) => {
  await openSite(page)
  await page.getByRole('button', { name: 'Contact us', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Start a project' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Prepare project inquiry' }).click()
  await expect(dialog.getByLabel('Your name')).toBeFocused()
  await dialog.getByLabel('Your name').fill('Alex Morgan')
  await dialog.getByLabel('Work email').fill('alex@example.com')
  await dialog.getByLabel('Organization').fill('Research Lab')
  await dialog.getByLabel('Area of interest').selectOption('Research collaboration')
  await dialog.getByLabel('What are you thinking about?').fill('We are exploring intelligent water quality monitoring for a research project.')
  await dialog.getByRole('button', { name: 'Prepare project inquiry' }).click()
  await expect(dialog.getByText('Your project brief is ready.', { exact: false })).toBeVisible()
  const downloadPromise = page.waitForEvent('download')
  await dialog.getByRole('button', { name: 'Download brief' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('scifer-project-brief.txt')
  await expect(dialog.getByRole('link', { name: 'Open email draft' })).toHaveAttribute('href', /Research%20collaboration/)
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Contact us', exact: true })).toBeFocused()
})

test('mobile navigation, reduced motion, and page layout remain usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openSite(page)
  await expect(page.locator('.main-webgl canvas')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
  await page.getByRole('button', { name: 'Open navigation' }).click()
  await expect(page.getByRole('navigation', { name: 'Navigation index' })).toBeVisible()
  await page.getByRole('navigation', { name: 'Navigation index' }).getByRole('link', { name: /Technology/ }).click()
  await expect(page.getByRole('button', { name: 'Open navigation' })).toHaveAttribute('aria-expanded', 'false')
  await expect(page.locator('#technology h2')).toBeInViewport()
  await page.locator('#explorer').scrollIntoViewIfNeeded()
  await page.getByRole('button', { name: '06 Control System' }).click()
  await expect(page.getByRole('heading', { name: 'From insight to action.' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
})

test('primary content passes automated accessibility checks', async ({ page }) => {
  await openSite(page)
  await page.waitForTimeout(1200)
  // The fixed WebGL aperture is not visible to axe's DOM background-color resolver.
  // Its rendered backdrop and text contrast are checked separately in energy.spec.ts.
  const result = await new AxeBuilder({ page }).exclude('#understanding').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  expect(result.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) }))).toEqual([])
})

test('persistent shader renders visible data particles and the future architecture', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openSite(page)
  await page.locator('#data').scrollIntoViewIfNeeded()
  await page.waitForTimeout(1200)
  const data = PNG.sync.read(await page.locator('.scifer-energy-field canvas').screenshot())
  let dataPixels = 0
  for (let i = 0; i < data.data.length; i += 4) if (data.data[i + 2] - data.data[i] > 35 && data.data[i + 2] - data.data[i + 1] > 10) dataPixels++
  expect(dataPixels).toBeGreaterThan(300)
  await page.locator('.final-section').scrollIntoViewIfNeeded()
  await expect(page.locator('.scifer-energy-field canvas')).toBeVisible()
  await page.waitForTimeout(500)
  const logo = PNG.sync.read(await page.locator('.scifer-energy-field canvas').screenshot())
  let logoPixels = 0
  for (let i = 0; i < logo.data.length; i += 4) if (logo.data[i + 2] - logo.data[i] > 35) logoPixels++
  expect(logoPixels).toBeGreaterThan(100)
})

test('cinematic hardware supports real mesh picking and accessible reset', async ({ page }) => {
  await openSite(page)
  const canvas = page.locator('.main-webgl canvas')
  const box = (await canvas.boundingBox())!
  let hit = false
  for (const [x, y] of [[.65,.49],[.6,.6],[.5,.55],[.75,.62],[.43,.48]]) {
    await page.mouse.move(box.x + box.width*x, box.y + box.height*y)
    await page.waitForTimeout(120)
    if (await page.locator('.mesh-hover-label').count()) { hit = true; await page.mouse.click(box.x + box.width*x, box.y + box.height*y); break }
  }
  expect(hit).toBeTruthy()
  await expect(page.locator('.story-inspection')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.locator('.story-inspection')).toHaveCount(0)
  await page.locator('#engineering').scrollIntoViewIfNeeded()
  await page.locator('.architecture-controls').getByRole('button', { name: 'AI Processor', exact: true }).click()
  await expect(page.locator('.story-inspection strong')).toHaveText('AI Processor')
})

test('discipline keyboard controls and project index preserve their selections', async ({ page }) => {
  await openSite(page)
  await page.locator('#technology').scrollIntoViewIfNeeded()
  const tab = page.getByRole('tab', { name: /Artificial Intelligence/i })
  await tab.focus()
  await page.keyboard.press('ArrowDown')
  await expect(page.getByRole('tab', { name: /Robotics/ })).toHaveAttribute('aria-selected', 'true')
  await expect(page.locator('.scifer-energy-field canvas')).toHaveCount(1)
  await page.locator('#projects').scrollIntoViewIfNeeded()
  await page.getByRole('button', { name: 'Index', exact: true }).click()
  await expect(page.locator('#projects')).toHaveClass(/is-index-view/)
  await expect(page.locator('.project-card')).toHaveCount(5)
  await page.getByRole('button', { name: 'Gallery', exact: true }).click()
  await expect(page.locator('#projects')).not.toHaveClass(/is-index-view/)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.waitForTimeout(500)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
})
