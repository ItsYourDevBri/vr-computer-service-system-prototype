# Chapter I Requirement-to-Prototype Traceability

This checklist maps the approved Chapter I research needs to the current prototype. It is an implementation-status aid, not a replacement or rewrite of the research document.

| Chapter I need / approved feature | Prototype evidence | Status and boundary |
| --- | --- | --- |
| Identify computer hardware and understand component functions | Student Hardware Exploration provides a selected-component summary and full details for all 11 models, including purpose, operation, identifying features, and basic information. In stereo, confirmed Computer Case meshes can be tapped to reveal matching per-eye part details. The Optical Drive is explicitly standalone. | [x] Implemented as an educational catalog with case-part selection in stereo. |
| Explore a computer component in 3D | All 11 Blender GLBs load in Three.js, including independent SSD/HDD and the standalone Optical Drive. Models support orbit, zoom, reset, and auto-framing. | [x] Implemented as isolated component exploration. This does not provide assembled-system simulation or assembly/disassembly gameplay. |
| Use a landscape-first learning workspace on phones | Hardware Exploration, Assembly, and Disassembly show only the rotate prompt and dashboard link in phone portrait. The viewer stays uninitialized or paused, and landscape resume preserves component and mode. Compact landscape includes a selected-component summary, a details drawer, and a components drawer. | [x] Implemented. No portrait fallback. Desktop/tablet are not gated. |
| Offer Normal 3D and optional VR-style viewing | Normal 3D is interactive. “VR View” displays left/right stationary stereoscopic projections with a fixed headset-style mask for every component. | [x] Visual presentation implemented. No motion tracking, WebXR, headset calibration, or physical headset validation. |
| Practice assembly in an organized, sequential walkthrough | CSS-3D-03A-R uses the case and motherboard GLBs with reversible Previous/Next/Replay/Reset transitions. The glass panel is animated out; motherboard movement is a labeled exploded fit preview that ends at an AABB-derived safe stop before the solid tray. | [~] Reversible animation foundation implemented. Motherboard installation remains unavailable because the Blender tray/board fit is unverified; the preview never marks the board installed. |
| Practice disassembly with removal guidance and component highlighting | Disassembly loads the case GLB and animates the verified glass-panel removal. Previous, Replay, and Reset reuse the same panel transform; motherboard removal is visibly unavailable. | [~] First verified removal step implemented. Further component removals remain future work until installed transforms are validated. |
| Support Principal → CSS Instructor → CSS Student roles | Role-specific dashboards and navigation are available in the prototype. | [x] UI flow only; role choice is not secure authorization. |
| Invite accounts and manage classes | Invitation, activation, and class screens are local interface flows. | [~] Simulated; no production identity service, database, or email delivery. |
| Assign assessments and monitor learning progress | Assessment and progress screens use illustrative local records. | [~] Simulated; no student activity is persisted or reported to a server. |
| Support repeatable independent practice | Hardware Exploration is interactive. Assembly and Disassembly support repeatable reversible animation of the verified case panel; Assembly also demonstrates the motherboard fit blocker without claiming installation. | [~] Prototype walkthrough foundation exists; a complete component sequence remains future work. |

## CSS-3D-02B implementation evidence

- Component catalog and shared learning shell: `src/data/hardware-components.js`, `src/activities/`.
- Multi-model GLB viewer and stereo presentation: `src/three/`.
- Browser coverage and all-model captures: `tests/smoke.spec.js`, `artifacts/css-3d-02b/after/`.
- Model sizes, mesh/triangle/material counts, filtered optical-drive contamination, mobile coverage, and environment limitations: [Hardware Exploration QA](hardware-exploration-qa.md).

## CSS-3D-02C implementation evidence

- Shared phone portrait gate, landscape resume/pause behavior, responsive coverage, and verification results: [Landscape Workspace QA](landscape-workspace-qa.md).
- Actual desktop, phone portrait/landscape, drawer, stereo, Assembly, and Disassembly captures: `artifacts/css-3d-02c/after/workspace/`.

## CSS-3D-02D implementation evidence

- Selected-component summaries and purpose, operation, identifying-feature, and basic-information content: `src/data/hardware-components.js` and `src/activities/activity-shell.js`.
- Summary/details drawer behavior, component selection, and overlay-free stereo presentation: `src/activities/activity-controller.js` and `src/styles/learning-workspace.css`.
- Browser interaction and content checks: `tests/smoke.spec.js`.
- Mobile landscape, component drawer, full details, selected CPU/motherboard/RAM, desktop, and stereo captures: `artifacts/css-3d-02d/after/hardware-exploration/`.
- Test/build/lint results: [Hardware Exploration 02D QA](hardware-exploration-02d-qa.md).

## CSS-3D-02E implementation evidence

- Confirmed Computer Case mesh-name groups and educational copy: `src/data/case-vr-parts.js`.
- Eye-specific raycasting, tap-versus-drag handling, reversible highlight, and paired detail cards: `src/three/viewer.js`, `src/activities/activity-controller.js`, and `src/activities/activity-shell.js`.
- Mapping and browser interaction evidence: [VR Part Selection QA](hardware-vr-interaction-qa.md).

## CSS-3D-03A implementation evidence

- Source model coordinate and fit audit: [Guided Assembly asset audit](guided-assembly-asset-audit.md).
- Historical workbench and source-fit evidence: [CSS-3D-03A report](guided-assembly-03a-report.md) and [asset audit](guided-assembly-asset-audit.md). Its drag interaction was replaced by CSS-3D-03A-R; the underlying tray fit blocker remains.

## CSS-3D-03A-R implementation evidence

- Reversible sequence state, source/destination transforms, fit-preview boundary, disassembly relationship, and remaining asset limitations: [Guided animation system](guided-animation-system.md).
- Browser coverage and actual initial/intermediate/stereo/disassembly captures: `tests/guided-assembly.spec.js` and `artifacts/css-3d-03a-r/after/`.

## CSS-MA-01 stabilization evidence

- Reversible sequence failure handling, failed GLB-load retry/resource cleanup, UI status accuracy, parallel audit findings, and exact Blender fit blockers: [System Stabilization Report](system-stabilization-report.md).
- Proposed roles, intended workflows, architecture, conceptual future data model, process flows, and implemented/simulated/future labels for later research diagrams: [Proposed System Contract](diagrams/proposed-system-contract.md). This does not claim the full assembly system or diagrams are ready.
- Actual browser interaction captures: `artifacts/css-ma-01/after/`.

## Future capstone boundary

Verified motherboard installation and the full assembly sequence, additional component-removal steps, additional interactive hardware models, persistent records, production authentication/invitations, and physical VR tracking/support are future work. The motherboard fit-preview does not establish installation compatibility. This checklist does not authorize later phases by itself; each remains subject to the project's current task approval and scope.
