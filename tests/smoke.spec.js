import { expect, test } from '@playwright/test'
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { caseVrPartForNodeName, caseVrParts } from '../src/data/case-vr-parts.js'
import { hardwareComponents } from '../src/data/hardware-components.js'

const viewportWidths = [320, 375, 390, 430, 768, 1024, 1440]
const responsiveViewports = [[320, 568], [375, 667], [390, 844], [430, 932], [667, 375], [844, 390], [874, 402], [932, 430], [768, 1024], [1440, 900]]
const applicationTitle = 'VR-Based Computer Systems Servicing (CSS) Training Application'

function readGlbJson(path) {
  const buffer = readFileSync(path)
  const jsonLength = buffer.readUInt32LE(12)
  return JSON.parse(buffer.toString('utf8', 20, 20 + jsonLength).trim())
}

async function pickMappedCasePartInEye(page, eye, { targetId = null, excludeIds = [], touch = false, canvasBounds = null } = {}) {
  const canvas = page.locator('[data-hardware-canvas]')
  const bounds = canvasBounds || await canvas.boundingBox()
  expect(bounds, 'hardware canvas should have a visible box for mesh picking').not.toBeNull()
  const split = Math.floor(bounds.width / 2)
  const start = eye === 'left' ? 0 : split
  const width = eye === 'left' ? split : bounds.width - split
  // The case is framed consistently in both eyes; start over the projected front
  // fan bank and keep the fallback grid small so a failed pick cannot burn the test timeout.
  const xFractions = touch ? [0.34] : [0.26]
  const yFractions = touch ? [0.462, 0.608, 0.731] : [0.463]
  const details = page.locator('[data-vr-part-details]')
  const points = yFractions.flatMap((yFraction) => xFractions.map((xFraction) => ({
    x: bounds.x + start + width * xFraction,
    y: bounds.y + bounds.height * yFraction,
  })))

  for (const { x, y } of points) {
      if (touch) await page.touchscreen.tap(x, y)
      else await page.mouse.click(x, y)
      const pickedId = await canvas.getAttribute('data-last-case-part-pick')
      const pickedEye = await canvas.getAttribute('data-last-case-part-eye')
      if (pickedEye === eye && pickedId && !excludeIds.includes(pickedId) && (!targetId || pickedId === targetId)) {
        return {
          id: pickedId,
          meshName: await canvas.getAttribute('data-last-case-part-mesh'),
          highlightedMeshCount: Number(await canvas.getAttribute('data-highlighted-part-mesh-count')),
          eye: pickedEye,
          x,
          y,
        }
      }
      if (await details.isVisible()) await page.getByRole('button', { name: 'Close selected part details' }).click()
  }
  throw new Error(`No actual ${eye}-eye mesh hit${targetId ? ` for ${targetId}` : ''} found in the Computer Case GLB.`)
}

async function signInAs(page, role) {
  await page.goto('/login')
  await page.getByLabel('Email Address').fill('preview@movers.test')
  await page.getByLabel('Password', { exact: true }).fill('demo-password')
  await page.getByRole('radio', { name: role, exact: true }).check()
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByRole('heading', { name: 'Set up your profile' })).toBeVisible()
  await page.getByRole('button', { name: 'Skip for now' }).click()
  const dashboardPath = { Student: '/student/dashboard', Instructor: '/instructor/dashboard', Principal: '/principal/dashboard' }[role]
  await expect(page).toHaveURL(new RegExp(dashboardPath.replaceAll('/', '\\/') + '$'))
}

