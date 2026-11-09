# VR-Based CSS Training Application

A mobile-first software prototype for the research project **A VR-Based Computer Systems Servicing (CSS) Training Application with Interactive Hardware Learning for Movers Institute of Technology and Education (MITE)**. It supplements classroom instruction and physical hands-on practice.

The approved research scope, role hierarchy, exclusions, and implementation boundaries are documented in [Project Context](docs/project-context.md), [System Flow](docs/system-flow.md), [Architecture](docs/architecture.md), and the [Chapter I requirement-to-prototype checklist](docs/requirement-traceability.md).

## Current prototype

- Student, CSS Instructor, and Principal role-based interface flows.
- Hardware Exploration with all 11 Blender GLBs, orbit, zoom, reset, and per-component educational details.
- Stereoscopic VR-style presentation with confirmed Computer Case part selection. Phone learning workspaces require landscape orientation and pause in portrait.
- Reversible Assembly and Disassembly controls with validated case, motherboard, CPU, paired RAM, and CPU cooler installation/removal transitions. The corrected exports validate the ATX tray, nine mounting-hole/standoff correspondences, and authored component attachment transforms at runtime.
- Application-controlled technician hands appear during guided stereo animations. They are procedural visuals, not tracked hands.
- Component 10, the optical drive, remains a standalone learning asset.

![MITE CSS training application landing page](docs/screenshots/landing-desktop.png)

![Desktop Hardware Exploration](docs/screenshots/hardware-exploration-desktop.png)

![Mobile stereoscopic case-part selection](docs/screenshots/vr-case-part-selection-mobile.png)

## Simulated and future functionality

Login, role selection, invitations, account activation, recovery, classes, assessments, and progress use local illustrative data and browser-session UI state. They do not authenticate users, send email, or persist information to a server.

The original Blender master is preserved. CSS-3D-04 adds versioned corrected case/motherboard exports, while CSS-3D-05 integrates the authored CPU, paired RAM, and cooler GLBs. See the [CSS-3D-04 geometry report](docs/css-3d-04-geometry-correction-report.md) and [CSS-3D-05 component report](docs/css-3d-05-components-report.md).

The stereo view is fixed and stationary. There is no WebXR, head tracking, motion sensing, controller input, physical headset validation, production authentication, database, email delivery, or multiplayer. See the traceability checklist and [system stabilization report](docs/system-stabilization-report.md) for feature-level status.

## Technology

- HTML5 and native CSS3
- Vanilla JavaScript ES modules
- Vite 8 and npm
- Three.js 0.187.0, GLTFLoader, and OrbitControls
- Blender-authored GLB assets
- Playwright Test and Oxlint

React, JSX/TSX, TypeScript, and Tailwind CSS are not part of the application architecture.

## Requirements and setup

- Node.js compatible with Vite 8 (verified in development with Node 24.11.1)
- npm
- Chromium browser binaries for end-to-end tests

```sh
# Clone the repository and enter it
git clone git@github.com:itsmebriii/vr-css-prototype.git
cd vr-css-prototype

# Install the locked dependency tree
npm ci

# Install the browser used by Playwright (one time per machine)
npx playwright install chromium

# Start the development server
npm run dev
```

Vite prints the local URL, normally `http://localhost:5173/`.

## Verification

```sh
npm run validate:js
npm run lint
npm run build
npm run test:e2e
PLAYWRIGHT_PREVIEW=1 npm run test:e2e
```

The preview-mode run expects a current production build. Browser tests cover public and role routes, navigation, responsive layouts, GLB loading and controls, stereo presentation, landscape gating, case-part picking, and guided transitions. Current results and limitations are in the [system stabilization report](docs/system-stabilization-report.md).

For an existing checkout, update it with an explicit pull strategy when local and remote history have diverged:

```sh
git fetch origin
git pull --rebase origin main
```

Use `git pull --no-rebase origin main` if the project requires a merge commit instead. The repository remote is `git@github.com:itsmebriii/vr-css-prototype.git`; verify it with `git remote -v`.

## Repository layout

```text
src/                                  Vanilla JS app, pages, styles, activities, and Three.js viewers
public/assets/hardware/optimized_glb/ Runtime GLBs used by Hardware Exploration
public/images/                        MITE branding, lab photo, and component previews
blender_assets/                       Reusable Blender project, source exports, and local QA evidence
docs/                                 Research context, architecture, traceability, and QA
docs/screenshots/                     Selected product screenshots shown above
tests/                                Playwright end-to-end coverage
```

All 11 optimized component GLBs are served from `public/`. The original Blender master and component assets are preserved. Historical Blender backups, scene renders, and local reports under `blender_assets/` are development artifacts and are not required to run the web application.

Image and school-seal credits are recorded in [Asset Credits](docs/asset-credits.md). Hardware Exploration evidence is in [Hardware Exploration QA](docs/hardware-exploration-qa.md), [Landscape Workspace QA](docs/landscape-workspace-qa.md), and [VR Part Selection QA](docs/hardware-vr-interaction-qa.md).
