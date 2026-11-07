# CSS-3D-03A — Assembly Asset Fit Audit

> Interaction history note: the drag path described in this audit was replaced by CSS-3D-03A-R. Its geometric diagnosis and measured safe boundary are still used for the current exploded fit preview; the preview is not an installation.

## Result

**Installation compatibility: FAIL.** The browser can load and move the actual case and motherboard GLBs in their shared exported coordinate frame, but their authored arrangement is not a trustworthy motherboard installation. The motherboard component side faces away from the tempered-glass side, and the case's closed solid motherboard tray blocks the approach from the glass side. The application now stops the motherboard before that tray and never marks it installed.

The Blender MCP connection was unavailable. The installed Blender 5.2.3 executable was used in background/read-only mode to inspect the existing master; the master file and hardware GLBs were not saved or modified. Runtime positions were then checked against the served optimized GLBs in Three.js.

## Assets

- Case: `public/assets/hardware/optimized_glb/computer_case.glb`.
- Motherboard: `public/assets/hardware/optimized_glb/motherboard.glb`.
- Blender source: `blender_assets/ATX_Mid_Tower_Master.blend`.
- Unrelated `OPTICAL_` nodes and temporary case-fan placeholder nodes are filtered from the case/motherboard runtime clones. The Optical Drive is not included in this workbench scene.

## Coordinate frame and source measurements

The Blender master uses X across the case, Y front-to-back, and Z vertically. The GLB/runtime mapping is Three.js `(x, y, z) = Blender (x, z, -y)`.

| Object / reference | Blender world transform or bounds (m) | Three.js/runtime equivalent (m) |
| --- | --- | --- |
| `MB_ROOT` authored origin | position `(-0.081500, 0.030000, 0.285000)`; quaternion `(0, 1, 0, 0)`; scale `(-1, -1, -1)` | position `(-0.081500, 0.285000, -0.030000)`; world quaternion identity; world scale `(-1, 1, 1)` |
| `CASE_MOUNT_Motherboard` | position `(-0.076000, 0.030000, 0.285000)` | position `(-0.076000, 0.285000, -0.030000)` |
| `CASE_MotherboardTray` | bounds X `[-0.089668, -0.082332]`, Y `[-0.094838, 0.154838]`, Z `[0.124936, 0.445064]` | bounds X `[-0.089668, -0.082332]`, Y `[0.124936, 0.445064]`, Z `[-0.154838, 0.094838]` |
| `CASE_GlassPanel` | bounds X `[-0.099956, -0.096288]`; centered at X `-0.098122` | same X bounds; glass is on the negative-X side |
| `MB_PCB` | bounds X `[-0.082300, -0.080700]`, Y `[-0.092000, 0.152000]`, Z `[0.132500, 0.437500]` | bounds X `[-0.082300, -0.080700]`, Y `[0.132500, 0.437500]`, Z `[-0.152000, 0.092000]` |
| All 197 motherboard meshes under `MB_ROOT` | bounds X `[-0.082500, -0.056500]`, Y `[-0.099000, 0.159000]`, Z `[0.131000, 0.439000]` | bounds X `[-0.082500, -0.056500]`, Y `[0.131000, 0.439000]`, Z `[-0.159000, 0.099000]` |

The source tray is a closed cuboid mesh with 8 vertices and 6 faces; it has no motherboard opening. The glass is at negative X. The motherboard's complete component geometry extends toward positive X from the PCB. At the authored target, the board root is 5.5 mm toward negative X from the case mounting empty. The board's PCB is nearly flush with the positive-X tray face, while its component side is behind that face from the glass viewpoint. These facts establish a wrong-side/orientation and obstructed-path problem; the marker offset alone is not used as proof of fit failure.

The GLB contains nine named motherboard mounting-hole markers. Their count/layout and authored root transform are inspected by the workbench. The existing case marker is not treated as proof that all nine holes and standoffs align. No screw-level fit is claimed.

## Runtime guard and interaction

The workbench keeps the stored board origin as a **reference**. It computes the tray AABB and board AABB at that reference in the loaded Three.js scene. For a negative-X staged board moved toward positive X, the conservative board/tray bounds guard stops the root 1 mm before the tray's negative-X bound. Runtime measurements place this stop at approximately X `-0.115668 m`, **34.17 mm before** the authored motherboard root X `-0.081500 m`. This guard prevents the demonstrated drag from passing through the solid slab; it is not presented as a full triangle-to-triangle collision engine or a mechanical pass.

The board remains independently selectable and draggable. A wrong drop is rejected. Reaching the tray guard reports a fit block. Even if a future interaction reaches the stored reference without the current tray guard, the controller still refuses to create an installed state until the source fit is explicitly verified. Step 3 and lesson completion stay disabled.

## Required source correction before installation work

Rework the Blender source fit only after review of the source asset: make the motherboard tray a mounting surface/opening rather than a solid slab; orient the component face toward the tempered-glass side; align the PCB plane and the nine board holes with the actual case standoffs and attachment marker; then validate mesh intersections, insertion/removal clearance, the CPU cooler and DIMM area, and a new shared-frame GLB export. The exact correction should be derived from the existing case geometry. This phase did not modify any case, motherboard, or master asset.