test('landing page navigation opens centered login and invitation sign up', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: applicationTitle })).toBeVisible()
  await expect(page.getByRole('img', { name: 'Movers Institute of Technology and Education seal' })).toBeVisible()
  await expect(page.getByText('Movers Institute of Technology and Education').first()).toBeVisible()
  await expect(page.locator('.brand-name')).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Home', exact: true })).toHaveAttribute('aria-current', 'location')
  await page.getByRole('link', { name: 'About', exact: true }).click()
  await expect(page).toHaveURL(/#about$/)
  await expect(page.getByRole('link', { name: 'About', exact: true })).toHaveAttribute('aria-current', 'location')
  await expect(page.getByRole('heading', { name: 'About the CSS Training Application' })).toBeVisible()
  await expect(page.getByText('This application supplements classroom instruction and physical hands-on training.')).toBeVisible()
  await page.getByRole('link', { name: 'Features', exact: true }).click()
  await expect(page).toHaveURL(/#features$/)
  await expect(page.getByRole('link', { name: 'Features', exact: true })).toHaveAttribute('aria-current', 'location')
  await expect(page.getByRole('heading', { name: 'Explore the Learning Experience' })).toBeVisible()
  await expect(page.getByText('Rotate and zoom the Computer Case in the interactive 3D viewer.')).toBeVisible()
  await page.getByRole('link', { name: 'Learn More' }).click()
  await expect(page).toHaveURL(/#about$/)
  await page.getByRole('link', { name: 'Get Started' }).click()
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible()
  await expect(page.getByRole('img', { name: 'Movers Institute of Technology and Education seal' })).toBeVisible()
  await expect(page.getByText('Movers Institute of Technology and Education').first()).toBeVisible()
  await expect(page.locator('.brand-name')).toHaveCount(0)
  await page.getByRole('tab', { name: 'Sign Up' }).click()
  await expect(page).toHaveURL(/\/activate-account$/)
  await expect(page.getByRole('heading', { name: 'Activate your account' })).toBeVisible()
  await expect(page.getByRole('img', { name: 'Movers Institute of Technology and Education seal' })).toBeVisible()
  await expect(page.locator('.brand-name')).toHaveCount(0)
})

test('landing layout keeps the seal, navigation, title, and actions reachable at real device sizes', async ({ page }) => {
  for (const [width, height] of responsiveViewports) {
    await page.setViewportSize({ width, height })
    await page.goto('/')
    await expect(page.getByRole('img', { name: 'Movers Institute of Technology and Education seal' })).toBeVisible()
    await expect(page.getByRole('heading', { name: applicationTitle })).toBeVisible()
    const measurements = await page.evaluate(() => {
      const rect = (selector) => {
        const element = document.querySelector(selector)
        if (!element) return null
        const { x, y, right, bottom, width, height } = element.getBoundingClientRect()
        return { x, y, right, bottom, width, height }
      }
      return {
        viewport: { width: innerWidth, height: innerHeight },
        pageWidth: document.documentElement.scrollWidth,
        header: rect('.landing-header'),
        seal: rect('.landing-identity .brand-logo-image'),
        controls: rect('.landing-controls'),
        title: rect('#landing-title'),
        getStarted: rect('.landing-start'),
        learnMore: rect('.button-outline-light'),
      }
    })
    expect(measurements.pageWidth, `horizontal overflow at ${width}×${height}`).toBeLessThanOrEqual(width)
    expect(measurements.header?.y).toBeGreaterThanOrEqual(0)
    expect(measurements.seal?.right).toBeLessThanOrEqual(measurements.controls?.x ?? 0)
    expect(measurements.title?.right).toBeLessThanOrEqual(width)
    if (height <= 500 && width <= 950) {
      expect(await page.getByRole('button', { name: 'Open site navigation' }).isVisible()).toBe(true)
      expect(measurements.getStarted?.y).toBeGreaterThanOrEqual(0)
      expect(measurements.getStarted?.bottom).toBeLessThanOrEqual(height)
      expect(measurements.learnMore?.bottom).toBeLessThanOrEqual(height)
    }
    if (width <= 430) {
      expect(await page.getByRole('button', { name: 'Open site navigation' }).isVisible()).toBe(true)
    }
  }
})

test('mobile menu opens without adding a second header row and all section links work', async ({ page }) => {
  for (const [width, height] of [[390, 844], [667, 375], [844, 390]]) {
    await page.setViewportSize({ width, height })
    await page.goto('/')
    const menuButton = page.getByRole('button', { name: 'Open site navigation' })
    await expect(menuButton).toBeVisible()
    const headerHeight = await page.locator('.landing-header').evaluate((element) => element.getBoundingClientRect().height)
    expect(headerHeight, `mobile header too tall at ${width}×${height}`).toBeLessThanOrEqual(60)
    await menuButton.click()
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Close site navigation' })).toHaveAttribute('aria-expanded', 'true')
    await page.getByRole('link', { name: 'About', exact: true }).click()
    await expect(page).toHaveURL(/#about$/)
    await expect(page.getByRole('heading', { name: 'About the CSS Training Application' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Open site navigation' })).toHaveAttribute('aria-expanded', 'false')
    await page.getByRole('button', { name: 'Open site navigation' }).click()
    await page.getByRole('link', { name: 'Features', exact: true }).click()
    await expect(page).toHaveURL(/#features$/)
    await expect(page.getByRole('heading', { name: 'Explore the Learning Experience' })).toBeVisible()
    await page.getByRole('button', { name: 'Open site navigation' }).click()
    await page.getByRole('link', { name: 'Home', exact: true }).click()
    await expect(page).toHaveURL(/#home$/)
  }
})

test('login profile flow, role dashboards, and logout remain available', async ({ page }) => {
  for (const [role, path, heading] of [
    ['Student', '/student/dashboard', 'Good morning, Alex.'],
    ['Instructor', '/instructor/dashboard', 'Good morning, Jordan.'],
    ['Principal', '/principal/dashboard', 'Welcome, Taylor.'],
  ]) {
    await signInAs(page, role)
    await expect(page).toHaveURL(new RegExp(path.replaceAll('/', '\\/')))
    await expect(page.getByRole('heading', { name: heading })).toBeVisible()
    await expect(page.getByText('Movers Institute of Technology and Education', { exact: true })).toHaveCount(0)
    await expect(page.getByText('Computer Systems Servicing Training Application', { exact: true })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Profile', exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Log out' }).click()
    await expect(page).toHaveURL(/\/login$/)
  }
})

test('invitation activation has a compact seal header and no visible test controls', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('tab', { name: 'Sign Up' }).click()
  await expect(page.getByRole('heading', { name: 'Activate your account' })).toBeVisible()
  await expect(page.getByLabel('Invited email')).toHaveValue('student@movers.test')
  await expect(page.getByLabel('Assigned role')).toHaveValue('CSS Student')
  await expect(page.getByText(/test invitation|invitation outcome|current invitation|unrecognized invitation|expired invitation|form checks complete/i)).toHaveCount(0)
  await expect(page.locator('.invitation-test-controls')).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Back to Login' })).toBeVisible()
  const header = await page.evaluate(() => {
    const back = document.querySelector('.activation-back-link')?.getBoundingClientRect()
    const seal = document.querySelector('.activation-header .brand-logo-image')?.getBoundingClientRect()
    return { backLeft: back?.left ?? Infinity, sealRight: seal?.right ?? -Infinity, width: innerWidth }
  })
  expect(header.backLeft).toBeLessThan(header.sealRight)
  expect(header.sealRight).toBeLessThanOrEqual(header.width)
  await expect(page.getByText('Movers Institute of Technology and Education', { exact: true })).toHaveCount(0)
  await page.getByLabel('Full name').fill('Jordan Student')
  await page.getByLabel('Create password').fill('test-only-password')
  await page.getByLabel('Confirm password').fill('test-only-password')
  await page.getByRole('button', { name: 'Activate account' }).click()
  await expect(page.getByRole('heading', { name: 'Details checked' })).toBeVisible()
  await expect(page.getByText(/no account was created/i)).toBeVisible()
  await page.getByRole('button', { name: 'Continue to login' }).click()
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByText(/Account creation is not connected/)).toBeVisible()
})

test('invalid and expired invitation states remain available as isolated development fixtures', async ({ page }) => {
  for (const [fixture, heading] of [['invalid', 'Invitation not recognized'], ['expired', 'Invitation expired']]) {
    await page.goto(`/activate-account?invitationFixture=${fixture}`)
    await expect(page.getByRole('heading', { name: heading })).toBeVisible()
    await expect(page.locator('.invitation-test-controls')).toHaveCount(0)
  }
})

test('student dashboard opens Hardware Exploration and shared activity shells', async ({ page }) => {
  await signInAs(page, 'Student')
  await page.getByRole('link', { name: 'Explore components' }).click()
  await expect(page.getByRole('heading', { name: 'Hardware Exploration' })).toBeVisible()
  await expect(page.locator('[data-learning-activity]')).toHaveAttribute('data-model-load-state', 'loaded', { timeout: 15_000 })
  await page.locator('.activity-topbar').getByRole('link', { name: 'Back to Student Dashboard' }).click()
  await page.getByRole('link', { name: 'Start assembly' }).click()
  await expect(page.getByRole('heading', { name: 'Guided Assembly', exact: true })).toBeVisible()
  await expect(page.getByRole('status').filter({ hasText: 'not interactive yet' })).toBeVisible()
  await page.locator('.activity-topbar').getByRole('link', { name: 'Back to Student Dashboard' }).click()
  await page.getByRole('link', { name: 'Start disassembly' }).click()
  await expect(page.getByRole('heading', { name: 'Guided Disassembly', exact: true })).toBeVisible()
  await expect(page.locator('[data-hardware-canvas]')).toHaveCount(0)
})

test('instructor demo interactions cover classes, invitation, assessments, and progress', async ({ page }) => {
  await signInAs(page, 'Instructor')
  await page.getByRole('link', { name: 'My classes' }).click()
  await page.getByRole('button', { name: 'View class' }).first().click()
  await expect(page.getByRole('dialog')).toContainText('class overview')
  await page.getByRole('button', { name: 'Done' }).click()
  await page.getByRole('link', { name: 'Invite students' }).click()
  await expect(page.getByRole('dialog')).toContainText('Invite a student')
  await page.getByLabel('Invitee email').fill('fictional.student@movers.test')
  await page.getByRole('button', { name: 'Review details' }).click()
  await expect(page.getByRole('dialog')).toContainText('No email was sent')
  await page.getByRole('button', { name: 'Done' }).click()
  await page.getByRole('link', { name: 'Assign assessments' }).click()
  await page.getByRole('button', { name: 'Review assignment' }).first().click()
  await expect(page.getByRole('dialog')).toContainText('Assessment details')
  await page.getByRole('button', { name: 'Review assignment', exact: true }).last().click()
  await expect(page.getByRole('button', { name: 'Reviewed' })).toBeVisible()
  await page.getByRole('link', { name: 'Student progress' }).click()
  await expect(page.getByRole('heading', { name: 'Student progress' })).toBeVisible()
})

test('principal can review instructors and classes and preview an invite', async ({ page }) => {
  await signInAs(page, 'Principal')
  await page.getByRole('navigation', { name: 'Principal navigation' }).getByRole('link', { name: 'Invite instructor' }).click()
  await expect(page.getByRole('dialog')).toContainText('Invite an instructor')
  await page.getByLabel('Invitee email').fill('fictional.instructor@movers.test')
  await page.getByRole('button', { name: 'Review details' }).click()
  await expect(page.getByRole('dialog')).toContainText('No email was sent')
  await page.getByRole('button', { name: 'Done' }).click()
  await page.getByRole('link', { name: 'CSS classes' }).click()
  await expect(page.getByRole('heading', { name: 'CSS class overview' })).toBeVisible()
})

test('responsive landing, login, and dashboard fit requested widths', async ({ page }) => {
  for (const width of viewportWidths) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await expect(page.getByRole('heading', { name: applicationTitle })).toBeVisible()
    let dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }))
    expect(dimensions.scroll, `landing overflow at ${width}px`).toBeLessThanOrEqual(dimensions.client)
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible()
    dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }))
    expect(dimensions.scroll, `login overflow at ${width}px`).toBeLessThanOrEqual(dimensions.client)
    await signInAs(page, 'Student')
    dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }))
    expect(dimensions.scroll, `student dashboard overflow at ${width}px`).toBeLessThanOrEqual(dimensions.client)
    if (width <= 760) {
      await page.getByRole('button', { name: 'Menu' }).click()
      await expect(page.getByRole('navigation', { name: 'Mobile role navigation' })).toBeVisible()
    }
  }
})

test('Profile opens directly in editable mode and saves display name and avatar across all roles', async ({ page }) => {
  for (const role of ['Student', 'Instructor', 'Principal']) {
    await signInAs(page, role)
    await page.getByRole('link', { name: 'Profile', exact: true }).click()
    await expect(page).toHaveURL(/\/settings$/)
    await expect(page.getByRole('heading', { name: 'My Profile' })).toBeVisible()
    await expect(page.getByLabel('Full name')).toHaveAttribute('readonly', '')
    await expect(page.getByLabel('Assigned role')).toHaveValue(role === 'Student' ? 'CSS Student' : role === 'Instructor' ? 'CSS Instructor' : 'Principal')
    await expect(page.getByLabel('Email address')).toHaveValue('preview@movers.test')
    await expect(page.getByLabel('Display name')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Edit profile' })).toHaveCount(0)
    await page.getByRole('button', { name: 'Choose profile avatar' }).click()
    await expect(page.getByRole('group', { name: 'Avatar appearance' })).toBeVisible()
    await page.getByRole('button', { name: 'Systems' }).click()
    const nextName = `${role} Learner`
    await page.getByLabel('Display name').fill(nextName)
    await page.getByRole('button', { name: 'Save Changes' }).click()
    await expect(page.getByRole('status')).toHaveText('Profile updated for this session.')
    await expect(page.locator('.topbar-user-name')).toHaveText(nextName)
    await expect(page.locator('.topbar-user .avatar-systems')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Choose profile avatar' })).toHaveAttribute('aria-expanded', 'true')
    await page.getByLabel('Display name').fill(`${nextName} revised`)
    await expect(page.getByRole('status')).toHaveCount(0)
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await signInAs(page, 'Instructor')
  await page.getByRole('button', { name: 'Menu' }).click()
  await page.getByRole('link', { name: 'Profile', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'My Profile' })).toBeVisible()
})

test('login email and password may be omitted for workspace navigation', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page).toHaveURL(/\/profile-setup$/)
  await page.getByRole('button', { name: 'Skip for now' }).click()
  await page.getByRole('link', { name: 'Profile', exact: true }).click()
  await expect(page.getByLabel('Email address')).toHaveValue('Not provided')
})

