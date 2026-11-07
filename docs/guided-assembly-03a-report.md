# CSS-3D-03A — Guided Assembly Workbench Report

> Historical implementation report. CSS-3D-03A-R replaced the drag-and-snap interaction with reversible step animations. The Blender fit limitation described below remains current; see [the guided animation system](guided-animation-system.md) for the current behavior.

## Outcome

The guided motherboard workbench foundation is implemented. The actual case and motherboard GLBs load in a shared scene, the glass panel can be removed, and the motherboard can be selected and dragged toward its authored reference. The source fit audit found a solid-tray obstruction and an orientation issue, so the workbench stops the board before the tray and records no installation. Step 3 and lesson completion remain disabled until the source geometry is corrected and validated.

This is not a completed motherboard assembly lesson. Disassembly remains a future activity, and no Blender source geometry was changed in this phase.

## Implemented

- A separate Assembly controller and Three.js viewer load the existing case and motherboard GLBs in their exported shared coordinate frame.
- Step 1 animates removal of the independently modeled glass panel. Step 2 exposes the motherboard parts tray, selection, target marker, drag interaction, wrong-placement feedback, and tray barrier.
- The stored motherboard origin is labeled as a reference. A conservative AABB guard stops the dragged board 1 mm before the solid tray; it does not claim triangle-level collision detection.
- A failed fit stays failed: no snap, installed state, Step 3, or lesson completion is recorded.
- Phone portrait follows the established rotate prompt and pauses rendering. Landscape resume preserves the selected part and view mode.
- Normal 3D supports camera orbit, zoom, and reset. Stereo uses stationary left/right projections. Stereo Assembly lazily loads two application-controlled virtual hands, mirrors the same reach/grip poses in both eyes, and hides them in Normal 3D. The hands use no device tracking or WebXR.
- The hand source and export are `blender_assets/assembly_hands.blend` and `public/assets/hardware/assembly_hands.glb`; the hand asset is separate from the PC master project.
- Hardware Exploration remains a separate viewer. This task does not implement Disassembly gameplay.

## Source fit audit

Source Blender file: `blender_assets/ATX_Mid_Tower_Master.blend`. Runtime assets: `public/assets/hardware/optimized_glb/computer_case.glb` and `motherboard.glb`.

The Blender MCP add-on was unavailable. A local Blender 5.2.3 background/read-only inspection and runtime Three.js measurements were used. The master and component GLBs were not saved or modified.

The source coordinate mapping is Three.js `(x, y, z) = Blender (x, z, -y)`. The motherboard root is authored at Blender `(-0.081500, 0.030000, 0.285000)`, quaternion `(0, 1, 0, 0)`, scale `(-1, -1, -1)`; runtime position is `(-0.081500, 0.285000, -0.030000)`. The case motherboard attachment marker is at Blender `(-0.076000, 0.030000, 0.285000)`, runtime `(-0.076000, 0.285000, -0.030000)`.

The motherboard tray is a closed cuboid (8 vertices, 6 faces), with no board opening. Its runtime X bounds are `[-0.089668, -0.082332] m`; the glass is on the negative-X side. The complete motherboard mesh bounds at its authored target are X `[-0.082500, -0.056500] m`. The component side faces away from the glass, while the board approach intersects the tray. The current scene therefore cannot demonstrate a mechanically valid installation.

The conservative drag barrier stops at runtime X `-0.115668 m`, approximately `34.17 mm` before the authored root X `-0.081500 m`. The barrier prevents the board from passing through the tray. It is a user-interaction safety guard, not evidence that the board can be installed. Nine mounting-hole markers are present in the motherboard GLB; alignment with every case standoff has not been certified.

Required source correction: make the tray a mounting surface/opening rather than a solid slab, turn the component face toward the glass, and derive PCB/standoff/hole alignment and an insertion/removal path from the actual case geometry. Re-export and validate clearances before enabling installation.

## Verification

| Check | Result |
| --- | --- |
| JavaScript syntax validation | PASS — `npm run validate:js` (30 files) |
| Lint | PASS — `npm run lint` |
| Production build | PASS — `npm run build` |
| Guided Assembly browser tests | PASS — 6 tests, including real GLB loading, drag guard, fit blocking, stereo hands, portrait pause/resume, and screenshot capture |
| Full project browser suite | PASS — `npm run test:e2e`, 41/41 tests. WebGL drag and screenshot checks retain their original assertions with a 90-second allowance for full-suite renderer load. |
| Blender master / Components 01–02 source edits | None |
| Physical/headset validation | Not performed; this prototype has no WebXR or tracking |

`git diff --check` still reports pre-existing conflict markers in the already-modified root `README.md` (lines 1, 57, 89, 94, 98, 102, 112, 130, and 162). This task did not edit or resolve that unrelated file. The targeted diff whitespace check for files changed by this task passes.

The production build warns that the shared Three.js runtime chunk is approximately 644 kB minified (about 161 kB gzip). This is an existing delivery-size consideration for future WebXR deployment.

## Evidence

Browser-generated captures are in `artifacts/css-3d-03a/after/`:

- `desktop-assembly-workbench.png`
- `initial-case-state.png`
- `mobile-landscape-assembly.png`
- `portrait-rotate-prompt.png`
- `motherboard-available.png`
- `motherboard-selected-target-highlighted.png`
- `vr-hands-resting.png`
- `vr-hand-reaching.png`
- `vr-motherboard-at-tray-barrier.png`
- `normal-3d-hands-hidden.png`
- `motherboard-fit-blocked.png`

The images document the implemented workbench and its blocked fit; they do not depict a completed motherboard installation.
