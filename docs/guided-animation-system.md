# CSS-3D-03A-R Guided Animation System

## Current prototype behavior

Assembly and Disassembly use a shared Three.js scene controller and `createGuidedSequence()` transition helper. Students use Previous, Next Step, Replay Step, and Reset Activity. Hardware is not manually dragged, snapped, scored, or checked for placement through gameplay collision rules. Ordinary camera orbit and zoom remain available between transitions.

The scene and GLBs remain loaded while a step is reversed, replayed, reset, or viewed in stereo. Navigation controls are locked while a transition runs so repeated input cannot move the sequence cursor ahead of the rendered transforms. After each completed or reversed transition, the current instruction and step progress are refreshed from the cursor. If Replay's reverse leg succeeds but its forward leg fails, the cursor is reconciled to the actually rendered reversed state. A rejected or interrupted transition does not silently advance the activity.

## Verified transition sequence

| Activity | Ordered transition | Forward result | Reverse result |
| --- | --- | --- | --- |
| Assembly | `case-panel` | The real glass-panel meshes move out by 120 mm on their authored local X axis and hide at the end. The motherboard reference GLB becomes visible at its authored staging transform. | The panel returns to each saved local position and becomes visible; the motherboard reference returns to hidden. |
| Assembly | `motherboard-fit-preview` | The motherboard moves along the authored X axis from staging toward the tray, then stops at the AABB-derived safe root X. It is labeled as an exploded fit preview and remains uninstalled. | The board returns to its exact staging X while the glass stays removed. |
| Disassembly | `case-panel` | The same verified glass-panel removal animation runs; the unverified motherboard pose stays hidden. | The panel returns to its saved installed transform. |

The source case and motherboard GLBs are loaded from `public/assets/hardware/optimized_glb/`. The motherboard target transform is a Blender-authored reference. The closed motherboard tray is a solid slab and blocks the target, so the board transition is a fit demonstration only. The runtime boundary is calculated as:

```text
safeRootX = tray.minX - boardRelativeBoundsAtTarget.maxX - 0.001 m
```

The `0.001 m` is an AABB guard gap. The existing measured source report places the resulting stop about 34.17 mm before the authored motherboard root X. This is not triangle-level collision certification and does not establish an installable board. The UI never records the motherboard as installed, complete, or reviewed. All further assembly steps remain unavailable.

Hiding the named glass-panel meshes updates the reversible transition state, but the current default camera capture still looks like an opaque case side. The available evidence does not identify whether an underlying frame mesh or viewing direction causes this. Do not claim that the interior is clearly exposed until the case GLB is reviewed.

Disassembly begins with the verified case and glass panel. The motherboard GLB is not shown as installed. Removal steps for the motherboard and other hardware remain unavailable until their assembled poses and paths are verified.

## Reversible state behavior

- **Next Step** animates the transition at the current cursor, then advances the cursor only after success.
- **Previous** reverses the transition immediately before the cursor, then restores the earlier cursor and instruction.
- **Replay Step** reverses and replays the latest completed transition without changing the cursor.
- **Reset Activity** reverses all completed transitions in reverse order and restores the initial component transforms and visibility.
- While a transition is active, Previous, Next, Replay, and Reset are disabled. The sequence helper also rejects concurrent calls as a second guard.
- A transition interrupted by scene disposal resolves unsuccessfully instead of advancing the sequence.
- A failed partial model load releases any successful scene clone and clears the retry state. Shared cached resources remain alive until the final cached scene reference is released; per-scene owned material corrections are disposed with their scene.

Each transition uses an 860 ms smoothstep animation. The panel's local positions and motherboard root are updated in the same Three.js scene rendered to Normal 3D and both fixed stereo eyes. In stereo, the application-controlled hands use reaching for the panel and grip for the board preview, then return to rest. These are static procedural pose changes, not hand tracking.

## Workspace behavior

Assembly and Disassembly retain the phone portrait gate. No scene is initialized on phone portrait entry. If the viewer returns to portrait during use, the render loop pauses; returning to landscape resumes the same scene, viewing mode, and sequence cursor. Normal 3D orbit and zoom use the existing camera controls. Hardware Exploration keeps its separate viewer and controller.

## Future work and limitations

- Correct the Blender tray and motherboard orientation, then validate standoff alignment, panel clearance, and the complete insertion path before replacing the exploded fit preview with an installation.
- Validate each remaining component's source and destination transforms before adding an assembly or disassembly transition.
- The prototype does not implement assembly scoring, progress persistence, WebXR, motion tracking, multiplayer, or hardware service gameplay.

## Source and verification evidence

- Sequence state helper: `src/activities/guided-sequence.js`.
- Activity UI/state: `src/activities/assembly-controller.js` and `src/activities/activity-shell.js`.
- Reversible GLB transforms, stereo draw, camera controls, and virtual hands: `src/three/assembly-viewer.js` and `src/three/guided-hands.js`.
- Browser coverage: `tests/guided-assembly.spec.js` and `tests/smoke.spec.js`.
- Source fit measurements: [Guided Assembly asset audit](guided-assembly-asset-audit.md).
- Browser screenshots from this stabilization: `artifacts/css-ma-01/after/` (includes Normal 3D and stereo Assembly and Disassembly evidence; the earlier CSS-3D-03A-R captures remain under `artifacts/css-3d-03a-r/after/`).

The latest verification result is recorded in [the CSS-MA-01 stabilization report](system-stabilization-report.md). Earlier CSS-3D-03A-R counts are historical and are not the final count for the current browser suite.
