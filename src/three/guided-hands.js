import * as THREE from 'three'

const HANDS_URL = '/assets/hardware/assembly_hands.glb'

const poseTargets = {
  rest: { x: 0.305, y: -0.24, z: -0.72, yaw: 0.52, curl: 0.08, thumb: 0.1 },
  released: { x: 0.305, y: -0.24, z: -0.72, yaw: 0.52, curl: 0.04, thumb: 0.05 },
  reach: { x: 0.22, y: -0.15, z: -0.64, yaw: 0.34, curl: 0.2, thumb: 0.16 },
  grip: { x: 0.18, y: -0.105, z: -0.57, yaw: 0.22, curl: 0.78, thumb: 0.62 },
}

function setData(canvas, key, value) {
  const text = String(value)
  if (canvas.dataset[key] !== text) canvas.dataset[key] = text
}

function findObject(root, name) {
  let found = null
  root.traverse((object) => {
    if (!found && object.name === name) found = object
  })
  return found
}

/** Application-animated first-person hands shared by guided service activities. */
export function createGuidedHands({ camera, assetManager, canvas, onError }) {
  let asset = null
  let roots = []
  let pose = 'rest'
  let shouldBeVisible = false
  let disposed = false
  let request = null

  async function ensureLoaded() {
    if (asset || disposed) return asset
    if (request) return request
    setData(canvas, 'handsLoadState', 'loading')
    request = assetManager.load(HANDS_URL).then((loaded) => {
      if (disposed) {
        assetManager.release(loaded)
        return null
      }
      asset = loaded
      asset.name = 'GUIDED_VIRTUAL_TECHNICIAN_HANDS'
      camera.add(asset)
      try {
        roots = ['L', 'R'].map((side) => {
          const root = findObject(asset, `HAND_${side}_ROOT`)
          if (!root) throw new Error(`The virtual-hands GLB is missing HAND_${side}_ROOT.`)
          root.userData.side = side
          root.rotation.x = Math.PI / 2
          return root
        })
      } catch (error) {
        assetManager.release(asset)
        asset = null
        roots = []
        throw error
      }
      asset.visible = shouldBeVisible
      setData(canvas, 'handsLoadState', 'loaded')
      setData(canvas, 'handRootCount', roots.length)
      let handMeshes = 0
      asset.traverse((object) => { if (object.isMesh) handMeshes += 1 })
      setData(canvas, 'handMeshCount', handMeshes)
      setData(canvas, 'handsVisible', shouldBeVisible)
      setPose(pose)
      return asset
    }).catch((error) => {
      setData(canvas, 'handsLoadState', 'error')
      onError?.(error)
      throw error
    }).finally(() => { request = null })
    return request
  }

  function setPose(nextPose) {
    pose = Object.hasOwn(poseTargets, nextPose) ? nextPose : 'rest'
    setData(canvas, 'handPose', pose)
  }

  function setVisible(visible) {
    shouldBeVisible = Boolean(visible)
    if (visible) {
      if (asset) {
        asset.visible = true
        setData(canvas, 'handsVisible', true)
      } else void ensureLoaded().catch(() => {})
      return
    }
    if (asset) asset.visible = false
    setData(canvas, 'handsVisible', false)
  }

  function update(deltaSeconds) {
    if (!asset?.visible || roots.length !== 2) return
    const target = poseTargets[pose] || poseTargets.rest
    const alpha = 1 - Math.exp(-deltaSeconds * 8)
    for (const hand of roots) {
      const sign = hand.userData.side === 'L' ? -1 : 1
      hand.position.x = THREE.MathUtils.lerp(hand.position.x, target.x * sign, alpha)
      hand.position.y = THREE.MathUtils.lerp(hand.position.y, target.y, alpha)
      hand.position.z = THREE.MathUtils.lerp(hand.position.z, target.z, alpha)
      hand.rotation.x = THREE.MathUtils.lerp(hand.rotation.x, Math.PI / 2, alpha)
      hand.rotation.y = THREE.MathUtils.lerp(hand.rotation.y, 0, alpha)
      hand.rotation.z = THREE.MathUtils.lerp(hand.rotation.z, target.yaw * sign, alpha)
      hand.traverse((object) => {
        if (!object.isObject3D || !object.name) return
        if (/_(Pinky|Ring|Middle|Index)$/.test(object.name)) {
          object.rotation.x = THREE.MathUtils.lerp(object.rotation.x, target.curl * 0.3, alpha)
        } else if (/_MiddleJoint$/.test(object.name)) {
          object.rotation.x = THREE.MathUtils.lerp(object.rotation.x, target.curl * 0.56, alpha)
        } else if (/_DistalJoint$/.test(object.name)) {
          object.rotation.x = THREE.MathUtils.lerp(object.rotation.x, target.curl * 0.42, alpha)
        } else if (/_Thumb$/.test(object.name)) {
          object.rotation.x = THREE.MathUtils.lerp(object.rotation.x, target.thumb * 0.46, alpha)
        } else if (/_ThumbTipJoint$/.test(object.name)) {
          object.rotation.x = THREE.MathUtils.lerp(object.rotation.x, target.thumb * 0.35, alpha)
        }
      })
    }
  }

  function dispose() {
    if (disposed) return
    disposed = true
    shouldBeVisible = false
    if (asset) assetManager.release(asset)
    asset = null
    roots = []
    setData(canvas, 'handsVisible', false)
  }

  setData(canvas, 'handsLoadState', 'idle')
  return { setPose, setVisible, update, dispose, get isLoaded() { return Boolean(asset) }, get pose() { return pose } }
}
