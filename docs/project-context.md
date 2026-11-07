# Project Context

## Project identity

**Project:** CSS VR Training Application<br>
**Research title:** A VR-Based Computer Systems Servicing (CSS) Training Application with Interactive Hardware Learning for Movers Institute of Technology and Education.

This is an independent, mobile-first educational application. The current work is a local web UI/UX prototype. It supplements physical hands-on instruction and does not replace it.

## Research problems

The approved project responds to:

1. Limited availability of physical computer resources for practical training.
2. Difficulty identifying computer hardware and understanding component functions.
3. Limited opportunities for individual practice.
4. Difficulty understanding and following computer assembly and disassembly procedures.

## Approved learning features

- Hardware exploration with component names, descriptions, purposes, functions, identifying features, and basic information. CSS-3D-02B loads all 11 Blender GLBs as independently selectable 3D models with orbit, zoom, reset, and fixed stereoscopic presentation. CSS-3D-02C gates the shared phone workspace to landscape orientation. CSS-3D-02D adds selected-component summaries and full educational details, with details and component drawers on compact landscape screens. CSS-3D-02E adds VR part selection for confirmed named Computer Case meshes, with an educational detail card in each eye.
- Guided assembly with an organized parts area and a sequential installation walkthrough. CSS-3D-03A-R adds reversible button-controlled glass-panel and motherboard fit-preview animations with Normal 3D and stereo presentation. The supplied Blender tray and motherboard pose block a verified installation, so the preview stops before the tray and never records the board as installed. Full assembly remains incomplete until the Blender assets are corrected and revalidated.
- Guided disassembly from an assembled computer with removal instructions and component highlighting.
- Independent, repeatable practice after students receive authorized access.
- Separate instructor-assigned procedural assessments focused on steps and sequence, with instructor progress monitoring.

## Roles and invitation hierarchy

The intended hierarchy is **Principal → CSS Instructor → CSS Student**.

- Principals invite and manage instructors and see general CSS class participation.
- Instructors manage classes and students, assign predefined assessments, and review learning and assessment progress.
- Students use hardware exploration, assembly, disassembly, assigned assessments, progress, profile, and settings.

The intended final system is invitation-only: principals invite instructors, instructors invite students, and students activate accounts before login. Public self-registration is not supported. Authentication, invitations, and role navigation in the prototype are simulated. Role selection on Login is demo-only and is not secure production authentication.

## Viewing modes

1. Normal 3D touchscreen mode is the default.
2. Smartphone VR is optional and requires compatible device support and testing.

Both modes support the same educational activities. Planned targets include compatible Android/iOS phones, VR Box headsets, and supported controllers. Compatibility has not yet been verified.

## Explicit exclusions

- Multiplayer or shared virtual classroom sessions
- Workstation navigation or a walkable 3D computer lab
- Avatar-based multiplayer gameplay
- Complex hardware troubleshooting
- Full TESDA certification or competency assessment
- Full school management functionality

## Current prototype

The approved research scope, role hierarchy, exclusions, and mobile-first direction are retained. The frontend uses HTML5, CSS3, Vanilla JavaScript ES modules, Vite, Three.js, and Playwright. Hardware Exploration dynamically loads all 11 copied optimized GLBs with per-model framing, orbit, zoom, reset, and stationary side-by-side stereo. Each selection updates a concise summary and a full educational detail panel covering purpose, operation, identifying features, and basic information. In VR View, taps raycast against confirmed named meshes in the Computer Case GLB from the tapped eye's stereo camera; the matching part is highlighted and its educational card appears in both eyes. Compact landscape uses a large viewer with component and detail drawers. On smartphone portrait, Hardware Exploration, Assembly, and Disassembly show only the rotate prompt and dashboard link; an opened viewer pauses on return to portrait. Landscape rotation resumes the selected model and viewing mode without a route reload. The Optical Drive remains standalone. Assembly and Disassembly now use reversible Previous/Next/Replay/Reset animations driven by an ordered Three.js transition sequence; students cannot drag or snap hardware. Assembly animates the verified glass-panel removal and a motherboard fit preview that stops before the solid tray. This preview is explicitly not an installation, and the installed state remains false. Disassembly reuses the same panel transform in reverse and keeps unverified component removals unavailable. Stereo uses the same animated scene in both eyes and application-controlled technician hand poses. CSS-MA-01 stabilized replay failure handling and partial GLB load cleanup. A read-only assembly candidate was rejected after it introduced further intersections; no Blender source or hardware GLBs changed. See [the guided animation system](guided-animation-system.md), [the CSS-3D-03A asset audit](guided-assembly-asset-audit.md), and [the CSS-MA-01 stabilization report](system-stabilization-report.md).

## Simulated features

Role navigation, login, profile setup, invitation forms, account activation, assessments, class records, and progress screens use local illustrative data and session-only UI state. They do not authenticate users, send email, persist records, or report server-side completion. Stereo is fixed, stationary, and uncalibrated; physical phone/headset compatibility is not verified. Guided animation uses real GLBs and deterministic local state. The motherboard motion is an exploded fit demonstration only because the current Blender geometry fails the fit audit; additional assembly and component-removal steps remain unavailable until their transforms are verified.

## Intended future capstone functionality

The complete application described by Chapter I may add verified sequential assembly and disassembly walkthroughs, persistent student activity and assessment records, invitation-based production authentication, and verified optional device support. The first assembly fit check is a prototype foundation, not an installed motherboard lesson. The case tray and board orientation need source-level correction and validation before the lesson can proceed. Do not broaden the research project into the exclusions listed above. Blender source assets and hardware GLBs remain unchanged; copies are served from `public/assets/hardware/optimized_glb/`. Runtime filtering removes stray `OPTICAL_` nodes from contaminated exports, and a runtime-only material correction neutralizes the case's temporary fan colors. See [Hardware Exploration QA](hardware-exploration-qa.md) and [the guided animation system](guided-animation-system.md) for current evidence.
