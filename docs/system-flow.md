# System Flow

These are approved product flows. The current UI uses local state and illustrative records only; it does not implement the underlying services.

## Invitation-based account entry

1. A Principal invites a CSS Instructor.
2. The Instructor activates the invitation and signs in.
3. The Instructor creates/manages a class and invites CSS Students.
4. Each Student activates an invitation before login.
5. A Student may optionally complete profile setup, then reaches the Student dashboard.

No public self-registration is planned. Authentication, invitations, and role navigation are simulated. Role selection is demo-only and is not secure production authentication. Passwords and activation details are not retained after the screen flow.

## Role-based dashboard navigation

- Principal → dashboard → instructors or classes.
- CSS Instructor → dashboard → classes, students, assessments, or progress.
- CSS Student → optional first-time profile setup → dashboard → hardware, assembly, disassembly, assessments, progress, or editable profile settings.

## Independent practice

Student dashboard → choose Hardware Exploration, Assembly, or Disassembly → practice at the student's pace → repeat activities when desired. Guided activities remain available after authorized access.

## Instructor-assigned assessment

Instructor selects a predefined procedural assessment → assigns it to a student/class → Student completes assembly/disassembly steps in sequence → result is recorded by the future system → Instructor reviews results and progress.

## Student progress

Student completes learning activities and assigned assessments → a future progress view presents the student's own activity/results. Activity tracking is not connected. Instructor and Principal pages currently contain illustrative class and learner records; those records are not live account data.

## Current prototype implementation after CSS-3D-02D

- The app is HTML5, CSS3, and Vanilla JavaScript ES modules, served and built with Vite. Three.js is dynamically loaded for the Hardware Exploration viewer.
- `src/app/router.js` preserves existing paths using the browser History API, supports direct URL loads and refresh, handles back/forward navigation, and redirects unknown paths to `/login`. Route-specific transient state is reset on path changes.
- Vite's SPA fallback serves the app shell for direct route visits in development and production preview.

- `/` is the cinematic landing page; its Get Started and Login / Sign Up actions lead to `/login`.
- Login offers the invitation-based Sign Up route at `/activate-account`; the role picker remains a local navigation aid and does not verify accounts.
- Login → optional first-time profile setup → selected role workspace. Login fields are optional and are not verified; email and profile preferences are held in memory for the current session.
- Invitation activation accepts local form checks and then states that no account was created. In development, isolated `invitationFixture=invalid|expired` query values can display invitation validation states without adding controls to the normal interface.
- Selecting Profile opens the editable settings page directly. Display name and avatar changes update the shared in-memory session state; full name, assigned role, and email are read-only. Reloading resets all session state.
- Student dashboard → Hardware Exploration opens a shared library/viewer/information workspace. All 11 catalog models load from served optimized GLBs. Selecting a component updates its concise summary and its full information panel (description, purpose, how it works, identifying features, and basic information). Component selection, per-model framing, orbit, zoom, and reset work. In VR View, the Computer Case supports actual tap-to-select raycasting for 99 confirmed named case meshes, grouped as 17 educational parts. A tap in either eye uses that eye's camera; the selected group receives a subtle highlight and matching educational cards appear in both eyes. Pointer movement beyond the tap threshold does not select a part. Other catalog GLBs do not yet expose mesh-level VR part selection. The compact landscape summary has a View Details action; the details drawer is scrollable and has a visible Close control. The top-left dashboard navigation is arrow-only and retains an accessible “Back to Student Dashboard” name. The Optical Drive remains standalone.
- On smartphone portrait, Hardware Exploration, Assembly, and Disassembly expose only a rotate-phone prompt, the exact instruction to rotate to landscape, and Back to Dashboard. The workspace and its controls are inaccessible. Three.js is not initialized on portrait entry; a viewer opened in landscape is paused when the viewport returns to portrait.
- Rotating back to landscape restores the shared workspace without navigation or GLB reload, preserving the selected component and Normal 3D/stereo mode. Desktop and tablet users are not blocked. “VR View” displays distinct stationary projections with a headset-style mask. Case-part picking is Three.js raycasting, but the viewer does not read motion sensors, request WebXR, or represent verified headset compatibility. These capability limits remain in internal documentation rather than visible learning UI.
- Compact landscape screens use component and detail drawers over a single viewer. The prompt relies on manual device rotation; the app does not request orientation locking or rotate the interface in software.
- In VR View, the component library, normal information panel, and mobile summary are hidden. Selecting a confirmed Computer Case part adds the same compact detail card inside each eye; visible text covers the part name, description, and purpose/function. Closing the card clears the highlight. Exiting returns to Normal 3D, where the standard component information remains available. Camera position and GLB load are preserved.
- Student dashboard → Assembly or Disassembly opens the same responsive landscape shell, but the interaction controls remain disabled and the screen states that the activity is not interactive yet.
- Instructor and Principal invitation delivery, class changes, assessment assignment, and progress recording are not connected. Invitation actions explicitly state that no email was sent.
- Blender-authored models and source exports are preserved under `blender_assets/`; copies of all 11 optimized GLBs are served from `public/assets/hardware/optimized_glb/`. Six exports contain stray `OPTICAL_` nodes, filtered from runtime clones so the standalone drive is not duplicated. Temporary blue case-fan materials are neutralized in a runtime-only clone. No Blender model or source GLB was modified. Blender MCP was unavailable, so review uses exported GLB structure/materials and browser renders; see [Hardware Exploration QA](hardware-exploration-qa.md).

## Intended future capstone flow

The Chapter I destination is a sequential, repeatable assembly and disassembly learning flow using the interactive hardware components, plus progress and instructor-assigned procedural assessments. Persistent records, production identity/invitations, and verified physical VR support remain future functionality. This phase completes Hardware Exploration only; walkthrough steps and gameplay interactions are not included. See the [requirement traceability checklist](requirement-traceability.md).