test('profile editor remains usable without overflow at portrait, landscape, tablet, and desktop sizes', async ({ page }) => {
  await signInAs(page, 'Student')
  await page.getByRole('link', { name: 'Profile', exact: true }).click()
  for (const [width, height] of responsiveViewports) {
    await page.setViewportSize({ width, height })
    const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }))
    expect(dimensions.scroll, `profile horizontal overflow at ${width}×${height}`).toBeLessThanOrEqual(dimensions.client)
    await page.getByRole('button', { name: 'Choose profile avatar' }).click()
    const options = await page.locator('.profile-avatar-options').evaluate((element) => ({ scroll: element.scrollWidth, client: element.clientWidth }))
    expect(options.scroll, `avatar choices overflow at ${width}×${height}`).toBeLessThanOrEqual(options.client)
    const save = page.getByRole('button', { name: 'Save Changes' })
    await save.scrollIntoViewIfNeeded()
    const bounds = await save.evaluate((element) => ({ top: element.getBoundingClientRect().top, bottom: element.getBoundingClientRect().bottom, height: innerHeight }))
    expect(bounds.top).toBeGreaterThanOrEqual(0)
    expect(bounds.bottom).toBeLessThanOrEqual(bounds.height)
    await page.getByRole('button', { name: 'Choose profile avatar' }).click()
  }
})

test('login starts at a reachable top and every control scrolls into view across requested devices', async ({ page }) => {
  for (const [width, height] of responsiveViewports) {
    await page.setViewportSize({ width, height })
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Login' })).toBeVisible()
    const initial = await page.evaluate(() => {
      const rect = (selector) => {
        const element = document.querySelector(selector)
        if (!element) return null
        const { x, y, right, bottom, width, height } = element.getBoundingClientRect()
        return { x, y, right, bottom, width, height }
      }
      return { pageWidth: document.documentElement.scrollWidth, scrollY, card: rect('.login-card'), seal: rect('.auth-brand-lockup .brand-logo-image'), heading: rect('.auth-card-heading'), tabs: rect('.auth-tabs') }
    })
    expect(initial.pageWidth, `login overflow at ${width}×${height}`).toBeLessThanOrEqual(width)
    expect(initial.scrollY).toBe(0)
    expect(initial.card?.y).toBeGreaterThanOrEqual(0)
    expect(initial.seal?.y).toBeGreaterThanOrEqual(initial.card?.y ?? 0)
    expect(initial.heading?.y).toBeGreaterThanOrEqual(initial.seal?.y ?? 0)
    expect(initial.tabs?.bottom).toBeLessThanOrEqual(height)

    for (const locator of [page.getByLabel('Email Address'), page.getByLabel('Password', { exact: true }), page.getByRole('button', { name: 'Continue' }), page.getByRole('radiogroup', { name: 'Choose a workspace' })]) {
      await locator.scrollIntoViewIfNeeded()
      const bounds = await locator.evaluate((element) => {
        const { top, bottom } = element.getBoundingClientRect()
        return { top, bottom, height: innerHeight }
      })
      expect(bounds.top, `control clipped above viewport at ${width}×${height}`).toBeGreaterThanOrEqual(0)
      expect(bounds.bottom, `control clipped below viewport at ${width}×${height}`).toBeLessThanOrEqual(bounds.height)
    }
  }
})

test('login can be completed by scrolling and tapping at every phone landscape size', async ({ page }) => {
  for (const [width, height] of [[667, 375], [844, 390], [874, 402], [932, 430]]) {
    await page.setViewportSize({ width, height })
    await page.goto('/login')
    await page.getByLabel('Email Address').fill('preview@movers.test')
    await page.getByLabel('Password', { exact: true }).fill('sample-password')
    await page.getByRole('radio', { name: 'Student', exact: true }).check()
    await page.getByRole('button', { name: 'Continue' }).scrollIntoViewIfNeeded()
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.getByRole('heading', { name: 'Set up your profile' })).toBeVisible()
  }
})

test('invitation activation remains scrollable on phone portrait and landscape', async ({ page }) => {
  for (const [width, height] of responsiveViewports) {
    await page.setViewportSize({ width, height })
    await page.goto('/activate-account')
    await expect(page.getByRole('heading', { name: 'Activate your account' })).toBeVisible()
    const layout = await page.evaluate(() => {
      const back = document.querySelector('.activation-back-link')?.getBoundingClientRect()
      const seal = document.querySelector('.activation-header .brand-logo-image')?.getBoundingClientRect()
      return { pageWidth: document.documentElement.scrollWidth, cardTop: document.querySelector('.activation-card')?.getBoundingClientRect().top ?? -1, backLeft: back?.left ?? Infinity, sealRight: seal?.right ?? -Infinity, viewport: innerWidth }
    })
    expect(layout.pageWidth, `activation horizontal overflow at ${width}×${height}`).toBeLessThanOrEqual(width)
    expect(layout.cardTop, `activation card clipped at ${width}×${height}`).toBeGreaterThanOrEqual(0)
    expect(layout.backLeft, `activation back link is not left aligned at ${width}×${height}`).toBeLessThan(layout.sealRight)
    expect(layout.sealRight, `activation seal is clipped at ${width}×${height}`).toBeLessThanOrEqual(layout.viewport)
    await page.getByLabel('Full name').scrollIntoViewIfNeeded()
    await page.getByLabel('Full name').fill('Jordan Student')
    await page.getByLabel('Create password').fill('test-only-password')
    await page.getByLabel('Confirm password').fill('test-only-password')
    await page.getByRole('button', { name: 'Activate account' }).scrollIntoViewIfNeeded()
    await expect(page.getByRole('button', { name: 'Activate account' })).toBeVisible()
    await page.getByRole('button', { name: 'Activate account' }).click()
    await expect(page.getByRole('heading', { name: 'Details checked' })).toBeVisible()
  }
})

test('activation, profile setup, and password recovery controls remain reachable at all requested viewports', async ({ page }) => {
  const screens = [
    { path: '/activate-account', heading: 'Activate your account', controls: ['Invited email', 'Assigned role', 'Age', 'Full name', 'Contact number', 'Create password', 'Confirm password', 'Activate account'] },
    { path: '/profile-setup', heading: 'Set up your profile', controls: ['Display name', 'Save & continue', 'Skip for now'] },
    { path: '/forgot-password', heading: 'Forgot your password?', controls: ['Account email', 'Check recovery availability'] },
  ]
  for (const [width, height] of responsiveViewports) {
    await page.setViewportSize({ width, height })
    for (const screen of screens) {
      await page.goto(screen.path)
      await expect(page.getByRole('heading', { name: screen.heading })).toBeVisible()
      const layout = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, height: innerHeight, cardTop: document.querySelector('.auth-card')?.getBoundingClientRect().top ?? -1 }))
      expect(layout.width, `${screen.path} horizontal overflow at ${width}×${height}`).toBeLessThanOrEqual(width)
      expect(layout.cardTop, `${screen.path} top clipping at ${width}×${height}`).toBeGreaterThanOrEqual(0)
      for (const control of screen.controls) {
        const locator = control.includes('password') || control.includes('Password')
          ? page.getByLabel(control, { exact: true })
          : control === 'Activate account' || control === 'Save & continue' || control === 'Skip for now' || control === 'Check recovery availability'
            ? page.getByRole('button', { name: control, exact: true })
            : page.getByLabel(control, { exact: false })
        await locator.scrollIntoViewIfNeeded()
        const bounds = await locator.evaluate((element) => {
          const { top, bottom } = element.getBoundingClientRect()
          return { top, bottom, height: innerHeight }
        })
        expect(bounds.top, `${control} clipped above in ${screen.path} at ${width}×${height}`).toBeGreaterThanOrEqual(0)
        expect(bounds.bottom, `${control} clipped below in ${screen.path} at ${width}×${height}`).toBeLessThanOrEqual(bounds.height + 1)
      }
    }
  }
})

test('all role dashboards fit phone, landscape, tablet, and desktop layouts', async ({ page }) => {
  const dashboards = [
    ['/student/dashboard', 'STUDENT WORKSPACE'],
    ['/instructor/dashboard', 'INSTRUCTOR WORKSPACE'],
    ['/principal/dashboard', 'PRINCIPAL WORKSPACE'],
  ]
  for (const [width, height] of responsiveViewports) {
    await page.setViewportSize({ width, height })
    for (const [path, label] of dashboards) {
      await page.goto(path)
      await expect(page.getByText(label).first()).toBeVisible()
      const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }))
      expect(dimensions.scroll, `${path} horizontal overflow at ${width}×${height}`).toBeLessThanOrEqual(dimensions.client)
      await expect(page.locator('.workspace-notice')).toHaveCount(0)
      await expect(page.locator('.dashboard-footer')).toHaveCount(0)
      const tableOverflows = await page.locator('.people-table').evaluateAll((tables) => tables.some((table) => table.scrollWidth > table.clientWidth + 1))
      expect(tableOverflows, `${path} roster table content overflow at ${width}×${height}`).toBe(false)
      if (width <= 760) await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible()
    }
  }
})

