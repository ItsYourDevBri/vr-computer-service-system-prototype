# BLENDER-CSS-12 GLB Optimization Report

Master: /Users/brian/Documents/ChatGPT/components-css-prototype/blender_assets/ATX_Mid_Tower_Master.blend
Optimized directory: /Users/brian/Documents/ChatGPT/components-css-prototype/blender_assets/optimized_glb
Blender: 5.2.3 LTS

## Export comparison

### 01_Computer_Case
Before: 9420 triangles, 4896 vertices, 12 materials.
After: 9420 triangles, 4896 vertices, 12 materials; decimated meshes 0.
computer_case.glb: 1603824 -> 1011904 bytes; 36.9% size change.
### 02_Motherboard
Before: 3708 triangles, 2248 vertices, 11 materials.
After: 3708 triangles, 2248 vertices, 11 materials; decimated meshes 0.
motherboard.glb: 10770708 -> 742400 bytes; 93.1% size change.
### 03_CPU
Before: 3224 triangles, 2136 vertices, 5 materials.
After: 3224 triangles, 2136 vertices, 5 materials; decimated meshes 0.
cpu.glb: 10385976 -> 552852 bytes; 94.7% size change.
### 04_CPU_Cooler
Before: 1568 triangles, 920 vertices, 5 materials.
After: 1568 triangles, 920 vertices, 5 materials; decimated meshes 0.
cpu_cooler.glb: 10770708 -> 584688 bytes; 94.6% size change.
### 05_RAM
Before: 1512 triangles, 1008 vertices, 6 materials.
After: 1512 triangles, 1008 vertices, 6 materials; decimated meshes 0.
ram.glb: 11921732 -> 742168 bytes; 93.8% size change.
### 06_GPU
Before: 4360 triangles, 2400 vertices, 11 materials.
After: 4360 triangles, 2400 vertices, 11 materials; decimated meshes 0.
gpu.glb: 1102336 -> 728036 bytes; 34.0% size change.
### 07_Storage
Before: 1612 triangles, 952 vertices, 8 materials.
After: 1612 triangles, 952 vertices, 8 materials; decimated meshes 0.
ssd.glb: 390176 -> 390176 bytes; 0.0% size change.
hdd.glb: 392156 -> 392156 bytes; 0.0% size change.
### 08_PSU
Before: 9048 triangles, 4720 vertices, 9 materials.
After: 9048 triangles, 4720 vertices, 9 materials; decimated meshes 0.
psu.glb: 1210952 -> 1210952 bytes; 0.0% size change.
### 09_Case_Fans
Before: 2976 triangles, 1664 vertices, 8 materials.
After: 2976 triangles, 1664 vertices, 8 materials; decimated meshes 0.
case_fans.glb: 276744 -> 276744 bytes; 0.0% size change.
### 10_Optical_Drive
Before: 3864 triangles, 2024 vertices, 9 materials.
After: 3864 triangles, 2024 vertices, 9 materials; decimated meshes 0.
optical_drive.glb: 367216 -> 367216 bytes; 0.0% size change.

## Preservation and readiness
- Original GLBs were not overwritten.
- Master geometry was not modified or saved.
- Critical educational and interactive meshes were preserved from decimation.
- Where the conservative duplicate export was larger than the source, the original GLB was copied into optimized_glb unchanged to avoid regressions.
- Optical drive remains standalone.

## WebXR risks
- Motherboard, CPU, CPU cooler, and RAM remain the primary performance risks.
- Further approved LOD, atlas, and draw-call work may be needed after headset/browser profiling.
- No external image textures were detected in the audited materials.

## Deliverables
- optimized_glb directory
- component_manifest_optimized.json
- optimized_assembled_pc.png
- optimized_interior.png
