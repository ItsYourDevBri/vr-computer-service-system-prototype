# Diagram Requirements Checklist

Status: contract prepared; final diagrams are a separate, not-yet-authorized task.

This checklist remains the quality gate for future diagram authoring. The
`docs/diagrams/proposed-system-contract.md` now supplies common terminology and
scope; it does not authorize implementation changes or declare diagrams ready.

## Source basis reviewed

- `AGENTS.md`
- `docs/project-context.md`
- `docs/system-flow.md`
- `docs/architecture.md`
- `docs/requirement-traceability.md`
- Current QA and implementation-boundary documents under `docs/`, including
  `hardware-exploration-qa.md`, `hardware-exploration-02d-qa.md`,
  `hardware-vr-interaction-qa.md`, `landscape-workspace-qa.md`,
  `guided-animation-system.md`, `guided-assembly-asset-audit.md`, and
  `guided-assembly-03a-report.md`.

## Source limitations

- The approved Chapter I research document is not present in the accessible
  workspace. The diagrams must therefore be grounded only in the approved
  project-context and traceability documents until the research source is
  supplied.
- The current prototype geometry blocks a truthful full assembly/disassembly
  sequence. See `docs/system-stabilization-report.md` before depicting any
  installed motherboard or complete-system removal path.
- The current prototype is frontend-only with local illustrative/session data.
  Authentication, invitations, persistence, assessment recording, progress
  reporting, and physical VR compatibility remain simulated or future scope.

## Cross-diagram vocabulary to verify against the contract

- Research system name: **VR-Based CSS Training Application**.
- Roles: **Principal**, **CSS Instructor**, **CSS Student**.
- Hierarchy: **Principal → CSS Instructor → CSS Student**.
- Learning activities: **Hardware Exploration**, **Guided Assembly**,
  **Guided Disassembly**, **Normal 3D**, and optional **VR-style viewing**.
- Assessment wording: instructor-assigned, predefined procedural assessments;
  student completion; future result/progress review.
- Current guided-animation boundary: verified glass-panel transition and a
  clearly labelled motherboard fit preview; no installed motherboard state,
  lesson completion, later component steps, hand tracking, WebXR, or gyroscope.

## Diagram-specific acceptance checklist

### 1. Proposed Use Case Diagram

- [ ] Use a UML system boundary and actor notation.
- [ ] Include the three approved roles only.
- [ ] Cover invitation-based access, instructor/class/student management,
      hardware exploration, guided assembly, guided disassembly, Normal 3D /
      VR-style viewing, assigned assessments, and progress/result viewing.
- [ ] Mark or document simulated/future capabilities without presenting them as
      production implementation.
- [ ] Exclude public self-registration, multiplayer, avatars, certification,
      complex troubleshooting, and full school management.

### 2. Proposed Block Diagram

- [ ] Show role interfaces, account/class management, learning activities,
      rendering, Blender/GLB assets, assessments, progress, and conceptual
      future data management.
- [ ] Separate current frontend/Three.js/GLB components from proposed future
      services and persistence.
- [ ] Avoid naming an unsupported backend framework, provider, database engine,
      email service, or VR platform.

### 3. DFD Level 0

- [ ] Show one context process: **VR-Based CSS Training Application**.
- [ ] Show external entities and labelled input/output flows only.
- [ ] Do not show internal data stores or internal subprocesses.
- [ ] Balance the role and learning/assessment/progress flows with Level 1.

### 4. DFD Level 1

- [ ] Decompose the context process into numbered logical processes.
- [ ] Use consistent external entities, flow labels, directions, and data-store
      names.
- [ ] Use stores only for proposed logical records supported by the approved
      workflows, such as users/invitations, classes/enrollments, learning
      progress, assessments/assignments, and results.
- [ ] Balance all Level 1 external flows against Level 0.
- [ ] Label persistence and result recording as proposed/future where relevant.

### 5. Proposed ERD

- [ ] Treat the ERD as conceptual/logical future data design, not evidence of a
      production database.
- [ ] Verify each entity and relationship against the contract before inclusion:
      Users, Roles, Invitations, Classes, Enrollments, Learning Modules,
      Activity Progress, Assessments, Assessment Assignments, and Assessment
      Results.
- [ ] Show primary keys, foreign keys, cardinality, and meaningful optionality.
- [ ] Represent the invitation hierarchy and instructor-assigned assessment
      workflow without inventing unrelated school-management records.

### 6. Proposed System Flowchart

- [ ] Show invitation-based entry, login, role-based dashboard, management
      paths, student learning activities, assessment/progress paths, and logout.
- [ ] Include Hardware Exploration, Assembly, Disassembly, Normal 3D / VR View,
      and Previous / Next / Replay / Reset where the approved flow supports them.
- [ ] Use decision symbols with explicit Yes/No branches.
- [ ] Keep the motherboard fit preview visibly distinct from a completed
      installation and avoid claiming unavailable later steps.
- [ ] Keep the flowchart consistent with the use-case actors and DFD flows.

## Validation required after the contract is available

- [ ] Discover and verify any functioning draw.io integration; do not claim its
      use without evidence.
- [ ] Otherwise generate editable diagrams.net XML with editable shapes,
      labels, and connectors.
- [ ] Create all six required `.drawio` files under `docs/diagrams/`.
- [ ] Create PNG previews and PDF exports if the available tooling supports it.
- [ ] Open or render each diagram and inspect notation, overlap, clipping,
      arrow readability, relationships, and consistency.
- [ ] Add `diagram-validation-report.md` documenting sources, assumptions,
      actual validation, and any remaining limitations.
- [ ] Keep all edits limited to `docs/diagrams/`; do not modify `src/`, GLBs,
      Blender files, dependencies, or application documentation.

## Finalization gate

Final diagram authoring is a separate task. Before authoring, reconcile this
checklist with the contract and the approved Chapter I source when available.
Keep future data stores and assessment result flows clearly proposed; do not
show the current fit preview as a completed motherboard installation.