test('user-facing screens avoid development labels while retaining factual limitations', async ({ page }) => {
  const paths = [
    '/', '/login', '/activate-account', '/forgot-password', '/profile-setup',
    '/student/dashboard', '/student/hardware', '/student/assembly', '/student/disassembly', '/student/assessments', '/student/progress',
    '/instructor/dashboard', '/instructor/classes', '/instructor/students', '/instructor/assessments', '/instructor/progress',
    '/principal/dashboard', '/principal/instructors', '/principal/classes', '/settings',
  ]
  const developmentCopy = /\b(?:demo|prototype|sample|mock|simulated|placeholder|fictional)\b|illustrative information|changes are not saved|profile changes are held|test invitation outcomes|invitation outcome|development-only|development preview|local role preview|example cases/i
  for (const path of paths) {
    await page.goto(path)
    const text = await page.locator('body').innerText()
    expect(text, `development label visible on ${path}`).not.toMatch(developmentCopy)
  }
  await page.goto('/forgot-password')
  await page.getByLabel('Account email').fill('test@movers.test')
  await page.getByRole('button', { name: 'Check recovery availability' }).click()
  await expect(page.getByRole('status')).toContainText('No message was sent')
})

test('all application routes load directly, survive refresh, and keep browser history navigation', async ({ page }) => {
  const routes = [
    ['/', applicationTitle], ['/login', 'Welcome Back'], ['/activate-account', 'Activate your account'], ['/forgot-password', 'Forgot your password?'], ['/profile-setup', 'Set up your profile'],
    ['/student/dashboard', 'Good morning, Alex.'], ['/student/hardware', 'Hardware Exploration'], ['/student/assembly', 'Guided Assembly'], ['/student/disassembly', 'Guided Disassembly'], ['/student/assessments', 'Assigned assessments'], ['/student/progress', 'My progress'],
    ['/instructor/dashboard', 'Good morning, Alex.'], ['/instructor/classes', 'My classes'], ['/instructor/students', 'Student list'], ['/instructor/assessments', 'Assign assessments'], ['/instructor/progress', 'Student progress'],
    ['/principal/dashboard', 'Welcome, Alex.'], ['/principal/instructors', 'Manage instructors'], ['/principal/classes', 'CSS class overview'], ['/settings', 'My Profile'],
  ]

  for (const [path, heading] of routes) {
    await page.goto(path)
    await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible()
    await page.reload()
    await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible()
  }

  await page.goto('/login')
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page).toHaveURL(/\/profile-setup$/)
  await page.getByRole('button', { name: 'Skip for now' }).click()
  await expect(page).toHaveURL(/\/student\/dashboard$/)
  await page.goBack()
  await expect(page).toHaveURL(/\/profile-setup$/)
  await page.goForward()
  await expect(page).toHaveURL(/\/student\/dashboard$/)
  await page.goto('/not-a-real-route')
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible()
})

test('profile text is rendered as text rather than executable markup', async ({ page }) => {
  const displayName = '<img src=x onerror=window.__unsafe=true>'
  await page.goto('/login')
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Skip for now' }).click()
  await page.getByRole('link', { name: 'Profile', exact: true }).click()
  await page.getByLabel('Display name').fill(displayName)
  await page.getByRole('button', { name: 'Save Changes' }).click()
  await expect(page.locator('.topbar-user-name')).toHaveText(displayName)
  await expect(page.locator('img[onerror]')).toHaveCount(0)
  expect(await page.evaluate(() => window.__unsafe)).toBeUndefined()
})

test('Hardware Exploration loads the manifest Computer Case GLB with the Three.js viewer', async ({ page }) => {
  const glbResponse = page.waitForResponse((response) => response.url().endsWith('/assets/hardware/optimized_glb/computer_case.glb'))
  await page.goto('/student/hardware')
  expect((await glbResponse).status()).toBe(200)
  await expect(page.locator('[data-learning-activity]')).toHaveAttribute('data-model-load-state', 'loaded', { timeout: 15_000 })
  await expect(page.locator('[data-hardware-canvas]')).toHaveAttribute('data-model-id', 'computer-case')
  await expect(page.locator('[data-hardware-canvas]')).toHaveAttribute('data-model-triangles', /\d+/)
  await expect(page.locator('[data-hardware-canvas]')).toHaveAttribute('data-model-meshes', /[1-9]\d*/)
  await expect(page.locator('[data-hardware-canvas]')).toHaveAttribute('data-model-materials', /[1-9]\d*/)
  const modelBounds = (await page.locator('[data-hardware-canvas]').getAttribute('data-model-bounds')).split(',').map(Number)
  expect(modelBounds).toHaveLength(3)
  expect(Math.max(...modelBounds), 'case-only bounds should exclude the stray standalone optical drive').toBeLessThanOrEqual(0.5)
  await expect(page.locator('html')).toHaveAttribute('data-three-revision', /^\d+$/)
  await expect(page.locator('html')).toHaveAttribute('data-three-foundation', 'GLTFLoader,OrbitControls')
})

test('three learning activities share the smartphone portrait gate and landscape workspace', async ({ page }) => {
  let glbRequests = 0
  page.on('request', (request) => {
    if (request.url().endsWith('.glb')) glbRequests += 1
  })
  for (const [path, heading] of [
    ['/student/hardware', 'Hardware Exploration'],
    ['/student/assembly', 'Guided Assembly'],
    ['/student/disassembly', 'Guided Disassembly'],
  ]) {
    await page.setViewportSize({ width: 320, height: 568 })
    await page.goto(path)
    for (const [width, height] of [[320, 568], [375, 667], [390, 844], [430, 932]]) {
      await page.setViewportSize({ width, height })
      const gate = page.locator('[data-rotate-gate]')
      await expect(page.getByRole('heading', { name: 'Rotate Your Phone' })).toBeVisible()
      await expect(page.getByText('Please rotate your phone to landscape to continue.')).toBeVisible()
      await expect(page.locator('[data-activity-workspace]')).toBeHidden()
      await expect(gate.locator(':scope > *')).toHaveCount(4)
      await expect(page.getByRole('link', { name: 'Back to Dashboard' })).toBeVisible()
      await expect(page.getByRole('button')).toHaveCount(0)
      const portraitLayout = await page.evaluate(() => ({
        width: innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        documentHeight: document.documentElement.scrollHeight,
        height: innerHeight,
      }))
      expect(portraitLayout.documentWidth).toBeLessThanOrEqual(portraitLayout.width + 1)
      expect(portraitLayout.documentHeight).toBeLessThanOrEqual(portraitLayout.height + 1)
      if (path === '/student/hardware') {
        await expect(page.locator('[data-hardware-canvas]')).toBeHidden()
        await expect(page.locator('[data-hardware-canvas]')).not.toHaveAttribute('data-renderer-active', 'true')
        await expect(page.locator('html')).not.toHaveAttribute('data-three-revision', /.+/)
        await expect(page.locator('[data-learning-activity]')).toHaveAttribute('data-orientation-state', 'portrait-prompt')
        expect(glbRequests).toBe(0)
      }
    }

    await page.setViewportSize({ width: 844, height: 390 })
    await expect(page.locator('[data-activity-workspace]')).toBeVisible()
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible()
    if (path === '/student/hardware') {
      await expect(page.locator('[data-learning-activity]')).toHaveAttribute('data-model-load-state', 'loaded', { timeout: 15_000 })
      expect(glbRequests).toBe(1)
    } else {
      await expect(page.getByRole('status').filter({ hasText: 'not interactive yet' })).toBeVisible()
      await expect(page.locator('.activity-topbar').getByRole('button', { name: 'Normal 3D' })).toBeDisabled()
      await expect(page.locator('[data-hardware-canvas]')).toHaveCount(0)
    }
  }
})

