import { icon } from './icons.js'

export function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])
}

export function mountTemplate(root, markup) {
  // UI templates contain application-authored HTML; dynamic text values are escaped before interpolation.
  const template = document.createElement('template')
  template.innerHTML = markup
  root.replaceChildren(template.content.cloneNode(true))
}

export function brand(compact = false) {
  return `<a class="brand-lockup${compact ? ' brand-lockup-compact' : ''}" href="/login" aria-label="Movers Institute of Technology and Education home"><img class="brand-logo-image" src="/images/mite-school-seal.jpg" alt="Movers Institute of Technology and Education seal"></a>`
}

export function pageHeading({ eyebrow = '', title, description = '', action = '' }) {
  return `<div class="page-heading"><div>${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}<h1>${title}</h1>${description ? `<p class="page-description">${description}</p>` : ''}</div>${action ? `<div class="page-heading-action">${action}</div>` : ''}</div>`
}

export function sectionHeading({ title, detail = '', action = '' }) {
  return `<div class="section-heading"><div><h2>${title}</h2>${detail ? `<p>${detail}</p>` : ''}</div>${action}</div>`
}

export function button(label, iconName = '', className = 'button button-primary') {
  return `<button class="${className}" type="button">${label}${iconName ? icon(iconName, 16) : ''}</button>`
}

export function authScene(content, compact = false) {
  return `<main class="auth-scene${compact ? ' auth-scene-compact' : ''}"><div class="cinematic-photo" aria-hidden="true"></div><div class="auth-center-content">${content}</div></main>`
}

export function authBrandLockup() {
  return `<div class="auth-brand-lockup">${brand(true)}<p>Movers Institute of Technology and Education</p></div>`
}

export function modal({ title, description = '', content }) {
  return `<div class="modal-backdrop" data-action="backdrop-close"><section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title"${description ? ' aria-describedby="modal-description"' : ''}><div class="modal-heading"><div><h2 id="modal-title">${title}</h2>${description ? `<p id="modal-description">${description}</p>` : ''}</div><button class="icon-button" type="button" aria-label="Close dialog" data-action="close-modal">${icon('X', 18)}</button></div>${content}</section></div>`
}

export function initials(name) {
  return String(name || '').trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase() || 'A'
}
