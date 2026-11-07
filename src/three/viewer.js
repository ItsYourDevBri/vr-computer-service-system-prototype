import * as THREE from 'three'
import { caseVrPartForNodeName } from '../data/case-vr-parts.js'
import { createCameraControls } from './camera-controls.js'
import { HardwareAssetManager } from './asset-manager.js'
import { createSceneLifecycle } from './scene-lifecycle.js'

function setData(canvas, key, value) {
  const text = String(value)
  if (canvas.dataset[key] !== text) canvas.dataset[key] = text
}

function collectModelStats(root) {
  const materials = new Set()
  let meshes = 0
  let triangles = 0
  root.traverse((object) => {
    if (!object.isMesh) return
    meshes += 1
    const geometry = object.geometry
    const indexCount = geometry.index?.count ?? geometry.attributes.position?.count ?? 0
    triangles += Math.floor(indexCount / 3)
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      if (material) materials.add(material)
    }
  })
  return { meshes, triangles, materials: materials.size }
}

function setBoundsData(canvas, bounds) {
  const size = bounds.getSize(new THREE.Vector3())
  setData(canvas, 'modelBounds', `${size.x.toFixed(4)},${size.y.toFixed(4)},${size.z.toFixed(4)}`)
}

export function createHardwareViewer(canvas, { background = '#172330' } = {}) {
  const isSmallScreen = window.matchMedia('(max-width: 760px)').matches
  const pixelRatio = Math.min(window.devicePixelRatio || 1, isSmallScreen ? 1.5 : 1.75)
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' })
  renderer.setPixelRatio(pixelRatio)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.18
  renderer.info.autoReset = false

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(background)
  scene.add(new THREE.HemisphereLight(0xdce8ff, 0x48515b, 2.7))

  const keyLight = new THREE.DirectionalLight(0xfff2df, 4.0)
  keyLight.position.set(3.5, 5, 4)
  scene.add(keyLight)

  const fillLight = new THREE.DirectionalLight(0x9ec5ed, 2.2)
  fillLight.position.set(-4, 2, -3)
  scene.add(fillLight)

  const rimLight = new THREE.DirectionalLight(0xffffff, 1.65)
  rimLight.position.set(1, 2, -5)
  scene.add(rimLight)

  const camera = new THREE.PerspectiveCamera(38, 1, 0.0001, 100)
  camera.position.set(2.8, 2.2, 3.5)
  const controls = createCameraControls(camera, canvas)
  controls.enablePan = false
  controls.screenSpacePanning = false
  controls.touches.ONE = THREE.TOUCH.ROTATE
  controls.touches.TWO = THREE.TOUCH.DOLLY_PAN

  const stereoCamera = new THREE.StereoCamera()
  stereoCamera.aspect = 0.5
  const raycaster = new THREE.Raycaster()
  const pointerNdc = new THREE.Vector2()
  const highlightColor = new THREE.Color('#25b8b0')
  const highlightSnapshots = new Map()
  const highlightMaterials = new Set()
  const assets = new HardwareAssetManager()
  const target = new THREE.Vector3()
  const initialPosition = new THREE.Vector3()
  const viewDirection = new THREE.Vector3(0.92, 0.66, 1.08).normalize()
  let mode = 'normal'
  let active = true
  let disposed = false
  let model = null
  let modelRadius = 0.5
  let pendingLoad = null
  let loadSequence = 0
  let lastCameraRevision = 0

  const resize = () => {
    const bounds = canvas.getBoundingClientRect()
    if (!bounds.width || !bounds.height) return
    renderer.setSize(bounds.width, bounds.height, false)
    camera.aspect = bounds.width / bounds.height
    camera.updateProjectionMatrix()
    if (model) draw()
  }

  const draw = () => {
    const bounds = canvas.getBoundingClientRect()
    if (!bounds.width || !bounds.height || disposed) return
    renderer.info.reset()

    if (mode === 'stereo') {
      camera.aspect = bounds.width / bounds.height
      camera.focus = Math.max(camera.position.distanceTo(controls.target), 0.0001)
      camera.updateProjectionMatrix()
      camera.updateMatrixWorld(true)
      stereoCamera.eyeSep = Math.max(0.0001, Math.min(modelRadius * 0.055, 0.064))
      stereoCamera.update(camera)

      const halfWidth = Math.floor(bounds.width / 2)
      renderer.setScissorTest(true)
      renderer.setViewport(0, 0, halfWidth, bounds.height)
      renderer.setScissor(0, 0, halfWidth, bounds.height)
      renderer.clear(true, true, true)
      renderer.render(scene, stereoCamera.cameraL)
      renderer.setViewport(halfWidth, 0, bounds.width - halfWidth, bounds.height)
      renderer.setScissor(halfWidth, 0, bounds.width - halfWidth, bounds.height)
      renderer.clear(true, true, true)
      renderer.render(scene, stereoCamera.cameraR)
      renderer.setScissorTest(false)

      const leftPosition = new THREE.Vector3().setFromMatrixPosition(stereoCamera.cameraL.matrix)
      const rightPosition = new THREE.Vector3().setFromMatrixPosition(stereoCamera.cameraR.matrix)
      setData(canvas, 'stereoEyeSeparation', leftPosition.distanceTo(rightPosition).toFixed(5))
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
  }

  const lifecycle = createSceneLifecycle(renderer, scene, camera, controls, draw)
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(canvas)
  resize()

  const onVisibilityChange = () => {
    const shouldRun = !document.hidden && active
    setData(canvas, 'rendererActive', shouldRun)
    if (shouldRun) lifecycle.start()
    else lifecycle.stop()
  }
  const onContextLost = (event) => {
    event.preventDefault()
    setData(canvas, 'webglState', 'lost')
    setData(canvas, 'rendererActive', false)
    lifecycle.stop()
  }
  const onContextRestored = () => {
    setData(canvas, 'webglState', 'restored')
    resize()
    const shouldRun = active && !document.hidden
    setData(canvas, 'rendererActive', shouldRun)
    if (shouldRun) lifecycle.start()
  }
  document.addEventListener('visibilitychange', onVisibilityChange)
  canvas.addEventListener('webglcontextlost', onContextLost, false)
  canvas.addEventListener('webglcontextrestored', onContextRestored, false)
  controls.addEventListener('change', () => {
    lastCameraRevision += 1
    setData(canvas, 'cameraRevision', lastCameraRevision)
    setData(canvas, 'cameraPosition', `${camera.position.x.toFixed(4)},${camera.position.y.toFixed(4)},${camera.position.z.toFixed(4)}`)
  })
  setData(canvas, 'rendererActive', !document.hidden && active)
  lifecycle.start()

  function frameModel(object, direction = viewDirection, upDirection = [0, 1, 0]) {
    object.updateMatrixWorld(true)
    const initialBounds = new THREE.Box3().setFromObject(object)
    if (initialBounds.isEmpty()) throw new Error('This GLB contains no renderable mesh geometry.')
    const center = initialBounds.getCenter(new THREE.Vector3())
    object.position.sub(center)
    object.updateMatrixWorld(true)

    const bounds = new THREE.Box3().setFromObject(object)
    const sphere = bounds.getBoundingSphere(new THREE.Sphere())
    modelRadius = Math.max(sphere.radius, 0.0001)
    const distance = (modelRadius / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2))) * 1.18
    target.set(0, 0, 0)
    camera.up.set(...upDirection).normalize()
    const framedDirection = direction instanceof THREE.Vector3 ? direction : new THREE.Vector3(...direction)
    framedDirection.normalize()
    camera.position.copy(target).addScaledVector(framedDirection, distance)
    camera.near = Math.max(modelRadius / 400, 0.0001)
    camera.far = Math.max(distance + modelRadius * 16, 10)
    camera.zoom = 1
    camera.updateProjectionMatrix()
    camera.lookAt(target)
    controls.target.copy(target)
    controls.minDistance = modelRadius * 0.65
    controls.maxDistance = modelRadius * 12
    setData(canvas, 'modelRadius', modelRadius.toFixed(5))
    setData(canvas, 'framedDistance', distance.toFixed(5))
    const wasDamping = controls.enableDamping
    controls.enableDamping = false
    controls.update()
    controls.enableDamping = wasDamping
    initialPosition.copy(camera.position)
    controls.saveState()
    setBoundsData(canvas, bounds)
    draw()
  }

  function clearCasePartHighlight() {
    for (const [object, originalMaterial] of highlightSnapshots) object.material = originalMaterial
    for (const material of highlightMaterials) material.dispose()
    highlightSnapshots.clear()
    highlightMaterials.clear()
    setData(canvas, 'highlightedPartMeshCount', 0)
    setData(canvas, 'selectedCasePartId', '')
    if (model) draw()
  }

  function highlightCasePart(partId) {
    clearCasePartHighlight()
    if (!model || !partId) return 0
    let highlightedCount = 0
    model.traverse((object) => {
      if (!object.isMesh || caseVrPartForNodeName(object.name)?.id !== partId) return
      const originalMaterial = object.material
      const originals = Array.isArray(originalMaterial) ? originalMaterial : [originalMaterial]
      const highlighted = originals.map((material) => {
        const copy = material.clone()
        if (copy.color) copy.color.lerp(highlightColor, 0.065)
        if (copy.emissive) {
          copy.emissive.lerp(highlightColor, 0.12)
          copy.emissiveIntensity = Math.max(copy.emissiveIntensity, 0.075)
        }
        highlightMaterials.add(copy)
        return copy
      })
      highlightSnapshots.set(object, originalMaterial)
      object.material = Array.isArray(originalMaterial) ? highlighted : highlighted[0]
      highlightedCount += 1
    })
    setData(canvas, 'selectedCasePartId', highlightedCount ? partId : '')
    setData(canvas, 'highlightedPartMeshCount', highlightedCount)
    draw()
    return highlightedCount
  }

  function isTransparentHit(hit) {
    const material = Array.isArray(hit.object.material)
      ? hit.object.material[hit.face?.materialIndex || 0]
      : hit.object.material
    return Boolean(material && ((material.transparent && material.opacity < 0.99) || material.transmission > 0.05))
  }

  function pickCasePart(clientX, clientY) {
    const bounds = canvas.getBoundingClientRect()
    if (mode !== 'stereo' || !model || clientX < bounds.left || clientX > bounds.right || clientY < bounds.top || clientY > bounds.bottom) return null

    const localX = clientX - bounds.left
    const split = Math.floor(bounds.width / 2)
    const eye = localX < split ? 'left' : 'right'
    const eyeOffset = eye === 'left' ? 0 : split
    const eyeWidth = eye === 'left' ? split : bounds.width - split
    if (!eyeWidth || !bounds.height) return null

    camera.aspect = bounds.width / bounds.height
    camera.focus = Math.max(camera.position.distanceTo(controls.target), 0.0001)
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld(true)
    stereoCamera.eyeSep = Math.max(0.0001, Math.min(modelRadius * 0.055, 0.064))
    stereoCamera.update(camera)
    model.updateMatrixWorld(true)

    pointerNdc.set(
      ((localX - eyeOffset) / eyeWidth) * 2 - 1,
      1 - ((clientY - bounds.top) / bounds.height) * 2,
    )
    const eyeCamera = eye === 'left' ? stereoCamera.cameraL : stereoCamera.cameraR
    // StereoCamera adjusts projectionMatrix directly; keep Raycaster's unprojection inverse in sync.
    eyeCamera.projectionMatrixInverse.copy(eyeCamera.projectionMatrix).invert()
    eyeCamera.updateMatrixWorld(true)
    raycaster.setFromCamera(pointerNdc, eyeCamera)
    const intersections = raycaster.intersectObject(model, true)
    let seeThroughCandidate = null
    for (const intersection of intersections) {
      const part = caseVrPartForNodeName(intersection.object.name)
      if (!part) continue
      const result = { part, meshName: intersection.object.name, eye }
      if (isTransparentHit(intersection)) {
        if (!seeThroughCandidate) seeThroughCandidate = result
        continue
      }
      setData(canvas, 'lastCasePartPick', part.id)
      setData(canvas, 'lastCasePartMesh', intersection.object.name)
      setData(canvas, 'lastCasePartEye', eye)
      return result
    }

    const result = seeThroughCandidate
    setData(canvas, 'lastCasePartPick', result?.part.id || '')
    setData(canvas, 'lastCasePartMesh', result?.meshName || '')
    setData(canvas, 'lastCasePartEye', result?.eye || eye)
    return result
  }

  function releaseCurrentModel() {
    if (!model) return
    clearCasePartHighlight()
    scene.remove(model)
    assets.release(model)
    model = null
    setData(canvas, 'modelId', '')
    setData(canvas, 'modelMeshes', 0)
    setData(canvas, 'modelTriangles', 0)
    setData(canvas, 'modelMaterials', 0)
    setData(canvas, 'modelBounds', '0,0,0')
  }

  async function loadModel(url, { componentId, excludeNodePrefixes = [], correctTemporaryFans = false, viewDirection: componentViewDirection, viewUp } = {}) {
    if (!url) throw new Error('No GLB path is configured for this hardware component.')
    if (model?.userData.hardwareAssetUrl === url) return model
    if (pendingLoad?.url === url) return pendingLoad.promise

    const requestId = ++loadSequence
    releaseCurrentModel()
    setData(canvas, 'modelLoadState', 'loading')
    setData(canvas, 'webglState', 'ready')

    const request = (async () => {
      const object = await assets.load(url, { excludeNodePrefixes, correctTemporaryFans })
      if (disposed || requestId !== loadSequence) {
        assets.release(object)
        return null
      }
      object.userData.hardwareAssetUrl = url
      model = object
      scene.add(model)
      frameModel(model, componentViewDirection || viewDirection, viewUp || [0, 1, 0])
      const stats = collectModelStats(model)
      setData(canvas, 'modelId', componentId || url.split('/').pop().replace(/\.glb$/i, ''))
      setData(canvas, 'modelMeshes', stats.meshes)
      setData(canvas, 'modelTriangles', stats.triangles)
      setData(canvas, 'modelMaterials', stats.materials)
      setData(canvas, 'filteredNodeCount', object.userData.filteredNodeCount || 0)
      setData(canvas, 'correctedMaterialNames', (object.userData.correctedMaterialNames || []).join(','))
      setData(canvas, 'modelLoadState', 'loaded')
      return model
    })()
    const record = { url, promise: request, requestId }
    pendingLoad = record
    try {
      return await request
    } catch (error) {
      if (!disposed && requestId === loadSequence) setData(canvas, 'modelLoadState', 'error')
      throw error
    } finally {
      if (pendingLoad === record) pendingLoad = null
    }
  }

  function resetView() {
    if (!model) return
    const wasDamping = controls.enableDamping
    controls.enableDamping = false
    controls.update()
    controls.reset()
    camera.position.copy(initialPosition)
    controls.target.copy(target)
    camera.zoom = 1
    camera.updateProjectionMatrix()
    camera.lookAt(target)
    controls.update()
    controls.enableDamping = wasDamping
  }

  function setMode(nextMode) {
    mode = nextMode === 'stereo' ? 'stereo' : 'normal'
    controls.enabled = mode === 'normal'
    setData(canvas, 'renderMode', mode)
    if (model) draw()
  }

  function setActive(nextActive) {
    active = Boolean(nextActive)
    const shouldRun = active && !document.hidden
    setData(canvas, 'rendererActive', shouldRun)
    if (shouldRun) lifecycle.start()
    else lifecycle.stop()
  }

  return {
    scene, camera, renderer, controls, assets, loadModel, resize, resetView, setMode, setActive, pickCasePart, highlightCasePart,
    get mode() { return mode },
    get model() { return model },
    dispose() {
      disposed = true
      loadSequence += 1
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      canvas.removeEventListener('webglcontextrestored', onContextRestored)
      lifecycle.dispose()
      releaseCurrentModel()
      assets.clear()
    },
  }
}
