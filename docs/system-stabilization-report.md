# CSS-MA-01 System Stabilization Report

Date: 2026-11-08
Branch: `feat/guided-assembly`

## Outcome

**Prototype stabilization: partial; physical assembly/disassembly readiness: FAIL.** The browser interaction foundation was hardened and documented. The app truthfully limits guided activity to a verified glass-panel transition and an explicitly uninstalled motherboard fit preview. Full motherboard installation, the remaining assembly sequence, and disassembly from a verified complete PC are still blocked by source geometry. The original Blender master and component GLBs were preserved.

**Diagram source status: NOT DIAGRAM SOURCE READY.** The proposed contract now records research roles, intended flows, architecture, proposed data concepts, and implementation boundaries. That scope and role vocabulary are usable. Operational assembly paths, a validated installed configuration, implemented assessment result flows, and current persistent data remain unresolved. The approved Chapter I source document was not present in the workspace. No diagrams were authored in this task.

## Parallel workstreams

Five actual subagents performed independent audits. Workstreams were coordinated with non-overlapping ownership; the lead integrated changes.

| Workstream | Assigned review | Findings |
| --- | --- | --- |
| Blender asset & geometry | Read-only source/master and attachment audit | Tray is a closed slab; motherboard is on the wrong side/orientation for the glass view; hole/standoff alignment and rear I/O are not validated. A candidate transform correction produced new collisions and was discarded. No source model changed. |
| Three.js animation | Reversible sequence, errors, scene lifecycle | Found replay cursor desynchronization if reverse completed but replay-forward failed; found partial asset load retry/resource cleanup risk. Both were corrected. |
| Assembly UI/UX | Step/status clarity, responsive and stereo behavior | Identified stereo instruction and component/function summary gaps, plus misleading disassembly step numbering. UI now reports the actual limited states. |
| Disassembly | Starting configuration and safe removal order | Only case glass removal is verified. Current activity does not begin from a fully assembled computer; motherboard and other removals stay unavailable. |
| QA, integration & docs | Browser coverage, repository docs, runtime risks | Confirmed prior test totals were stale, README had conflict markers, test coverage needed transition/retry/orientation checks, and full assembly claims must remain blocked. |

## Changes made

- Stabilized sequence state in `src/activities/guided-sequence.js`: replay keeps the selected cursor on success, but reconciles it to the rendered reversed state if the forward replay leg fails.
- Hardened Three.js scene loading/retry in `src/three/assembly-viewer.js`: waits for all load outcomes, releases successful partial scenes on failure, clears failed references/highlights, and allows retry.
- Improved cached resource lifecycle in `src/three/asset-manager.js`: per-scene owned material corrections are disposed, shared resources are released only after the last cached scene reference.
- Clarified Assembly/Disassembly language and live state in `src/activities/activity-shell.js`, `src/activities/assembly-controller.js`, and `src/styles/learning-workspace.css`. Stereo keeps instructional context; Disassembly shows the one verified numbered removal and an unnumbered unavailable-state note.
- Expanded `tests/guided-assembly.spec.js` for failed replay, repeated reversals, portrait/landscape animation behavior, retry after one-time load failure, and stereo instructional overlay. Screenshot path: `artifacts/css-ma-01/after/`.
- Reconciled root `README.md` and removed its merge conflict markers while retaining project context and current/future boundaries.
- Updated `AGENTS.md`, `docs/project-context.md`, `docs/system-flow.md`, `docs/architecture.md`, `docs/requirement-traceability.md`, and `docs/guided-animation-system.md` to align prototype claims and stabilization behavior.
- Added this report and `docs/diagrams/proposed-system-contract.md`.

No CSS application backend, Blender source model, master `.blend`, or source/exported GLB was modified. No commit, push, merge, or deployment was performed.

## Assembly and disassembly status

