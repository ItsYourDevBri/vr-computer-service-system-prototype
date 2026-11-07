# CSS-ARCH-01 Migration Audit

## Baseline

- Existing frontend: React 19 + TypeScript, React Router, Vite 8, Tailwind CSS v4 build plugin, handwritten application CSS, Lucide React icons.
- Browser entry: `index.html` → `src/main.tsx` → `src/App.tsx`.
- Navigation: React Router browser history with SPA fallback; explicit route components and a login fallback for unknown routes.
- State: in-memory React context only. Role, display name, email, avatar selection, modal state, search, and review status are prototype state; reload resets the session.
- Authentication, account activation, invitations, recovery, assessment assignment, tracking, and 3D training are not connected services.
- Browser baseline before migration: `npm run test:e2e` passed 20 tests. Existing CSS-UI-01E screenshots are in `artifacts/css-ui-01e/`.
- Git baseline: repository has no commits yet; all project files are untracked. No cleanup or history rewrite was performed.
- Pre-migration source and test snapshot: `artifacts/css-arch-01/pre-migration-2026-11-07.tar.gz`.

## Pre-Migration TypeScript/TSX Inventory

- App and state: `src/App.tsx`, `src/main.tsx`, `src/app/prototype-config.ts`, `src/app/prototype-context.tsx`, `src/app/prototype-state.tsx`, `src/app/use-prototype-state.ts`.
- Shared components: `src/components/AuthLayout.tsx`, `Brand.tsx`, `DashboardLayout.tsx`, `Modal.tsx`, `PageHeading.tsx`.
- Pages: `src/pages/ActivateAccountPage.tsx`, `ForgotPasswordPage.tsx`, `LandingPage.tsx`, `LoginPage.tsx`, `ManagementPages.tsx`, `ProfileSetupPage.tsx`, `StudentDashboardPage.tsx`.
- Routes and tooling: `src/routes/route-config.ts`, `vite.config.ts`, `playwright.config.ts`, `tests/smoke.spec.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`.
- React dependencies: `react`, `react-dom`, `react-router`, `lucide-react`, `@vitejs/plugin-react`.
- TypeScript/Tailwind dependencies: `typescript`, `@types/node`, `@types/react`, `@types/react-dom`, `tailwindcss`, `@tailwindcss/vite`.

## Migration Plan (documented before implementation)

1. Run the existing browser suite and preserve its approval screenshots.
2. Archive the existing React source, package/config files, tests, and baseline screenshots before changing the active entry point.
3. Build the Vanilla JavaScript store, History API router, reusable HTML templates, and route views alongside the preserved source.
4. Run the existing Playwright flows against the new entry point; fix responsive or interaction regressions before removing the old application.
5. Install Three.js as an isolated, non-rendering foundation and verify the GLTFLoader/OrbitControls imports bundle with Vite.
6. Only after the replacement passes, remove active React/TSX/TypeScript/Tailwind files and dependencies.
7. Update instructions and architecture documentation, then verify development and production preview behavior.

## Route Inventory

| Route | Page | Role / behavior |
| --- | --- | --- |
| `/` | Landing | Home, About and Features anchors, responsive menu, login links |
| `/login` | Workspace entry | Optional email/password, password visibility, role selection, profile flow |
| `/activate-account` | Invitation form | Valid, invalid and expired development fixture states; no account creation |
| `/forgot-password` | Recovery notice | Required email input; confirms no email is sent |
| `/profile-setup` | Profile setup | Optional display name, avatar choices, save or skip |
| `/student/dashboard` | Student overview | Activity cards, assigned work and progress preview |
| `/student/hardware` | Hardware activity preview | Future activity notice and return navigation |
| `/student/assembly` | Assembly activity preview | Future activity notice and return navigation |
| `/student/disassembly` | Disassembly activity preview | Future activity notice and return navigation |
| `/student/assessments` | Student assignments | Static illustrative assignments and activity links |
| `/student/progress` | Student progress | Static empty progress overview |
| `/instructor/dashboard` | Instructor overview | Illustrative class and learner summaries |
| `/instructor/classes` | Class list | Class details modal |
| `/instructor/students` | Student directory | Search, details modal, invitation review modal; `?invite=1` opens invite |
| `/instructor/assessments` | Assessment library | Review modal and session-only Reviewed state |
| `/instructor/progress` | Student progress | Learner details modal |
| `/principal/dashboard` | Principal overview | Illustrative class and instructor summaries |
| `/principal/instructors` | Instructor directory | Details modal, invitation review; `?invite=1` opens invite |
| `/principal/classes` | Class overview | Illustrative institutional summary |
| `/settings` | Profile | Directly editable display name and avatar; readonly identity fields |
| Other paths | Login fallback | Unknown routes return to `/login` |

