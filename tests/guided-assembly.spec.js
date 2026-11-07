import { expect, test } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const evidenceDir = resolve('artifacts/css-ma-01/after')
const activity = (page) => page.locator('[data-learning-activity]')
const guidedCanvas = (page) => page.locator('[data-guided-canvas]')

async function openGuided(page, path = '/student/assembly', viewport = { width: 1440, height: 900 }) {
  await page.setViewportSize(viewport)
  await page.goto(path)
  const isAssembly = path === '/student/assembly'
  const title = isAssembly ? 'Guided Assembly' : 'Guided Disassembly'
  await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible()
  await expect(activity(page)).toHaveAttribute('data-assembly-load-state', 'loaded', { timeout: 30_000 })
  await expect(guidedCanvas(page)).toHaveAttribute('data-case-model-loaded', 'true')
  if (isAssembly) await expect(guidedCanvas(page)).toHaveAttribute('data-motherboard-model-loaded', 'true')
}

async function capture(page, name) {
  const path = resolve(evidenceDir, name)
  mkdirSync(dirname(path), { recursive: true })
  await page.screenshot({ path, fullPage: true, animations: 'disabled' })
  return path
}

async function waitForSequenceIdle(page) {
  await expect(activity(page)).toHaveAttribute('data-sequence-busy', 'false', { timeout: 20_000 })
}

