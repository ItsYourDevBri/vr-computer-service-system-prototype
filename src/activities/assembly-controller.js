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

const ASSEMBLY_TRANSITIONS = Object.freeze(['case-panel', 'motherboard-install', 'cpu', 'ramA', 'ramB', 'cooler'])
const DISASSEMBLY_TRANSITIONS = Object.freeze(['cooler', 'ramB', 'ramA', 'cpu', 'motherboard-install', 'case-panel'])

function assemblyStep(cursor) {
  if (cursor >= 6) return {
    number: 6,
    title: 'Assembly complete',
    instruction: 'The CPU, paired RAM modules, and cooler are installed on the validated motherboard.',
    alignmentTitle: 'Verified component sequence',
    alignmentDescription: 'All authored component roots reached their validated installation transforms.',
    componentName: 'CPU, RAM, and CPU Cooler',
    componentFunction: 'The core component installation sequence is complete.',
    state: 'COMPLETE',
    feedback: 'Use Previous or Replay to inspect the reversible installation steps.',
  }
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
    title: 'Install the motherboard',
    instruction: 'Move the motherboard into the corrected tray position until all nine mounting holes sit on the ATX standoffs.',
    alignmentTitle: 'Validated ATX mounting fit',
    alignmentDescription: 'The corrected tray, orientation, and nine-hole standoff alignment are validated before installation is enabled.',
    componentName: 'ATX motherboard',
    componentFunction: 'The board holds the CPU, memory, expansion slots, and connectors.',
    state: 'READY TO INSTALL',
    feedback: 'Select Next Step to animate the motherboard into its validated mounting position.',
  }
  const steps = [
    ['Install the CPU', 'Observe how the processor aligns with the motherboard CPU socket.', 'Validated CPU socket alignment', 'The modeled LGA1700-compatible package is placed on the authored CPU socket marker.', 'Processor (CPU)', 'The CPU executes instructions and must be oriented to the socket key.', 'CPU INSTALLED'],
    ['Install RAM module 1', 'Observe how the first memory module aligns with the matching DIMM slot.', 'Validated DIMM slot alignment', 'RAM A uses the authored first populated DDR5-style slot and key notch.', 'Memory module 1', 'This module provides fast volatile working memory for the processor.', 'RAM 1 INSTALLED'],
    ['Install RAM module 2', 'Observe how the second memory module aligns with the adjacent matching DIMM slot.', 'Validated DIMM slot alignment', 'RAM B uses the authored adjacent populated DDR5-style slot.', 'Memory module 2', 'The paired module expands the working memory configuration.', 'RAM 2 INSTALLED'],
    ['Install the CPU Cooler', 'Observe how the cooling assembly is positioned over the processor.', 'Validated cooler clearance', 'The cooler contact base aligns to the CPU and clears the RAM, glass panel, and top panel.', 'CPU Cooler', 'The cooler transfers heat from the processor into the surrounding air.', 'COOLER INSTALLED'],
  ]
  const [title, instruction, alignmentTitle, alignmentDescription, componentName, componentFunction, state] = steps[cursor - 2] || steps[3]
  return { number: cursor + 1, title, instruction, alignmentTitle, alignmentDescription, componentName, componentFunction, state, feedback: `Select Next Step to animate ${title.toLowerCase()}.` }
}

