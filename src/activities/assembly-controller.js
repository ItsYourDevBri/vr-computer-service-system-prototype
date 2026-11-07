import { createGuidedSequence } from './guided-sequence.js'

function viewportSize() {
  return {
    width: window.visualViewport?.width ?? window.innerWidth,
    height: window.visualViewport?.height ?? window.innerHeight,
  }
}

function isPhoneViewport() {
  const { width, height } = viewportSize()
  return Math.min(width, height) <= 600 && Math.max(width, height) <= 1100
}

function isPortraitGateActive() {
  const { width, height } = viewportSize()
  return isPhoneViewport() && width <= height
}

const ASSEMBLY_TRANSITIONS = Object.freeze(['case-panel', 'motherboard-fit-preview'])
const DISASSEMBLY_TRANSITIONS = Object.freeze(['case-panel'])

function assemblyStep(cursor, barrierMm) {
  if (cursor === 0) return {
    number: 1,
    title: 'Prepare the computer case',
    instruction: 'Remove the tempered-glass side panel to expose the motherboard mounting area.',
    alignmentTitle: 'Case access',
    alignmentDescription: 'The removable glass panel is a verified part of the case model.',
    componentName: 'Tempered-glass side panel',
    componentFunction: 'The panel opens the case for inspection and service access.',
    state: 'READY',
    feedback: 'Select Next Step to animate the glass panel out of its installed position.',
  }
  if (cursor === 1) return {
    number: 2,
    title: 'Check the motherboard fit',
    instruction: 'Preview the motherboard approach. The supplied board and case transforms do not establish a valid installation; this is an exploded fit demonstration, not an installation.',
    alignmentTitle: 'Exploded fit preview',
    alignmentDescription: 'The solid tray and mismatched mounts/rear I/O prevent a validated installed pose. No motherboard installation is recorded.',
    componentName: 'ATX motherboard',
    componentFunction: 'The board holds the CPU, memory, expansion slots, and connectors. This scene only previews the unresolved fit.',
    state: 'FIT CHECK',
    feedback: 'The motherboard is staged outside the case. Next Step animates it only to the measured tray barrier.',
  }
  return {
    number: 2,
    title: 'Motherboard fit blocked',
    instruction: 'The preview stopped about ' + (Number.isFinite(barrierMm) ? `${barrierMm.toFixed(1)} mm` : 'before the tray') + ' short of the authored position. The source models need correction before an installation lesson can be shown.',
    alignmentTitle: 'Preview only · not installed',
    alignmentDescription: 'The source geometry has additional mounting and rear I/O conflicts. The board remains uninstalled.',
    componentName: 'ATX motherboard',
    componentFunction: 'The fit demonstration stops before the authored target; it is not a completed installation lesson.',
    state: 'FIT BLOCKED',
    feedback: 'The animated fit check reached the safe stop before the solid tray. No placement or installation is recorded.',
  }
}

function disassemblyStep(cursor) {
  if (cursor === 0) return {
    number: 1,
    title: 'Open the computer case',
    instruction: 'Remove the tempered-glass side panel before accessing the verified case interior.',
    alignmentTitle: 'Verified case component',
    alignmentDescription: 'The case and its removable glass panel are included in this validated scene.',
    componentName: 'Tempered-glass side panel',
    componentFunction: 'Removing the panel opens the case for component inspection and service.',
    state: 'CASE CLOSED',
    feedback: 'Select Next Step to animate the glass panel out of its installed position.',
  }
  return {
    number: 1,
    title: 'Case access open',
    instruction: 'The glass panel is removed. Further component-removal steps remain unavailable because the motherboard installation position has not been verified.',
    alignmentTitle: 'More parts unavailable',
    alignmentDescription: 'The scene does not portray the motherboard as installed. This activity stops at the verified case-panel removal.',
    componentName: 'Motherboard removal unavailable',
    componentFunction: 'No installed motherboard pose or safe removal path is currently validated.',
    state: 'CASE OPEN',
    feedback: 'Use Previous to reinstall the glass panel. No unverified component removal is shown.',
  }
}