test('Hardware Exploration shows selected educational summaries and readable detail controls', async ({ page }) => {
  test.setTimeout(90_000)
  for (const component of hardwareComponents) {
    expect(component.name).toBeTruthy()
    expect(component.summary).toBeTruthy()
    expect(component.description).toBeTruthy()
    expect(component.purpose).toBeTruthy()
    expect(component.explanation).toBeTruthy()
    expect(component.features.length).toBeGreaterThan(0)
    expect(component.basicInfo.length).toBeGreaterThan(0)
  }
  expect(hardwareComponents.find(({ id }) => id === 'ssd')?.name).not.toBe(hardwareComponents.find(({ id }) => id === 'hdd')?.name)
  expect(hardwareComponents.find(({ id }) => id === 'optical-drive')?.basicInfo.join(' ')).toContain('Standalone')

  await page.setViewportSize({ width: 667, height: 375 })
  await page.goto('/student/hardware')
  const activity = page.locator('[data-learning-activity]')
  const summary = page.locator('[data-mobile-component-summary]')
  const details = page.locator('[data-component-information]')
  const canvas = page.locator('[data-hardware-canvas]')
  await expect(activity).toHaveAttribute('data-model-load-state', 'loaded', { timeout: 15_000 })
  await expect(summary).toBeVisible()
  await expect(summary.locator('[data-mobile-summary-title]')).toHaveText('Computer Case')
  await expect(summary.locator('[data-mobile-summary-description]')).toHaveText(hardwareComponents[0].summary)
  const backLink = page.locator('.activity-back-link')
  await expect(backLink).toHaveAttribute('aria-label', 'Back to Student Dashboard')
  await expect(backLink.locator('svg')).toHaveCount(1)
  await expect(backLink).toHaveText('')

  await page.getByRole('button', { name: 'View Details' }).click()
  await expect(details).toBeVisible()
  await expect(details.locator('[data-component-description]')).toHaveText(hardwareComponents[0].description)
  await expect(details.locator('[data-component-purpose]')).toHaveText(hardwareComponents[0].purpose)
  await expect(details.locator('[data-component-explanation]')).toHaveText(hardwareComponents[0].explanation)
  await expect(details.locator('[data-component-features] li')).toHaveCount(hardwareComponents[0].features.length)
  await expect(details.locator('[data-component-basic-info] li')).toHaveCount(hardwareComponents[0].basicInfo.length)
  await page.getByRole('button', { name: 'Close component details' }).click()
  await expect(details).toBeHidden()
  await expect(page.getByRole('button', { name: 'View Details' })).toHaveAttribute('aria-expanded', 'false')

  await page.getByRole('button', { name: 'Components' }).click()
  await expect(page.locator('[data-component-library]')).toBeVisible()
  await page.locator('[data-component-id="motherboard"]').click()
  await expect(activity).toHaveAttribute('data-model-load-state', 'loaded', { timeout: 15_000 })
  await expect(canvas).toHaveAttribute('data-model-id', 'motherboard')
  await expect(page.locator('[data-component-library]')).toBeHidden()
  await expect(summary.locator('[data-mobile-summary-title]')).toHaveText('Motherboard')
  await expect(summary.locator('[data-mobile-summary-description]')).toHaveText(hardwareComponents[1].summary)
  await page.getByRole('button', { name: 'View Details' }).click()
  await expect(details.locator('[data-component-purpose]')).toHaveText(hardwareComponents[1].purpose)
  await expect(details.locator('[data-component-basic-info]')).toContainText('LGA1700-style CPU socket model')
  await page.getByRole('button', { name: 'Close component details' }).click()

  await page.getByRole('button', { name: 'Components' }).click()
  await page.locator('[data-component-id="ram"]').click()
  await expect(activity).toHaveAttribute('data-model-load-state', 'loaded', { timeout: 15_000 })
  await expect(canvas).toHaveAttribute('data-model-id', 'ram')
  await expect(summary.locator('[data-mobile-summary-title]')).toHaveText('Memory (RAM)')
  await expect(summary.locator('[data-mobile-summary-description]')).toHaveText(hardwareComponents[4].summary)
  await expect(page.getByRole('button', { name: 'Components' })).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByRole('button', { name: 'View Details' })).toHaveAttribute('aria-expanded', 'false')

  await page.getByRole('button', { name: 'VR View' }).click()
  await expect(page.locator('[data-viewer-stage]')).toHaveAttribute('data-render-mode', 'stereo')
  await expect(canvas).toHaveAttribute('data-model-id', 'ram')
  await expect(summary).toBeHidden()
  await expect(details).toBeHidden()
  await expect(page.locator('[data-component-library]')).toBeHidden()
  await expect(page.getByRole('button', { name: 'Components' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'View Details' })).toHaveCount(0)
  const stage = await page.locator('[data-viewer-stage]').boundingBox()
  expect(stage?.width).toBeGreaterThan(630)

  await page.getByRole('button', { name: 'Exit VR View and return to Normal 3D' }).click()
  await expect(page.locator('[data-viewer-stage]')).toHaveAttribute('data-render-mode', 'normal')
  await expect(canvas).toHaveAttribute('data-model-id', 'ram')
  await expect(summary.locator('[data-mobile-summary-title]')).toHaveText('Memory (RAM)')
  await expect(summary.locator('[data-mobile-summary-description]')).toHaveText(hardwareComponents[4].summary)

  await page.setViewportSize({ width: 1440, height: 900 })
  await expect(summary).toBeHidden()
  await expect(details).toBeVisible()
})

test('portrait pauses the viewer and landscape resumes the selected component and VR mode without reloading', async ({ page }) => {
  test.setTimeout(90_000)
  const glbRequests = new Map()
  let documentRequests = 0
  page.on('request', (request) => {
    if (request.resourceType() === 'document') documentRequests += 1
    if (request.url().endsWith('.glb')) {
      const filename = request.url().split('/').pop()
      glbRequests.set(filename, (glbRequests.get(filename) || 0) + 1)
    }
  })
  await page.setViewportSize({ width: 844, height: 390 })
  await page.goto('/student/hardware')
  await expect(page.locator('[data-learning-activity]')).toHaveAttribute('data-model-load-state', 'loaded', { timeout: 15_000 })
  await page.getByRole('button', { name: 'Components' }).click()
  await page.locator('[data-component-id="cpu"]').click()
  await expect(page.locator('[data-learning-activity]')).toHaveAttribute('data-selected-component', 'cpu')
  await expect(page.locator('[data-component-title]')).toHaveText('Processor (CPU)')
  await expect(page.locator('[data-learning-activity]')).toHaveAttribute('data-model-load-state', 'loaded', { timeout: 15_000 })
  await expect(page.locator('[data-hardware-canvas]')).toHaveAttribute('data-model-id', 'cpu')
  await expect(page.locator('[data-component-explanation]')).toContainText('fetches, interprets, and executes')
  await expect(page.getByRole('button', { name: 'VR View' })).toBeEnabled()
  await page.getByRole('button', { name: 'VR View' }).click()
  await expect(page.locator('[data-viewer-stage]')).toHaveAttribute('data-render-mode', 'stereo')
  await expect(page.locator('[data-hardware-canvas]')).toHaveAttribute('data-renderer-active', 'true')

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByRole('heading', { name: 'Rotate Your Phone' })).toBeVisible()
  await expect(page.locator('[data-activity-workspace]')).toBeHidden()
  await expect(page.locator('[data-hardware-canvas]')).toHaveAttribute('data-renderer-active', 'false')
  await expect(page.getByRole('button', { name: /VR View/ })).toHaveCount(0)
  await expect(page.locator('[data-learning-activity]')).toHaveAttribute('data-selected-component', 'cpu')
  await expect(page.locator('[data-viewer-stage]')).toHaveAttribute('data-render-mode', 'stereo')
  await page.setViewportSize({ width: 375, height: 667 })
  await expect(page.locator('[data-activity-workspace]')).toBeHidden()
  await expect(page.locator('[data-hardware-canvas]')).toHaveAttribute('data-renderer-active', 'false')
  await page.setViewportSize({ width: 874, height: 402 })
  await expect(page.locator('[data-activity-workspace]')).toBeVisible()
  await expect(page.locator('[data-viewer-stage]')).toHaveAttribute('data-render-mode', 'stereo')
  await expect(page.locator('[data-hardware-canvas]')).toHaveAttribute('data-renderer-active', 'true')
  await expect(page.getByRole('button', { name: 'Components' })).toHaveCount(0)
  await expect(page.locator('[data-component-information]')).toBeHidden()
  await expect(page.locator('[data-mobile-component-summary]')).toBeHidden()
  await expect(page.locator('[data-learning-activity]')).toHaveAttribute('data-selected-component', 'cpu')
  await expect(page.locator('[data-hardware-canvas]')).toHaveAttribute('data-model-id', 'cpu')
  await page.getByRole('button', { name: 'Normal 3D', exact: true }).click()
  await expect(page.locator('[data-viewer-stage]')).toHaveAttribute('data-render-mode', 'normal')
  await page.getByRole('button', { name: 'Components' }).click()
  await expect(page.locator('[data-component-title]')).toHaveText('Processor (CPU)')
  await expect(page.locator('[data-component-id="cpu"]')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('[data-hardware-canvas]')).toHaveAttribute('data-model-id', 'cpu')
  await expect(page.locator('[data-viewer-stage]')).toHaveAttribute('data-render-mode', 'normal')
  expect(glbRequests.get('cpu.glb')).toBe(1)
  expect(documentRequests).toBe(1)
})

