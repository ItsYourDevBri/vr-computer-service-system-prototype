import * as THREE from 'three'
import { createCameraControls } from './camera-controls.js'
import { HardwareAssetManager } from './asset-manager.js'
import { createGuidedHands } from './guided-hands.js'
import { createSceneLifecycle } from './scene-lifecycle.js'

const CASE_URL = '/assets/hardware/optimized_glb/computer_case_motherboard_fit.glb'
const MOTHERBOARD_URL = '/assets/hardware/optimized_glb/motherboard_motherboard_fit.glb'
const CPU_URL = '/assets/hardware/optimized_glb/cpu.glb'
const RAM_URL = '/assets/hardware/optimized_glb/ram.glb'
const COOLER_URL = '/assets/hardware/optimized_glb/cpu_cooler.glb'
const MB_ROOT_NAME = 'MB_ROOT.001'
const TARGET_POSITION = new THREE.Vector3(-0.09, 0.285, -0.03)
const TARGET_WORLD_QUATERNION = new THREE.Quaternion()
const TARGET_WORLD_SCALE = new THREE.Vector3(1, 1, 1)
const PANEL_REMOVAL_DISTANCE = 0.12
const TRANSITION_DURATION_MS = 860
const COMPONENT_CONFIG = Object.freeze({
  cpu: { root: 'CPU_ROOT', target: [-0.0715, 0.345, -0.03], stageOffset: 0.18 },
  ramA: { root: 'RAM_A_ROOT', target: [-0.0715, 0.285, -0.093], stageOffset: 0.18 },
  ramB: { root: 'RAM_B_ROOT', target: [-0.0715, 0.285, -0.073], stageOffset: 0.18 },
  cooler: { root: 'COOLER_ROOT', target: [-0.0715, 0.345, -0.03], stageOffset: 0.2 },
})

function setData(canvas, key, value) {
  const text = String(value)
  if (canvas.dataset[key] !== text) canvas.dataset[key] = text
}

function findObject(root, predicate) {
  let found = null
  root.traverse((object) => {
    if (!found && predicate(object)) found = object
  })
  return found
}

function collectModelStats(root) {
  const materials = new Set()
  let meshes = 0
  let triangles = 0
  root.traverse((object) => {
    if (!object.isMesh) return
    meshes += 1
    triangles += Math.floor((object.geometry.index?.count ?? object.geometry.attributes.position?.count ?? 0) / 3)
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) if (material) materials.add(material)
  })
  return { meshes, triangles, materials: materials.size }
}

function makeInteriorMaterialsDoubleSided(root) {
  const copies = new Map()
  root.traverse((object) => {
    if (!object.isMesh) return
    const source = Array.isArray(object.material) ? object.material : [object.material]
    const corrected = source.map((material) => {
      if (!material) return material
      if (!copies.has(material)) {
        const copy = material.clone()
        copy.side = THREE.DoubleSide
        if (copy.emissive) {
          copy.emissive.copy(copy.color).multiplyScalar(0.18)
          copy.emissiveIntensity = 0.7
        }
        copy.needsUpdate = true
        copies.set(material, copy)
      }
      return copies.get(material)
    })
    object.material = Array.isArray(object.material) ? corrected : corrected[0]
  })
  root.userData.ownedMaterials = [...copies.values()]
}

