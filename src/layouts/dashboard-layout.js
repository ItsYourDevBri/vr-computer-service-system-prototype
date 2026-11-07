import { dashboardNavigation } from '../routes/route-config.js'
import { dashboardPaths, roleLabels } from '../app/store.js'
import { icon } from '../components/icons.js'
import { brand, escapeHTML, initials } from '../components/primitives.js'

export function dashboardLayout(role, pathname, content, state) {
  const roleName = roleLabels[role]
  const links = dashboardNavigation[role]
  const activePath = (href) => href.split('?')[0] === pathname
  const sideLinks = links.map((item) => `<a class="side-link${activePath(item.path) ? ' is-active' : ''}" href="${item.path}"${activePath(item.path) ? ' aria-current="page"' : ''}>${icon(item.icon, 17)}<span>${item.label}</span></a>`).join('')
  const mobile = Boolean(state.ui.mobileNavOpen)
  const avatar = state.avatarStyle === 'systems' ? icon('Cpu', 14) : state.avatarStyle === 'teal' ? '<span></span>' : initials(state.displayName)
  const currentProfile = pathname === '/settings'
  const mobileLinks = links.map((item) => `<a class="mobile-nav-link" href="${item.path}">${icon(item.icon, 17)}${item.label}${icon('ArrowUpRight', 14, 'mobile-nav-arrow')}</a>`).join('')

  return `<div class="dashboard-app"><aside class="sidebar"><div class="sidebar-brand">${brand(true)}</div><div class="sidebar-role"><span class="role-indicator"></span><strong>${roleName}</strong></div>
    <nav class="side-navigation" aria-label="${roleName} navigation"><p class="nav-caption" aria-hidden="true"></p>${sideLinks}</nav>
    <div class="sidebar-bottom"><a class="side-link${currentProfile ? ' is-active' : ''}" href="/settings">${icon('Settings', 17)}<span>Profile</span></a><button class="side-link signout-link" type="button" data-action="logout">${icon('DoorOpen', 17)}<span>Log out</span></button></div>
  </aside><div class="dashboard-main-column"><header class="dashboard-topbar"><button class="mobile-menu-button" type="button" data-action="toggle-dashboard-menu" aria-expanded="${mobile}" aria-controls="mobile-navigation">${icon(mobile ? 'X' : 'Menu', 20)}<span>${mobile ? 'Close menu' : 'Menu'}</span></button>
    <div class="breadcrumbs"><span>CSS TRAINING</span><span class="breadcrumb-slash">/</span><strong>${roleName}</strong></div><div class="topbar-user"><span class="avatar avatar-small avatar-${state.avatarStyle}">${avatar}</span><span class="topbar-user-name">${escapeHTML(state.displayName)}</span></div>
  </header>${mobile ? `<nav class="mobile-navigation" id="mobile-navigation" aria-label="Mobile role navigation">${mobileLinks}<a href="/settings" class="mobile-nav-link">${icon('Settings', 17)}Profile</a><button type="button" class="mobile-nav-link" data-action="logout">${icon('DoorOpen', 17)}Log out</button></nav>` : ''}<main class="dashboard-content">${content}</main></div></div>`
}

export function dashboardRole(pathname) {
  if (pathname.startsWith('/instructor/')) return 'instructor'
  if (pathname.startsWith('/principal/')) return 'principal'
  if (pathname.startsWith('/student/')) return 'student'
  return pathname === '/settings' ? 'settings' : null
}

export function homeForRole(role) { return dashboardPaths[role] || dashboardPaths.student }