test('Normal 3D supports orbit, zoom, and reset without horizontal overflow across target sizes', async ({ page }) => {
  test.setTimeout(90_000)
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/student/hardware')
  const canvas = page.locator('[data-hardware-canvas]')
  await expect(page.locator('[data-learning-activity]')).toHaveAttribute('data-model-load-state', 'loaded', { timeout: 15_000 })
  await page.waitForTimeout(350)
  const initialPosition = await canvas.getAttribute('data-camera-position')
  const initialRevision = Number(await canvas.getAttribute('data-camera-revision'))
  const bounds = await canvas.boundingBox()
  expect(bounds?.width).toBeGreaterThan(100)

  await page.mouse.move(bounds.x + bounds.width * 0.42, bounds.y + bounds.height * 0.48)
  await page.mouse.down()
  await page.mouse.move(bounds.x + bounds.width * 0.62, bounds.y + bounds.height * 0.58, { steps: 5 })
  await page.mouse.up()
  await expect.poll(async () => Number(await canvas.getAttribute('data-camera-revision'))).toBeGreaterThan(initialRevision)
  await page.mouse.wheel(0, -320)
  await expect.poll(async () => await canvas.getAttribute('data-camera-position')).not.toBe(initialPosition)
  await page.getByRole('button', { name: 'Reset 3D view' }).click()
  await expect.poll(async () => await canvas.getAttribute('data-camera-position')).toBe(initialPosition)

  for (const [width, height] of responsiveViewports) {
    await page.setViewportSize({ width, height })
    const portraitPhone = width < height && Math.min(width, height) <= 600 && Math.max(width, height) <= 1100
    await expect(page.locator('[data-learning-activity]')).toHaveAttribute('data-orientation-state', portraitPhone ? 'portrait-prompt' : 'workspace')
    await expect(page.locator('[data-viewer-stage]')).toHaveAttribute('data-render-mode', 'normal')
    const dimensions = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }))
    expect(dimensions.document, `${width}x${height} document width`).toBeLessThanOrEqual(dimensions.viewport + 1)
    if (width > height || Math.min(width, height) > 600) {
      await expect(canvas).toBeVisible()
      const stage = await page.locator('[data-viewer-stage]').boundingBox()
      expect(stage?.width).toBeGreaterThan(100)
      expect(stage?.height).toBeGreaterThan(80)
      const controls = await page.locator('.activity-topbar button').evaluateAll((elements) => elements.map((element) => {
        const { x, y, right, bottom } = element.getBoundingClientRect()
        return { x, y, right, bottom }
      }))
      for (const control of controls) {
        expect(control.x, `${width}x${height} control left`).toBeGreaterThanOrEqual(0)
        expect(control.right, `${width}x${height} control right`).toBeLessThanOrEqual(width + 1)
        expect(control.y, `${width}x${height} control top`).toBeGreaterThanOrEqual(0)
        expect(control.bottom, `${width}x${height} control bottom`).toBeLessThanOrEqual(height + 1)
      }
    } else {
      await expect(page.getByRole('heading', { name: 'Rotate Your Phone' })).toBeVisible()
    }
  }
})

test('all 11 manifest GLBs load, frame, rotate, zoom, reset, and render in stereo', async ({ page }) => {
  test.setTimeout(240_000)
  const modelAssets = [
    ['computer-case', 'computer_case.glb'],
    ['motherboard', 'motherboard.glb'],
    ['cpu', 'cpu.glb'],
    ['cpu-cooler', 'cpu_cooler.glb'],
    ['ram', 'ram.glb'],
    ['gpu', 'gpu.glb'],
    ['ssd', 'ssd.glb'],
    ['hdd', 'hdd.glb'],
    ['psu', 'psu.glb'],
    ['case-fans', 'case_fans.glb'],
    ['optical-drive', 'optical_drive.glb'],
  ]
  const manifest = JSON.parse(readFileSync('blender_assets/optimized_glb/component_manifest_optimized.json', 'utf8'))
  const manifestFiles = [...new Set(Object.values(manifest.components).flatMap((component) => component.source_files))].sort()
  expect(modelAssets.map(([, filename]) => filename).sort()).toEqual(manifestFiles)

  const output = 'artifacts/css-3d-02b/after/hardware-models'
  mkdirSync(output, { recursive: true })
  const responses = new Map()
  page.on('response', (response) => {
    const filename = response.url().split('/').pop()
    if (filename.endsWith('.glb')) responses.set(filename, response.status())
  })
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/student/hardware')
  const canvas = page.locator('[data-hardware-canvas]')
  const stage = page.locator('[data-viewer-stage]')
  const stats = []

  for (const [index, [id, filename]] of modelAssets.entries()) {
    if (index > 0) await page.locator(`[data-component-id="${id}"]`).click()
    await expect(page.locator('[data-learning-activity]')).toHaveAttribute('data-selected-component', id)
    await expect(page.locator('[data-learning-activity]')).toHaveAttribute('data-model-load-state', 'loaded', { timeout: 15_000 })
    await expect(canvas).toHaveAttribute('data-model-id', id)
    await expect(canvas).toHaveAttribute('data-model-meshes', /[1-9]\d*/)
    await expect(canvas).toHaveAttribute('data-model-triangles', /[1-9]\d*/)
    await expect(canvas).toHaveAttribute('data-model-materials', /[1-9]\d*/)
    await expect(canvas).toHaveAttribute('data-render-calls', /[1-9]\d*/)
    await expect(canvas).toHaveAttribute('data-rendered-triangles', /[1-9]\d*/)
    await expect(canvas).toHaveCount(1)
    expect(responses.get(filename), `${filename} response`).toBe(200)

    const measurements = await canvas.evaluate((element) => ({
      meshes: Number(element.dataset.modelMeshes),
      triangles: Number(element.dataset.modelTriangles),
      materials: Number(element.dataset.modelMaterials),
      bounds: element.dataset.modelBounds.split(',').map(Number),
      radius: Number(element.dataset.modelRadius),
      distance: Number(element.dataset.framedDistance),
      renderCalls: Number(element.dataset.renderCalls),
      renderedTriangles: Number(element.dataset.renderedTriangles),
      filteredNodes: Number(element.dataset.filteredNodeCount || 0),
      correctedMaterials: element.dataset.correctedMaterialNames || '',
    }))
    expect(measurements.bounds.every((dimension) => Number.isFinite(dimension) && dimension > 0), `${id} bounds`).toBe(true)
    expect(measurements.distance, `${id} camera distance`).toBeGreaterThan(measurements.radius)
    const sourceBytes = statSync(`public/assets/hardware/optimized_glb/${filename}`).size

    const initialPosition = await canvas.getAttribute('data-camera-position')
    const initialRevision = Number(await canvas.getAttribute('data-camera-revision'))
    const bounds = await canvas.boundingBox()
    await page.mouse.move(bounds.x + bounds.width * 0.42, bounds.y + bounds.height * 0.48)
    await page.mouse.down()
    await page.mouse.move(bounds.x + bounds.width * 0.62, bounds.y + bounds.height * 0.58, { steps: 4 })
    await page.mouse.up()
    await expect.poll(async () => Number(await canvas.getAttribute('data-camera-revision'))).toBeGreaterThan(initialRevision)
    await page.mouse.wheel(0, -140)
    await expect.poll(async () => canvas.getAttribute('data-camera-position')).not.toBe(initialPosition)
    await page.getByRole('button', { name: 'Reset 3D view' }).click()
    await expect.poll(async () => canvas.getAttribute('data-camera-position')).toBe(initialPosition)
    await page.screenshot({ path: `${output}/${id}-normal.png` })

    const requestCountBeforeStereo = responses.get(filename)
    await page.getByRole('button', { name: 'VR View' }).click()
    await expect(stage).toHaveAttribute('data-render-mode', 'stereo')
    await expect(canvas).toHaveAttribute('data-model-id', id)
    await expect(canvas).toHaveAttribute('data-stereo-views', 'left,right')
    await expect(canvas).toHaveAttribute('data-stereo-eye-separation', /^(?!0\.00000)\d+\.\d+$/)
    await expect(canvas).toHaveAttribute('data-stereo-projection-offset', /^(?!0\.000000)\d+\.\d+$/)
    await expect(canvas).toHaveAttribute('data-rendered-triangles', /[1-9]\d*/)
    await page.screenshot({ path: `${output}/${id}-stereo.png` })
    const stereoRenderedTriangles = Number(await canvas.getAttribute('data-rendered-triangles'))
    await page.getByRole('button', { name: 'Exit VR View and return to Normal 3D' }).click()
    await expect(stage).toHaveAttribute('data-render-mode', 'normal')
    await expect(canvas).toHaveAttribute('data-model-id', id)
    expect(responses.get(filename)).toBe(requestCountBeforeStereo)

    stats.push({ id, file: filename, bytes: sourceBytes, ...measurements, stereoRenderedTriangles })
  }

  writeFileSync(`${output}/renderer-stats.json`, JSON.stringify(stats, null, 2))
})