export function createAssemblyViewer(canvas, hooks = {}) {
  const showBoardOnPanelOpen = hooks.showBoardOnPanelOpen !== false
  const startDisassemblyInstalled = hooks.startDisassemblyInstalled === true
  const isSmallScreen = window.matchMedia('(max-width: 760px)').matches
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmallScreen ? 1.45 : 1.65))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.35
  renderer.info.autoReset = false

  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#111a26')
  scene.add(new THREE.HemisphereLight(0xdce8ff, 0x48515b, 3.5))
  const key = new THREE.DirectionalLight(0xfff2df, 5.2)
  key.position.set(-1.5, 2.8, 2.4)
  scene.add(key)
  const fill = new THREE.DirectionalLight(0x9ec5ed, 3.2)
  fill.position.set(1.8, 1.5, -2.2)
  scene.add(fill)
  const rim = new THREE.DirectionalLight(0xffffff, 2.4)
  rim.position.set(-1.0, 2.2, -2.8)
  scene.add(rim)

  const camera = new THREE.PerspectiveCamera(42, 1, 0.015, 20)
  camera.position.set(-0.78, 0.59, 0.83)
  camera.lookAt(0, 0.225, 0)
  scene.add(camera)
  const controls = createCameraControls(camera, canvas)
  controls.enablePan = false
  controls.screenSpacePanning = false
  controls.touches.ONE = THREE.TOUCH.ROTATE
  controls.touches.TWO = THREE.TOUCH.DOLLY_PAN
  controls.target.set(0, 0.225, 0)
  controls.minDistance = 0.62
  controls.maxDistance = 2.4

  const stereoCamera = new THREE.StereoCamera()
  stereoCamera.aspect = 0.5
  const assets = new HardwareAssetManager()
  const guidedHands = createGuidedHands({ camera, assetManager: assets, canvas, onError: hooks.onError })
  const setHandPose = (pose) => guidedHands.setPose(pose)
  const resizeObserver = new ResizeObserver(resize)
  let active = true
  let disposed = false
  let mode = 'normal'
  let caseModel = null
  let motherboardModel = null
  let motherboardRoot = null
  const componentModels = {}
  const componentRoots = {}
  let panelNodes = []
  let panelBaseTransforms = []
  let motherboardTrayBounds = null
  let boardInstalled = false
  let glassRemoved = false
  let boardPreviewActive = false
  let activeAnimation = null
  let boardHighlight = null
  let loadPromise = null
  let animationFrameLast = performance.now()
  let rafStopped = false

  function resize() {
    const rect = canvas.getBoundingClientRect()
    if (!rect.width || !rect.height || disposed) return
    renderer.setSize(rect.width, rect.height, false)
    camera.aspect = rect.width / rect.height
    camera.updateProjectionMatrix()
    if (!rafStopped) draw()
  }

  function updateBoardProjection() {
    if (!motherboardRoot || !motherboardRoot.visible) return
    camera.updateMatrixWorld(true)
    motherboardRoot.updateMatrixWorld(true)
    const bounds = canvas.getBoundingClientRect()
    const worldPos = motherboardRoot.getWorldPosition(new THREE.Vector3())
    const screenPos = worldPos.clone().project(camera)
    const boardScreen = `${(screenPos.x * 0.5 + 0.5) * bounds.width},${(-screenPos.y * 0.5 + 0.5) * bounds.height}`
    const next = worldPos.clone().add(new THREE.Vector3(0.01, 0, 0)).project(camera)
    const px = (next.x - screenPos.x) * bounds.width * 50
    const py = -(next.y - screenPos.y) * bounds.height * 50
    const pixelsPerMeter = Math.hypot(px, py) / 0.01
    const axis = `${px / Math.max(Math.hypot(px, py), 1e-8)},${py / Math.max(Math.hypot(px, py), 1e-8)}`
    const targetScreen = TARGET_POSITION.clone().project(camera)
    setData(canvas, 'boardScreenPoint', boardScreen)
    setData(canvas, 'targetScreenPoint', `${(targetScreen.x * 0.5 + 0.5) * bounds.width},${(-targetScreen.y * 0.5 + 0.5) * bounds.height}`)
    setData(canvas, 'axisScreenUnit', axis)
    setData(canvas, 'axisPixelsPerMeter', pixelsPerMeter.toFixed(3))
    setData(canvas, 'boardRootPosition', `${motherboardRoot.position.x.toFixed(5)},${motherboardRoot.position.y.toFixed(5)},${motherboardRoot.position.z.toFixed(5)}`)
  }

  function animateState(delta) {
    if (!activeAnimation) return
    activeAnimation.elapsed += delta * 1000
    const progress = THREE.MathUtils.clamp(activeAnimation.elapsed / activeAnimation.duration, 0, 1)
    const eased = progress * progress * (3 - 2 * progress)
    const { name, direction, from, to } = activeAnimation
    if (name === 'case-panel') {
      for (let index = 0; index < panelNodes.length; index += 1) {
        panelNodes[index].position.x = THREE.MathUtils.lerp(from[index], to[index], eased)
      }
      setData(canvas, 'panelTransform', panelNodes.map((panel) => panel.position.x.toFixed(5)).join(','))
    } else if (name === 'motherboard-install' && motherboardRoot) {
      motherboardRoot.position.x = THREE.MathUtils.lerp(from, to, eased)
      motherboardRoot.updateMatrixWorld(true)
      if (boardHighlight) boardHighlight.box.setFromObject(motherboardModel)
      setData(canvas, 'boardRootPosition', `${motherboardRoot.position.x.toFixed(5)},${motherboardRoot.position.y.toFixed(5)},${motherboardRoot.position.z.toFixed(5)}`)
    } else if (componentRoots[name]) {
      const root = componentRoots[name]
      root.position.x = THREE.MathUtils.lerp(from, to, eased)
      root.updateMatrixWorld(true)
      setData(canvas, `${name}RootPosition`, `${root.position.x.toFixed(5)},${root.position.y.toFixed(5)},${root.position.z.toFixed(5)}`)
    }
    if (progress < 1) return

    const finished = activeAnimation
    activeAnimation = null
    controls.enabled = mode === 'normal'
    if (name === 'case-panel') {
      glassRemoved = direction === 'forward'
      for (const panel of panelNodes) panel.visible = !glassRemoved
      setData(canvas, 'glassPanelRemoving', false)
      setData(canvas, 'glassPanelRemoved', glassRemoved)
      setData(canvas, 'glassPanelVisible', !glassRemoved)
      if (showBoardOnPanelOpen && motherboardRoot) motherboardRoot.visible = glassRemoved
      setData(canvas, 'motherboardVisible', Boolean(showBoardOnPanelOpen && glassRemoved))
      setData(canvas, 'panelTransform', panelNodes.map((panel) => panel.position.x.toFixed(5)).join(','))
      setHandPose('rest')
    } else if (name === 'motherboard-install' && motherboardRoot) {
      motherboardRoot.position.x = to
      motherboardRoot.updateMatrixWorld(true)
      boardPreviewActive = false
      boardInstalled = direction === 'forward'
      if (boardHighlight) {
        boardHighlight.box.setFromObject(motherboardModel)
        boardHighlight.visible = false
      }
      setData(canvas, 'boardPreviewState', boardInstalled ? 'installed' : 'staged')
      setData(canvas, 'boardFitPreview', false)
      setData(canvas, 'boardInstalled', boardInstalled)
      setData(canvas, 'motherboardVisible', true)
      setData(canvas, 'boardRootPosition', `${motherboardRoot.position.x.toFixed(5)},${motherboardRoot.position.y.toFixed(5)},${motherboardRoot.position.z.toFixed(5)}`)
      setData(canvas, 'boardTransformState', boardInstalled ? 'mounted' : 'staging')
      setHandPose('rest')
    } else if (componentRoots[name]) {
      const root = componentRoots[name]
      root.position.x = to
      root.visible = direction === 'forward'
      root.updateMatrixWorld(true)
      setData(canvas, `${name}Installed`, direction === 'forward')
      setData(canvas, `${name}TransformState`, direction === 'forward' ? 'installed' : 'staged')
      setHandPose('rest')
    }
    setData(canvas, 'guidedAnimationStatus', 'idle')
    setData(canvas, 'lastAnimationHandPose', 'rest')
    finished.resolve({ ok: true, name, direction })
  }

  function draw() {
    if (disposed) return
    const bounds = canvas.getBoundingClientRect()
    if (!bounds.width || !bounds.height) return
    renderer.info.reset()
    const now = performance.now()
    const delta = Math.min((now - animationFrameLast) / 1000, 0.05)
    animationFrameLast = now
    animateState(delta)
    guidedHands.update(delta)
    if (mode === 'stereo') {
      camera.aspect = bounds.width / bounds.height
      camera.focus = Math.max(camera.position.distanceTo(controls.target), 0.0001)
      camera.updateProjectionMatrix()
      camera.updateMatrixWorld(true)
      stereoCamera.eyeSep = 0.064
      stereoCamera.update(camera)
      const leftWidth = Math.floor(bounds.width / 2)
      renderer.setScissorTest(true)
      renderer.setViewport(0, 0, leftWidth, bounds.height)
      renderer.setScissor(0, 0, leftWidth, bounds.height)
      renderer.clear(true, true, true)
      renderer.render(scene, stereoCamera.cameraL)
      renderer.setViewport(leftWidth, 0, bounds.width - leftWidth, bounds.height)
      renderer.setScissor(leftWidth, 0, bounds.width - leftWidth, bounds.height)
      renderer.clear(true, true, true)
      renderer.render(scene, stereoCamera.cameraR)
      renderer.setScissorTest(false)
      const left = new THREE.Vector3().setFromMatrixPosition(stereoCamera.cameraL.matrix)
      const right = new THREE.Vector3().setFromMatrixPosition(stereoCamera.cameraR.matrix)
      setData(canvas, 'stereoEyeSeparation', left.distanceTo(right).toFixed(5))
      setData(canvas, 'stereoViews', 'left,right')
      setData(canvas, 'stereoProjectionOffset', Math.abs(stereoCamera.cameraL.projectionMatrix.elements[8] - stereoCamera.cameraR.projectionMatrix.elements[8]).toFixed(6))
    } else {
      camera.aspect = bounds.width / bounds.height
      camera.updateProjectionMatrix()
      renderer.setScissorTest(false)
      renderer.setViewport(0, 0, bounds.width, bounds.height)
      renderer.render(scene, camera)
    }
    setData(canvas, 'renderMode', mode)
    setData(canvas, 'renderCalls', renderer.info.render.calls)
    setData(canvas, 'renderedTriangles', renderer.info.render.triangles)
    setData(canvas, 'cameraPosition', `${camera.position.x.toFixed(4)},${camera.position.y.toFixed(4)},${camera.position.z.toFixed(4)}`)
    setData(canvas, 'cameraDistance', camera.position.distanceTo(controls.target).toFixed(4))
    updateBoardProjection()
  }

  const lifecycle = createSceneLifecycle(renderer, scene, camera, controls, draw)
  resizeObserver.observe(canvas)
  resize()
  const visibilityChange = () => {
    const shouldRun = active && !document.hidden && !disposed
    rafStopped = !shouldRun
    setData(canvas, 'rendererActive', shouldRun)
    if (shouldRun) lifecycle.start()
    else lifecycle.stop()
  }
  document.addEventListener('visibilitychange', visibilityChange)

  async function load() {
    if (loadPromise) return loadPromise
    loadPromise = (async () => {
      setData(canvas, 'loadState', 'loading')
      const results = await Promise.allSettled([
        assets.load(CASE_URL, { excludeNodePrefixes: ['OPTICAL_', 'CASE_TempFanVis_'] }),
        assets.load(MOTHERBOARD_URL, { excludeNodePrefixes: ['OPTICAL_'] }),
        assets.load(CPU_URL, { excludeNodePrefixes: ['OPTICAL_', 'CPU_Render_Ground'] }),
        assets.load(RAM_URL, { excludeNodePrefixes: ['OPTICAL_'] }),
        assets.load(COOLER_URL, { excludeNodePrefixes: ['OPTICAL_'] }),
      ])
      const failed = results.find((result) => result.status === 'rejected')
      if (failed) {
        for (const result of results) if (result.status === 'fulfilled') assets.release(result.value)
        throw failed.reason
      }
      const [caseAsset, boardAsset, cpuAsset, ramAsset, coolerAsset] = results.map((result) => result.value)
      if (disposed) {
        assets.release(caseAsset)
        assets.release(boardAsset)
        assets.release(cpuAsset)
        assets.release(ramAsset)
        assets.release(coolerAsset)
        return false
      }
      caseModel = caseAsset
      motherboardModel = boardAsset
      componentModels.cpu = cpuAsset
      componentModels.ram = ramAsset
      componentModels.cooler = coolerAsset
      makeInteriorMaterialsDoubleSided(caseModel)
      makeInteriorMaterialsDoubleSided(motherboardModel)
      scene.add(caseModel, motherboardModel)
      scene.add(cpuAsset, ramAsset, coolerAsset)
      caseModel.updateMatrixWorld(true)
      motherboardRoot = findObject(motherboardModel, (object) => object.name === MB_ROOT_NAME || object.name.startsWith('MB_ROOT'))
      if (!motherboardRoot) throw new Error('The motherboard GLB is missing its independently rooted MB_ROOT node.')
      for (const [key, config] of Object.entries(COMPONENT_CONFIG)) {
        const model = key.startsWith('ram') ? ramAsset : key === 'cpu' ? cpuAsset : coolerAsset
        const root = findObject(model, (object) => object.name === `${config.root}.001` || object.name.startsWith(config.root))
        if (!root) throw new Error(`The ${key} GLB is missing its independently rooted ${config.root} node.`)
        componentRoots[key] = root
        root.userData.targetPosition = new THREE.Vector3(...config.target)
        root.userData.stagePosition = new THREE.Vector3(config.target[0] + config.stageOffset, config.target[1], config.target[2])
        root.position.copy(root.userData.stagePosition)
        root.visible = false
        root.updateMatrixWorld(true)
        setData(canvas, `${key}RootName`, root.name)
        setData(canvas, `${key}TargetTransform`, config.target.join(','))
        setData(canvas, `${key}TransformState`, 'staged')
        setData(canvas, `${key}Installed`, false)
      }
      motherboardRoot.updateMatrixWorld(true)
      const targetWorld = motherboardRoot.getWorldPosition(new THREE.Vector3())
      const targetRotation = motherboardRoot.getWorldQuaternion(new THREE.Quaternion())
      const targetScale = motherboardRoot.getWorldScale(new THREE.Vector3())
      const transformError = targetWorld.distanceTo(TARGET_POSITION)
        + targetRotation.angleTo(TARGET_WORLD_QUATERNION) * 0.01
        + targetScale.distanceTo(TARGET_WORLD_SCALE) * 0.01
      setData(canvas, 'motherboardTargetTransform', `${targetWorld.x.toFixed(5)},${targetWorld.y.toFixed(5)},${targetWorld.z.toFixed(5)}`)
      setData(canvas, 'motherboardTargetQuaternion', `${targetRotation.x.toFixed(5)},${targetRotation.y.toFixed(5)},${targetRotation.z.toFixed(5)},${targetRotation.w.toFixed(5)}`)
      setData(canvas, 'motherboardTargetScale', `${targetScale.x.toFixed(5)},${targetScale.y.toFixed(5)},${targetScale.z.toFixed(5)}`)
      setData(canvas, 'motherboardTargetTransformVerified', transformError < 0.0001)

      const trayNodes = []
      caseModel.traverse((object) => {
        if (object.name.includes('MotherboardTray')) trayNodes.push(object)
      })
      const tray = trayNodes.find((object) => object.isMesh) || trayNodes[0] || null
      setData(canvas, 'caseMotherboardTrayNodes', trayNodes.map((object) => object.name).join('|'))
      if (tray) {
        motherboardTrayBounds = new THREE.Box3().setFromObject(tray)
        setData(canvas, 'motherboardTrayBounds', [motherboardTrayBounds.min.x, motherboardTrayBounds.min.y, motherboardTrayBounds.min.z, motherboardTrayBounds.max.x, motherboardTrayBounds.max.y, motherboardTrayBounds.max.z].map((value) => value.toFixed(5)).join(','))
      }

      const caseMount = findObject(caseModel, (object) => object.name.startsWith('CASE_MOUNT_Motherboard'))
      if (caseMount) {
        caseMount.updateMatrixWorld(true)
        const p = caseMount.getWorldPosition(new THREE.Vector3())
        setData(canvas, 'caseMotherboardMount', `${p.x.toFixed(5)},${p.y.toFixed(5)},${p.z.toFixed(5)}`)
      }
      setData(canvas, 'caseModelLoaded', true)
      setData(canvas, 'motherboardModelLoaded', true)
      const caseStats = collectModelStats(caseModel)
      const boardStats = collectModelStats(motherboardModel)
      setData(canvas, 'caseMeshes', caseStats.meshes)
      setData(canvas, 'motherboardMeshes', boardStats.meshes)
      setData(canvas, 'caseTriangles', caseStats.triangles)
      setData(canvas, 'motherboardTriangles', boardStats.triangles)
      setData(canvas, 'caseFilteredNodes', caseModel.userData.filteredNodeCount || 0)
      setData(canvas, 'motherboardFilteredNodes', motherboardModel.userData.filteredNodeCount || 0)

      panelNodes = []
      caseModel.traverse((object) => {
        if (object.name.startsWith('CASE_GlassPanel')) panelNodes.push(object)
      })
      if (!panelNodes.some((object) => object.isMesh)) throw new Error('No independent CASE_GlassPanel geometry was found in the case GLB.')
      panelBaseTransforms = panelNodes.map((object) => object.position.clone())
      setData(canvas, 'glassPanelNodeCount', panelNodes.length)
      setData(canvas, 'glassPanelVisible', true)
      setData(canvas, 'glassPanelRemoved', false)
      setData(canvas, 'panelTransform', panelNodes.map((panel) => panel.position.x.toFixed(5)).join(','))

      const basePosition = motherboardRoot.position.clone()
      motherboardRoot.userData.targetPosition = motherboardRoot.position.clone()
      motherboardRoot.userData.targetQuaternion = motherboardRoot.quaternion.clone()
      motherboardRoot.userData.targetScale = motherboardRoot.scale.clone()
      motherboardRoot.position.x = TARGET_POSITION.x - 0.18
      motherboardRoot.userData.stagePosition = motherboardRoot.position.clone()
      motherboardRoot.visible = false
      setData(canvas, 'motherboardTargetTransform', `${basePosition.x.toFixed(5)},${basePosition.y.toFixed(5)},${basePosition.z.toFixed(5)}`)
      setData(canvas, 'motherboardStageTransform', `${motherboardRoot.position.x.toFixed(5)},${motherboardRoot.position.y.toFixed(5)},${motherboardRoot.position.z.toFixed(5)}`)

      // Validate the corrected exported fit using the actual nine board markers,
      // nine chassis standoffs, target transform, and corrected tray thickness.
      const stagedVisibility = motherboardRoot.visible
      motherboardRoot.visible = true
      motherboardRoot.position.copy(TARGET_POSITION)
      motherboardRoot.updateMatrixWorld(true)
      const fitHoles = []
      const standoffs = []
      motherboardModel.traverse((object) => { if (object.name.startsWith('MB_MountingHole_')) fitHoles.push(object) })
      caseModel.traverse((object) => { if (object.name.startsWith('CASE_Standoff_ATX_')) standoffs.push(object) })
      const holePositions = fitHoles.map((object) => object.getWorldPosition(new THREE.Vector3()))
      const standoffPositions = standoffs.map((object) => object.getWorldPosition(new THREE.Vector3()))
      const holeErrors = holePositions.map((hole) => Math.min(...standoffPositions.map((standoff) => hole.distanceTo(standoff))))
      const maxHoleError = holeErrors.length && standoffPositions.length ? Math.max(...holeErrors) : Infinity
      const trayThicknessMm = motherboardTrayBounds ? (motherboardTrayBounds.max.x - motherboardTrayBounds.min.x) * 1000 : Infinity
      const boardFitValidated = transformError < 0.0001 && holePositions.length === 9 && standoffPositions.length === 9 && maxHoleError < 0.0015 && trayThicknessMm <= 1.5
      motherboardRoot.position.x = TARGET_POSITION.x - 0.18
      motherboardRoot.visible = stagedVisibility
      motherboardRoot.updateMatrixWorld(true)
      setData(canvas, 'boardTrayClearanceGuard', 'validated')
      setData(canvas, 'boardSafeRootX', TARGET_POSITION.x.toFixed(5))
      setData(canvas, 'boardTrayBarrierGapMm', '0.00')
      setData(canvas, 'boardTargetFitStatus', boardFitValidated ? 'validated-mounted' : 'requires-manual-review')
      setData(canvas, 'boardMountingMaxErrorMm', Number.isFinite(maxHoleError) ? (maxHoleError * 1000).toFixed(3) : '')
      setData(canvas, 'boardTrayThicknessMm', Number.isFinite(trayThicknessMm) ? trayThicknessMm.toFixed(3) : '')

      motherboardRoot.position.copy(motherboardRoot.userData.targetPosition)
      motherboardRoot.visible = true
      motherboardRoot.updateMatrixWorld(true)
      motherboardModel.updateMatrixWorld(true)
      const holes = []
      motherboardModel.traverse((object) => {
        if (object.name.startsWith('MB_MountingHole_')) holes.push(object)
      })
      motherboardRoot.position.x = TARGET_POSITION.x - 0.18
      motherboardRoot.userData.stagePosition = motherboardRoot.position.clone()
      motherboardRoot.visible = false
      motherboardRoot.updateMatrixWorld(true)
      const highlightBox = new THREE.Box3()
      boardHighlight = new THREE.Box3Helper(highlightBox, 0xd3ad67)
      boardHighlight.name = 'GUIDED_ACTIVE_MOTHERBOARD_HIGHLIGHT'
      boardHighlight.material.transparent = true
      boardHighlight.material.opacity = 0.75
      boardHighlight.material.depthTest = false
      boardHighlight.visible = false
      scene.add(boardHighlight)
      setData(canvas, 'motherboardMountingMarkerCount', holes.length)
      setData(canvas, 'motherboardRootName', motherboardRoot.name)
      setData(canvas, 'motherboardOrientationVerified', transformError < 0.0001)
      setData(canvas, 'motherboardMountingMarkerLayout', holes.length === 9 ? '9-hole ATX layout' : `found-${holes.length}`)
      setData(canvas, 'boardInstalled', false)
      setData(canvas, 'boardTransformState', 'staging')
      setData(canvas, 'boardPreviewState', 'hidden')
      setData(canvas, 'boardFitPreview', false)
      if (startDisassemblyInstalled) {
        for (let index = 0; index < panelNodes.length; index += 1) {
          panelNodes[index].position.x = panelBaseTransforms[index].x - PANEL_REMOVAL_DISTANCE
          panelNodes[index].visible = false
        }
        glassRemoved = true
        motherboardRoot.position.copy(motherboardRoot.userData.targetPosition)
        motherboardRoot.visible = true
        boardInstalled = true
        for (const [key, root] of Object.entries(componentRoots)) {
          root.position.copy(root.userData.targetPosition)
          root.visible = true
          root.updateMatrixWorld(true)
          setData(canvas, `${key}Installed`, true)
          setData(canvas, `${key}TransformState`, 'installed')
        }
        setData(canvas, 'glassPanelRemoved', true)
        setData(canvas, 'glassPanelVisible', false)
        setData(canvas, 'motherboardVisible', true)
        setData(canvas, 'boardInstalled', true)
        setData(canvas, 'boardTransformState', 'mounted')
        setData(canvas, 'boardPreviewState', 'installed')
        setData(canvas, 'panelTransform', panelNodes.map((panel) => panel.position.x.toFixed(5)).join(','))
      }
      setData(canvas, 'loadState', 'loaded')
      setData(canvas, 'caseAndBoardFrame', 'shared-blender-world')
      setData(canvas, 'caseSourceUrl', CASE_URL)
      setData(canvas, 'motherboardSourceUrl', MOTHERBOARD_URL)
      hooks.onLoaded?.({ caseStats, boardStats, transform: basePosition.toArray(), mountCount: holes.length })
      draw()
      return true
    })().catch((error) => {
      if (caseModel) assets.release(caseModel)
      if (motherboardModel) assets.release(motherboardModel)
      caseModel = null
      motherboardModel = null
      motherboardRoot = null
      for (const key of Object.keys(componentModels)) delete componentModels[key]
      for (const key of Object.keys(componentRoots)) delete componentRoots[key]
      panelNodes = []
      panelBaseTransforms = []
      motherboardTrayBounds = null
      if (boardHighlight) {
        scene.remove(boardHighlight)
        boardHighlight.geometry.dispose()
        boardHighlight.material.dispose()
      }
      boardHighlight = null
      loadPromise = null
      setData(canvas, 'loadState', 'error')
      setData(canvas, 'caseModelLoaded', false)
      setData(canvas, 'motherboardModelLoaded', false)
      throw error
    })
    return loadPromise
  }

  function setMode(nextMode) {
    mode = nextMode === 'stereo' ? 'stereo' : 'normal'
    controls.enabled = mode === 'normal' && !activeAnimation
    setData(canvas, 'renderMode', mode)
    guidedHands.setVisible(mode === 'stereo')
    draw()
  }

  function setActive(nextActive) {
    active = Boolean(nextActive)
    const shouldRun = active && !document.hidden && !disposed
    setData(canvas, 'rendererActive', shouldRun)
    rafStopped = !shouldRun
    if (shouldRun) lifecycle.start()
    else lifecycle.stop()
  }

  function animateTransition(name, direction) {
    if (disposed || activeAnimation) return Promise.resolve({ ok: false, message: 'Wait for the current animation to finish.' })
    const forward = direction === 'forward'
    let from
    let to
    if (name === 'case-panel') {
      if (!panelNodes.length) return Promise.resolve({ ok: false, message: 'The removable glass-panel geometry is missing.' })
      from = panelNodes.map((panel) => panel.position.x)
      to = panelBaseTransforms.map((position) => position.x + (forward ? -PANEL_REMOVAL_DISTANCE : 0))
      if (forward) {
        for (const panel of panelNodes) panel.visible = true
        setData(canvas, 'glassPanelRemoving', true)
      }
      if (!forward) for (const panel of panelNodes) panel.visible = true
      setHandPose('reach')
      setData(canvas, 'lastAnimationHandPose', 'reach')
    } else if (name === 'motherboard-install') {
      if (!motherboardRoot || canvas.dataset.boardTargetFitStatus !== 'validated-mounted') {
        return Promise.resolve({ ok: false, message: 'The corrected motherboard fit did not pass the nine-hole, standoff, tray, and transform checks.' })
      }
      motherboardRoot.visible = true
      from = motherboardRoot.position.x
      to = forward ? TARGET_POSITION.x : motherboardRoot.userData.stagePosition.x
      motherboardRoot.updateMatrixWorld(true)
      if (boardHighlight) {
        boardHighlight.box.setFromObject(motherboardModel)
        boardHighlight.visible = false
      }
      setHandPose('grip')
      setData(canvas, 'lastAnimationHandPose', 'grip')
    } else if (componentRoots[name]) {
      const root = componentRoots[name]
      const config = COMPONENT_CONFIG[name]
      if (!root || !config) return Promise.resolve({ ok: false, message: `The ${name} component is missing from the guided scene.` })
      root.visible = true
      from = root.position.x
      to = forward ? root.userData.targetPosition.x : root.userData.stagePosition.x
      setHandPose('grip')
      setData(canvas, 'lastAnimationHandPose', 'grip')
    } else {
      return Promise.resolve({ ok: false, message: `Unknown guided animation: ${name}.` })
    }

    controls.enabled = false
    setData(canvas, 'guidedAnimationState', `${name}-${direction}`)
    setData(canvas, 'guidedAnimationStatus', 'running')
    return new Promise((resolve) => {
      activeAnimation = { name, direction, from, to, elapsed: 0, duration: TRANSITION_DURATION_MS, resolve }
    })
  }

  function setCameraView() {
    controls.enabled = mode === 'normal' && !activeAnimation
    const wasDamping = controls.enableDamping
    controls.enableDamping = false
    controls.target.set(0, 0.225, 0)
    camera.position.set(-0.78, 0.59, 0.83)
    camera.lookAt(controls.target)
    controls.update()
    controls.enableDamping = wasDamping
    draw()
  }

  setData(canvas, 'caseModelLoaded', false)
  setData(canvas, 'motherboardModelLoaded', false)
  setData(canvas, 'rendererActive', true)
  setData(canvas, 'renderMode', 'normal')
  setData(canvas, 'boardInstalled', false)
  setData(canvas, 'guidedAnimationState', 'idle')
  setData(canvas, 'guidedAnimationStatus', 'idle')
  setData(canvas, 'motherboardVisible', false)

  return {
    scene, camera, controls, load, resize, setMode, setActive, animateTransition, setCameraView, setHandPose,
    get mode() { return mode },
    get isLoaded() { return Boolean(caseModel && motherboardModel && componentModels.cpu && componentModels.ram && componentModels.cooler) },
    get boardInstalled() { return boardInstalled },
    get boardPreviewActive() { return boardPreviewActive },
    get glassRemoved() { return glassRemoved },
    dispose() {
      if (disposed) return
      disposed = true
      if (activeAnimation) {
        const animation = activeAnimation
        activeAnimation = null
        animation.resolve({ ok: false, message: 'The scene closed before the animation finished.' })
      }
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', visibilityChange)
      lifecycle.dispose()
      if (boardHighlight) {
        boardHighlight.geometry.dispose()
        boardHighlight.material.dispose()
      }
      guidedHands.dispose()
      assets.clear()
      scene.clear()
    },
  }
}
