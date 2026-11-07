# Architecture

## Technology stack

- HTML5 document shell in `index.html`
- Native CSS3 in `src/styles/app.css`, with CSS custom properties for navy, charcoal, slate, soft white and teal
- Vanilla JavaScript ES modules in `src/`
- Vite for development, history fallback, and production builds
- Three.js 0.187.0 plus official `GLTFLoader` and `OrbitControls` addons, loaded dynamically under `src/three/`
- Blender and glTF/GLB as the source format for the hardware assets
- Playwright Test and Oxlint for verification

There is no React, JSX/TSX, TypeScript, React Router, or Tailwind runtime/build dependency.

## Structure

```text
src/
  app/          main entry, History API router, session-only store
  components/   safe template mounting, escaped text, SVG icons and shared helpers
  data/         local illustrative student, class, instructor and assessment records
  layouts/      dashboard shell and role-aware navigation
  pages/        landing, auth, student, instructor, principal and profile views
  activities/   shared landscape learning workspace and activity controller
  routes/       known path list and role navigation
  styles/       native application CSS and responsive rules
  three/        viewer factory, model loader, controls, asset manager and lifecycle
```

`main.js` renders the selected page and delegates click, input, submit, and keyboard events. Template strings hold authored markup; interpolated user text is HTML-escaped, and live preview text is inserted through `textContent`. Shared UI is composed from small rendering functions without a component framework.

## Routing and session state

`src/app/router.js` uses `history.pushState()`, `popstate`, and same-origin links. Direct loads and refreshes work through Vite's SPA fallback. Unknown paths replace the URL with `/login`. Hash navigation on the landing page remains native. Transient form, menu, search, and modal state resets when the pathname changes; browser history state is used for the post-activation notice.

`src/app/store.js` holds role, display name, full name, optional email, and avatar style in memory. This is not authentication or authorization: routes do not enforce access and role choice is only a UI navigation aid. Profile edits are session-only and reload resets the store, matching the existing prototype behavior.

## Views and behavior

- Public screens: landing, login, invitation activation, and password recovery.
- Shared screens: optional profile setup and directly editable profile settings.
- Student: dashboard, hardware exploration, assembly, disassembly, assessments, and progress previews. Hardware Exploration loads all 11 catalog GLBs as interactive isolated models and binds educational summaries and detail fields to the selected catalog record.
- Instructor: dashboard, classes, students, assessments, and progress.
- Principal: dashboard, instructor list, and class overview.

The existing simulated navigation and responsive behavior are retained. Invitation review does not send email; login and password recovery do not verify accounts or send messages; class and assessment records remain local illustrative data; assembly/disassembly gameplay and activity tracking are not implemented.

## CSS and design

The existing MITE seal, classroom photograph, dark glass surfaces, typography, focus states, and responsive layouts are retained in native CSS. The design tokens live as CSS variables in `:root`. Tailwind's import, plugin, utility processing, and dependencies are removed.

## Three.js boundary

`src/three/runtime.js` is dynamically imported after Hardware Exploration is open, keeping Three.js out of the initial application download. `viewer.js` creates one scene, camera, renderer, controls, asset manager, and resize lifecycle. All 11 models support orbit, pinch/scroll zoom, reset, and per-model framing. The selected catalog record supplies the mobile summary and detail panel fields (description, purpose, operation, identifying features, and basic information). Compact landscape opens component and scrollable details drawers over the viewer; the summary remains visible in the normal view. The top-left dashboard link contains only a back arrow and has a screen-reader label. Stereo mode renders left/right projections with separate projection offsets and a CSS headset mask, and hides the component library and normal detail panels. For the Computer Case only, confirmed named meshes map to educational part groups; a tap is converted to eye-local normalized coordinates and raycast against the corresponding stereo camera. A small pointer-movement threshold distinguishes taps from drags. The selected group receives a reversible teal-tinted material highlight, and matching part cards are shown at equivalent positions in both eyes. Mount empties and unrelated GLB nodes are ignored. Other models do not yet expose part-level VR selection. The viewer does not read device motion or request WebXR. Phone portrait shows only the rotate prompt and dashboard link for Hardware Exploration, Assembly, and Disassembly. The viewer is not initialized on portrait entry and is paused on a return to portrait; selection and mode persist for landscape resume without reloading the route or GLB. Assembly and disassembly retain a responsive shell but do not have walkthrough steps or gameplay interactions; those remain future capstone work.

`asset-manager.js` loads from `public/assets/hardware/optimized_glb/`, returns a cloned scene, and releases model resources when a selection changes. It filters node names beginning with `OPTICAL_` in the Case, Motherboard, CPU, CPU Cooler, RAM, and GPU exports because these include geometry for the separate standalone Optical Drive. It applies a neutral graphite material correction to temporary case-fan placeholders at runtime. Neither correction modifies the source GLBs or Blender project. GLB accessor-derived triangle totals do not match all manifest estimates; the QA report records export and rendered geometry counts separately. The physical headset experience, motion tracking, and WebXR remain unverified and unimplemented. See [Hardware Exploration QA](hardware-exploration-qa.md) for model-by-model counts and issues.

## Verification and rollback

`npm run validate:js` checks JavaScript syntax, `npm run lint` runs Oxlint, `npm run build` produces the Vite bundle, and `npm run test:e2e` exercises the browser app. Set `PLAYWRIGHT_PREVIEW=1` to run the same suite against `vite preview` after a build.

A pre-migration source/test/screenshot snapshot is preserved in `artifacts/css-arch-01/pre-migration-2026-11-07.tar.gz`. It is an archival rollback artifact and is not loaded by Vite or included in production output.