## Existing Interactions to Preserve

- Landing hash navigation updates active section and closes the mobile navigation.
- Login permits blank email and password by user direction; role selection opens profile setup, then the selected role dashboard.
- Profile setup supports Initials, Systems and Teal avatar styles, optional display name, save and skip.
- Invitation form validates required fields and matching passwords; development-only `invitationFixture=invalid|expired` query fixtures remain available without visible testing controls.
- Recovery accepts an email and reports that recovery is unavailable without sending a message.
- Role dashboards provide active desktop/mobile navigation, profile access, logout, and page links.
- Student activity previews and assessment/progress pages display illustrative UI without claiming completed tracking or 3D behavior.
- Instructor class and learner rows open details; student directory supports live search; invite forms only review details; assessment review stores a temporary Reviewed state.
- Principal instructor details and invite review remain available.
- Profile page is directly editable; only display name/avatar update for the current in-memory session.
- Invite query parameters open the relevant dialog and are removed when closed.
- Modal close button, backdrop, and Escape key dismiss dialogs.
- Browser back/forward, direct route load and refresh must continue to work.

## UI, CSS and Assets

- Existing handwritten CSS in `src/index.css` defines the complete visual system and responsive behavior. The only Tailwind-specific input was `@import "tailwindcss"` plus a token `@theme` block; screens use custom CSS classes rather than utility classes.
- Key visual assets are `public/images/mite-school-seal.jpg` and `public/images/mite-computer-lab.jpg`. Preserve both original files and their paths.
- No CSS app screenshots or Blender hardware assets are to be altered during migration.

## Migration Result

- Vanilla entry point: `index.html` → `src/app/main.js`; all 20 existing paths are retained.
- Routing: same-origin links plus `history.pushState()`, `popstate`, native hashes, route-specific transient-state reset, Vite SPA fallback, and `/login` fallback for unknown routes.
- Application modules use native HTML templates, DOM event delegation, and a session-only store. Template text is HTML-escaped before interpolation; user-facing preview text uses `textContent`.
- Native CSS is split into tokens, base, layout, auth, dashboards, shared components, landing, profile, branding, and responsive modules. No Tailwind utility classes were present in the migrated screens.
- Three.js 0.187.0 and its official GLTFLoader and OrbitControls addons are imported by the isolated foundation; the UI does not create a scene or load models.
- Existing Blender assets remain in place and are not modified.
- Final test suite expanded to 23 Playwright scenarios, including direct-route refresh/history checks, unknown-route fallback, escaped profile text, and a Three.js module assertion. Development and production preview are both tested.
- The pre-migration React/TypeScript snapshot is compressed at `artifacts/css-arch-01/pre-migration-2026-11-07.tar.gz`; it is not an active app dependency.

## Test and Build Surface

- Playwright suite: `tests/smoke.spec.js`, 23 scenarios across route flows, role flows, mobile portrait/landscape layouts, management actions, profile editing, direct-route refresh/history, escaped user text, and UI truthfulness.
- Active scripts: `npm run dev`, `npm run validate:js`, `npm run lint`, `npm run build`, `npm run preview`, and `npm run test:e2e`.
- The active app has no TypeScript/TSX/JSX files or TypeScript/Tailwind/React dependencies. The pre-migration versions remain only in the compressed rollback archive.
- Build validation is `node scripts/check-js.js` followed by a production Vite build; browser flows are checked against both the dev server and production preview.

## Three.js Boundary

- Add Three.js and its GLTFLoader/OrbitControls addon imports as an isolated ES module foundation.
- Do not load Blender exports, create a scene in the user interface, implement component manipulation, or claim WebXR support in this phase.
- Preserve `blender_assets/` byte-for-byte. Future GLB loading should use the separately optimized exports after their review and staging, while Component 10 remains standalone.