test('mobile landscape uses compact drawers and retains the model through VR mode changes', async ({ page }) => {
  await page.setViewportSize({ width: 667, height: 375 })
  await page.goto('/student/hardware')
  const canvas = page.locator('[data-hardware-canvas]')
  await expect(page.locator('[data-learning-activity]')).toHaveAttribute('data-model-load-state', 'loaded', { timeout: 15_000 })
  await expect(page.locator('[data-component-library]')).toBeHidden()
  await expect(page.locator('[data-component-information]')).toBeHidden()
  await page.getByRole('button', { name: 'Components' }).click()
  await expect(page.locator('[data-component-library]')).toBeVisible()
  await page.locator('[data-component-id="gpu"]').click()
  await expect(page.locator('[data-learning-activity]')).toHaveAttribute('data-model-load-state', 'loaded', { timeout: 15_000 })
  await expect(canvas).toHaveAttribute('data-model-id', 'gpu')
  await expect(page.locator('[data-component-library]')).toBeHidden()
  await page.getByRole('button', { name: 'View Details' }).click()
  await expect(page.locator('[data-component-information]')).toBeVisible()
  await expect(page.locator('[data-component-explanation]')).toContainText('graphics processor')
  const stageBefore = await page.locator('[data-viewer-stage]').boundingBox()
  await page.getByRole('button', { name: 'VR View' }).click()
  await expect(page.locator('[data-viewer-stage]')).toHaveAttribute('data-render-mode', 'stereo')
  await expect(canvas).toHaveAttribute('data-model-id', 'gpu')
  await expect(canvas).toHaveAttribute('data-stereo-views', 'left,right')
  const stageDuring = await page.locator('[data-viewer-stage]').boundingBox()
  expect(stageBefore?.width).toBeGreaterThan(300)
  expect(stageDuring?.width).toBeGreaterThanOrEqual(stageBefore?.width)
  const dimensions = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }))
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport + 1)
  await page.getByRole('button', { name: 'Exit VR View and return to Normal 3D' }).click()
  await expect(canvas).toHaveAttribute('data-model-id', 'gpu')
  await expect(page).toHaveURL(/\/student\/hardware$/)
})

test('Computer Case VR part definitions map only to confirmed named GLB mesh nodes', async () => {
  const gltf = readGlbJson('public/assets/hardware/optimized_glb/computer_case.glb')
  const caseMeshes = gltf.nodes.filter((node) => node.mesh !== undefined && node.name.startsWith('CASE_'))
  const unmatched = caseMeshes.filter((node) => !caseVrPartForNodeName(node.name)).map((node) => node.name)
  const mappedCounts = new Map(caseVrParts.map((part) => [part.id, 0]))
  for (const node of caseMeshes) {
    const part = caseVrPartForNodeName(node.name)
    if (part) mappedCounts.set(part.id, mappedCounts.get(part.id) + 1)
  }
  expect(caseMeshes).toHaveLength(99)
  expect(unmatched).toEqual([])
  expect([...mappedCounts.values()].every((count) => count > 0)).toBe(true)
  expect(caseVrPartForNodeName('CASE_TempFanVis_01_Blade_01.001')?.id).toBe('front-intake-fans')
  expect(caseVrPartForNodeName('CASE_MotherboardTray.001')?.id).toBe('motherboard-tray')
  expect(gltf.nodes.filter((node) => node.name.startsWith('CASE_MOUNT_')).every((node) => node.mesh === undefined)).toBe(true)
  expect(gltf.nodes.filter((node) => node.name.startsWith('OPTICAL_')).every((node) => !caseVrPartForNodeName(node.name))).toBe(true)
  expect(caseVrPartForNodeName('Cube.001')).toBeNull()
})

test('desktop VR mouse picking raycasts an actual Computer Case mesh in the right eye', async ({ page }) => {
  test.setTimeout(90_000)
  const output = 'artifacts/css-3d-02e/after/hardware-vr'
  mkdirSync(output, { recursive: true })
  let modelRequests = 0
  page.on('request', (request) => {
    if (request.url().endsWith('/assets/hardware/optimized_glb/computer_case.glb')) modelRequests += 1
  })
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/student/hardware')
  const canvas = page.locator('[data-hardware-canvas]')
  const stage = page.locator('[data-viewer-stage]')
  const details = page.locator('[data-vr-part-details]')
  await expect(page.locator('[data-learning-activity]')).toHaveAttribute('data-model-load-state', 'loaded', { timeout: 30_000 })
  await page.getByRole('button', { name: 'VR View' }).click()
  await expect(stage).toHaveAttribute('data-render-mode', 'stereo')
  await expect(page.locator('[data-activity-heading]')).toHaveText('Computer Case')
  await expect(details).toBeHidden()

  const initialCameraPosition = await canvas.getAttribute('data-camera-position')
  const initialCameraRevision = await canvas.getAttribute('data-camera-revision')
  const bounds = { x: 1, y: 59, width: 1438, height: 840 }
  const dragStartX = bounds.x + bounds.width * 0.28
  const dragStartY = bounds.y + bounds.height * 0.57
  await page.mouse.move(dragStartX, dragStartY)
  await page.mouse.down()
  await page.mouse.move(dragStartX + 20, dragStartY + 14, { steps: 3 })
  await page.mouse.up()
  await expect(details).toBeHidden()
  await expect(canvas).toHaveAttribute('data-camera-position', initialCameraPosition)
  await expect(canvas).toHaveAttribute('data-camera-revision', initialCameraRevision)

  const rightPick = await pickMappedCasePartInEye(page, 'right', { targetId: 'front-intake-fans', canvasBounds: bounds })
  expect(rightPick.id).toBe('front-intake-fans')
  expect(rightPick.eye).toBe('right')
  expect(rightPick.meshName).toMatch(/^CASE_TempFanVis_0[1-3]_/)
  expect(rightPick.highlightedMeshCount).toBeGreaterThan(0)
  expect(modelRequests).toBe(1)
})

test('mobile VR accepts real touch taps and remains readable across target landscape sizes', async ({ browser, baseURL }) => {
  test.setTimeout(120_000)
  const output = 'artifacts/css-3d-02e/after/hardware-vr'
  mkdirSync(output, { recursive: true })
  const context = await browser.newContext({ baseURL, viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true })
  try {
    const page = await context.newPage()
    let modelRequests = 0
    page.on('request', (request) => {
      if (request.url().endsWith('/assets/hardware/optimized_glb/computer_case.glb')) modelRequests += 1
    })
    await page.goto('/student/hardware')
    const canvas = page.locator('[data-hardware-canvas]')
    const stage = page.locator('[data-viewer-stage]')
    const details = page.locator('[data-vr-part-details]')
    await expect(page.locator('[data-learning-activity]')).toHaveAttribute('data-model-load-state', 'loaded', { timeout: 30_000 })
    await page.getByRole('button', { name: 'VR View' }).click()
    await expect(stage).toHaveAttribute('data-render-mode', 'stereo')
    const partPick = await pickMappedCasePartInEye(page, 'left', { targetId: 'front-intake-fans', touch: true })
    expect(partPick.meshName).toMatch(/^CASE_TempFanVis_0[1-3]_/)
    await expect(canvas).toHaveAttribute('data-last-case-part-eye', 'left')
    await expect(page.locator('.vr-part-eye-right [data-vr-part-name]')).toHaveText('Front Intake Fans')

    for (const [width, height] of [[667, 375], [844, 390], [874, 402], [932, 430]]) {
      await page.setViewportSize({ width, height })
      const geometry = await page.evaluate(() => {
        const canvasElement = document.querySelector('[data-hardware-canvas]')
        const stageElement = document.querySelector('[data-viewer-stage]')
        const button = document.querySelector('.activity-mode-switch [data-activity-action="mode-vr"]')
        const canvasRect = canvasElement.getBoundingClientRect()
        const stageRect = stageElement.getBoundingClientRect()
        const buttonRect = button.getBoundingClientRect()
        return {
          viewportWidth: innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          canvasWidth: canvasRect.width,
          stageTop: stageRect.top,
          stageBottom: stageRect.bottom,
          buttonBottom: buttonRect.bottom,
        }
      })
      const leftEyeWidth = Math.floor(geometry.canvasWidth / 2)
      const rightEyeWidth = geometry.canvasWidth - leftEyeWidth
      expect(Math.abs(leftEyeWidth - rightEyeWidth), `${width}x${height} eye widths`).toBeLessThanOrEqual(1)
      expect(geometry.documentWidth, `${width}x${height} horizontal overflow`).toBeLessThanOrEqual(geometry.viewportWidth + 1)
      expect(geometry.stageTop, `${width}x${height} stage should clear the Exit VR topbar`).toBeGreaterThanOrEqual(geometry.buttonBottom)
      const rightCard = await page.locator('.vr-part-eye-right .vr-part-card').boundingBox()
      const stageBox = await stage.boundingBox()
      expect(rightCard.x).toBeGreaterThanOrEqual(stageBox.x)
      expect(rightCard.y).toBeGreaterThanOrEqual(stageBox.y)
      expect(rightCard.x + rightCard.width).toBeLessThanOrEqual(stageBox.x + stageBox.width)
      expect(rightCard.y + rightCard.height).toBeLessThanOrEqual(stageBox.y + stageBox.height)
      await expect(details).toBeVisible()
      await expect(page.locator('.vr-part-eye-right [data-vr-part-function]')).toContainText('draw air into the case')
      if (width === 844) await page.screenshot({ path: `${output}/mobile-landscape-vr-front-fan-selected.png` })
    }

    await page.setViewportSize({ width: 390, height: 844 })
    await expect(page.getByRole('heading', { name: 'Rotate Your Phone' })).toBeVisible()
    await expect(page.locator('[data-activity-workspace]')).toBeHidden()
    await expect(details).toBeHidden()
    await page.setViewportSize({ width: 932, height: 430 })
    await expect(stage).toHaveAttribute('data-render-mode', 'stereo')
    await expect(details).toBeVisible()
    await expect(page.locator('[data-learning-activity]')).toHaveAttribute('data-selected-component', 'computer-case')
    await expect(canvas).toHaveAttribute('data-model-id', 'computer-case')
    expect(modelRequests).toBe(1)
    await page.getByRole('button', { name: 'Close selected part details' }).click()
    await expect(details).toBeHidden()
  } finally {
    await context.close()
  }
})

