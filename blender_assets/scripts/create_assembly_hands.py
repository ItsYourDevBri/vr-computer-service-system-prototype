import bpy
import math
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
OUT_BLEND = ROOT / 'assembly_hands.blend'
OUT_GLB = Path(__file__).resolve().parents[2] / 'public/assets/hardware/assembly_hands.glb'

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for material in list(bpy.data.materials):
    bpy.data.materials.remove(material)


def create_material(name, color, roughness=0.78):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value = (*color, 1)
    mat.node_tree.nodes.get('Principled BSDF').inputs['Roughness'].default_value = roughness
    return mat


rubber = create_material('Technician glove | charcoal knit', (0.024, 0.032, 0.038), 0.91)
reinforced = create_material('Technician glove | reinforced palm', (0.039, 0.050, 0.058), 0.88)
seam = create_material('Technician glove | subtle seams', (0.074, 0.087, 0.094), 0.94)


def new_mesh_object(name, vertices, faces, parent, mat):
    mesh = bpy.data.meshes.new(name + ' mesh')
    mesh.from_pydata(vertices, [], faces)
    mesh.materials.append(mat)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    if parent:
        obj.parent = parent
    for poly in mesh.polygons:
        poly.use_smooth = True
    obj.modifiers.new('Soft glove normals', 'WEIGHTED_NORMAL')
    return obj


def add_palm(name, parent, mat):
    # Elliptical cross-sections create a continuous, tapered palm and wrist silhouette.
    profile = [
        (-0.079, 0.015, 0.010),
        (-0.067, 0.021, 0.013),
        (-0.048, 0.027, 0.016),
        (-0.022, 0.034, 0.018),
        (0.008, 0.039, 0.019),
        (0.032, 0.037, 0.017),
        (0.050, 0.030, 0.014),
    ]
    sides = 16
    vertices = []
    faces = []
    for y, rx, rz in profile:
        for i in range(sides):
            angle = 2 * math.pi * i / sides
            vertices.append((math.cos(angle) * rx, y, math.sin(angle) * rz))
    for row in range(len(profile) - 1):
        for side in range(sides):
            a = row * sides + side
            b = row * sides + (side + 1) % sides
            c = (row + 1) * sides + (side + 1) % sides
            d = (row + 1) * sides + side
            faces.append((a, b, c, d))
    faces.append(tuple(range(sides - 1, -1, -1)))
    faces.append(tuple((len(profile) - 1) * sides + i for i in range(sides)))
    return new_mesh_object(name, vertices, faces, parent, mat)


def add_capsule(name, start, end, rx, rz, parent, mat, sides=12):
    start, end = Vector(start), Vector(end)
    delta = end - start
    length = max(delta.length, 1e-5)
    profile = [(0.025, .38), (.10, .66), (.24, .88), (.5, 1), (.76, .88), (.90, .66), (.975, .38)]
    vertices = []
    faces = []
    for t, factor in profile:
        for i in range(sides):
            angle = 2 * math.pi * i / sides
            vertices.append((math.cos(angle) * rx * factor, length * t, math.sin(angle) * rz * factor))
    for row in range(len(profile) - 1):
        for side in range(sides):
            a = row * sides + side
            b = row * sides + (side + 1) % sides
            c = (row + 1) * sides + (side + 1) % sides
            d = (row + 1) * sides + side
            faces.append((a, b, c, d))
    faces.append(tuple(range(sides - 1, -1, -1)))
    faces.append(tuple((len(profile) - 1) * sides + i for i in range(sides)))
    obj = new_mesh_object(name, vertices, faces, parent, mat)
    obj.location = start
    obj.rotation_mode = 'QUATERNION'
    obj.rotation_quaternion = Vector((0, 1, 0)).rotation_difference(delta.normalized())
    return obj


def add_uv_patch(name, parent, location, scale, mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=1)
    obj = bpy.context.object
    obj.name = name
    obj.parent = parent
    obj.location = location
    obj.scale = scale
    obj.data.materials.append(mat)
    for poly in obj.data.polygons:
        poly.use_smooth = True
    obj.modifiers.new('Soft panel normals', 'WEIGHTED_NORMAL')
    return obj


def add_joint(name, parent, location):
    joint = bpy.data.objects.new(name, None)
    bpy.context.scene.collection.objects.link(joint)
    joint.parent = parent
    joint.location = location
    return joint


