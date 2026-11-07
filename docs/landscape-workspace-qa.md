# CSS-3D-02C — Landscape Workspace QA

## Result

PASS. Phone portrait blocks the learning workspace on Hardware Exploration, Assembly, and Disassembly. It displays a rotation icon, “Rotate Your Phone,” the required message, and Back to Dashboard. Desktop and tablet layouts remain available. Rotating between portrait and landscape updates the current route in place.

On a fresh phone-portrait visit, the Hardware Exploration route does not import the Three.js runtime or request a GLB. If the viewer was already opened in landscape, returning to portrait hides the workspace and stops its animation loop. Returning to landscape resumes the same selected model and viewing mode without reloading the document or GLB.

## Verified behavior

| Check | Result | Evidence |
| --- | --- | --- |
| Portrait gate at 320×568, 375×667, 390×844, and 430×932 | PASS. Only the rotation icon, title, exact instruction, and dashboard link appear. Workspace controls are inaccessible and the page does not overflow. | `three learning activities share the smartphone portrait gate and landscape workspace` |
| Three.js on initial portrait entry | PASS. The runtime is not imported and no GLB request is made for Hardware Exploration. Assembly and Disassembly have no canvas. | Same test, using fresh portrait navigation for each activity. |
| Phone landscape at 667×375, 844×390, 874×402, and 932×430 | PASS. Normal 3D and VR controls, viewer, and compact component/details drawers remain usable without horizontal overflow. | `Normal 3D supports orbit, zoom, and reset without horizontal overflow across target sizes`; `mobile landscape uses compact drawers and retains the model through VR mode changes` |
| Tablet and desktop | PASS. 768×1024 tablet and 1440×900 desktop remain ungated; viewer and top-bar controls stay inside the viewport. | Responsive Normal 3D test. |
| Return from landscape to portrait | PASS. Workspace is hidden and `rendererActive` becomes false, which stops the viewer lifecycle. Selected CPU and stereo mode remain in state. | `portrait pauses the viewer and landscape resumes the selected component and VR mode without reloading` |
| Return from portrait to landscape | PASS. The workspace and renderer resume; CPU remains selected in stereo mode. The same document stays open and `cpu.glb` is requested once. | Same orientation-transition test. |
| Normal 3D state | PASS. Normal mode remains selected across the portrait/landscape responsive matrix; orbit, zoom, and reset still work. | Responsive Normal 3D test. |
| Assembly and Disassembly | PASS for the shared orientation gate and landscape shell. Their walkthrough controls remain placeholders and no gameplay was added. | Shared activity gate test and portrait screenshots. |
| Motion sensors and orientation lock | PASS. No device motion/orientation sensor or screen orientation-lock API is used. The interface is not rotated in software. | `activity orientation and camera implementation do not use motion sensor APIs`; source audit. |

## Captures

- [Desktop Hardware Exploration](../artifacts/css-3d-02c/after/workspace/hardware-exploration-desktop.png)
- [Phone portrait prompt](../artifacts/css-3d-02c/after/workspace/hardware-exploration-phone-portrait-prompt.png)
- [Phone landscape workspace](../artifacts/css-3d-02c/after/workspace/hardware-exploration-phone-landscape.png)
- [Components drawer](../artifacts/css-3d-02c/after/workspace/hardware-exploration-components-drawer.png)
- [Details drawer](../artifacts/css-3d-02c/after/workspace/hardware-exploration-details-drawer.png)
- [Stereo view in landscape](../artifacts/css-3d-02c/after/workspace/hardware-exploration-stereo-landscape.png)
- [Assembly portrait prompt](../artifacts/css-3d-02c/after/workspace/assembly-phone-portrait-prompt.png)
- [Disassembly portrait prompt](../artifacts/css-3d-02c/after/workspace/disassembly-phone-portrait-prompt.png)

These are actual Playwright browser captures of the app and its Three.js viewer.

## Verification commands

- `npm run validate:js` — PASS; syntax validated in 25 JavaScript files.
- `npm run lint` — PASS.
- `npm run build` — PASS. Vite reports the dynamically loaded Three.js runtime at 646.37 kB minified / 161.52 kB gzip, above its 500 kB advisory threshold.
- `npm run test:e2e` — PASS; 31/31 tests.
- Final orientation, responsive, and screenshot checks after the last assertion update — PASS; 4/4 targeted tests.

No Blender geometry or GLB assets were changed. Assembly/disassembly walkthroughs, physical VR compatibility, WebXR, and device-sensor behavior remain outside this phase.
