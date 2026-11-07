# Diagram Validation Report

Status: **Draft — Pending Final Research/Architecture Reconciliation**

## Source basis

The six diagrams were prepared from:

- `docs/project-context.md`
- `docs/system-flow.md`
- `docs/architecture.md`
- `docs/requirement-traceability.md`
- `docs/diagrams/diagram-requirements-checklist.md`
- Relevant current QA/audit documents under `docs/`
- `docs/diagrams/proposed-system-diagram-basis.md`

The approved Chapter I research document and
`docs/diagrams/proposed-system-contract.md` were not available during this
draft. The diagrams therefore require later reconciliation against those
sources.

## Deliverables validated

- `proposed-use-case.drawio`
- `proposed-block-diagram.drawio`
- `proposed-dfd-level-0.drawio`
- `proposed-dfd-level-1.drawio`
- `proposed-erd.drawio`
- `proposed-system-flowchart.drawio`

PNG previews and PDF exports were generated for all six diagrams using the
installed draw.io desktop export CLI. The `.drawio` files contain native
editable mxGraph shapes, labels, and connectors; they do not embed screenshots.

## Validation performed

- Parsed all six `.drawio` files with `xmllint --noout`; all passed.
- Opened the generated diagrams in the installed draw.io desktop application.
- Visually inspected the use-case, block, DFD Level 0, DFD Level 1, ERD, and
  flowchart PNG renders for page framing, clipping, shape readability, arrows,
  and connector direction.
- Confirmed that the use-case diagram contains the three approved actors and a
  system boundary.
- Confirmed that DFD Level 0 contains one context process and no internal data
  stores, while Level 1 contains numbered processes and conceptual stores.
- Confirmed that the ERD includes keys and the approved conceptual entity set.
- Confirmed that the flowchart includes invitation entry, login, role routing,
  learning activities, guided controls, assessment/progress, and logout.
- Confirmed that draft/future/simulated boundaries are documented in the basis
  and diagram notes.

## Limitations and unresolved assumptions

- The ERD keys, cardinalities, and optionality are conceptual and need final
  contract/research approval.
- The DFD stores and future identity/records service are proposed logical
  designs, not existing production services.
- The flowchart represents the intended completed guided learning process. The
  current prototype only verifies a limited glass-panel transition and a
  motherboard fit preview; it does not establish a completed installation.
- Optional VR is shown as the documented stationary viewing mode and does not
  imply head tracking, WebXR, gyroscope input, or verified physical headset
  compatibility.
- Connector labels in dense diagrams use draw.io's automatic orthogonal routing;
  final contract reconciliation may warrant small layout refinements before
  research submission.

## Scope confirmation

Only files under `docs/diagrams/` were created or modified for this task.
Application source, Blender files, GLBs, dependencies, and shared architecture
documents were not changed. No commit, push, merge, or deployment was made.

## Multi-page consolidation — CSS-DIAGRAM-01B

The primary editable artifact is now
`proposed-system-diagrams.drawio`. It contains six independent native
diagrams.net pages in this exact order:

1. Use Case Diagram
2. Block Diagram
3. DFD Level 0
4. DFD Level 1
5. Entity Relationship Diagram
6. System Flowchart

The original six single-page `.drawio` files were preserved as backups.

Consolidation checks performed:

- Parsed the combined file with `xmllint --noout`; it passed.
- Opened the combined file in draw.io desktop.
- Confirmed the draw.io accessibility tree exposed all six named page tabs in
  the required order.
- Confirmed the active Use Case page reported editable shapes and connectors.
- Exported each combined-file page separately by page index to a PNG and a
  one-page PDF; all twelve exports were created successfully.
- Reopened the combined file after generation and confirmed the page list was
  present.

The page-switch action was issued in draw.io; the computer-use capture stream
then returned a macOS ScreenCaptureKit error before a second accessibility
snapshot could be collected. Independent page-index exports and the initial
six-tab accessibility snapshot verified the page definitions and content.

## ERD revision — CSS-DIAGRAM-04A

Only the Entity Relationship Diagram page was revised. A pre-revision backup
was preserved as `proposed-system-diagrams-before-erd-revision-2026-11-08.drawio`.
The other seven page models were compared against that backup and remained
unchanged.

Final proposed entity set:

- `ROLES`
- `USERS`
- `INVITATIONS`
- `CLASSES`
- `ENROLLMENTS`
- `LEARNING_MODULES`
- `HARDWARE_COMPONENTS`
- `MODULE_COMPONENTS` (junction for module/component many-to-many use)
- `ACTIVITY_PROGRESS`
- `ASSESSMENTS`
- `ASSESSMENT_ASSIGNMENTS`
- `ASSESSMENT_RESULTS`

Relationship summary:

- Roles have many users and invitation role targets.
- Users send invitations; an invitation may be accepted by zero or one user.
- An instructor user manages many classes.
- Classes have many enrollments; student users may have many enrollments.
- Learning modules and hardware components connect through
  `MODULE_COMPONENTS`.
- Student users have many activity-progress records, and modules have many
  activity-progress records.
- Assessments have many assignments; instructor users create assignments.
- An assignment may target a class or an individual student, represented by
  nullable foreign keys in `ASSESSMENT_ASSIGNMENTS`.
- Assignments have many submitted result attempts; student users have many
  result records.

The revised ERD uses compact white rectangular entity boxes, black borders,
header/attribute row styling, PK/FK/type attributes, orthogonal connectors, and
crow’s-foot cardinality markers with optional circles. Updated exports:
`proposed-erd-updated.png` and `proposed-erd-updated.pdf`.