def add_cuff(side, parent):
    # A low-profile reinforced cuff with a single raised edge, aligned around the wrist.
    bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=0.0205, depth=0.013, location=(0, -0.064, 0))
    cuff = bpy.context.object
    cuff.name = f'HAND_{side}_Cuff'
    cuff.parent = parent
    cuff.location = (0, -0.064, 0)
    cuff.rotation_euler.x = math.pi / 2
    cuff.scale = (1, 1, 0.78)
    cuff.data.materials.append(reinforced)
    for poly in cuff.data.polygons:
        poly.use_smooth = True
    bevel = cuff.modifiers.new('Soft cuff edge', 'BEVEL')
    bevel.width = 0.002
    bevel.segments = 2
    cuff.modifiers.new('Cuff weighted normals', 'WEIGHTED_NORMAL')


def create_hand(side, mirror=False):
    root = bpy.data.objects.new(f'HAND_{side}_ROOT', None)
    bpy.context.scene.collection.objects.link(root)
    root.empty_display_type = 'CIRCLE'
    mirror_sign = -1 if mirror else 1

    add_capsule(f'HAND_{side}_Forearm', (0, -0.065, 0), (0, -0.17, 0), 0.023, 0.015, root, rubber)
    add_palm(f'HAND_{side}_Palm', root, rubber)
    add_uv_patch(f'HAND_{side}_PalmGripPatch', root, (0, -0.004, 0.0168), (0.019, 0.024, 0.0018), reinforced)
    # Short, subtle palm channels add glove construction detail without reading as a badge.
    for index, x in enumerate((-0.009, 0, 0.009)):
        add_uv_patch(f'HAND_{side}_PalmChannel_{index + 1}', root, (x, -0.004, 0.0181), (0.0010, 0.015, 0.00065), seam)
    add_uv_patch(f'HAND_{side}_CuffSeam', root, (0, -0.071, 0.014), (0.0185, 0.0022, 0.002), seam)
    add_cuff(side, root)

    fingers = [
        ('Pinky', -0.026, 0.053, 0.020, 0.014),
        ('Ring', -0.009, 0.064, 0.023, 0.017),
        ('Middle', 0.009, 0.068, 0.025, 0.018),
        ('Index', 0.026, 0.060, 0.022, 0.016),
    ]
    for label, x, length, middle_length, distal_length in fingers:
        x *= mirror_sign
        finger = add_joint(f'HAND_{side}_{label}', root, (x, 0.039, 0))
        proximal_length = length - middle_length - distal_length
        proximal_spread = -x * 0.035
        middle_spread = -x * 0.020
        add_capsule(f'HAND_{side}_{label}_ProximalGlove', (0, 0, 0), (proximal_spread, proximal_length, 0), 0.0080, 0.0068, finger, rubber)
        middle_joint = add_joint(f'HAND_{side}_{label}_MiddleJoint', finger, (proximal_spread, proximal_length, 0))
        add_capsule(f'HAND_{side}_{label}_MiddleGlove', (0, 0, 0), (middle_spread, middle_length, 0), 0.0066, 0.0058, middle_joint, rubber)
        distal_joint = add_joint(f'HAND_{side}_{label}_DistalJoint', middle_joint, (middle_spread, middle_length, 0))
        add_capsule(f'HAND_{side}_{label}_DistalGlove', (0, 0, 0), (0, distal_length, 0), 0.0052, 0.0048, distal_joint, rubber)
        add_uv_patch(f'HAND_{side}_{label}_KnuckleSeam', finger, (proximal_spread * 0.42, proximal_length * 0.63, 0.0056), (0.0054, 0.0013, 0.0010), seam)

    thumb = add_joint(f'HAND_{side}_Thumb', root, (0.031 * -mirror_sign, 0.004, 0))
    thumb_first_end = (-0.024 * mirror_sign, 0.019, 0)
    add_capsule(f'HAND_{side}_ThumbBaseGlove', (0, 0, 0), thumb_first_end, 0.0095, 0.0080, thumb, rubber)
    thumb_tip = add_joint(f'HAND_{side}_ThumbTipJoint', thumb, thumb_first_end)
    add_capsule(f'HAND_{side}_ThumbTipGlove', (0, 0, 0), (-0.020 * mirror_sign, 0.013, 0), 0.0070, 0.0060, thumb_tip, rubber)
    add_uv_patch(f'HAND_{side}_ThumbGripPanel', thumb, (-0.021 * mirror_sign, 0.014, 0.0065), (0.005, 0.008, 0.0014), reinforced)
    return root


create_hand('L', mirror=True)
create_hand('R')
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.render.engine = 'BLENDER_EEVEE'
scene.render.resolution_x = 512
scene.render.resolution_y = 512
scene.render.resolution_percentage = 100
scene.world.color = (0.08, 0.08, 0.08)

OUT_BLEND.parent.mkdir(parents=True, exist_ok=True)
OUT_GLB.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT_BLEND))
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=str(OUT_GLB), export_format='GLB', export_apply=True, export_animations=False)
print('ASSEMBLY_HANDS_EXPORTED', str(OUT_GLB), OUT_GLB.stat().st_size)
