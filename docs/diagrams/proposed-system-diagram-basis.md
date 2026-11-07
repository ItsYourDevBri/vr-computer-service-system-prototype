# Proposed System Diagram Basis

Status: **Historical draft; use `proposed-system-contract.md` as the current source of truth.**

This earlier draft remains for traceability. For future diagrams, use
`proposed-system-contract.md` and `system-stabilization-report.md`; reconcile
the approved Chapter I document when it is available. This file does not
authorize diagrams or override the current implementation evidence.

## Research scope

The proposed system is a VR-based Computer Systems Servicing (CSS) training
application for Movers Institute of Technology and Education. It supplements
physical instruction by supporting independent hardware learning, guided
assembly/disassembly practice, instructor-assigned procedural assessments, and
progress review. It does not replace physical hands-on training.

## Actors and role hierarchy

- **Principal** — invites/manages CSS instructors and views general CSS class
  participation.
- **CSS Instructor** — manages classes and students, assigns predefined
  procedural assessments, and reviews learning/assessment progress.
- **CSS Student** — activates an invitation, explores hardware, practices
  guided assembly/disassembly, completes assigned assessments, and reviews
  personal progress.

Hierarchy: **Principal → CSS Instructor → CSS Student**. Public self-
registration is out of scope.

## Functional requirements represented

1. Invitation-based account entry and role-based dashboard navigation.
2. Principal instructor/class oversight.
3. Instructor class/student management and predefined assessment assignment.
4. Student hardware exploration with educational component information.
5. Guided assembly and disassembly using a sequential learning walkthrough.
6. Normal 3D and optional VR-style viewing of the same educational activities.
7. Repeatable independent practice.
8. Student progress and instructor result/progress review.

The intended assembly/disassembly flow includes **Next**, **Previous**,
**Replay**, and **Reset**. The current prototype verifies only a limited panel
transition and a motherboard fit preview; the diagrams show the intended
completed learning process as a proposed capstone capability.

## Proposed application modules

- Role interfaces and dashboards
- Invitation/account activation and role access
- Class, student, and instructor management
- Hardware Exploration learning module
- Guided Assembly learning module
- Guided Disassembly learning module
- Normal 3D / VR View presentation layer
- Assessment assignment and completion
- Progress and result reporting
- Conceptual future data management/persistence
- Three.js rendering and Blender/GLB educational assets

No backend framework, provider, database engine, email vendor, WebXR stack,
motion tracking, multiplayer, walkable laboratory, avatar gameplay,
troubleshooting, certification, or full school-management module is assumed.

## Conceptual data entities

The proposed logical data view uses Users, Roles, Invitations, Classes,
Enrollments, Learning Modules, Activity Progress, Assessments, Assessment
Assignments, and Assessment Results. These are design concepts only; the
current prototype uses local illustrative/session data and has no production
database.

## Proposed data flows

- Principal/instructor invitation and activation data.
- Instructor class, student, and assessment assignment data.
- Student access, learning activity selections, step interactions, and
  assessment submissions.
- Activity progress and assessment results returned to students and reviewed by
  instructors/principals according to role scope.
- Future persistence of identity, enrollment, module, assignment, progress,
  and result records.

## Proposed navigation

Invitation entry → activation/login → role dashboard →

- Principal: instructors/classes → participation overview → logout.
- Instructor: classes/students → assessments/progress → logout.
- Student: optional profile setup → Hardware Exploration, Assembly,
  Disassembly, Assessments, Progress/Profile → logout.

Learning workspaces support Normal 3D by default and optional VR-style viewing.
Guided activities support Next, Previous, Replay, and Reset. The diagrams do
not imply head tracking, WebXR, physical headset compatibility, or a completed
motherboard installation.

## Assumptions and unresolved decisions

- The approved Chapter I document was not available in the workspace; only the
  approved project context, system flow, architecture, traceability checklist,
  and related QA/audit documents were used.
- The proposed-system contract was not available when these drafts were made;
  terminology and relationships must be reconciled when it becomes available.
- Authentication, invitations, persistence, assessment recording, and progress
  reporting are proposed future services, not current production capabilities.
- Optional VR means the currently documented stationary stereoscopic presentation
  concept; physical compatibility and tracking remain unverified.
- ERD keys and cardinalities are conceptual and require final research/system
  contract approval.