| Area | Result | Evidence / boundary |
| --- | --- | --- |
| Hardware Exploration | Retained | Separate existing viewer; no scope expansion here. |
| Assembly panel action | PASS for the named panel transition | Actual glass panel animates reversibly in the shared scene. |
| Learner-visible open-side reveal | FAIL / needs asset review | The browser state reports the named glass panel removed, but the captured view remains an opaque-looking case side from the default camera. The transform test does not prove that the interior is visibly exposed; the responsible overlapping mesh/orientation has not been isolated. |
| Motherboard fit | FAIL | Preview stops before the solid tray; board remains uninstalled and lesson incomplete. AABB stop is a safe visual boundary, not triangle-level collision certification. |
| Full assembly | FAIL / unavailable | No later component installation steps were enabled. |
| Disassembly panel action | PASS for the named panel transition | Reverses the same verified panel transform. |
| Full-system disassembly | FAIL / unavailable | No verified fully assembled starting pose exists; no motherboard or other component removal sequence enabled. |
| Previous / Next / Replay / Reset state | PASS for covered sequence cases | State locking and error reconciliation implemented; final suite result recorded below. |
| Normal/stereo, mobile landscape | PASS for covered UI behavior | Existing portrait gate is preserved; no sensors/WebXR. App-controlled hand poses only. |

## Geometry audit

Read-only inspection used Blender 5.2.3 background Python against the existing master. Blender MCP's live session was a default scene; it was not modified. World bounds and transforms below are Blender units in meters.

| Feature | Measured source evidence | Finding |
| --- | --- | --- |
| Chassis tray | `CASE_MotherboardTray`: X `[-0.089668, -0.082332]`, Y `[-0.094838, 0.154838]`, Z `[0.124936, 0.445064]`; mesh is 8 vertices / 6 faces | Closed solid slab; no board opening. |
| Motherboard root | `MB_ROOT` origin `(-0.081500, 0.030000, 0.285000)`, quaternion `(0,1,0,0)`, scale `(-1,-1,-1)`; effective world scale `(-1,1,1)` | Components extend toward +X while the glass is at -X; authored component face is turned away from glass-side access. |
| Glass panel | X bounds `[-0.099956, -0.096288]` | Glass is on negative-X side. |
| PCB | X `[-0.082300,-0.080700]`, Y `[-0.092000,0.152000]`, Z `[0.132500,0.437500]` | Board root/PCB is nearly flush with the tray face; not a validated standoff-mounted pose. |
| Standoffs | centers at X `-0.075`; Y rows `-0.080, 0.030, 0.140`; Z rows `0.150,0.285,0.420`; bounds X `[-0.07821,-0.07179]` | Tray inner face to standoff start gap is ~4.122 mm. Board hole markers share Y/Z pattern, but X centers `-0.0795` differ from standoffs by 4.5 mm. Markers are closed solids; PCB is a closed slab with no true through-holes. |
| Rear I/O | Board I/O blocks do not align to the chassis rear I/O proxy; measured Y gap ~41.7 mm | Alignment fails; rear proxies are closed geometry rather than verified openings. |

An in-memory mirrored/orientation candidate (saved only as `/tmp/ATX_Mid_Tower_Master_03b_candidate.blend`) was tested and rejected: it introduced actual overlaps involving board vs storage mounts, board vs GPU, cooler vs storage, and GPU vs storage. The candidate was not adopted or exported. This shows the mismatch is broader than one root translation; correcting it safely requires coordinated source geometry and fit redesign across components. Original master and protected backup files remain untouched. Exact pairwise count from the exploratory candidate is not asserted here because the candidate was not adopted as a validation baseline.

## Tests and build

Final results:

- `npm run validate:js` — PASS; 31 JavaScript files checked.
- `npm run lint` — PASS.
- `npm run build` — PASS; Vite 8.3.6 built 37 modules. The `scene-lifecycle` chunk is 642.50 kB minified / 160.24 kB gzip, above Vite's 500 kB advisory threshold.
- `npm run test:e2e` — PASS; 46/46 tests in 5.6 minutes on the staged checkpoint. This includes all 11 manifest GLBs in Normal 3D and stereo, orbit/zoom/reset, hardware interactions, role routes, responsive states, phone orientation gate, and guided transitions.
- Focused `case and motherboard preview transitions` — PASS; completed during full suite as test 1.
- Focused Disassembly stereo capture test after adding its stereo evidence — PASS; 1/1. It checks that the current instruction appears in both eyes and captures `disassembly-stereo-glass-removed.png`.
- `git diff --check` — PASS; root README conflict-marker scan returned no matches.

