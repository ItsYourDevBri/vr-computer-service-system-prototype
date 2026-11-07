# CSS-3D-02B — Hardware Exploration QA (Historical)

This report records the CSS-3D-02B implementation and test results. CSS-3D-02C supersedes its portrait behavior: phones now require landscape orientation, with no Normal 3D continuation in portrait. See [Landscape Workspace QA](landscape-workspace-qa.md) for current orientation behavior and evidence.

## Result

Hardware Exploration loads all 11 optimized component GLBs from the served asset directory and renders each through the same Three.js viewer. Playwright verified selection, model-specific framing, orbit, zoom, reset, Normal 3D and stationary left/right stereo presentation. Phone portrait fallback, compact landscape drawers, orientation messaging, and navigation also passed.

This phase renders isolated components. It does not validate assembled fit, collision, removal paths, physical dimensions, or Blender scene integrity. Assembly and Disassembly remain shell-only.

The Blender MCP add-on was unavailable during this phase (`Connection to Blender lost: Broken pipe`, followed by `Not connected to Blender`). Browser captures below are Three.js render outputs of the supplied GLBs, not Blender-rendered stills. No Blender project or source GLB was changed. Each served asset was checked against its source by SHA-256 and is byte-identical.

## Per-model rendering and performance

Bounds are the runtime GLB scene bounds in X × Y × Z order, in millimetres. Meshes, triangles, materials, and draw calls are observed from the filtered runtime clone in the browser. Draw calls are for the isolated model in Normal 3D; stereo renders two views. GLB triangle totals are accessor-derived and may differ from renderer totals because glTF material groups can submit the same geometry through multiple draw calls.

| Component | GLB size | Runtime meshes | Runtime triangles | Materials | Normal draw calls | Bounds (mm) | Notes |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Computer Case | 988.2 KiB | 99 | 9,420 | 12 | 199 | 210 × 460 × 465 | 55 stray Optical Drive nodes filtered; temporary blue fan materials neutralized at runtime. |
| Motherboard | 725.0 KiB | 197 | 3,708 | 11 | 197 | 26 × 308 × 258 | 55 stray Optical Drive nodes filtered. Highest mesh/draw-call cost. |
| CPU | 540.3 KiB | 11 | 3,212 | 5 | 11 | 4.8 × 45 × 37.8 | 55 stray Optical Drive nodes and one `CPU_Render_Ground` mesh filtered. Resulting bounds are close to the intended 4.4 × 37.5 × 45 mm envelope. |
| CPU Cooler | 571.0 KiB | 39 | 6,688 | 5 | 39 | 115.5 × 123.4 × 120 | 55 stray Optical Drive nodes filtered. Export bounds differ from the 120 × 75 × 158 mm illustrative envelope; source fit is not validated here. |
| RAM | 724.8 KiB | 130 | 6,456 | 6 | 130 | 31.8 × 133.8 × 29.1 | 55 stray Optical Drive nodes filtered. Bounds cover both modules together. |
| GPU | 711.0 KiB | 112 | 4,360 | 11 | 112 | 64 × 137 × 330 | 55 stray Optical Drive nodes filtered. The runtime camera presents the dual-fan face. |
| SSD | 381.0 KiB | 38 | 6,860 | 6 | 38 | 10.3 × 70 × 116.4 | Bounds include modeled connector geometry; reference target is about 7 × 69.9 × 100 mm. |
| HDD | 383.0 KiB | 39 | 6,864 | 7 | 39 | 36 × 117 × 163.9 | Bounds include modeled cover/inspection geometry; reference target is about 26.1 × 101.6 × 147 mm. |
| PSU | 1,182.6 KiB | 108 | 34,376 | 9 | 108 | 165 × 335.1 × 326.5 | Bounds include cable geometry and materially exceed a PSU enclosure envelope; cables dominate the isolated framing. |
| Case Fans | 270.3 KiB | 92 | 4,896 | 8 | 92 | 120 × 387 × 487.9 | Bounds span the front fan set and rear fan together. |
| Optical Drive | 358.6 KiB | 49 | 6,472 | 9 | 49 | 395 × 183.3 × 221.3 | Standalone only. Open tray/disc geometry dominates framing; no chassis installation was attempted. |

The 11 files total **6,999,292 bytes (6.68 MiB)** with **zero embedded textures**. The runtime viewer loads one component at a time. Summed isolated model statistics are 914 mesh objects, 93,312 geometry triangles, and approximately 1,014 normal-view draw calls if all renderable meshes were displayed at once. This is a future assembled-view performance risk, especially the motherboard and case, despite the modest file sizes.

## Runtime-only handling of export contamination

The source exports for Computer Case, Motherboard, CPU, CPU Cooler, RAM, and GPU each include 55 nodes named with the `OPTICAL_` prefix. The standalone Optical Drive GLB is separately served intact. Hardware Exploration removes those named nodes from cloned scenes only. It also filters the CPU's non-component ground plane and recolors the case's temporary blue fan placeholder materials on cloned runtime materials. Source Blender files and original/optimized GLBs remain unchanged.

