export function createSceneLifecycle(renderer, scene, camera, controls, renderFrame = () => renderer.render(scene, camera)) {
  let frame = 0
  let disposed = false

  const draw = () => {
    if (disposed) return
    controls?.update()
    renderFrame()
    frame = window.requestAnimationFrame(draw)
  }

  return {
    start() { if (!frame && !disposed) draw() },
    stop() { if (frame) window.cancelAnimationFrame(frame); frame = 0 },
    dispose() {
      disposed = true
      this.stop()
      controls?.dispose()
      renderer.dispose()
    },
  }
}