The first full browser pass was 44/46 because two tests asserted rendered state before asynchronous reverse transitions finished. Those tests now wait for `data-sequence-busy="false"`; the final full run passed without changing the intentionally blocked motherboard state.

Required commands run during integration:

- `npm run validate:js`
- `npm run lint`
- `npm run build`
- `npm run test:e2e`
- Focused slow glass-panel transition test
- `git diff --check`

The production build passes with a Vite advisory that the existing Three.js scene-lifecycle chunk is above the 500 kB minified chunk threshold; the implementation is not split further in this stabilization scope. No actual headset, motion sensor, WebXR, or mobile hardware test was performed.

Actual browser captures are stored in `artifacts/css-ma-01/after/`: `assembly-initial.png`, `assembly-initial-capture.png`, `assembly-glass-removed.png`, `assembly-intermediate-capture.png`, `assembly-motherboard-staged.png`, `assembly-fit-preview-blocked.png`, `assembly-fit-fallback-capture.png`, `assembly-stereo-hands-capture.png`, `assembly-mobile-landscape-stereo-initial.png`, `assembly-mobile-landscape-stereo-board-preview.png`, `assembly-mobile-portrait-rotate-gate.png`, `disassembly-initial.png`, `disassembly-glass-removed.png`, and `disassembly-stereo-glass-removed.png`. These are Playwright browser captures, not mockups. The Disassembly stereo capture confirms paired instructions but also shows the opaque-looking side-view limitation recorded above.

## Repository state and safety

- Pre-checkpoint `git status --short --branch` on 2026-11-08: branch `feat/guided-assembly`; 13 tracked paths showed modified/deleted (`AGENTS.md`, `README.md`, four project docs, four application files, `tests/smoke.spec.js`, plus deleted `.gitattributes` and `.gitignore`) and 2,222 paths were untracked. The worktree was already dirty with in-progress app code, Blender backups/exports/renders, dependency/build folders, and artifacts; these were preserved. Do not interpret this snapshot as a clean branch or as all changes originating in CSS-MA-01. Check the current Git status for the post-checkpoint state.
- No commit or remote operation was performed.
- Root README conflict markers were resolved. No conflict markers remain in README.
- Pre-existing deletions `.gitattributes` and `.gitignore` were left untouched.
- Pre-existing project artifacts and untracked `blender_assets/`, render, and test outputs were preserved; they were not cleaned or reset.
- Protected Blender files include `blender_assets/ATX_Mid_Tower_Master_pre_03b.blend` and `blender_assets/ATX_Mid_Tower_Master_03b_working.blend`. Original master remains unchanged.

## Remaining blockers

1. Replace the solid tray with a mechanically sound tray/opening and establish the correct glass-side motherboard orientation, while preserving real chassis geometry.
2. Align the motherboard standoff pattern, actual PCB holes, and rear I/O aperture; validate insertion/removal path.
3. Revalidate CPU/socket, CPU cooler mounting/contact, DIMM and RAM, GPU, storage, PSU, fans, panel, and cable clearances in the corrected assembly. The prior candidate had multiple pairwise geometry overlaps.
4. Only after full physical validation, add assembly/disassembly steps and a truly assembled starting state. Until then, current one-step disassembly and fit preview are the only honest claims.
5. Reconcile the diagram contract against the approved Chapter I source when available; diagram authoring remains a separate approval/task.
6. Inspect the case GLB/frame and camera angle to determine why hiding the glass-panel meshes does not visibly expose the interior in the default capture; do not hide other chassis geometry without confirming the source structure.
