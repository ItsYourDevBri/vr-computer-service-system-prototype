# Hardware Exploration VR Part Selection QA

**Date:** 2026-11-07<br>
**Scope:** CSS-3D-02E — educational Computer Case part selection in the stationary stereoscopic Hardware Exploration view.

## Delivered behavior

- The Computer Case GLB has 99 named `CASE_` mesh nodes. All 99 map to 17 confirmed educational part groups. Mount empties, generic nodes, and unrelated `OPTICAL_` geometry are excluded.
- A tap or click in either eye raycasts with that eye's stereo camera. The selected part is highlighted in the model and its name, description, and purpose/function appear in equivalent cards in both eyes.
- A pointer movement over 8 CSS pixels is treated as a drag and does not select a part. The selection highlight is reversible; closing its card clears the selection.
- Switching between stereo view and Normal 3D keeps the loaded GLB available. Normal 3D orbit, zoom, reset, and information UI remain unchanged. Closing the selected-part card clears the selection.
- Phone portrait retains the existing rotate-to-landscape gate. Touch selection and paired cards work in the landscape learning workspace.
- The visible stationary-view technical disclaimer was removed from the learning UI. The capability boundary remains documented below.

## Implementation note

Each rendered stereo eye uses an offset projection matrix. Three.js `StereoCamera.update()` updates the two eye projection matrices but does not refresh their inverse matrices. Because raycasting unprojects through the inverse, leaving it stale made the pointer ray disagree with the displayed eye. The viewer now recomputes the selected eye's inverse immediately before raycasting. Tests confirm actual named GLB mesh hits in both eyes.

The highlight changes are applied to cloned runtime materials and restored on clear. Source Blender models and GLBs are not modified. Other catalog models do not yet support part-level selection.

## Verification

| Check | Result | Evidence |
| --- | --- | --- |
| Named-mesh mapping | PASS | Playwright verifies 99 of 99 named case meshes map to 17 groups; empties and optical-drive nodes are excluded. |
| Desktop eye selection | PASS, isolated | Final focused Playwright run: real mouse input in the right eye raycasts the front-fan mesh group; selected mesh and nonzero highlight count are checked. A direct browser run also hit named case meshes in both eye cameras. |
| Mobile touch and responsive layout | PASS | Final focused Playwright run: real touch selection in the left eye; checked at 667×375, 844×390, 874×402, and 932×430, plus the existing portrait gate at 390×844. The paired cards contain the selected part information. |
| Close, drag, and mode behavior | PASS | A drag does not select or move the stationary camera. Closing hides the selected-part card and runs the viewer's highlight-clear path. The existing mode test confirms the GLB remains loaded and Normal 3D is restored. |
| JavaScript syntax | PASS | `npm run validate:js` — 26 files. |
| Lint | PASS | `npm run lint`. |
| Production build | PASS with advisory | `npm run build`; Vite reports the Three.js runtime chunk at 649.56 kB minified (162.57 kB gzip), above its 500 kB advisory threshold. |
| Full browser suite | PASS | Final `npm run test:e2e` run — all 35 tests passed in 3.4 minutes, including all 11 GLB viewer checks, desktop mouse selection, mobile touch selection, and responsive layout coverage. |

## Capture

Playwright capture with the fan group selected and matching information visible in both eye regions:

- [Mobile landscape, paired VR details](../artifacts/css-3d-02e/after/hardware-vr/mobile-landscape-vr-front-fan-selected.png)
- Other captures: `artifacts/css-3d-02e/after/hardware-vr/`

## Capability boundary

The VR-style mode is a fixed, stationary stereo preview. It does not implement WebXR, motion sensing, head tracking, or physical headset calibration. Part selection currently applies only to the confirmed named meshes of the Computer Case model. Assembly/Disassembly remain outside this phase.
