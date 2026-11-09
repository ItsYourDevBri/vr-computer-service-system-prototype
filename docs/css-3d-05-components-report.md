# CSS-3D-05 CPU, RAM, and CPU Cooler Report

## Scope and prerequisite

CSS-3D-04 was verified before implementation: the corrected motherboard export passes the runtime nine-hole/standoff fit gate, the case panel opens, and focused Normal 3D/stereo installation and removal tests pass. The original Blender master remains unchanged.

## Agent responsibilities

- CPU geometry: inspected the authored CPU root, LGA1700 socket markers, package dimensions, and orientation.
- RAM geometry: inspected both authored module roots, DIMM markers, keying, and clearance validation.
- CPU cooler geometry: inspected the authored cooler root, CPU contact, mounting pattern, and chassis clearances.
- Sequence integration: extended the shared Three.js guided-sequence controller and synchronized Normal 3D/stereo state.
- QA: added/revised browser coverage for forward/reverse transitions, reset, repeated navigation, stereo rendering, and visual captures.

## Source assets and verified transforms

Runtime assets are the existing optimized exports:

- `public/assets/hardware/optimized_glb/cpu.glb`
- `public/assets/hardware/optimized_glb/ram.glb`
- `public/assets/hardware/optimized_glb/cpu_cooler.glb`

Validated authored roots in the shared Blender world (metres):

| Component | Root | Installation position |
| --- | --- | --- |
| CPU | `CPU_ROOT.001` | `(-0.0715, 0.345, -0.030)` |
| RAM A | `RAM_A_ROOT.001` | `(-0.0715, 0.285, -0.093)` |
| RAM B | `RAM_B_ROOT.001` | `(-0.0715, 0.285, -0.073)` |
| Cooler | `COOLER_ROOT.001` | `(-0.0715, 0.345, -0.030)` |

RAM A/B use the authored first two DDR5-style DIMM positions. The CPU and cooler use the authored CPU socket/contact origin. Removal staging is derived from each root’s validated removal path by an explicit X offset; no drag scoring or physics is used.

## Implemented sequence

Assembly:

1. Remove the tempered-glass panel.
2. Install the motherboard.
3. Install the CPU.
4. Install RAM module 1.
5. Install RAM module 2.
6. Install the CPU cooler.

Disassembly reverses dependencies safely:

1. Remove the CPU cooler.
2. Remove RAM module 2.
3. Remove RAM module 1.
4. Remove the CPU.
5. Remove the motherboard.
6. Reattach the access panel.

Next, Previous, Replay, and Reset use the existing locked guided-sequence state machine. Each GLB is loaded once; transitions only move the existing authored root, preventing duplicate models.

## Geometry validation

The existing validation reports confirm:

- CPU package is an LGA1700-compatible educational model with a matched socket marker.
- RAM keying and orientation are valid; both populated modules have zero unintended motherboard/cooler intersections.
- Cooler contact offset and four-point mounting alignment are zero; cooler-to-glass clearance is 9.29 mm and cooler-to-top-panel clearance is 0.78 mm.
- The original Blender source and prior corrected case/motherboard exports are preserved.

## Verification

- `npm run validate:js` — PASS.
- `npm run lint` — PASS.
- `npm run build` — PASS (existing large Three.js chunk advisory remains).
- Guided assembly CPU/RAM/cooler forward and reverse test — PASS.
- Guided disassembly dependency-order test — PASS.
- Focused browser captures include initial, staged, installed, and stereo states.

## Remaining limitations

The cooler’s detailed fastening and thermal-paste procedures are not represented, so the UI describes placement/contact only. GPU, storage, PSU, case-fan, and optical-drive assembly remain outside this phase. Blender MCP was unavailable during this implementation; no source `.blend` rewrite was attempted.