The revised file was XML-validated and the ERD page was exported and visually
inspected as PNG/PDF. The already-open draw.io window retained a stale
unsaved in-memory copy from before the rewrite, so no discard action was taken;
fresh disk exports and page-integrity comparisons were used for validation.

## ERD routing and cardinality correction — CSS-DIAGRAM-04B

The primary combined file was backed up as
`proposed-system-diagrams-before-erd-04b-2026-11-08.drawio` before this pass.
The ERD was rebuilt from the verified pre-ERD page-order backup so the primary
file retains the intended eight-page order: three Use Case pages, Block Diagram,
DFD Level 0, DFD Level 1, Entity Relationship Diagram, and System Flowchart.

The ERD now uses native diagrams.net endpoint styles on both ends of all 17
relationship connectors:

- `ERone` for exactly-one endpoints.
- `ERzeroToOne` for optional one endpoints.
- `ERzeroToMany` for optional many endpoints.
- `ERmany` where a mandatory many endpoint is required.

The verified mappings include Roles→Users (one to zero/many), Users→Classes,
Classes→Enrollments, Users→Enrollments, module/component junction links,
student/module progress, assessment assignment ownership and targets, and
assignment/result attempts. `accepted_user_id`, `class_id`, and `student_id`
assignment targets remain explicitly nullable. The invitation acceptance
relationship uses optional one-to-one markers as a documented logical
assumption; production uniqueness rules remain future design work.

The layout was tightened into four logical groups with compact entity tables,
light-blue headers, black borders, aligned attribute rows, and no large
disclaimer box inside the ERD. Connector labels were removed from the lines so
the native cardinality markers remain legible. The updated PNG and PDF were
opened/visually inspected, and the exact primary file was reopened in draw.io;
the ERD tab displayed the revised entities and crow’s-foot markers while all
eight page tabs remained present. The draw.io application canvas was in dark UI
theme, but the page/export background is white.

Because the open draw.io editor retained an in-memory stale copy and rewrote
the file during close/synchronization, the final primary file was restored from
the trusted pre-ERD backup after the editor closed. Final disk validation then
confirmed the eight-page order, preserved non-ERD page content, 17 native
start/end cardinality marker pairs, and the updated one-page PNG/PDF exports.

## Use Case Diagram revision

Only the Use Case section was revised. The consolidated file now has three
actor-specific editable pages before the unchanged five diagrams:

1. Proposed Use Case Diagram of CSS Student
2. Proposed Use Case Diagram of CSS Instructor
3. Proposed Use Case Diagram of Principal
4. Block Diagram
5. DFD Level 0
6. DFD Level 1
7. Entity Relationship Diagram
8. System Flowchart

The revised Use Case pages use a white background, black outlines, a left-side
actor, a system boundary labelled **VR-Based CSS Training Application**, and
spaced use-case ovals with direct actor associations. No unnecessary
`<<include>>` or `<<extend>>` relationships were added. The student page uses
the approved invitation-based access wording and includes the documented
learning, viewing, assessment, progress, and profile interactions. Instructor
and Principal pages are limited to role-relevant management, assessment, and
participation/progress functions supported by the project documentation.

An exact pre-revision backup was preserved as
`proposed-system-diagrams-before-use-case-revision-2026-11-08.drawio`.
Updated PNG previews were generated for the Student, Instructor, and Principal
pages. The revised combined file was opened in draw.io; its accessibility tree
showed all eight named page tabs, editable shapes/connectors on the active
Student page, and the other five pages after the new Use Case pages. The five
non-Use-Case page models were compared against the backup and were unchanged.

## ERD compact rebuild — CSS-DIAGRAM-04C

Only the **Entity Relationship Diagram** page was rebuilt in this pass. The
other seven pages were restored from the trusted pre-ERD backup and compared
by page name/content before the final file was written.

The ERD is now one compact landscape diagram (`1500 × 1050`) with all 12
required native editable entities visible together: ROLES, USERS, INVITATIONS,
CLASSES, ENROLLMENTS, LEARNING_MODULES, HARDWARE_COMPONENTS,
MODULE_COMPONENTS, ACTIVITY_PROGRESS, ASSESSMENTS, ASSESSMENT_ASSIGNMENTS,
and ASSESSMENT_RESULTS. Each entity uses a compact rectangular table with a
light-blue header, black borders, and explicit PK/FK/type attributes.

All 17 relationships use native diagrams.net Crow’s Foot endpoint styles on
both ends (`ERone`, `ERmany`, `ERzeroToOne`, or `ERzeroToMany`). The compact
routing keeps the relationship paths short and the exported diagram readable
without the former large disclaimer/legend boxes.

Validation completed:

- XML validation passed with `xmllint`.
- Page order remains the eight-page combined-file order.
- All 12 required ERD entities and 17 start/end cardinality marker pairs are
  present.
- Non-ERD page content matches the trusted pre-ERD backup.
- The ERD was exported and visually inspected as a one-page PNG and PDF.
- The ERD-only backup is preserved as
  `proposed-system-diagrams-before-erd-04c-2026-11-08.drawio`.

## UML class diagram refinement — current request

The Entity Relationship Diagram page was refined as an editable UML-style
class diagram using native draw.io cells. The existing classes, attributes,
PK/FK markers, relationships, layout, and cardinalities were preserved; the
class formerly named `ENROLLMENTS` is now displayed as `CLASS MEMBERSHIP`.
Each class has an editable attributes compartment and a methods compartment;
the reference model did not specify operations, so the method compartments
remain intentionally empty (`Methods: —`) rather than inventing behavior.

The other seven pages were not changed. The updated ERD page was exported as
`proposed-erd-updated.png` and `proposed-erd-updated.pdf`, and the prior
combined file was preserved as
`proposed-system-diagrams-before-class-rebuild-2026-11-08.drawio`.
