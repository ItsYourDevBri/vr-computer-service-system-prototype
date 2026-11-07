import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export function createModelLoader(manager) {
  const loader = new GLTFLoader(manager)
  return {
    load(url) { return loader.loadAsync(url) },
    parse(data, basePath = '') { return loader.parseAsync(data, basePath) },
  }
}
