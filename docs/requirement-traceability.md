# Chapter I Requirement-to-Prototype Traceability

This checklist maps the approved Chapter I research needs to the current prototype. It is an implementation-status aid, not a replacement or rewrite of the research document.

| Chapter I need / approved feature | Prototype evidence | Status and boundary |
| --- | --- | --- |
| Identify computer hardware and understand component functions | Student Hardware Exploration provides a selected-component summary and full details for all 11 models, including purpose, operation, identifying features, and basic information. In stereo, confirmed Computer Case meshes can be tapped to reveal matching per-eye part details. The Optical Drive is explicitly standalone. | [x] Implemented as an educational catalog with case-part selection in stereo. |
| Explore a computer component in 3D | All 11 Blender GLBs load in Three.js, including independent SSD/HDD and the standalone Optical Drive. Models support orbit, zoom, reset, and auto-framing. | [x] Implemented as isolated component exploration. This does not provide assembled-system simulation or assembly/disassembly gameplay. |
| Use a landscape-first learning workspace on phones | Hardware Exploration, Assembly, and Disassembly show only the rotate prompt and dashboard link in phone portrait. The viewer stays uninitialized or paused, and landscape resume preserves component and mode. Compact landscape includes a selected-component summary, a details drawer, and a components drawer. | [x] Implemented. No portrait fallback. Desktop/tablet are not gated. |
| Offer Normal 3D and optional VR-style viewing | Normal 3D is interactive. “VR View” displays left/right stationary stereoscopic projections with a fixed headset-style mask for every component. | [x] Visual presentation implemented. No motion tracking, WebXR, headset calibration, or physical headset validation. |
| Practice assembly in an organized, sequential walkthrough | Assembly route has a shared responsive shell and communicates that the activity is not interactive yet. | [ ] Future approved phase; 02B explicitly excludes gameplay. |
| Practice disassembly with removal guidance and component highlighting | Disassembly route has a shared responsive shell and communicates that the activity is not interactive yet. | [ ] Future approved phase; 02B explicitly excludes gameplay. |
| Support Principal → CSS Instructor → CSS Student roles | Role-specific dashboards and navigation are available in the prototype. | [x] UI flow only; role choice is not secure authorization. |
| Invite accounts and manage classes | Invitation, activation, and class screens are local interface flows. | [~] Simulated; no production identity service, database, or email delivery. |
| Assign assessments and monitor learning progress | Assessment and progress screens use illustrative local records. | [~] Simulated; no student activity is persisted or reported to a server. |
| Support repeatable independent practice | Hardware, Assembly, and Disassembly destinations are reachable. All catalog GLBs are explorable; walkthrough gameplay remains unavailable. | [~] Exploration is interactive; assembly/disassembly remain shell-only. |

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

## Future capstone boundary

Assembly/disassembly walkthrough steps, additional interactive hardware models, persistent records, production authentication/invitations, and verified physical VR support are future work. This checklist does not authorize those phases by itself; each remains subject to the project's current task approval and scope.
