import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export function createCameraControls(camera, canvas) {
  const controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  return controls
}
