const partDefinitions = [
  {
    id: 'front-intake-fans',
    name: 'Front Intake Fans',
    description: 'Three fan positions sit behind the front mesh. The separate case-fan model shows the removable fan units.',
    purpose: 'When installed, the front fans draw air into the case to help cool its internal components.',
    exactNames: [],
    prefixes: ['CASE_TempFanVis_01_', 'CASE_TempFanVis_02_', 'CASE_TempFanVis_03_'],
  },
  {
    id: 'power-button',
    name: 'Power Button',
    description: 'The front power button is the case control used to request that the computer starts or shuts down.',
    purpose: 'Sends a momentary power-switch signal to the motherboard front-panel header.',
    exactNames: ['CASE_PowerButton'],
    prefixes: [],
  },
  {
    id: 'front-io',
    name: 'Front USB and Audio Ports',
    description: 'These front-panel connectors provide convenient access to external USB and audio devices.',
    purpose: 'Connects the front-panel ports to the corresponding motherboard headers.',
    exactNames: ['CASE_FrontIO'],
    prefixes: ['CASE_USB_Audio_'],
  },
  {
    id: 'front-mesh',
    name: 'Front Mesh Panel',
    description: 'The fine mesh and its border form the ventilated front panel.',
    purpose: 'Allows intake air to enter while covering the front fan area.',
    exactNames: ['CASE_FrontMesh'],
    prefixes: ['CASE_FrontMeshBorder_', 'CASE_FrontMeshVentBar_'],
  },
  {
    id: 'front-bezel',
    name: 'Front Bezel',
    description: 'The bezel forms the case front around its mesh and front I/O area.',
    purpose: 'Supports and finishes the front-facing case assembly.',
    exactNames: ['CASE_FrontBezel'],
    prefixes: [],
  },
  {
    id: 'glass-side-panel',
    name: 'Tempered-Glass Side Panel',
    description: 'The transparent panel closes the component side of the chassis and keeps internal hardware visible.',
    purpose: 'Protects the interior while allowing visual inspection of installed components.',
    exactNames: ['CASE_GlassPanel'],
    prefixes: ['CASE_GlassPanel_'],
  },
  {
    id: 'solid-side-panel',
    name: 'Solid Side Panel',
    description: 'The opaque panel closes the opposite side of the chassis.',
    purpose: 'Covers and protects the cable-management side of the case.',
    exactNames: ['CASE_SolidPanel'],
    prefixes: ['CASE_SolidPanel_'],
  },
  {
    id: 'top-ventilation',
    name: 'Top Ventilation Panel',
    description: 'A mesh opening and surrounding frame form the top ventilation area.',
    purpose: 'Provides an air path through the top of the chassis.',
    exactNames: ['CASE_TopVentFrame', 'CASE_TopVentilation'],
    prefixes: [],
  },
  {
    id: 'motherboard-tray',
    name: 'Motherboard Tray',
    description: 'The tray is the flat mounting surface behind the motherboard.',
    purpose: 'Supports the motherboard and includes openings for cable routing and cooler access.',
    exactNames: ['CASE_MotherboardTray'],
    prefixes: ['CASE_Tray_'],
  },
  {
    id: 'motherboard-standoffs',
    name: 'Motherboard Standoffs',
    description: 'The raised threaded posts match mounting holes in the board.',
    purpose: 'Hold the motherboard above the tray and provide secure screw points.',
    exactNames: [],
    prefixes: ['CASE_Standoff_ATX_'],
  },
  {
    id: 'rear-expansion-slots',
    name: 'Rear Expansion Slots',
    description: 'These removable slot covers line up with expansion-card brackets.',
    purpose: 'Provide rear openings and fastening positions for PCIe cards such as a graphics card.',
    exactNames: [],
    prefixes: ['CASE_ExpansionSlot_'],
  },
  {
    id: 'rear-io-opening',
    name: 'Rear I/O Opening',
    description: 'The rear opening aligns with the motherboard’s external connector area.',
    purpose: 'Leaves access to motherboard USB, network, display, and audio connections.',
    exactNames: ['CASE_RearIO'],
    prefixes: [],
  },
  {
    id: 'psu-mounting-area',
    name: 'Power Supply Mounting Area',
    description: 'The lower-rear case opening and mounting surface are shaped for the power supply.',
    purpose: 'Positions and secures the PSU at the rear of the chassis.',
    exactNames: ['CASE_PSUMountArea', 'CASE_PSUOpening'],
    prefixes: [],
  },
  {
    id: 'psu-shroud',
    name: 'PSU Shroud',
    description: 'The lower cover separates the power-supply area from the main component chamber.',
    purpose: 'Conceals the PSU and cable area while defining the lower interior of the case.',
    exactNames: ['CASE_PSUShroud'],
    prefixes: ['CASE_PSUShroud_'],
  },
  {
    id: 'ssd-mounting-points',
    name: 'SSD Mounting Points',
    description: 'The case model includes two dedicated 2.5-inch SSD mounting points.',
    purpose: 'Provides screw locations for attaching compatible 2.5-inch drives.',
    exactNames: [],
    prefixes: ['CASE_StorageMount_SSD_'],
  },
  {
    id: 'case-frame',
    name: 'Case Frame',
    description: 'The rails and supports form the structural chassis around the components.',
    purpose: 'Holds the case panels and provides a rigid structure for mounting hardware.',
    exactNames: [],
    prefixes: ['CASE_Frame_'],
  },
  {
    id: 'case-feet',
    name: 'Case Feet',
    description: 'Four feet support the chassis above the work surface.',
    purpose: 'Stabilizes the case and leaves a small gap below its base.',
    exactNames: [],
    prefixes: ['CASE_Foot_'],
  },
]

function studentFacingPart({ id, name, description, purpose }) {
  return { id, name, description, purpose }
}

export const caseVrParts = Object.freeze(partDefinitions.map((part) => Object.freeze(studentFacingPart(part))))

const definitionsById = new Map(partDefinitions.map((part) => [part.id, part]))

function normalizedNodeName(name = '') {
  return name.replace(/\.\d{3}$/, '')
}

export function caseVrPartById(id) {
  const part = definitionsById.get(id)
  return part ? studentFacingPart(part) : null
}

export function caseVrPartForNodeName(name) {
  const normalizedName = normalizedNodeName(name)
  for (const part of partDefinitions) {
    if (part.exactNames.includes(normalizedName) || part.prefixes.some((prefix) => normalizedName.startsWith(prefix))) {
      return studentFacingPart(part)
    }
  }
  return null
}