test.describe('CSS-3D-03A-R reversible guided assembly and disassembly', () => {
  test.describe.configure({ timeout: 90_000 })

  test('case and motherboard preview transitions reverse exactly and preserve the blocked fit status', async ({ page }) => {
    await openGuided(page)
    const canvas = guidedCanvas(page)
    const next = page.getByRole('button', { name: 'Next step' })
    const previous = page.getByRole('button', { name: 'Previous' })
    const panelInitial = await canvas.getAttribute('data-panel-transform')
    const boardStageX = Number((await canvas.getAttribute('data-motherboard-stage-transform')).split(',')[0])
    const boardStageTransform = await canvas.getAttribute('data-motherboard-stage-transform')
    const targetQuaternion = await canvas.getAttribute('data-motherboard-target-quaternion')
    const targetScale = await canvas.getAttribute('data-motherboard-target-scale')
    await expect(next).toBeEnabled()
    await expect(previous).toBeDisabled()
    await expect(canvas).not.toHaveAttribute('data-board-drag-enabled', 'true')
    await expect(page.getByText(/drag toward the stored reference/i)).toHaveCount(0)

    await capture(page, 'assembly-initial.png')
    await next.click()
    await expect(canvas).toHaveAttribute('data-glass-panel-removed', 'true', { timeout: 20_000 })
    await expect(activity(page)).toHaveAttribute('data-sequence-cursor', '1')
    await expect(page.getByRole('heading', { name: 'Check the motherboard fit' })).toBeVisible()
    const panelRemoved = await canvas.getAttribute('data-panel-transform')
    expect(panelRemoved).not.toBe(panelInitial)
    await capture(page, 'assembly-glass-removed.png')

    await previous.click()
    await expect(canvas).toHaveAttribute('data-glass-panel-removed', 'false', { timeout: 20_000 })
    await expect(activity(page)).toHaveAttribute('data-sequence-cursor', '0')
    await expect(canvas).toHaveAttribute('data-panel-transform', panelInitial)
    await expect(canvas).toHaveAttribute('data-motherboard-visible', 'false')

    await next.click()
    await expect(canvas).toHaveAttribute('data-glass-panel-removed', 'true', { timeout: 20_000 })
    await expect(activity(page)).toHaveAttribute('data-sequence-cursor', '1')
    await expect(page.getByRole('button', { name: 'Preview fit approach' })).toBeEnabled()
    await capture(page, 'assembly-motherboard-staged.png')

    await page.getByRole('button', { name: 'Preview fit approach' }).click()
    await expect(canvas).toHaveAttribute('data-board-preview-state', 'exploded-reference-only', { timeout: 20_000 })
    await expect(activity(page)).toHaveAttribute('data-sequence-cursor', '2')
    await expect(page.getByRole('heading', { name: 'Motherboard fit blocked' })).toBeVisible()
    await expect(canvas).toHaveAttribute('data-board-installed', 'false')
    await expect(canvas).toHaveAttribute('data-board-target-fit-status', 'blocked-by-solid-tray')
    const preview = await canvas.evaluate((element) => ({
      rootX: Number(element.dataset.boardRootPosition.split(',')[0]),
      safeX: Number(element.dataset.boardSafeRootX),
      gapMm: Number(element.dataset.boardTrayBarrierGapMm),
      state: element.dataset.boardTransformState,
    }))
    expect(preview.rootX).toBeCloseTo(preview.safeX, 5)
    expect(preview.gapMm).toBeGreaterThan(0)
    expect(preview.state).toBe('safe-fit-barrier')
    expect((await canvas.getAttribute('data-board-root-position')).split(',').slice(1)).toEqual(boardStageTransform.split(',').slice(1))
    await expect(canvas).toHaveAttribute('data-motherboard-target-quaternion', targetQuaternion)
    await expect(canvas).toHaveAttribute('data-motherboard-target-scale', targetScale)
    await expect(page.getByRole('button', { name: 'Fit correction required' })).toBeDisabled()
    await capture(page, 'assembly-fit-preview-blocked.png')

    await previous.click()
    await expect(activity(page)).toHaveAttribute('data-sequence-cursor', '1')
    await expect(canvas).toHaveAttribute('data-board-transform-state', 'staging')
    const stagedX = Number((await canvas.getAttribute('data-board-root-position')).split(',')[0])
    expect(stagedX).toBeCloseTo(boardStageX, 5)
    await expect(canvas).toHaveAttribute('data-board-root-position', boardStageTransform)
    await expect(canvas).toHaveAttribute('data-glass-panel-removed', 'true')
    await page.getByRole('button', { name: 'Preview fit approach' }).click()
    await expect(activity(page)).toHaveAttribute('data-sequence-cursor', '2')
    await expect(canvas).toHaveAttribute('data-board-transform-state', 'safe-fit-barrier')
    const rootAtPreview = await canvas.getAttribute('data-board-root-position')
    await page.getByRole('button', { name: 'Replay step' }).click()
    await waitForSequenceIdle(page)
    await expect(activity(page)).toHaveAttribute('data-sequence-cursor', '2')
    await expect(canvas).toHaveAttribute('data-board-root-position', rootAtPreview)
    await page.getByRole('button', { name: 'Reset Activity' }).click()
    await waitForSequenceIdle(page)
    await expect(activity(page)).toHaveAttribute('data-sequence-cursor', '0')
    await expect(canvas).toHaveAttribute('data-panel-transform', panelInitial)
    await expect(canvas).toHaveAttribute('data-board-installed', 'false')
    await expect(canvas).toHaveAttribute('data-motherboard-visible', 'false')
  })

  test('rapid navigation is locked during animation and reset restores the initial state', async ({ page }) => {
    await openGuided(page)
    const canvas = guidedCanvas(page)
    const next = page.locator('.assembly-guide-panel [data-assembly-action="next-step"]')
    const initialPanel = await canvas.getAttribute('data-panel-transform')
    await next.evaluate((button) => button.dispatchEvent(new MouseEvent('click', { bubbles: true })))
    await expect(activity(page)).toHaveAttribute('data-sequence-busy', 'true')
    await expect(next).toBeDisabled()
    await expect(page.locator('.assembly-guide-panel [data-assembly-action="previous-step"]')).toBeDisabled()
    await next.evaluate((button) => button.dispatchEvent(new MouseEvent('click', { bubbles: true })))
    await expect(canvas).toHaveAttribute('data-glass-panel-removed', 'true', { timeout: 20_000 })
    await expect(activity(page)).toHaveAttribute('data-sequence-cursor', '1')
    await waitForSequenceIdle(page)
    await expect(canvas).toHaveAttribute('data-board-preview-state', 'staged')
    await page.getByRole('button', { name: 'Reset Activity' }).click()
    await waitForSequenceIdle(page)
    await expect(activity(page)).toHaveAttribute('data-sequence-cursor', '0')
    await expect(canvas).toHaveAttribute('data-panel-transform', initialPanel)
    await expect(canvas).toHaveAttribute('data-glass-panel-visible', 'true')
  })

  test('repeated forward and reverse cycles restore the authored panel transform without drift', async ({ page }) => {
    await openGuided(page)
    const canvas = guidedCanvas(page)
    const initial = await canvas.getAttribute('data-panel-transform')
    for (let cycle = 0; cycle < 4; cycle += 1) {
      await page.getByRole('button', { name: 'Next step' }).click()
      await expect(canvas).toHaveAttribute('data-glass-panel-removed', 'true', { timeout: 20_000 })
      await page.getByRole('button', { name: 'Previous' }).click()
      await expect(canvas).toHaveAttribute('data-glass-panel-removed', 'false', { timeout: 20_000 })
      await expect(canvas).toHaveAttribute('data-panel-transform', initial)
      await expect(activity(page)).toHaveAttribute('data-sequence-cursor', '0')
    }
  })

  test('failed replay forward leg leaves the cursor at the actual staged transform', async ({ page }) => {
    await page.goto('/login')
    const result = await page.evaluate(async () => {
      const { createGuidedSequence } = await import('/src/activities/guided-sequence.js')
      let pose = 'staged'
      let calls = 0
      const sequence = createGuidedSequence({
        transitions: ['motherboard'],
        runTransition: async (_transition, direction) => {
          calls += 1
          if (calls === 3) return { ok: false }
          pose = direction === 'forward' ? 'installed-demo' : 'staged'
          return { ok: true }
        },
      })
      const firstInstall = await sequence.next()
      const replay = await sequence.replay()
      const afterFailedReplay = { pose, ...sequence.state }
      const reinstall = await sequence.next()
      return { firstInstall, replay, afterFailedReplay, reinstall, finalPose: pose, finalState: sequence.state }
    })
    expect(result.firstInstall).toBe(true)
    expect(result.replay).toBe(false)
    expect(result.afterFailedReplay).toMatchObject({ pose: 'staged', cursor: 0, busy: false, length: 1 })
    expect(result.reinstall).toBe(true)
    expect(result.finalPose).toBe('installed-demo')
    expect(result.finalState.cursor).toBe(1)
  })

  test('stereo mode animates the shared scene and application hands follow both guided actions', async ({ page }) => {
    await openGuided(page, '/student/assembly', { width: 874, height: 402 })
    const canvas = guidedCanvas(page)
    await page.getByRole('button', { name: 'VR View' }).click()
    await expect(canvas).toHaveAttribute('data-hands-load-state', 'loaded', { timeout: 15_000 })
    await expect(canvas).toHaveAttribute('data-hand-root-count', '2')
    await expect(canvas).toHaveAttribute('data-stereo-views', 'left,right')
    await expect(canvas).toHaveAttribute('data-hands-visible', 'true')
    await expect(page.locator('.assembly-stereo-step')).toHaveCount(2)
    await expect(page.locator('.assembly-stereo-step-right')).toContainText('Prepare the computer case')
    await capture(page, 'assembly-mobile-landscape-stereo-initial.png')

    const stereoNext = page.locator('.assembly-stereo-controls [data-assembly-action="next-step"]')
    await stereoNext.evaluate((button) => button.dispatchEvent(new MouseEvent('click', { bubbles: true })))
    await expect(canvas).toHaveAttribute('data-guided-animation-state', 'case-panel-forward')
    await expect(canvas).toHaveAttribute('data-last-animation-hand-pose', 'reach')
    await expect(canvas).toHaveAttribute('data-glass-panel-removed', 'true', { timeout: 20_000 })
    await expect(canvas).toHaveAttribute('data-render-mode', 'stereo')
    await expect(canvas).toHaveAttribute('data-stereo-views', 'left,right')

    await page.locator('.assembly-stereo-controls [data-assembly-action="next-step"]').evaluate((button) => button.dispatchEvent(new MouseEvent('click', { bubbles: true })))
    await expect(canvas).toHaveAttribute('data-guided-animation-state', 'motherboard-fit-preview-forward')
    await expect(canvas).toHaveAttribute('data-last-animation-hand-pose', 'grip')
    await expect(canvas).toHaveAttribute('data-board-preview-state', 'exploded-reference-only', { timeout: 20_000 })
    await expect(canvas).toHaveAttribute('data-board-installed', 'false')
    await expect(page.locator('.assembly-stereo-step-right')).toContainText('Preview only · not installed')
    await capture(page, 'assembly-mobile-landscape-stereo-board-preview.png')
    await page.getByRole('button', { name: 'Exit VR View and return to Normal 3D' }).click()
    await expect(canvas).toHaveAttribute('data-render-mode', 'normal')
    await expect(canvas).toHaveAttribute('data-hands-visible', 'false')
    await expect(activity(page)).toHaveAttribute('data-sequence-cursor', '2')
  })

  test('Normal 3D orbit and zoom work, and switching modes or phone orientation preserves progress', async ({ page }) => {
    await openGuided(page, '/student/assembly', { width: 874, height: 402 })
    const canvas = guidedCanvas(page)
    await page.getByRole('button', { name: 'Next step' }).click()
    await expect(canvas).toHaveAttribute('data-glass-panel-removed', 'true', { timeout: 20_000 })
    const initialCamera = await canvas.getAttribute('data-camera-position')
    const bounds = await canvas.boundingBox()
    await page.mouse.move(bounds.x + bounds.width * 0.5, bounds.y + bounds.height * 0.5)
    await page.mouse.down()
    await page.mouse.move(bounds.x + bounds.width * 0.65, bounds.y + bounds.height * 0.58, { steps: 8 })
    await page.mouse.up()
    await expect.poll(() => canvas.getAttribute('data-camera-position')).not.toBe(initialCamera)
    const beforeZoom = Number(await canvas.getAttribute('data-camera-distance'))
    await page.mouse.move(bounds.x + bounds.width * 0.5, bounds.y + bounds.height * 0.5)
    await page.mouse.wheel(0, -180)
    await expect.poll(async () => Number(await canvas.getAttribute('data-camera-distance'))).toBeLessThan(beforeZoom)

    await page.getByRole('button', { name: 'VR View' }).click()
    await expect(canvas).toHaveAttribute('data-hands-load-state', 'loaded', { timeout: 15_000 })
    await page.setViewportSize({ width: 390, height: 844 })
    await expect(page.getByRole('heading', { name: 'Rotate Your Phone' })).toBeVisible()
    await expect(canvas).toBeHidden()
    await expect(canvas).toHaveAttribute('data-renderer-active', 'false')
    await expect(activity(page)).toHaveAttribute('data-sequence-cursor', '1')
    await capture(page, 'assembly-mobile-portrait-rotate-gate.png')
    await page.setViewportSize({ width: 844, height: 390 })
    await expect(page.locator('[data-learning-activity]')).toHaveAttribute('data-orientation-state', 'workspace')
    await expect(canvas).toHaveAttribute('data-render-mode', 'stereo')
    await expect(canvas).toHaveAttribute('data-renderer-active', 'true')
    await expect(activity(page)).toHaveAttribute('data-sequence-cursor', '1')
    await expect(canvas).toHaveAttribute('data-glass-panel-removed', 'true')
  })

  test('landscape interruption pauses and resumes the same in-progress animation', async ({ page }) => {
    await openGuided(page, '/student/assembly', { width: 844, height: 390 })
    const canvas = guidedCanvas(page)
    await page.getByRole('button', { name: 'Next step' }).click()
    await expect(canvas).toHaveAttribute('data-guided-animation-status', 'running')
    await page.setViewportSize({ width: 390, height: 844 })
    await expect(page.getByRole('heading', { name: 'Rotate Your Phone' })).toBeVisible()
    await expect(canvas).toHaveAttribute('data-renderer-active', 'false')
    await expect(activity(page)).toHaveAttribute('data-sequence-busy', 'true')
    await page.setViewportSize({ width: 844, height: 390 })
    await expect(canvas).toHaveAttribute('data-glass-panel-removed', 'true', { timeout: 10_000 })
    await expect(activity(page)).toHaveAttribute('data-sequence-cursor', '1')
    await expect(activity(page)).toHaveAttribute('data-sequence-busy', 'false')
  })

  test('disassembly reverses only the verified case-panel transform and keeps unverified removals unavailable', async ({ page }) => {
    await openGuided(page, '/student/disassembly')
    const canvas = guidedCanvas(page)
    const initialPanel = await canvas.getAttribute('data-panel-transform')
    await expect(canvas).toHaveAttribute('data-motherboard-visible', 'false')
    await expect(page.locator('[data-sequence-step]')).toHaveCount(1)
    await expect(page.getByText('Motherboard removal unavailable', { exact: true })).toBeVisible()
    await expect(page.getByText('No verified installed motherboard pose or removal path is available.')).toBeVisible()
    await capture(page, 'disassembly-initial.png')
    await page.getByRole('button', { name: 'Next step' }).click()
    await expect(canvas).toHaveAttribute('data-glass-panel-removed', 'true', { timeout: 20_000 })
    await expect(canvas).toHaveAttribute('data-motherboard-visible', 'false')
    await expect(page.getByRole('heading', { name: 'Case access open' })).toBeVisible()
    await capture(page, 'disassembly-glass-removed.png')
    await page.getByRole('button', { name: 'VR View' }).click()
    await expect(canvas).toHaveAttribute('data-render-mode', 'stereo')
    await expect(canvas).toHaveAttribute('data-stereo-views', 'left,right')
    await expect(page.locator('.assembly-stereo-step-right')).toContainText('Case access open')
    await capture(page, 'disassembly-stereo-glass-removed.png')
    await page.getByRole('button', { name: 'Exit VR View and return to Normal 3D' }).click()
    await expect(canvas).toHaveAttribute('data-render-mode', 'normal')
    await page.getByRole('button', { name: 'Previous' }).click()
    await expect(canvas).toHaveAttribute('data-glass-panel-removed', 'false', { timeout: 20_000 })
    await expect(canvas).toHaveAttribute('data-panel-transform', initialPanel)
    await page.getByRole('button', { name: 'Next step' }).click()
    await expect(canvas).toHaveAttribute('data-glass-panel-removed', 'true', { timeout: 20_000 })
    await page.getByRole('button', { name: 'Replay step' }).click()
    await expect(canvas).toHaveAttribute('data-glass-panel-removed', 'true', { timeout: 20_000 })
    await waitForSequenceIdle(page)
    await expect(page.getByRole('button', { name: 'Sequence complete' })).toBeDisabled()
    await page.getByRole('button', { name: 'Previous' }).click()
    await waitForSequenceIdle(page)
    await expect(canvas).toHaveAttribute('data-glass-panel-visible', 'true')
    await expect(page.locator('[data-hardware-canvas]')).toHaveCount(0)
  })

  test('Hardware Exploration remains separate and the portrait workspace gate is preserved', async ({ page }) => {
    await page.goto('/student/hardware')
    await expect(page.locator('[data-learning-activity]')).toHaveAttribute('data-model-load-state', 'loaded', { timeout: 20_000 })
    await expect(page.locator('[data-hardware-canvas]')).toHaveAttribute('data-model-id', 'computer-case')
    await expect(page.locator('[data-guided-canvas]')).toHaveCount(0)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/student/disassembly')
    await expect(page.getByRole('heading', { name: 'Rotate Your Phone' })).toBeVisible()
    await expect(guidedCanvas(page)).toBeHidden()
    await expect(page.locator('html')).not.toHaveAttribute('data-three-revision', /.+/)
    await page.setViewportSize({ width: 844, height: 390 })
    await expect(activity(page)).toHaveAttribute('data-assembly-load-state', 'loaded', { timeout: 30_000 })
    await expect(guidedCanvas(page)).toHaveAttribute('data-render-mode', 'normal')
  })

  test('a failed GLB load can be retried without creating a second viewer', async ({ page }) => {
    let failedOnce = false
    await page.route('**/computer_case.glb', async (route) => {
      if (!failedOnce) {
        failedOnce = true
        await route.abort('failed')
      } else {
        await route.continue()
      }
    })
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/student/assembly')
    await expect(activity(page)).toHaveAttribute('data-assembly-load-state', 'error', { timeout: 30_000 })
    await expect(page.getByRole('button', { name: 'Retry scene' })).toBeVisible()
    await page.getByRole('button', { name: 'Retry scene' }).click()
    await expect(activity(page)).toHaveAttribute('data-assembly-load-state', 'loaded', { timeout: 30_000 })
    await expect(page.locator('[data-guided-canvas]')).toHaveCount(1)
  })

  test('captures browser renders for initial, intermediate, blocked-preview, and disassembly states', async ({ page }) => {
    await openGuided(page)
    await capture(page, 'assembly-initial-capture.png')
    await page.getByRole('button', { name: 'Next step' }).click()
    await expect(guidedCanvas(page)).toHaveAttribute('data-glass-panel-removed', 'true', { timeout: 20_000 })
    await capture(page, 'assembly-intermediate-capture.png')
    await page.getByRole('button', { name: 'Preview fit approach' }).click()
    await expect(guidedCanvas(page)).toHaveAttribute('data-board-preview-state', 'exploded-reference-only', { timeout: 20_000 })
    await capture(page, 'assembly-fit-fallback-capture.png')
    await page.getByRole('button', { name: 'VR View' }).click()
    await expect(guidedCanvas(page)).toHaveAttribute('data-hands-load-state', 'loaded', { timeout: 15_000 })
    await capture(page, 'assembly-stereo-hands-capture.png')
  })
})