export function mountActivityWorkspace({ root, path }) {
  const isAssembly = path === '/student/assembly'
  const isDisassembly = path === '/student/disassembly'
  if (!isAssembly && !isDisassembly) return () => {}

  const activity = root.querySelector('.learning-workspace')
  const gate = activity?.querySelector('[data-rotate-gate]')
  const workspace = activity?.querySelector('[data-activity-workspace]')
  const canvas = workspace?.querySelector('[data-guided-canvas]')
  if (!activity || !gate || !workspace || !canvas) return () => {}

  const loading = workspace.querySelector('[data-assembly-loading]')
  const error = workspace.querySelector('[data-assembly-error]')
  const status = workspace.querySelector('[data-assembly-viewer-status]')
  const feedback = workspace.querySelector('[data-assembly-feedback]')
  const nextButtons = [...workspace.querySelectorAll('[data-assembly-action="next-step"]')]
  const previousButtons = [...workspace.querySelectorAll('[data-assembly-action="previous-step"]')]
  const replayButtons = [...workspace.querySelectorAll('[data-assembly-action="replay-step"]')]
  const resetButtons = [...workspace.querySelectorAll('[data-assembly-action="reset-activity"]')]
  const modeButtons = {
    normal: workspace.querySelector('[data-activity-action="mode-normal"]'),
    stereo: workspace.querySelector('[data-activity-action="mode-vr"]'),
  }
  const abortController = new AbortController()
  const { signal } = abortController
  const orientationQuery = window.matchMedia('(orientation: landscape)')
  const transitions = isAssembly ? ASSEMBLY_TRANSITIONS : DISASSEMBLY_TRANSITIONS
  let viewer = null
  let viewerRequest = null
  let disposed = false
  let orientationFrame = 0
  let mode = 'normal'
  let sequence

  document.body.classList.add('learning-activity-active')

  function currentStep(cursor) {
    const barrier = Number(canvas.dataset.boardTrayBarrierGapMm)
    return isAssembly ? assemblyStep(cursor, barrier) : disassemblyStep(cursor)
  }

  function updateMode() {
    const stereo = mode === 'stereo'
    modeButtons.normal.disabled = !viewer?.isLoaded
    modeButtons.stereo.disabled = !viewer?.isLoaded
    modeButtons.normal.classList.toggle('is-active', !stereo)
    modeButtons.normal.setAttribute('aria-pressed', String(!stereo))
    modeButtons.stereo.classList.toggle('is-active', stereo)
    modeButtons.stereo.setAttribute('aria-pressed', String(stereo))
    modeButtons.stereo.textContent = stereo ? 'Exit VR View' : 'VR View'
    modeButtons.stereo.setAttribute('aria-label', stereo ? 'Exit VR View and return to Normal 3D' : 'Enter stereoscopic VR View')
    workspace.querySelector('[data-assembly-stage]').classList.toggle('is-vr-view', stereo)
    workspace.querySelector('[data-assembly-stage]').dataset.renderMode = stereo ? 'stereo' : 'normal'
    workspace.querySelector('[data-assembly-layout]').classList.toggle('is-stereo-mode', stereo)
    viewer?.setMode(stereo ? 'stereo' : 'normal')
    activity.dataset.renderMode = stereo ? 'stereo' : 'normal'
  }

  function updateSequence({ cursor, busy, length }) {
    const step = currentStep(cursor)
    const ready = Boolean(viewer?.isLoaded)
    const displayNumber = Math.min(step.number, length)
    const label = `STEP ${String(displayNumber).padStart(2, '0')} / ${String(length).padStart(2, '0')}`
    activity.dataset.currentStep = String(displayNumber)
    activity.dataset.sequenceCursor = String(cursor)
    activity.dataset.sequenceBusy = String(busy)
    activity.dataset.casePrepared = String(Boolean(canvas.dataset.glassPanelRemoved === 'true'))
    activity.dataset.motherboardInstalled = 'false'
    activity.dataset.lessonComplete = 'false'
    activity.dataset.assemblyReadiness = isAssembly ? 'fit-blocked' : 'verified-case-only'
    workspace.querySelector('[data-assembly-step-title]').textContent = step.title
    workspace.querySelector('[data-assembly-instruction]').textContent = step.instruction
    workspace.querySelector('[data-assembly-alignment-title]').textContent = step.alignmentTitle
    workspace.querySelector('[data-assembly-alignment-description]').textContent = step.alignmentDescription
    workspace.querySelector('[data-assembly-component-name]').textContent = step.componentName
    workspace.querySelector('[data-assembly-component-function]').textContent = step.componentFunction
    workspace.querySelector('[data-assembly-live]').textContent = `${label}. ${step.title}. ${step.instruction}`
    for (const eye of workspace.querySelectorAll('.assembly-stereo-step')) {
      eye.querySelector('[data-stereo-step-label]').textContent = label
      eye.querySelector('[data-stereo-step-title]').textContent = step.title
      eye.querySelector('[data-stereo-instruction]').textContent = step.instruction
      eye.querySelector('[data-stereo-status]').textContent = step.alignmentTitle
    }
    workspace.querySelector('[data-assembly-step-label]').textContent = label
    workspace.querySelector('[data-assembly-step-indicator]').textContent = label
    workspace.querySelector('[data-assembly-state-pill]').textContent = busy ? 'ANIMATING' : step.state
    feedback.textContent = busy ? (isAssembly ? 'Playing the guided 3D step…' : 'Playing the guided removal…') : step.feedback
    feedback.dataset.state = isAssembly && cursor === 2 ? 'blocked' : 'info'
    for (const button of previousButtons) button.disabled = busy || !ready || cursor === 0
    for (const button of replayButtons) button.disabled = busy || !ready || cursor === 0
    for (const button of resetButtons) button.disabled = busy || !ready || cursor === 0
    const nextLabel = busy
      ? 'Animating…'
      : cursor === length && isAssembly
        ? 'Fit correction required'
        : cursor === length
          ? 'Sequence complete'
          : cursor === 0
            ? 'Next step'
            : isAssembly
              ? 'Preview fit approach'
              : 'Next step'
    for (const button of nextButtons) {
      button.disabled = busy || !ready || cursor >= length
      button.textContent = button.closest('.assembly-stereo-controls')
        ? (busy ? 'Animating…' : cursor === length ? (isAssembly ? 'Fit blocked' : 'Complete') : 'Next Step')
        : nextLabel
      button.title = cursor === length && isAssembly ? 'The motherboard cannot be shown as installed until its Blender fit is corrected.' : ''
    }
    workspace.querySelector('[data-assembly-step-list]').dataset.sequenceCursor = String(cursor)
    for (const item of workspace.querySelectorAll('[data-sequence-step]')) {
      const index = Number(item.dataset.sequenceStep)
      const completed = index < cursor
      const current = index === Math.min(cursor, length - 1)
      item.classList.toggle('is-complete', completed)
      if (current) item.setAttribute('aria-current', 'step')
      else item.removeAttribute('aria-current')
    }
    const activeBoardPreview = isAssembly && cursor > 0
    canvas.dataset.boardPreviewState = activeBoardPreview ? (cursor > 1 ? 'exploded-reference-only' : 'staged') : 'hidden'
    updateMode()
  }

  async function playTransition(name, direction) {
    const result = await viewer?.animateTransition(name, direction)
    if (result?.ok === false) {
      feedback.textContent = result.message || 'This step cannot be played with the current model transforms.'
      feedback.dataset.state = 'blocked'
      return false
    }
    return Boolean(result)
  }

  sequence = createGuidedSequence({
    transitions,
    runTransition: playTransition,
    onStateChange: updateSequence,
  })

  function getViewer() {
    if (viewer) return Promise.resolve(viewer)
    if (viewerRequest) return viewerRequest
    viewerRequest = Promise.all([import('../three/runtime.js'), import('../three/assembly-viewer.js')]).then(([{ threeRuntime }, { createAssemblyViewer }]) => {
      if (disposed) return null
      document.documentElement.dataset.threeRevision = threeRuntime.revision
      document.documentElement.dataset.threeFoundation = Object.keys(threeRuntime.addons).join(',')
      viewer = createAssemblyViewer(canvas, {
        showBoardOnPanelOpen: isAssembly,
        onLoaded() {
          activity.dataset.fitStatus = canvas.dataset.boardTargetFitStatus || 'not-required'
          updateSequence(sequence.state)
        },
        onError: showError,
      })
      return viewer
    }).finally(() => { viewerRequest = null })
    return viewerRequest
  }

  async function loadScene() {
    if (disposed || isPortraitGateActive()) return
    if (viewer?.isLoaded) {
      viewer.setActive(true)
      loading.hidden = true
      error.hidden = true
      activity.dataset.assemblyLoadState = 'loaded'
      updateSequence(sequence.state)
      return
    }
    activity.dataset.assemblyLoadState = 'loading'
    status.textContent = isAssembly ? 'Loading the case and motherboard reference GLBs…' : 'Loading the verified case GLB…'
    loading.hidden = false
    error.hidden = true
    try {
      const activeViewer = await getViewer()
      if (!activeViewer || disposed || isPortraitGateActive()) return
      await activeViewer.load()
      if (disposed || isPortraitGateActive()) return
      activeViewer.setActive(true)
      loading.hidden = true
      error.hidden = true
      status.textContent = isAssembly
        ? 'Real Blender GLBs ready · drag to orbit · scroll or pinch to zoom.'
        : 'Verified case model ready · drag to orbit · scroll or pinch to zoom.'
      activity.dataset.assemblyLoadState = 'loaded'
      activeViewer.setCameraView()
      activeViewer.setMode(mode)
      updateSequence(sequence.state)
    } catch (loadError) {
      showError(loadError)
    }
  }

  function showError(loadError) {
    if (disposed) return
    loading.hidden = true
    error.hidden = false
    workspace.querySelector('[data-assembly-error-message]').textContent = `The guided 3D scene could not be loaded. ${loadError?.message || 'Check the GLB assets and try again.'}`
    status.textContent = 'Guided scene failed to load.'
    activity.dataset.assemblyLoadState = 'error'
  }

  function orientationSync() {
    const blocked = isPortraitGateActive()
    gate.hidden = !blocked
    workspace.hidden = blocked
    activity.dataset.orientationState = blocked ? 'portrait-prompt' : 'workspace'
    viewer?.setActive(!blocked)
    updateMode()
    if (!blocked) void loadScene()
  }

  function scheduleOrientationSync() {
    if (orientationFrame || disposed) return
    orientationFrame = window.requestAnimationFrame(() => {
      orientationFrame = 0
      orientationSync()
      viewer?.resize()
    })
  }

  async function onClick(event) {
    const actionButton = event.target.closest('[data-assembly-action]')
    if (actionButton && workspace.contains(actionButton)) {
      const action = actionButton.dataset.assemblyAction
      if (action === 'next-step') await sequence.next()
      else if (action === 'previous-step') await sequence.previous()
      else if (action === 'replay-step') await sequence.replay()
      else if (action === 'reset-activity') await sequence.reset()
      else if (action === 'reset-view') viewer?.setCameraView()
      else if (action === 'retry') void loadScene()
      return
    }

    const modeAction = event.target.closest('[data-activity-action]')?.dataset.activityAction
    if (modeAction === 'mode-normal') {
      mode = 'normal'
      viewer?.setHandPose('rest')
      updateMode()
    } else if (modeAction === 'mode-vr') {
      mode = mode === 'stereo' ? 'normal' : 'stereo'
      const animation = canvas.dataset.guidedAnimationState || ''
      const isAnimating = canvas.dataset.guidedAnimationStatus === 'running'
      viewer?.setHandPose(isAnimating && animation.includes('case-panel') ? 'reach' : isAnimating ? 'grip' : 'rest')
      updateMode()
    } else if (modeAction === 'fullscreen') {
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => {})
      else void activity.requestFullscreen?.().catch(() => {})
    }
  }

  root.addEventListener('click', onClick, { signal })
  window.addEventListener('resize', scheduleOrientationSync, { signal, passive: true })
  window.addEventListener('orientationchange', scheduleOrientationSync, { signal, passive: true })
  window.visualViewport?.addEventListener('resize', scheduleOrientationSync, { signal, passive: true })
  orientationQuery.addEventListener('change', scheduleOrientationSync, { signal })

  updateSequence(sequence.state)
  orientationSync()

  return () => {
    disposed = true
    abortController.abort()
    if (orientationFrame) window.cancelAnimationFrame(orientationFrame)
    viewer?.dispose()
    document.body.classList.remove('learning-activity-active')
  }
}
