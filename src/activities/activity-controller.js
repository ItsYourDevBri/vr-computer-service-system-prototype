import { componentById } from '../data/hardware-components.js'
import { caseVrPartById } from '../data/case-vr-parts.js'

const learningState = {
  selectedId: 'computer-case',
  mode: 'normal',
  libraryCollapsed: false,
  informationCollapsed: false,
  mobileLibraryOpen: false,
  mobileInformationOpen: false,
  selectedCasePartId: null,
}

function viewportSize() {
  return {
    width: window.visualViewport?.width ?? window.innerWidth,
    height: window.visualViewport?.height ?? window.innerHeight,
  }
}

function isPhoneViewport() {
  const { width, height } = viewportSize()
  const shortSide = Math.min(width, height)
  const longSide = Math.max(width, height)
  return shortSide <= 600 && longSide <= 1100
}

function isLandscape() {
  const { width, height } = viewportSize()
  return width > height
}

function isPortraitGateActive() {
  return isPhoneViewport() && !isLandscape()
}

function isCompactLandscape() {
  const { width, height } = viewportSize()
  return width <= 1000 && height <= 540 && isLandscape()
}

export function mountActivityWorkspace({ root, path }) {
  const activity = root.querySelector('.learning-workspace')
  const gate = activity?.querySelector('[data-rotate-gate]')
  const workspace = activity?.querySelector('[data-activity-workspace]')
  if (!activity || !gate || !workspace) return () => {}

  const hardware = path === '/student/hardware'
  const layout = workspace.querySelector('[data-hardware-layout]')
  const stage = workspace.querySelector('[data-viewer-stage]')
  const canvas = workspace.querySelector('[data-hardware-canvas]')
  const status = workspace.querySelector('[data-viewer-status]')
  const loadingOverlay = workspace.querySelector('[data-viewer-loading]')
  const errorOverlay = workspace.querySelector('[data-viewer-error]')
  const vrPartDetails = workspace.querySelector('[data-vr-part-details]')
  const workspaceHeading = workspace.querySelector('[data-activity-heading]')
  const normalWorkspaceHeading = workspaceHeading?.textContent || 'Hardware Exploration'
  const mediaQuery = window.matchMedia('(orientation: landscape)')
  const abortController = new AbortController()
  const { signal } = abortController
  let viewer = null
  let viewerModuleRequest = null
  let disposed = false
  let orientationFrame = 0
  let pointerGesture = null

  document.body.classList.add('learning-activity-active')

  function selectedComponent() {
    return componentById(learningState.selectedId) || componentById('computer-case')
  }

  function updateLayoutInterface() {
    if (!hardware || !layout) return
    const compactLandscape = isCompactLandscape()
    layout.classList.toggle('is-library-collapsed', learningState.libraryCollapsed)
    layout.classList.toggle('is-information-collapsed', learningState.informationCollapsed)
    layout.classList.toggle('is-mobile-library-open', compactLandscape && learningState.mobileLibraryOpen)
    layout.classList.toggle('is-mobile-information-open', compactLandscape && learningState.mobileInformationOpen)

    const componentButton = workspace.querySelector('[data-activity-action="toggle-library"]')
    const expandedLibrary = compactLandscape ? learningState.mobileLibraryOpen : !learningState.libraryCollapsed
    const expandedInformation = compactLandscape ? learningState.mobileInformationOpen : !learningState.informationCollapsed
    componentButton?.setAttribute('aria-expanded', String(expandedLibrary))
    for (const detailsButton of workspace.querySelectorAll('[data-activity-action="toggle-information"]')) {
      detailsButton.setAttribute('aria-expanded', String(expandedInformation))
      detailsButton.classList.toggle('is-active', expandedInformation)
    }
    const innerDetailsButton = workspace.querySelector('.information-toggle')
    innerDetailsButton?.setAttribute('aria-expanded', String(expandedInformation))
    innerDetailsButton?.setAttribute('aria-label', expandedInformation ? 'Collapse component information' : 'Expand component information')
    workspace.querySelector('[data-component-information-body]').hidden = compactLandscape ? false : learningState.informationCollapsed
    const scrim = layout.querySelector('[data-activity-action="dismiss-mobile-drawers"]')
    if (scrim) scrim.hidden = !(compactLandscape && (learningState.mobileLibraryOpen || learningState.mobileInformationOpen))
    activity.dataset.workspaceLayout = compactLandscape ? 'mobile-landscape' : 'wide'
  }

  function updateModeInterface() {
    if (!hardware) return
    const component = selectedComponent()
    const hasModel = Boolean(component.glb)
    if (!hasModel && learningState.mode === 'stereo') learningState.mode = 'normal'
    const normalButton = workspace.querySelector('[data-activity-action="mode-normal"]')
    const vrButton = workspace.querySelector('[data-activity-action="mode-vr"]')
    const resetButton = workspace.querySelector('[data-activity-action="reset-view"]')
    const stereo = learningState.mode === 'stereo'

    normalButton.disabled = !hasModel
    vrButton.disabled = !hasModel
    normalButton.classList.toggle('is-active', !stereo)
    normalButton.setAttribute('aria-pressed', String(!stereo))
    vrButton.classList.toggle('is-active', stereo)
    vrButton.setAttribute('aria-pressed', String(stereo))
    vrButton.textContent = stereo ? 'Exit VR View' : 'VR View'
    vrButton.setAttribute('aria-label', stereo ? 'Exit VR View and return to Normal 3D' : 'Enter stereoscopic VR View')
    resetButton.disabled = !hasModel || stereo
    workspaceHeading.textContent = stereo ? component.name : normalWorkspaceHeading
    stage.classList.toggle('is-vr-view', stereo)
    stage.dataset.renderMode = stereo ? 'stereo' : 'normal'
    workspace.classList.toggle('is-stereo-mode', stereo)
    layout?.classList.toggle('is-stereo-mode', stereo)
    viewer?.setMode(stereo ? 'stereo' : 'normal')
    updateVrPartDetails()
  }

  function updateVrPartDetails() {
    if (!hardware || !vrPartDetails) return
    const selectedPart = learningState.selectedId === 'computer-case'
      ? caseVrPartById(learningState.selectedCasePartId)
      : null
    const shouldShow = learningState.mode === 'stereo' && Boolean(selectedPart) && canvas.dataset.modelId === 'computer-case'
    vrPartDetails.hidden = !shouldShow
    if (shouldShow) {
      for (const name of vrPartDetails.querySelectorAll('[data-vr-part-name]')) name.textContent = selectedPart.name
      for (const description of vrPartDetails.querySelectorAll('[data-vr-part-description]')) description.textContent = selectedPart.description
      for (const purpose of vrPartDetails.querySelectorAll('[data-vr-part-function]')) purpose.textContent = selectedPart.purpose
    }
    const highlightId = shouldShow ? selectedPart.id : ''
    if ((canvas.dataset.selectedCasePartId || '') !== highlightId) viewer?.highlightCasePart(highlightId || null)
  }

  function closeVrPartDetails(returnFocus = false) {
    learningState.selectedCasePartId = null
    updateVrPartDetails()
    if (returnFocus && learningState.mode === 'stereo') canvas.focus({ preventScroll: true })
  }

  function selectVrCasePart(clientX, clientY) {
    if (!hardware || learningState.mode !== 'stereo' || learningState.selectedId !== 'computer-case') return
    const selection = viewer?.pickCasePart(clientX, clientY)
    if (!selection) return
    learningState.selectedCasePartId = selection.part.id
    updateVrPartDetails()
  }

  function onCanvasPointerDown(event) {
    if (learningState.mode !== 'stereo' || learningState.selectedId !== 'computer-case' || !event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) {
      pointerGesture = null
      return
    }
    pointerGesture = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, moved: false }
  }

  function onCanvasPointerMove(event) {
    if (!pointerGesture || pointerGesture.pointerId !== event.pointerId) return
    if (Math.hypot(event.clientX - pointerGesture.x, event.clientY - pointerGesture.y) > 8) pointerGesture.moved = true
  }

  function onCanvasPointerUp(event) {
    const gesture = pointerGesture
    pointerGesture = null
    if (!gesture || gesture.pointerId !== event.pointerId || gesture.moved) return
    if (Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 8) return
    selectVrCasePart(event.clientX, event.clientY)
  }

  function updateComponentInformation(component) {
    activity.dataset.selectedComponent = component.id
    for (const button of workspace.querySelectorAll('[data-component-id]')) {
      const selected = button.dataset.componentId === component.id
      button.classList.toggle('is-selected', selected)
      button.setAttribute('aria-pressed', String(selected))
    }

    workspace.querySelector('[data-component-group]').textContent = component.group.toUpperCase()
    workspace.querySelector('[data-component-title]').textContent = component.name
    workspace.querySelector('[data-mobile-summary-title]').textContent = component.name
    workspace.querySelector('[data-mobile-summary-description]').textContent = component.summary
    workspace.querySelector('[data-component-description]').textContent = component.description
    workspace.querySelector('[data-component-purpose]').textContent = component.purpose
    workspace.querySelector('[data-component-explanation]').textContent = component.explanation
    const features = workspace.querySelector('[data-component-features]')
    features.replaceChildren(...component.features.map((feature) => {
      const item = document.createElement('li')
      item.textContent = feature
      return item
    }))
    const basicInfo = workspace.querySelector('[data-component-basic-info]')
    basicInfo.replaceChildren(...component.basicInfo.map((fact) => {
      const item = document.createElement('li')
      item.textContent = fact
      return item
    }))
    canvas.setAttribute('aria-label', `Interactive 3D model of ${component.name}. Drag to rotate; scroll or pinch to zoom.`)
    workspace.querySelector('[data-viewer-caption]').textContent = `${component.name} · drag to rotate · scroll or pinch to zoom`
  }

  function showModelError(component, error) {
    if (disposed || learningState.selectedId !== component.id) return
    loadingOverlay.hidden = true
    errorOverlay.hidden = false
    workspace.querySelector('[data-viewer-error-message]').textContent = `Could not load the ${component.name} GLB. ${error?.message || 'Check the model asset and try again.'}`
    status.textContent = `${component.name} 3D model failed to load.`
    activity.dataset.modelLoadState = 'error'
  }

  async function getViewer() {
    if (viewer) return viewer
    if (!viewerModuleRequest) {
      viewerModuleRequest = import('../three/runtime.js').then(({ threeRuntime }) => {
        if (disposed) return null
        document.documentElement.dataset.threeRevision = threeRuntime.revision
        document.documentElement.dataset.threeFoundation = Object.keys(threeRuntime.addons).join(',')
        viewer = threeRuntime.createViewer(canvas)
        return viewer
      }).finally(() => { viewerModuleRequest = null })
    }
    return viewerModuleRequest
  }

  async function loadSelectedModel(component = selectedComponent()) {
    if (!hardware || disposed || isPortraitGateActive()) return
    if (!component.glb) {
      showModelError(component, new Error('No validated GLB path is configured for this catalog entry.'))
      return
    }
    if (viewer?.model && canvas.dataset.modelId === component.id) {
      viewer.setActive(true)
      viewer.setMode(learningState.mode === 'stereo' ? 'stereo' : 'normal')
      loadingOverlay.hidden = true
      errorOverlay.hidden = true
      status.textContent = `${component.name} model ready · drag to rotate and scroll or pinch to zoom.`
      activity.dataset.modelLoadState = 'loaded'
      return
    }
    activity.dataset.modelLoadState = 'loading'
    errorOverlay.hidden = true
    loadingOverlay.hidden = false
    status.textContent = `Loading ${component.name} GLB…`
    try {
      const activeViewer = await getViewer()
      if (!activeViewer || disposed || learningState.selectedId !== component.id || isPortraitGateActive()) return
      activeViewer.setActive(true)
      activeViewer.setMode(learningState.mode === 'stereo' ? 'stereo' : 'normal')
      await activeViewer.loadModel(component.glb, {
        componentId: component.id,
        excludeNodePrefixes: component.excludeNodePrefixes || [],
        correctTemporaryFans: component.id === 'computer-case',
        viewDirection: component.viewDirection,
        viewUp: component.viewUp,
      })
      if (disposed || learningState.selectedId !== component.id) return
      loadingOverlay.hidden = true
      errorOverlay.hidden = true
      status.textContent = `${component.name} model ready · drag to rotate and scroll or pinch to zoom.`
      activity.dataset.modelLoadState = 'loaded'
      updateModeInterface()
    } catch (error) {
      showModelError(component, error)
    }
  }

  function showComponent(id) {
    const component = componentById(id)
    if (!component || !hardware) return
    if (learningState.selectedId !== component.id) learningState.selectedCasePartId = null
    learningState.selectedId = component.id
    updateComponentInformation(component)
    errorOverlay.hidden = true
    loadingOverlay.hidden = false
    viewer?.setActive(!isPortraitGateActive())
    updateModeInterface()
    updateLayoutInterface()

    if (isPortraitGateActive()) {
      status.textContent = 'Rotate your phone to landscape to open the model viewer.'
      loadingOverlay.hidden = true
      activity.dataset.modelLoadState = viewer?.model ? 'loaded' : 'idle'
    } else {
      void loadSelectedModel(component)
    }
  }

  async function toggleFullscreen() {
    const button = workspace.querySelector('[data-activity-action="fullscreen"]')
    const activityStatus = workspace.querySelector('[data-activity-status]')
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else if (activity.requestFullscreen) {
        await activity.requestFullscreen()
      } else {
        activityStatus.textContent = 'Fullscreen is not available in this browser.'
      }
    } catch {
      activityStatus.textContent = 'Fullscreen was not allowed. The learning workspace is still available.'
    }
    if (button) {
      const isFullscreen = Boolean(document.fullscreenElement)
      button.setAttribute('aria-label', isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen')
      button.title = isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'
    }
  }

  function toggleLibrary() {
    if (isCompactLandscape()) {
      learningState.mobileLibraryOpen = !learningState.mobileLibraryOpen
    } else {
      learningState.libraryCollapsed = !learningState.libraryCollapsed
    }
    updateLayoutInterface()
    viewer?.resize()
  }

  function toggleInformation() {
    if (isCompactLandscape()) {
      learningState.mobileInformationOpen = !learningState.mobileInformationOpen
    } else {
      learningState.informationCollapsed = !learningState.informationCollapsed
    }
    updateLayoutInterface()
    viewer?.resize()
  }

  function closeInformation() {
    if (isCompactLandscape()) learningState.mobileInformationOpen = false
    else learningState.informationCollapsed = true
    updateLayoutInterface()
    viewer?.resize()
  }

  function syncOrientation() {
    const blocked = isPortraitGateActive()
    gate.hidden = !blocked
    workspace.hidden = blocked
    activity.dataset.orientationState = blocked ? 'portrait-prompt' : 'workspace'
    viewer?.setActive(!blocked && hardware)
    updateModeInterface()
    updateLayoutInterface()
    if (!blocked && hardware) void loadSelectedModel()
    else viewer?.resize()
  }

  function scheduleOrientationSync() {
    if (orientationFrame || disposed) return
    orientationFrame = window.requestAnimationFrame(() => {
      orientationFrame = 0
      syncOrientation()
    })
  }

  function onClick(event) {
    const componentButton = event.target.closest('[data-component-id]')
    if (componentButton && workspace.contains(componentButton)) {
      learningState.mobileLibraryOpen = false
      showComponent(componentButton.dataset.componentId)
      return
    }
    const button = event.target.closest('[data-activity-action]')
    if (!button || (!workspace.contains(button) && !gate.contains(button))) return
    const action = button.dataset.activityAction
    if (action === 'fullscreen') {
      void toggleFullscreen()
    } else if (action === 'toggle-library') {
      toggleLibrary()
    } else if (action === 'toggle-information') {
      toggleInformation()
    } else if (action === 'close-information') {
      closeInformation()
    } else if (action === 'close-vr-part') {
      closeVrPartDetails(true)
    } else if (action === 'dismiss-mobile-drawers') {
      learningState.mobileLibraryOpen = false
      learningState.mobileInformationOpen = false
      updateLayoutInterface()
      viewer?.resize()
    } else if (action === 'reset-view') {
      viewer?.resetView()
    } else if (action === 'retry-model') {
      void loadSelectedModel()
    } else if (action === 'mode-normal') {
      learningState.mode = 'normal'
      updateModeInterface()
      updateLayoutInterface()
      viewer?.resize()
    } else if (action === 'mode-vr' && !button.disabled) {
      learningState.mode = learningState.mode === 'stereo' ? 'normal' : 'stereo'
      if (learningState.mode === 'stereo') {
        learningState.mobileLibraryOpen = false
        learningState.mobileInformationOpen = false
      }
      updateModeInterface()
      updateLayoutInterface()
      viewer?.resize()
    }
  }

  function onWorkspaceKeyDown(event) {
    if (event.key === 'Escape' && !vrPartDetails?.hidden) closeVrPartDetails(true)
  }

  root.addEventListener('click', onClick, { signal })
  root.addEventListener('keydown', onWorkspaceKeyDown, { signal })
  canvas?.addEventListener('pointerdown', onCanvasPointerDown, { signal })
  canvas?.addEventListener('pointermove', onCanvasPointerMove, { signal })
  canvas?.addEventListener('pointerup', onCanvasPointerUp, { signal })
  canvas?.addEventListener('pointercancel', () => { pointerGesture = null }, { signal })
  canvas?.addEventListener('lostpointercapture', () => { pointerGesture = null }, { signal })
  window.addEventListener('resize', scheduleOrientationSync, { signal, passive: true })
  window.addEventListener('orientationchange', scheduleOrientationSync, { signal, passive: true })
  window.visualViewport?.addEventListener('resize', scheduleOrientationSync, { signal, passive: true })
  mediaQuery.addEventListener('change', scheduleOrientationSync, { signal })
  document.addEventListener('fullscreenchange', () => {
    const button = workspace.querySelector('[data-activity-action="fullscreen"]')
    const isFullscreen = Boolean(document.fullscreenElement)
    button?.setAttribute('aria-label', isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen')
    if (button) button.title = isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'
  }, { signal })
  canvas?.addEventListener('webglcontextlost', () => {
    status.textContent = '3D graphics paused because the browser lost its WebGL context. Waiting for the browser to restore it.'
  }, { signal })
  canvas?.addEventListener('webglcontextrestored', () => {
    status.textContent = `${selectedComponent().name} model restored.`
  }, { signal })

  if (hardware) {
    layout?.classList.toggle('is-library-collapsed', learningState.libraryCollapsed)
    layout?.classList.toggle('is-information-collapsed', learningState.informationCollapsed)
  }
  syncOrientation()
  if (hardware) showComponent(learningState.selectedId)

  return () => {
    disposed = true
    abortController.abort()
    if (orientationFrame) window.cancelAnimationFrame(orientationFrame)
    mediaQuery.removeEventListener('change', scheduleOrientationSync)
    if (document.fullscreenElement === activity && document.exitFullscreen) void document.exitFullscreen().catch(() => {})
    document.body.classList.remove('learning-activity-active')
    viewer?.dispose()
    viewer = null
  }
}