function disassemblyStep(cursor) {
  if (cursor >= 6) return {
    number: 6,
    title: 'Disassembly complete',
    instruction: 'The cooler, RAM, CPU, motherboard, and access panel sequence completed in reverse order.',
    alignmentTitle: 'Verified reverse sequence',
    alignmentDescription: 'All dependent components returned to their authored staging positions.',
    componentName: 'Computer case',
    componentFunction: 'The case is ready for the next verified service step.',
    state: 'COMPLETE',
    feedback: 'Use Previous to inspect any removal transition again.',
  }
  if (cursor === 0) return {
    number: 1,
    title: 'Remove the CPU Cooler',
    instruction: 'The cooler starts installed. Move it away from the processor while preserving the CPU and RAM.',
    alignmentTitle: 'Installed starting state',
    alignmentDescription: 'This reverse sequence starts from the validated assembled CPU, RAM, and cooler state.',
    componentName: 'CPU Cooler',
    componentFunction: 'Remove the cooler before accessing the processor or memory.',
    state: 'INSTALLED',
    feedback: 'Select Next Step to animate the cooler away from the processor.',
  }
  const steps = [
    ['Remove the CPU Cooler', 'Move the cooler away from the processor while preserving the installed CPU and RAM.', 'Validated reverse cooler path', 'The cooler returns to its authored removal staging position.', 'CPU Cooler', 'Remove the cooler before accessing the processor.', 'COOLER INSTALLED'],
    ['Remove RAM module 2', 'Move the second memory module away from its DIMM slot.', 'Validated reverse DIMM path', 'RAM B is removed first so the paired memory state remains deterministic.', 'Memory module 2', 'Remove the most recently installed module first.', 'RAM 2 REMOVED'],
    ['Remove RAM module 1', 'Move the first memory module away from its DIMM slot.', 'Validated reverse DIMM path', 'RAM A returns to its authored removal staging position.', 'Memory module 1', 'The remaining memory module is removed before the CPU.', 'RAM 1 REMOVED'],
    ['Remove the CPU', 'Move the processor away from the motherboard socket.', 'Validated reverse CPU path', 'The CPU returns to its authored staging position while the motherboard remains installed.', 'Processor (CPU)', 'Remove the processor after the cooler and RAM are clear.', 'CPU REMOVED'],
    ['Remove the motherboard', 'Move the motherboard away from the ATX standoffs before restoring the access panel.', 'Installed starting state', 'The board follows the validated reverse path from its mounted position.', 'ATX motherboard', 'The motherboard is removed after dependent components are clear.', 'MOTHERBOARD REMOVED'],
    ['Reattach the access panel', 'Reattach the tempered-glass panel to restore the closed case.', 'Verified reverse sequence', 'The panel closes after all dependent components have been removed.', 'Tempered-glass side panel', 'The panel closes the case after service work.', 'COMPLETE'],
  ]
  const [title, instruction, alignmentTitle, alignmentDescription, componentName, componentFunction, state] = steps[Math.min(cursor, steps.length - 1)]
  return { number: cursor + 1, title, instruction, alignmentTitle, alignmentDescription, componentName, componentFunction, state, feedback: `Select Next Step to animate ${title.toLowerCase()}.` }
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
    return isAssembly ? assemblyStep(cursor) : disassemblyStep(cursor)
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
    activity.dataset.motherboardInstalled = canvas.dataset.boardInstalled || 'false'
    activity.dataset.lessonComplete = String(cursor === length && (isAssembly ? canvas.dataset.coolerInstalled === 'true' : true))
    activity.dataset.assemblyReadiness = canvas.dataset.boardTargetFitStatus === 'validated-mounted' ? 'validated' : 'fit-blocked'
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
    feedback.dataset.state = cursor === length ? 'complete' : 'info'
    for (const button of previousButtons) button.disabled = busy || !ready || cursor === 0
    for (const button of replayButtons) button.disabled = busy || !ready || cursor === 0
    for (const button of resetButtons) button.disabled = busy || !ready || cursor === 0
    const nextLabel = busy
      ? 'Animating…'
      : cursor === length
          ? 'Sequence complete'
          : cursor === 0
            ? 'Next step'
            : isAssembly
            ? isAssembly ? 'Continue installation' : 'Next step'
              : 'Next step'
    for (const button of nextButtons) {
      button.disabled = busy || !ready || cursor >= length
      button.textContent = button.closest('.assembly-stereo-controls')
        ? (busy ? 'Animating…' : cursor === length ? 'Complete' : 'Next Step')
        : nextLabel
      button.title = ''
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
    canvas.dataset.boardPreviewState = isAssembly ? (cursor === 0 ? 'hidden' : cursor >= 2 ? 'installed' : 'staged') : (cursor >= 5 ? 'staged' : 'installed')
    updateMode()
  }

  async function playTransition(name, direction) {
    const viewerDirection = isDisassembly
      ? (direction === 'forward' ? 'reverse' : 'forward')
      : direction
    const result = await viewer?.animateTransition(name, viewerDirection)
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
        startDisassemblyInstalled: isDisassembly,
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
    status.textContent = 'Loading the verified case, motherboard, CPU, RAM, and cooler GLBs…'
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
      status.textContent = 'Real Blender GLBs ready · drag to orbit · scroll or pinch to zoom.'
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
