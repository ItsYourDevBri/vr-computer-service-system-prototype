# Project Instructions for Codex

- Read `docs/project-context.md`, `docs/system-flow.md`, and `docs/architecture.md` before substantial product or architecture changes.
- Respect the approved CSS research scope and role hierarchy.
- Keep documentation explicit about what the current prototype implements, what is simulated, and what belongs to the future capstone; maintain `docs/requirement-traceability.md` as a concise Chapter I checklist.
- Audit existing files and architecture before editing. Preserve existing work and avoid replacing unrelated project assets.
- Keep interfaces mobile-first, accessible, compact, and professional. Use the established navy, charcoal, slate, soft-white, and teal tokens.
- Treat authentication, invitations, assessments, physical VR compatibility, and unimplemented 3D behavior as simulated or future requirements until actually implemented and verified.
- Never automatically add multiplayer, walkable lab navigation, avatar gameplay, complex troubleshooting, certification, or school-management features.
- Keep local illustrative data clearly labeled in source and documentation. Do not use real student personal information or credentials.
- Preserve the HTML5, CSS3, Vanilla JavaScript ES module, Vite, Three.js, Blender/GLB asset, and npm architecture unless a task gives a concrete reason to change it.
- CSS-3D-02B authorizes all 11 hardware GLBs in Hardware Exploration, with interactive orbit/zoom/reset and stationary side-by-side stereoscopic presentation. CSS-3D-02C requires a strict landscape-only learning workspace on phones for Hardware Exploration, Assembly, and Disassembly: in portrait, expose only the rotate prompt and dashboard link, and pause any existing viewer. Do not provide a portrait Normal 3D fallback. Preserve desktop/tablet behavior and selected component/mode through viewport rotation. This does not authorize Assembly/Disassembly gameplay, motion tracking, or WebXR.
- CSS-3D-02D adds component-specific summary and educational detail content to Hardware Exploration. Keep details available on desktop and use a readable, scrollable details drawer in compact landscape. Hide flat information overlays in stereoscopic mode. The Hardware Exploration top-left dashboard link is intentionally arrow-only, with an accessible name. Preserve the landscape-only portrait gate and do not add gameplay, head tracking, or WebXR.
- CSS-3D-02E adds actual raycast selection for confirmed named Computer Case meshes in either stereoscopic eye. Show matching educational details in both eyes and a restrained selected-part highlight; taps select while drags do not. Preserve the normal 3D experience and portrait gate. Keep VR capability limitations in internal documentation, not visible learning UI. Do not extend part picking to unverified mesh names or add head tracking/WebXR.
- Do not add backend services, databases, SMTP, or mobile packaging unless the user requests that phase.
- Verify relevant changes with JavaScript syntax validation, production build, linting, and appropriate Playwright checks. Report anything not run or not verified.
- Preserve all `blender_assets/` files unless a Blender task explicitly requests changes.
- Do not commit, push, merge, or deploy unless explicitly requested.
