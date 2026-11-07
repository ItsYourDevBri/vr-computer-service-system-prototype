import * as THREE from 'three'
import { createModelLoader } from './model-loader.js'

function disposeObjectResources(root, { disposeShared = false, ownedMaterials = [] } = {}) {
  const geometries = new Set()
  const materials = new Set()
  const textures = new Set()
  const owned = new Set(ownedMaterials)
  root.traverse((object) => {
    if (!object.isMesh) return
    if (disposeShared && object.geometry) geometries.add(object.geometry)
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      if (material && (disposeShared || owned.has(material))) materials.add(material)
      if (disposeShared && material) {
        for (const value of Object.values(material)) {
          if (value?.isTexture) textures.add(value)
        }
      }
    }
  })
  for (const geometry of geometries) geometry.dispose()
  for (const material of materials) material.dispose()
  for (const texture of textures) texture.dispose()
}

function applyTemporaryFanMaterialCorrection(scene) {
  const fanColors = new Map([
    ['MAT_TempFanVisibleBlade', '#11171d'],
    ['MAT_TempFanVisibleFrame', '#090c10'],
    ['MAT_TempFanVisibleHub', '#171d24'],
    ['MAT_TempFanVisibleRing', '#0b0f14'],
  ])
  const copies = new Map()
  scene.traverse((object) => {
    if (!object.isMesh) return
    const source = Array.isArray(object.material) ? object.material : [object.material]
    const corrected = source.map((material) => {
      const color = fanColors.get(material?.name)
      if (!color) return material
      if (!copies.has(material)) {
        const copy = material.clone()
        copy.color.set(color)
        copy.roughness = 0.68
        copy.metalness = 0.06
        copy.emissive?.set('#000000')
        copies.set(material, copy)
      }
      return copies.get(material)
    })
    object.material = Array.isArray(object.material) ? corrected : corrected[0]
  })
  return {
    names: [...copies.keys()].map((material) => material.name),
    ownedMaterials: [...copies.values()],
  }
}

export class HardwareAssetManager {
  constructor() {
    this.loadingManager = new THREE.LoadingManager()
    this.loader = createModelLoader(this.loadingManager)
    this.cache = new Map()
    this.activeScenes = new Map()
  }

  async load(url, { excludeNodePrefixes = [], correctTemporaryFans = false } = {}) {
    let entry = this.cache.get(url)
    if (!entry) {
      entry = { url, refs: 0, promise: this.loader.load(url) }
      this.cache.set(url, entry)
    }

    let gltf
    try {
      gltf = await entry.promise
    } catch (error) {
      if (this.cache.get(url) === entry) this.cache.delete(url)
      throw error
    }

    const scene = gltf.scene.clone(true)
    let filteredNodeCount = 0
    if (excludeNodePrefixes.length) {
      const excluded = []
      scene.traverse((object) => {
        if (excludeNodePrefixes.some((prefix) => object.name.startsWith(prefix))) excluded.push(object)
      })
      filteredNodeCount = excluded.length
      for (const object of excluded) object.parent?.remove(object)
    }
    scene.userData.filteredNodeCount = filteredNodeCount
    const materialCorrection = correctTemporaryFans ? applyTemporaryFanMaterialCorrection(scene) : { names: [], ownedMaterials: [] }
    scene.userData.correctedMaterialNames = materialCorrection.names
    scene.userData.ownedMaterials = materialCorrection.ownedMaterials

    entry.refs += 1
    this.activeScenes.set(scene, entry)
    return scene
  }

  release(scene) {
    if (!scene) return
    const entry = this.activeScenes.get(scene)
    this.activeScenes.delete(scene)
    scene.parent?.remove(scene)
    if (entry) {
      entry.refs = Math.max(0, entry.refs - 1)
      const disposeShared = entry.refs === 0
      disposeObjectResources(scene, { disposeShared, ownedMaterials: scene.userData.ownedMaterials || [] })
      if (disposeShared && this.cache.get(entry.url) === entry) this.cache.delete(entry.url)
    } else {
      disposeObjectResources(scene, { ownedMaterials: scene.userData.ownedMaterials || [] })
    }
  }

  clear() {
    for (const scene of [...this.activeScenes.keys()]) this.release(scene)
    this.cache.clear()
  }
}
