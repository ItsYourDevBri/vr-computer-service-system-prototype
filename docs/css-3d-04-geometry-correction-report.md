# CSS-3D-04 Geometry Correction Report

## Scope

This phase completes the verified case + motherboard portion of the guided activity. CPU, cooler, RAM, GPU, storage, PSU, cable, and other hardware installation phases remain outside the scope.

The original `blender_assets/ATX_Mid_Tower_Master.blend` and all original GLBs were preserved. Blender MCP was unavailable, so the correction was applied to versioned GLB exports with a reproducible Node script: `scripts/apply-motherboard-fit-correction.mjs`. The correction manifest is `blender_assets/motherboard_fit_correction_manifest.json`.

## Original defects

- The motherboard component side faced away from the negative-X tempered-glass access side.
- `CASE_MotherboardTray.001` was a closed slab approximately 7.34 mm thick, blocking the board insertion path.
- The nine motherboard markers were offset from the case ATX standoff line by approximately 4.5 mm in X.
- The authored board root was at `(-0.0815, 0.285, -0.03)` in the exported Three.js frame and used a mirrored effective scale.
- The existing browser flow stopped at a conservative tray barrier and never recorded an installed state.

## Corrected exports

The versioned exports are:

- `blender_assets/optimized_glb/computer_case_motherboard_fit.glb`
- `blender_assets/optimized_glb/motherboard_motherboard_fit.glb`
- `public/assets/hardware/optimized_glb/computer_case_motherboard_fit.glb`
- `public/assets/hardware/optimized_glb/motherboard_motherboard_fit.glb`

The case tray footprint and mounting plane are preserved while the tray thickness is reduced to approximately 0.92 mm, leaving a physical mounting plate instead of a solid insertion barrier. The motherboard root is corrected to `[1, -1, -1]` with target position `(-0.09, 0.285, -0.03)`. The tray and nine ATX standoffs are shifted together toward the service side, keeping every marker aligned while placing the component face in the open-panel view.

## Runtime validation

The Three.js viewer now loads the corrected exports and validates the actual scene before enabling installation:

- target world position, quaternion, and scale;
- nine motherboard mounting markers;
- nine `CASE_Standoff_ATX_` nodes;
- maximum nearest-marker error;
- corrected tray thickness.

The installation gate reports `data-board-target-fit-status="validated-mounted"` only when all checks pass. The board is never marked installed by UI state alone.

## Guided sequence

Assembly now runs:

1. Remove the tempered-glass panel.
2. Move the motherboard into the validated mounted position.

Disassembly starts from that installed state and runs the reverse sequence:

1. Move the motherboard away from the standoffs to a visible staging position.
2. Reattach the tempered-glass panel.

Previous, Next, Replay, and Reset continue to operate through the shared `createGuidedSequence` state machine. A failed transition does not advance the cursor. Normal 3D and stationary stereo use the same scene state and application-controlled technician hands.

## Visual evidence

The Playwright guided-assembly capture suite writes browser screenshots to `artifacts/css-ma-01/after/`. The updated captures include:

- `assembly-initial.png`
- `assembly-glass-removed.png`
- `assembly-motherboard-staged.png`
- `assembly-motherboard-installed.png`
- `assembly-mobile-landscape-stereo-board-installed.png`
- `disassembly-initial.png`
- `disassembly-motherboard-removed.png`
- `disassembly-stereo-motherboard-removed.png`

These are browser captures of the corrected GLBs, not mockups.

## Verification

- `npm run validate:js` — PASS.
- `npm run build` — PASS. Vite reports the existing large Three.js chunk advisory.
- Focused Playwright installation and disassembly checks — PASS, 2/2.
- Focused capture check — PASS, including installed, staged, and stereo browser renders.

## Remaining blockers

The Blender MCP connection was unavailable, so the original `.blend` source was intentionally not rewritten. The corrected runtime exports are versioned and reproducible, but a Blender-authored source save and mechanical rear-I/O aperture validation still require an available Blender session. The board installation is enabled only for the corrected case + motherboard scope; later hardware phases remain blocked by design.

## Files changed

- `scripts/apply-motherboard-fit-correction.mjs`
- `blender_assets/motherboard_fit_correction_manifest.json`
- `blender_assets/optimized_glb/computer_case_motherboard_fit.glb`
- `blender_assets/optimized_glb/motherboard_motherboard_fit.glb`
- `public/assets/hardware/optimized_glb/computer_case_motherboard_fit.glb`
- `public/assets/hardware/optimized_glb/motherboard_motherboard_fit.glb`
- `src/three/assembly-viewer.js`
- `src/activities/assembly-controller.js`
- `src/activities/activity-shell.js`
- `tests/guided-assembly.spec.js`
- `docs/css-3d-04-geometry-correction-report.md`
