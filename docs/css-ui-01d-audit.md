# CSS-UI-01D — UI Polish Audit

## Scope

Reviewed the landing page, About and Features sections, login, invitation activation, password recovery, optional profile setup, student learning and progress pages, instructor dashboards and management pages, principal dashboards and class pages, profile settings, mobile navigation, and modal/drawer flows. This pass changes presentation and copy only; it adds no authentication, invitation service, saved records, assessment submission, 3D interaction, or backend behavior.

## Findings before refinement

- Activation and profile screens used the lab image directly behind fields, without the same visible surface as the login card. The activation form also began with a state selector, an invitation status card, a `SAMPLE` badge, a second heading, and technical warning copy.
- Profile setup repeated its purpose in a tag, eyebrow, heading, role notice, and “demo profile” caption.
- Login described its role selector as a local preview, while the primary button suggested a verified sign-in. Password recovery used a preview action and a conditional success-like response despite sending no email.
- Dashboard pages repeated `DEMO PREVIEW`, sample-data tags, and tiny metric labels. The data was fictional, but the warnings competed with the content instead of clearly explaining it once.
- The Principal overview’s instructor table clipped its last action column on desktop. The related roster layout also overflowed at a 768px tablet width.
- Dashboard surfaces were structurally consistent but used very small labels and tight corners. Auth fields had darker backgrounds, but activation/profile lacked shared glass panels and consistent field sizing.

## Refinements

- Added a shared dark glass surface for all authentication cards, with stronger mobile opacity, a darker photo overlay, shared borders/radii, and consistent form sizes and spacing. The MITE seal image is unchanged and keeps its aspect ratio.
- Simplified activation and profile setup headings and hierarchy. Invitation outcome scenarios remain available in a collapsed, development-only disclosure; normal activation form content no longer includes test labels or duplicate status chips.
- Reworded account actions to report their actual behavior. Login continues to the selected workspace without checking credentials; activation only runs local field checks; invitation and assessment actions do not send or save; password recovery does not send email. Result messages state these limitations without claiming completion of a real service action.
- Replaced repeated dashboard badges with one restrained notice: “Illustrative information. People and learning records are fictional; changes are not saved.” Removed decorative demo/sample labels while preserving clear data transparency.
- Increased dashboard heading, body, table, and card readability; consolidated surface colors and corner radii into shared tokens; adjusted tablet table columns to prevent clipping and overflow.
- Preserved the accepted landing-page structure and navigation while updating capability wording to distinguish planned 3D activities from features currently available.

## Routes and visual QA

Playwright captured desktop (1440×900) and phone portrait (390×844) screenshots for the landing page, login, activation, recovery, profile setup, student dashboard/activity/assessment/progress pages, instructor dashboard/classes/students/assessments/progress pages, principal dashboard/instructors/classes, and profile settings. Login, activation, recovery, and profile setup also have phone landscape captures at 844×390. Screenshots are in `artifacts/css-ui-01d/after/`.

Visual review confirmed the shared auth panels, mobile card readability, clean profile setup, dashboard notices, and corrected Principal table actions. Automated layout checks cover the requested 320×568, 375×667, 390×844, 430×932, 667×375, 844×390, 874×402, 932×430, 768×1024, and 1440×900 viewports, including form reachability and table overflow.

## Validation

- `npm run typecheck` — passed
- `npm run lint` — passed
- `npm run build` — passed
- `npm run test:e2e` — 17 passed

Validation used Playwright Chromium viewport emulation; physical iOS/Android devices and on-screen keyboards were not tested.

## Remaining boundaries

Authentication, account activation, password recovery, invitation delivery, data persistence, and assessment recording remain unimplemented. Student hardware, assembly, and disassembly activities remain informational destinations without 3D interactions. The UI discloses these limitations where relevant. The app is ready for the next **Hardware Exploration UI** phase, while that activity itself still requires implementation.
