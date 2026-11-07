# Proposed System Contract for Research Diagrams

Status: **Source contract prepared; final diagrams are not approved by this task.**

This is the shared vocabulary and scope source for future editable research diagrams. It describes the intended Chapter I application while recording what the current prototype actually does. It does not authorize new product features or claim production services. The approved Chapter I document itself was not available in this workspace; this contract is based on the project context, system flow, architecture, traceability checklist, and verified application behavior.

## A. Research system scope

The proposed VR-Based Computer Systems Servicing (CSS) Training Application for Movers Institute of Technology and Education supplements physical instruction. It is intended to help CSS students identify computer hardware, understand component functions, practice assembly and disassembly procedures, complete instructor-assigned procedural assessments, and review learning progress. The application does not replace supervised physical training.

The approved user hierarchy is **Principal → CSS Instructor → CSS Student**. The current repository is a local frontend prototype. Login, role selection, invitations, account activation, class records, assessment assignment/results, and progress are simulated or illustrative. There is no production authentication, email delivery, backend, persistent database, or server-side assessment result.

Out of scope: public self-registration, multiplayer, walkable laboratory navigation, avatars/gameplay, complex troubleshooting, certification, and full school-management functionality.

## B. Actors

| Actor | Intended responsibility | Current prototype boundary |
| --- | --- | --- |
| Principal | Invite/manage CSS instructors; view general class participation. | Role dashboard and illustrative views only. |
| CSS Instructor | Manage classes/students; assign predefined procedural assessments; review progress/results. | Local UI and illustrative records; no actual invitations, assignment persistence, or results. |
| CSS Student | Access learning modules; practice; complete assigned assessments; view own progress. | Learning UI is available, but assessment/progress data is not persisted. |

Do not add other external actors unless approved research documents are supplied and reconciled.

## C. Intended role workflows

1. Principal invites a CSS Instructor; the instructor activates an invitation and signs in.
2. Instructor creates/manages classes and invites CSS Students; students activate invitations and sign in.
3. Student independently uses Hardware Exploration, Guided Assembly, and Guided Disassembly; chooses Normal 3D or optional VR-style presentation; repeats learning activities.
4. Instructor assigns a predefined procedural assessment to a student/class. Student completes the sequence. The future system records results for student review and instructor monitoring.
5. Principal views general CSS class participation within the intended role scope.

The current prototype only simulates the account and management paths. Student Hardware Exploration is interactive. Guided Assembly and Disassembly expose reversible controls but only a verified removable glass-panel transition; Assembly also shows a motherboard fit preview that is explicitly not installation. No assessment completion or result recording should be depicted as currently implemented.

## D. Learning modules and presentation

- **Hardware Exploration:** 11 Blender/GLB catalog models with orbit, zoom, reset, component-specific learning information, and selected Computer Case part raycasting for confirmed named meshes.
- **Guided Assembly:** intended sequential installation learning. Current prototype: case glass removal plus a motherboard exploded fit preview stopped before the solid tray; no motherboard-installed state and no later component steps.
- **Guided Disassembly:** intended safe component-removal learning. Current prototype: reversible glass-panel removal only; the system does not start from a validated fully assembled computer.
- **Normal 3D:** touchscreen orbit/zoom presentation.
- **VR-style view:** optional stationary side-by-side stereo presentation of the same scene, with application-controlled technician hand poses in guided scenes. No WebXR, gyroscope, head tracking, controller input, hand tracking, calibration, or physical headset validation.

Guided controls are **Next**, **Previous**, **Replay**, and **Reset**. There is no manual drag-and-drop, snap scoring, or complex physics gameplay. Phone learning workspaces require landscape; portrait presents only the rotate prompt and dashboard link and pauses/defer scene rendering.

## E. Actual technical architecture

Current implementation:

- HTML5 shell, CSS3, Vanilla JavaScript ES modules.
- Vite development/build and browser-history routing.
- Three.js with GLTFLoader and OrbitControls.
- Blender-authored GLB assets; originals remain in `blender_assets/`, runtime copies are served from `public/assets/hardware/optimized_glb/`.
- `src/activities/` activity shell and sequence controllers; `src/three/` scene/viewer, asset loading, stereo and application-controlled hands.
- Local illustrative data and in-memory session state; no backend or production data store.
- Playwright browser tests and npm validation/build/lint scripts.

The shared guided sequence serializes transitions and supports Previous/Next/Replay/Reset. A transition cursor advances only after successful animation; if replay reverses successfully but its forward leg fails, the cursor is reconciled with the rendered state. Asset-load failure releases any successfully loaded partial scene and resets the retryable load state. Cached scene resources are disposed when no longer referenced.

## F. Proposed future data model (conceptual only)

These are possible logical entities for a later approved implementation, not existing database tables:

- **User** and **Role** (Principal, CSS Instructor, CSS Student)
- **Invitation** (issuer, invitee address, intended role, expiry/status)
- **Class** and **Enrollment**
- **LearningModule** and **ActivityProgress**
- **Assessment**, **AssessmentAssignment**, and **AssessmentResult**

The conceptual model should support the invitation hierarchy, class enrollment, module activity, instructor-assigned assessments, student results, and role-appropriate progress review. Keys, constraints, retention, authorization rules, and cardinalities require future design approval. Do not represent these entities as persisted current records.

## G. Proposed system processes and DFD balancing

Use the same external entities and top-level flow labels in both levels.

**Level 0 context process:** `0 — VR-Based CSS Training Application`.

External entities and balanced flows:

| External entity | Inputs to system | Outputs from system |
| --- | --- | --- |
| Principal | Instructor invitation details; class/participation request. | Invitation status; instructor/class participation summary. |
| CSS Instructor | Invitation activation/sign-in; class/student changes; assessment assignment; progress request. | Access/workspace response; invitation/class status; assignment confirmation; student progress and assessment results. |
| CSS Student | Invitation activation/sign-in; learning-module and step actions; assessment response; progress request. | Access/workspace response; learning content/instructions; assessment feedback; personal progress/results. |

**Level 1 logical processes** (future proposed system decomposition):

1. **Manage identity and invitations** — validates invitation/role request and returns access/status. Future persistence only.
2. **Manage classes and enrollment** — processes instructor class/student management and principal oversight; returns class/participation status. Future persistence only.
3. **Deliver learning activities** — serves hardware information, 3D presentation and guided activity instructions; accepts step interactions. Current client implements only catalog exploration and the limited reversible panel/fit-preview sequence.
4. **Manage assessments** — accepts instructor assignment and student completion; future process returns feedback and assignment state.
5. **Record and report progress** — future process records activity/assessment results and returns role-appropriate summaries.

Proposed stores for an eventual Level 1 DFD: `D1 Users & Invitations`, `D2 Classes & Enrollments`, `D3 Learning Modules & Activity Progress`, `D4 Assessments & Assignments`, `D5 Assessment Results`. Mark all as **proposed future stores**. Do not draw them as current database infrastructure. Any future DFD must balance external flows with Level 0 and distinguish current browser-local data from proposed persistence.

## H. Intended system flowchart

1. Start → invitation/login entry → invitation valid or account access accepted?
2. If not accepted, show an entry/validation response; if accepted, route by role to the corresponding dashboard.
3. Principal: instructor/class oversight → participation view → logout.
4. Instructor: class/student management → optional assessment assignment → progress/result review → logout.
5. Student: optional profile setup → choose Hardware Exploration, Assembly, Disassembly, Assessment, Progress, or Profile.
6. Learning activity: choose Normal 3D or stationary VR-style view; for phone, check orientation. Portrait → show rotate prompt and pause/defer viewer; landscape → continue.
7. Hardware Exploration: choose component → inspect, rotate/zoom/reset → return or exit.
8. Guided activity: read instruction → Next/Previous/Replay/Reset. In the current prototype, glass panel is the only verified install/remove transition; Assembly motherboard preview is a blocked fit demonstration and must not branch to “installed” or “complete.”
9. Assessment/progress branches describe the intended future workflow and must be labelled proposed/simulated until persistence and result handling are implemented.
10. Return to role dashboard → logout.

## I. Implementation status for diagram labels

| Capability | Status to show |
| --- | --- |
| Hardware catalog, 3D orbit/zoom/reset, educational details | Implemented in browser; source GLBs are local assets. |
| Confirmed Computer Case part picking in stereo | Implemented for verified named case mesh groups only. |
| Landscape-only phone learning workspace | Implemented; portrait prompt/pause behavior. |
| Normal 3D and stationary stereo | Implemented presentation; physical headset support not verified. |
| Application-controlled virtual hands | Implemented static procedural poses in guided stereo view; no tracking. |
| Reversible activity controls | Implemented; only case glass transform is mechanically validated. |
| Motherboard installation/full assembly sequence | Blocked; motherboard fit preview only, not installation. |
| Guided component disassembly from fully assembled state | Not implemented; only glass-panel removal is verified. |
| Login, invitations, roles, classes | Simulated/local UI; not authenticated or persistent. |
| Assessment assignment, completion, results, progress records | Simulated UI or future workflow; not persisted or reported by a service. |
| Database, email, backend, multiplayer, WebXR, sensors | Future/unimplemented; not in current architecture. |

## Readiness note

The actor hierarchy, research purpose, intended role workflows, conceptual future entities, and proposed process vocabulary are usable for later diagram authoring. **Operational assembly/disassembly paths, installed-system states, assessment-result flows as implemented behavior, and a current persistent data model are not validated.** The motherboard geometry remains a hard blocker. Final diagrams must label intended/future functions separately from current prototype behavior and must be reviewed against the approved Chapter I source when available. This contract prepares source material; it does not declare the diagrams finalized or the system complete.