test('VR View renders distinct stereo eyes with lens masking, stays stationary, and exits without reloading', async ({ page }) => {
  let modelRequests = 0
  page.on('request', (request) => {
    if (request.url().endsWith('/assets/hardware/optimized_glb/computer_case.glb')) modelRequests += 1
  })
  await page.setViewportSize({ width: 844, height: 390 })
  await page.goto('/student/hardware')
  const canvas = page.locator('[data-hardware-canvas]')
  const stage = page.locator('[data-viewer-stage]')
  await expect(page.locator('[data-learning-activity]')).toHaveAttribute('data-model-load-state', 'loaded', { timeout: 15_000 })
  await page.getByRole('button', { name: 'VR View' }).click()
  await expect(stage).toHaveAttribute('data-render-mode', 'stereo')
  await expect(canvas).toHaveAttribute('data-stereo-views', 'left,right')
  await expect(canvas).toHaveAttribute('data-stereo-eye-separation', /^(?!0\.0000)\d+\.\d+$/)
  await expect(canvas).toHaveAttribute('data-stereo-projection-offset', /^(?!0\.000000)\d+\.\d+$/)
  await expect(stage).toHaveClass(/is-vr-view/)
  await expect(page.getByText('VR View is a stationary stereoscopic preview. Phone movement does not move the camera.')).toHaveCount(0)
  await expect(page.locator('[data-viewer-mode-note]')).toHaveCount(0)
  await expect(page.locator('.viewer-toolbar')).toBeHidden()
  await expect(page.locator('.viewer-caption')).toBeHidden()
  await expect(page.locator('[data-vr-part-details]')).toBeHidden()
  await expect(page.locator('[data-activity-heading]')).toHaveText('Computer Case')
  await expect(page.locator('[data-hardware-canvas]')).toHaveCount(1)

  await page.waitForTimeout(300)
  const stationaryPosition = await canvas.getAttribute('data-camera-position')
  const stationaryRevision = await canvas.getAttribute('data-camera-revision')
  await page.waitForTimeout(350)
  await expect(canvas).toHaveAttribute('data-camera-position', stationaryPosition)
  await expect(canvas).toHaveAttribute('data-camera-revision', stationaryRevision)

  await page.getByRole('button', { name: 'Exit VR View and return to Normal 3D' }).click()
  await expect(stage).toHaveAttribute('data-render-mode', 'normal')
  await expect(page.getByRole('button', { name: 'Normal 3D' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('[data-activity-heading]')).toHaveText('Hardware Exploration')
  await expect(page.locator('[data-learning-activity]')).toHaveAttribute('data-selected-component', 'computer-case')
  await expect(page.locator('[data-learning-activity]')).toHaveAttribute('data-model-load-state', 'loaded', { timeout: 15_000 })
  expect(modelRequests).toBe(1)
})

test('activity orientation and camera implementation do not use motion sensor APIs', async () => {
  const source = [
    readFileSync('src/activities/activity-controller.js', 'utf8'),
    readFileSync('src/three/viewer.js', 'utf8'),
  ].join('\n')
  expect(source).not.toMatch(/DeviceOrientationEvent|DeviceMotionEvent|deviceorientation|devicemotion|requestDeviceOrientation/i)
  expect(source).not.toMatch(/screen\.orientation|orientation\.lock/i)
})

test('capture CSS-3D-02D educational-information and mobile UX screenshots', async ({ page }) => {
  test.setTimeout(90_000)
  const output = 'artifacts/css-3d-02d/after/hardware-exploration'
  mkdirSync(output, { recursive: true })
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/student/hardware')
  await expect(page.locator('[data-learning-activity]')).toHaveAttribute('data-model-load-state', 'loaded', { timeout: 15_000 })
  await page.screenshot({ path: `${output}/desktop.png` })

  await page.setViewportSize({ width: 667, height: 375 })
  await expect(page.locator('[data-activity-workspace]')).toBeVisible()
  await expect(page.locator('[data-learning-activity]')).toHaveAttribute('data-model-load-state', 'loaded', { timeout: 15_000 })
  await expect(page.locator('[data-mobile-component-summary]')).toBeVisible()
  await page.screenshot({ path: `${output}/mobile-landscape.png` })
  await page.screenshot({ path: `${output}/normal-3d-with-description.png` })
  await page.getByRole('button', { name: 'Components' }).click()
  await expect(page.locator('[data-component-library]')).toBeVisible()
  await page.screenshot({ path: `${output}/components-drawer.png` })
  await page.locator('[data-activity-action="dismiss-mobile-drawers"]').click({ force: true })
  await page.getByRole('button', { name: 'View Details' }).click()
  await expect(page.locator('[data-component-information]')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Close component details' })).toBeVisible()
  await page.screenshot({ path: `${output}/full-component-details.png` })
  await page.getByRole('button', { name: 'Close component details' }).click()

  for (const [id, filename] of [['cpu', 'cpu-details.png'], ['motherboard', 'motherboard-details.png'], ['ram', 'ram-details.png']]) {
    await page.getByRole('button', { name: 'Components' }).click()
    await page.locator(`[data-component-id="${id}"]`).click()
    await expect(page.locator('[data-hardware-canvas]')).toHaveAttribute('data-model-id', id)
    await expect(page.locator('[data-mobile-summary-title]')).toBeVisible()
    await page.getByRole('button', { name: 'View Details' }).click()
    await expect(page.locator('[data-component-information]')).toBeVisible()
    await page.screenshot({ path: `${output}/${filename}` })
    await page.getByRole('button', { name: 'Close component details' }).click()
  }

  await page.setViewportSize({ width: 844, height: 390 })
  await expect(page.locator('[data-mobile-component-summary]')).toBeVisible()
  await page.screenshot({ path: `${output}/normal-3d-with-description-844x390.png` })
  await page.getByRole('button', { name: 'VR View' }).click()
  await expect(page.locator('[data-viewer-stage]')).toHaveAttribute('data-render-mode', 'stereo')
  await expect(page.locator('[data-component-information]')).toBeHidden()
  await expect(page.locator('[data-component-library]')).toBeHidden()
  await page.screenshot({ path: `${output}/vr-view.png` })
})

test('capture CSS-ARCH-01 migration screenshots', async ({ page }) => {
  const output = 'artifacts/css-arch-01/after'
  mkdirSync(output, { recursive: true })
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/activate-account')
  await page.screenshot({ path: `${output}/invitation-activation-desktop-1440x900.png`, fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/activate-account')
  await page.screenshot({ path: `${output}/invitation-activation-mobile-390x844.png`, fullPage: true })

  await page.setViewportSize({ width: 1440, height: 900 })
  await signInAs(page, 'Student')
  await page.getByRole('link', { name: 'Profile', exact: true }).click()
  await expect(page).toHaveURL(/\/settings$/)
  await expect(page.getByRole('heading', { name: 'My Profile' })).toBeVisible()
  await page.screenshot({ path: `${output}/profile-settings-desktop-1440x900.png`, fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: `${output}/profile-settings-mobile-390x844.png`, fullPage: true })

  await page.setViewportSize({ width: 1440, height: 900 })
  await signInAs(page, 'Student')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: `${output}/student-dashboard-mobile-390x844.png`, fullPage: true })
  await page.setViewportSize({ width: 1440, height: 900 })
  await signInAs(page, 'Instructor')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: `${output}/instructor-dashboard-mobile-390x844.png`, fullPage: true })
  await page.setViewportSize({ width: 1440, height: 900 })
  await signInAs(page, 'Principal')
  await expect(page.getByRole('heading', { name: 'Welcome, Taylor.' })).toBeVisible()
  await page.screenshot({ path: `${output}/principal-dashboard-desktop-1440x900.png`, fullPage: true })
})
