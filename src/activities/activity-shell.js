import { icon } from '../components/icons.js'
import { escapeHTML } from '../components/primitives.js'
import { hardwareComponents } from '../data/hardware-components.js'

export const learningActivityPaths = Object.freeze([
  '/student/hardware',
  '/student/assembly',
  '/student/disassembly',
])

const activityDetails = {
  '/student/hardware': {
    title: 'Hardware Exploration',
    eyebrow: 'COMPONENT LIBRARY',
    description: 'Identify common computer parts, their purpose, and the features used to recognize them.',
  },
  '/student/assembly': {
    title: 'Guided Assembly',
    eyebrow: 'GUIDED INSTALLATION',
    description: 'A step-by-step installation walkthrough will be added in a later phase.',
  },
  '/student/disassembly': {
    title: 'Guided Disassembly',
    eyebrow: 'GUIDED REMOVAL',
    description: 'A step-by-step component removal walkthrough will be added in a later phase.',
  },
}

function rotatePhoneIcon() {
  return `<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><rect x="20" y="9" width="24" height="43" rx="5"/><path d="M27 15h10M29 46h6M12 28a21 21 0 0 1 9-14M12 28l-1-8m1 8 8-2M52 36a21 21 0 0 1-9 14m9-14 1 8m-1-8-8 2"/></svg>`
}

function modeSwitch(disabled = false) {
  const disabledAttr = disabled ? ' disabled aria-disabled="true"' : ''
  return `<div class="activity-mode-switch" role="group" aria-label="3D viewing mode" data-mode-switch>
    <button type="button" class="is-active" aria-pressed="true" data-activity-action="mode-normal"${disabledAttr}>Normal 3D</button>
    <button type="button" aria-pressed="false" data-activity-action="mode-vr"${disabledAttr}>VR View</button>
  </div>`
}

function componentRail() {
  return `<aside class="component-library" id="component-library" aria-label="Hardware component library" data-component-library>
    <div class="activity-panel-heading"><div><span class="activity-eyebrow">EXPLORE</span><h2>Components</h2></div><span class="activity-count">${hardwareComponents.length}</span></div>
    <nav class="component-list" aria-label="Select a hardware component">
      ${hardwareComponents.map((component) => `<button type="button" class="component-option${component.id === 'computer-case' ? ' is-selected' : ''}" data-component-id="${escapeHTML(component.id)}" aria-pressed="${component.id === 'computer-case'}">
        <img src="${escapeHTML(component.image)}" alt="" loading="lazy" width="64" height="44">
        <span class="component-option-copy"><strong>${escapeHTML(component.name)}</strong><small>${component.glb ? 'Interactive 3D' : escapeHTML(component.group)}</small></span>
        ${component.glb ? '<span class="component-ready-mark" aria-label="Interactive model available">3D</span>' : ''}
      </button>`).join('')}
    </nav>
  </aside>`
}

function vrPartCard(eye, accessible = false) {
  const accessibleAttributes = accessible ? ' role="region" aria-label="Selected case part details" aria-live="polite"' : ''
  const hiddenAttributes = accessible ? '' : ' aria-hidden="true" tabindex="-1"'
  return `<section class="vr-part-eye vr-part-eye-${eye}"${accessible ? '' : ' aria-hidden="true"'}>
    <article class="vr-part-card"${accessibleAttributes}>
      <header class="vr-part-card-heading"><div><span class="activity-eyebrow">CASE PART</span><h2 data-vr-part-name></h2></div>
        <button type="button" class="vr-part-close" data-activity-action="close-vr-part" aria-label="Close selected part details"${hiddenAttributes}>Close</button>
      </header>
      <p class="vr-part-description" data-vr-part-description></p>
      <div class="vr-part-function"><span>Purpose / Function</span><p data-vr-part-function></p></div>
    </article>
  </section>`
}

