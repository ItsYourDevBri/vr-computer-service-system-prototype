# Hardware Exploration 02D QA

**Date:** 2026-11-07<br>
**Scope:** Selected-component education content, compact landscape UX, stereo overlays, and icon-only dashboard navigation.

## Delivered behavior

- All 11 hardware catalog entries provide a concise summary plus description, purpose, explanation, identifying features, and basic information. Component selection updates those fields and loads the matching GLB.
- SSD and HDD remain separate catalog entries. The optical drive remains a standalone educational model because the chassis has no compatible 5.25-inch bay.
- Compact landscape shows the selected component summary and a `View Details` action. The details drawer has a visible `Close` action and scrollable content; the component library remains a separate drawer.
- Desktop keeps the component information panel visible.
- Stereo presentation hides the component library, details panel, and compact summary. Returning to Normal 3D restores the existing selection and viewer without reloading the GLB.
- The activity top-left dashboard link displays only the back-arrow icon. Its accessible name remains `Back to Student Dashboard`.
- The phone portrait gate and landscape-resume behavior from 02C remain in place. Assembly and Disassembly remain non-interactive shells.

## Verification

| Check | Result | Evidence |
| --- | --- | --- |
| JavaScript syntax | PASS | `npm run validate:js` — 25 files |
| Lint | PASS | `npm run lint` |
| Production build | PASS with warning | `npm run build`; Three.js runtime chunk is 646.37 kB minified (161.52 kB gzip), above Vite's 500 kB advisory threshold |
| Full browser suite | PASS | `npm run test:e2e` — 32 passed |
| Focused 02D interactions | PASS | 5 Playwright tests covering content, drawers, stereo, and captures |
| Portrait/landscape resume | PASS | Preserves the selected CPU and stereo mode across rotation; overlays stay hidden in stereo; returning to Normal 3D restores component-library access |
| Component content | PASS | Automated assertions cover all 11 entries and distinct SSD/HDD plus standalone optical-drive facts |
| Icon-only navigation | PASS | No visible Dashboard text; link retains accessible name |
| Blender/master assets | Unchanged | No Blender, GLB source, or CSS application backend assets were edited |

## Screenshots

Captured by Playwright from the running application:

- [Desktop workspace](../artifacts/css-3d-02d/after/hardware-exploration/desktop.png)
- [Mobile landscape summary — 667 × 375](../artifacts/css-3d-02d/after/hardware-exploration/mobile-landscape.png)
- [Mobile landscape — 844 × 390](../artifacts/css-3d-02d/after/hardware-exploration/normal-3d-with-description-844x390.png)
- [Component drawer](../artifacts/css-3d-02d/after/hardware-exploration/components-drawer.png)
- [Full component details](../artifacts/css-3d-02d/after/hardware-exploration/full-component-details.png)
- [CPU details](../artifacts/css-3d-02d/after/hardware-exploration/cpu-details.png)
- [Motherboard details](../artifacts/css-3d-02d/after/hardware-exploration/motherboard-details.png)
- [RAM details](../artifacts/css-3d-02d/after/hardware-exploration/ram-details.png)
- [Stereo VR-style view](../artifacts/css-3d-02d/after/hardware-exploration/vr-view.png)

The stereo view is a stationary visual preview. It does not implement WebXR, head tracking, or motion controls. Component facts are illustrative educational descriptions of the supplied models, not verified commercial hardware specifications.
