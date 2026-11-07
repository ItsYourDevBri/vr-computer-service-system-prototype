import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { createHardwareViewer } from './viewer.js'

export const threeRuntime = Object.freeze({
  revision: THREE.REVISION,
  createViewer: createHardwareViewer,
  addons: Object.freeze({ GLTFLoader, OrbitControls }),
  status: 'multi-model-hardware-viewer-ready',
})