## Screenshots

Each component has an actual Three.js browser capture in both modes:

| Component | Normal 3D | Stereo |
| --- | --- | --- |
| Computer Case | [PNG](../artifacts/css-3d-02b/after/hardware-models/computer-case-normal.png) | [PNG](../artifacts/css-3d-02b/after/hardware-models/computer-case-stereo.png) |
| Motherboard | [PNG](../artifacts/css-3d-02b/after/hardware-models/motherboard-normal.png) | [PNG](../artifacts/css-3d-02b/after/hardware-models/motherboard-stereo.png) |
| CPU | [PNG](../artifacts/css-3d-02b/after/hardware-models/cpu-normal.png) | [PNG](../artifacts/css-3d-02b/after/hardware-models/cpu-stereo.png) |
| CPU Cooler | [PNG](../artifacts/css-3d-02b/after/hardware-models/cpu-cooler-normal.png) | [PNG](../artifacts/css-3d-02b/after/hardware-models/cpu-cooler-stereo.png) |
| RAM | [PNG](../artifacts/css-3d-02b/after/hardware-models/ram-normal.png) | [PNG](../artifacts/css-3d-02b/after/hardware-models/ram-stereo.png) |
| GPU | [PNG](../artifacts/css-3d-02b/after/hardware-models/gpu-normal.png) | [PNG](../artifacts/css-3d-02b/after/hardware-models/gpu-stereo.png) |
| SSD | [PNG](../artifacts/css-3d-02b/after/hardware-models/ssd-normal.png) | [PNG](../artifacts/css-3d-02b/after/hardware-models/ssd-stereo.png) |
| HDD | [PNG](../artifacts/css-3d-02b/after/hardware-models/hdd-normal.png) | [PNG](../artifacts/css-3d-02b/after/hardware-models/hdd-stereo.png) |
| PSU | [PNG](../artifacts/css-3d-02b/after/hardware-models/psu-normal.png) | [PNG](../artifacts/css-3d-02b/after/hardware-models/psu-stereo.png) |
| Case Fans | [PNG](../artifacts/css-3d-02b/after/hardware-models/case-fans-normal.png) | [PNG](../artifacts/css-3d-02b/after/hardware-models/case-fans-stereo.png) |
| Optical Drive | [PNG](../artifacts/css-3d-02b/after/hardware-models/optical-drive-normal.png) | [PNG](../artifacts/css-3d-02b/after/hardware-models/optical-drive-stereo.png) |

Additional app captures:

- [Desktop Hardware Exploration](../artifacts/css-3d-02b/after/workspace/hardware-exploration-desktop.png)
- [Mobile landscape workspace](../artifacts/css-3d-02b/after/workspace/hardware-exploration-mobile-landscape.png)
- [Portrait rotate prompt](../artifacts/css-3d-02b/after/workspace/rotate-your-phone-portrait.png)
- [Portrait Normal 3D fallback](../artifacts/css-3d-02b/after/workspace/hardware-exploration-mobile-portrait-fallback.png)
- [Stationary stereoscopic presentation](../artifacts/css-3d-02b/after/workspace/stereoscopic-vr-view.png)
- [Assembly shell](../artifacts/css-3d-02b/after/workspace/assembly-landscape-shell.png)
- [Disassembly shell](../artifacts/css-3d-02b/after/workspace/disassembly-landscape-shell.png)
- [Raw renderer measurements](../artifacts/css-3d-02b/after/hardware-models/renderer-stats.json)

## Verification

- `npm run validate:js` — PASS (25 JavaScript files).
- `npm run lint` — PASS.
- `npm run build` — PASS. Vite warns that the lazy Three.js runtime chunk is about 646.2 kB minified / 161.5 kB gzip, over its 500 kB advisory threshold; it is dynamically loaded after opening Hardware Exploration.
- `PLAYWRIGHT_PREVIEW=1 npm run test:e2e` — PASS (33/33 tests).
- All 11 GLBs returned HTTP 200, produced non-empty renderable geometry and materials, and passed selection, framing, camera controls, and stereo assertions.
- Layout coverage passed for desktop, tablet, phone landscape, portrait fallback, and unsupported orientation-lock behavior.
- No assembly, fit, mechanical-intersection, Blender-render, physical-headset, or WebXR validation was performed.

## Recommended follow-up

The viewer phase is ready for review. Before using these exports as scale-accurate assembly models or rendering a simultaneous full PC, clean up the contaminated exports in Blender, re-export each clean component, and verify component scale and assembled clearances. In particular, inspect the CPU Cooler, SSD/HDD, PSU cable envelope, and Optical Drive dimensions. Those source-level corrections were outside this phase and were not silently changed.