function hardwareWorkspace() {
  const initial = hardwareComponents[0]
  return `<div class="activity-layout" data-hardware-layout>
    ${componentRail()}
    <section class="activity-viewer-column" aria-label="Interactive hardware viewer">
      <div class="viewer-toolbar">
        <div class="viewer-toolbar-label"><span class="activity-eyebrow">INTERACTIVE MODEL</span><span data-viewer-status role="status" aria-live="polite">Loading the Computer Case model…</span></div>
        <button type="button" class="viewer-reset-button" data-activity-action="reset-view" aria-label="Reset 3D view">${icon('RotateCcw', 16)}<span>Reset view</span></button>
      </div>
      <div class="viewer-stage" data-viewer-stage data-render-mode="normal">
        <canvas class="hardware-canvas" data-hardware-canvas aria-label="Interactive 3D model of the computer case. Drag to rotate and use the scroll wheel or pinch to zoom." tabindex="0"></canvas>
        <div class="viewer-loading" data-viewer-loading aria-hidden="true"><span></span></div>
        <div class="viewer-error" data-viewer-error role="alert" hidden><p data-viewer-error-message></p><button type="button" data-activity-action="retry-model">Retry 3D model</button></div>
        <div class="stereo-eye-label stereo-eye-left" aria-hidden="true">LEFT EYE</div>
        <div class="stereo-eye-label stereo-eye-right" aria-hidden="true">RIGHT EYE</div>
        <div class="viewer-stereo-shade" aria-hidden="true"></div>
        <div class="vr-part-details" data-vr-part-details hidden>
          ${vrPartCard('left')}
          ${vrPartCard('right', true)}
        </div>
      </div>
      <section class="mobile-component-summary" aria-label="Selected component" data-mobile-component-summary>
        <div class="mobile-component-summary-copy"><h2 data-mobile-summary-title>${escapeHTML(initial.name)}</h2><p data-mobile-summary-description>${escapeHTML(initial.summary)}</p></div>
        <button type="button" class="mobile-summary-details-button" aria-controls="component-information-body" aria-expanded="false" data-activity-action="toggle-information">View Details</button>
      </section>
      <p class="viewer-caption" data-viewer-caption>Interactive Blender model · drag to rotate · scroll or pinch to zoom</p>
    </section>
    <aside class="component-information" aria-labelledby="component-title" data-component-information>
      <div class="activity-panel-heading"><div><span class="activity-eyebrow" data-component-group>${escapeHTML(initial.group.toUpperCase())}</span><h2 id="component-title" data-component-title>${escapeHTML(initial.name)}</h2></div><div class="component-information-actions"><button type="button" class="information-toggle" aria-label="Collapse component information" aria-expanded="true" data-activity-action="toggle-information">${icon('ChevronRight', 17)}</button><button type="button" class="information-close-button" aria-label="Close component details" data-activity-action="close-information">${icon('X', 14)}<span>Close</span></button></div></div>
      <div class="component-information-body" data-component-information-body>
        <p class="component-description" data-component-description>${escapeHTML(initial.description)}</p>
        <section class="component-fact"><h3>Primary purpose</h3><p data-component-purpose>${escapeHTML(initial.purpose)}</p></section>
        <section class="component-fact"><h3>How it works</h3><p data-component-explanation>${escapeHTML(initial.explanation)}</p></section>
        <section class="component-fact"><h3>Identifying features</h3><ul data-component-features>${initial.features.map((feature) => `<li>${escapeHTML(feature)}</li>`).join('')}</ul></section>
        <section class="component-fact"><h3>Basic information</h3><ul data-component-basic-info>${initial.basicInfo.map((fact) => `<li>${escapeHTML(fact)}</li>`).join('')}</ul></section>
      </div>
    </aside>
    <button type="button" class="activity-drawer-backdrop" data-activity-action="dismiss-mobile-drawers" aria-label="Close open component panel" hidden></button>
  </div>`
}

function activityPlaceholder(path) {
  const details = activityDetails[path]
  const type = path === '/student/assembly' ? 'assembly' : 'disassembly'
  return `<div class="activity-placeholder-layout">
    <section class="activity-placeholder-card" aria-labelledby="placeholder-title">
      <div class="activity-placeholder-icon">${icon(type === 'assembly' ? 'Layers3' : 'PackageOpen', 38)}</div>
      <span class="activity-eyebrow">${escapeHTML(details.eyebrow)}</span>
      <h2 id="placeholder-title">${escapeHTML(details.title)} workspace</h2>
      <p>${escapeHTML(details.description)}</p>
      <div class="activity-not-ready" role="status">This activity is not interactive yet. The shared landscape workspace is ready for its future walkthrough.</div>
      <a class="activity-return-link" href="/student/dashboard">Back to Student Dashboard ${icon('ArrowRight', 15)}</a>
    </section>
    <aside class="activity-placeholder-side"><span class="activity-eyebrow">VIEWING MODES</span>${modeSwitch(true)}<p>Normal 3D and VR View will be available here when this activity’s interactive 3D content is implemented.</p></aside>
  </div>`
}

export function renderActivityShell(path) {
  const details = activityDetails[path] || activityDetails['/student/hardware']
  const isHardware = path === '/student/hardware'
  return `<main class="learning-workspace" data-learning-activity="${escapeHTML(path)}">
    <section class="rotate-phone-gate" data-rotate-gate hidden aria-labelledby="rotate-title">
      <div class="rotate-phone-icon">${rotatePhoneIcon()}</div>
      <h1 id="rotate-title">Rotate Your Phone</h1>
      <p>Please rotate your phone to landscape to continue.</p>
      <a class="orientation-back-link" href="/student/dashboard">Back to Dashboard</a>
    </section>
    <section class="activity-workspace" data-activity-workspace hidden aria-label="${escapeHTML(details.title)} learning workspace">
      <header class="activity-topbar">
        <a class="activity-back-link" href="/student/dashboard" aria-label="Back to Student Dashboard">${icon('ArrowLeft', 17)}</a>
        <div class="activity-title-block"><span class="activity-eyebrow">${escapeHTML(details.eyebrow)}</span><h1 data-activity-heading>${escapeHTML(details.title)}</h1></div>
        ${isHardware ? '<button type="button" class="activity-panel-toggle" aria-expanded="true" aria-controls="component-library" data-activity-action="toggle-library">Components</button>' : ''}
        ${isHardware ? '<button type="button" class="activity-details-toggle" aria-expanded="true" aria-controls="component-information-body" data-activity-action="toggle-information">Details</button>' : ''}
        ${isHardware ? '<span class="portrait-mode-label">Normal 3D</span>' : ''}
        ${modeSwitch(!isHardware)}
        <button type="button" class="activity-fullscreen-button" aria-label="Enter fullscreen" title="Enter fullscreen" data-activity-action="fullscreen">${icon('Maximize2', 17)}</button>
      </header>
      ${isHardware ? hardwareWorkspace() : activityPlaceholder(path)}
      <p class="activity-workspace-status" data-activity-status role="status" aria-live="polite"></p>
    </section>
  </main>`
}
