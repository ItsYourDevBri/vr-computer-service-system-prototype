import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const projectRoot = resolve(import.meta.dirname, '..')

function pad4(size) {
  return (4 - (size % 4)) % 4
}

async function readGlb(file) {
  const input = await readFile(file)
  if (input.readUInt32LE(0) !== 0x46546c67) throw new Error(`${file} is not a GLB`) // glTF
  const jsonLength = input.readUInt32LE(12)
  const jsonType = input.readUInt32LE(16)
  if (jsonType !== 0x4e4f534a) throw new Error(`${file} does not begin with a JSON chunk`)
  const json = JSON.parse(input.subarray(20, 20 + jsonLength).toString('utf8').trim())
  const binaryOffset = 20 + jsonLength
  const binaryLength = input.readUInt32LE(binaryOffset)
  const binary = input.subarray(binaryOffset + 8, binaryOffset + 8 + binaryLength)
  return { json, binary }
}

function writeGlb({ json, binary }, output) {
  const jsonBuffer = Buffer.from(JSON.stringify(json))
  const jsonPadding = Buffer.alloc(pad4(jsonBuffer.length), 0x20)
  const binaryPadding = Buffer.alloc(pad4(binary.length), 0)
  const totalLength = 12 + 8 + jsonBuffer.length + jsonPadding.length + (binary.length ? 8 + binary.length + binaryPadding.length : 0)
  const header = Buffer.alloc(12)
  header.writeUInt32LE(0x46546c67, 0)
  header.writeUInt32LE(2, 4)
  header.writeUInt32LE(totalLength, 8)
  const jsonHeader = Buffer.alloc(8)
  jsonHeader.writeUInt32LE(jsonBuffer.length + jsonPadding.length, 0)
  jsonHeader.writeUInt32LE(0x4e4f534a, 4)
  const chunks = [header, jsonHeader, jsonBuffer, jsonPadding]
  if (binary.length) {
    const binaryHeader = Buffer.alloc(8)
    binaryHeader.writeUInt32LE(binary.length + binaryPadding.length, 0)
    binaryHeader.writeUInt32LE(0x004e4942, 4)
    chunks.push(binaryHeader, binary, binaryPadding)
  }
  return writeFile(output, Buffer.concat(chunks))
}

function findNode(json, name) {
  const index = json.nodes?.findIndex((node) => node.name === name)
  if (index < 0) throw new Error(`Could not find node ${name}`)
  return json.nodes[index]
}

async function patchCase(source, output) {
  const glb = await readGlb(source)
  const tray = findNode(glb.json, 'CASE_MotherboardTray.001')
  // The original tray is a 7.34 mm closed slab. Keep the authored footprint and
  // mounting plane, but turn it into a 1 mm mounting plate for a real insertion path.
  tray.scale = [0.00575, tray.scale?.[1] ?? 1, tray.scale?.[2] ?? 1]
  tray.translation = [(tray.translation?.[0] ?? -0.09378) - 0.017, tray.translation?.[1] ?? 0.28934, tray.translation?.[2] ?? -0.03244]
  tray.extras = { ...(tray.extras || {}), fitCorrection: 'thin-mounting-plate', thicknessMm: 1 }
  const mount = findNode(glb.json, 'CASE_MOUNT_Motherboard.001')
  mount.translation = [(mount.translation?.[0] ?? -0.08288) - 0.017, mount.translation?.[1] ?? 0.28934, mount.translation?.[2] ?? -0.03244]
  mount.extras = { ...(mount.extras || {}), fitCorrection: 'atx-standoff-reference', holePattern: 'ATX-9', serviceSideOffsetMm: -17 }
  for (const node of glb.json.nodes || []) {
    if (node.name?.startsWith('CASE_Standoff_ATX_')) {
      node.translation = [(node.translation?.[0] ?? -0.08179) - 0.017, node.translation?.[1] ?? 0, node.translation?.[2] ?? 0]
      node.extras = { ...(node.extras || {}), fitCorrection: 'validated-atx-standoff' }
    }
  }
  await mkdir(dirname(output), { recursive: true })
  await writeGlb(glb, output)
}

async function patchMotherboard(source, output) {
  const glb = await readGlb(source)
  const root = findNode(glb.json, 'MB_ROOT.001')
  // Flip the authored component face toward the negative-X glass side and move
  // the nine mounting-hole markers onto the case's -0.075 m ATX standoff line.
  root.scale = [1, -1, -1]
  root.translation = [-0.09, root.translation?.[1] ?? 0.285, root.translation?.[2] ?? -0.03]
  root.extras = {
    ...(root.extras || {}),
    fitCorrection: 'glass-side-component-face',
    mountingPattern: 'ATX-9',
    targetStandoffX: -0.092,
    rearIoReference: 'CASE_RearIO001',
  }
  for (const node of glb.json.nodes || []) {
    if (node.name?.startsWith('MB_MountingHole_')) node.extras = { ...(node.extras || {}), fitCorrection: 'aligned-to-case-standoff' }
  }
  await mkdir(dirname(output), { recursive: true })
  await writeGlb(glb, output)
}

const sourceCase = resolve(projectRoot, 'blender_assets/optimized_glb/computer_case.glb')
const sourceBoard = resolve(projectRoot, 'blender_assets/optimized_glb/motherboard.glb')
const correctedCase = resolve(projectRoot, 'blender_assets/optimized_glb/computer_case_motherboard_fit.glb')
const correctedBoard = resolve(projectRoot, 'blender_assets/optimized_glb/motherboard_motherboard_fit.glb')
await patchCase(sourceCase, correctedCase)
await patchMotherboard(sourceBoard, correctedBoard)

const publicDir = resolve(projectRoot, 'public/assets/hardware/optimized_glb')
await mkdir(publicDir, { recursive: true })
await writeFile(resolve(publicDir, 'computer_case_motherboard_fit.glb'), await readFile(correctedCase))
await writeFile(resolve(publicDir, 'motherboard_motherboard_fit.glb'), await readFile(correctedBoard))
console.log(JSON.stringify({ correctedCase, correctedBoard }, null, 2))
