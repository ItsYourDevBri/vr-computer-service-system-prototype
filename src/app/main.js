import '../styles/app.css'
import { initializeRouter, currentLocation, navigate } from './router.js'
import { chooseRole, dashboardPaths, finishProfile, getState, logout, resetTransientState, updateProfile } from './store.js'
import { knownRoutes } from '../routes/route-config.js'
import { mountTemplate } from '../components/primitives.js'
import { dashboardLayout, dashboardRole } from '../layouts/dashboard-layout.js'
import { renderLanding } from '../pages/landing-page.js'
import { renderAuth } from '../pages/auth-pages.js'
import { renderStudent } from '../pages/student-pages.js'
import { findAssessment, findClass, findPerson, renderManagement } from '../pages/management-pages.js'
import { learningActivityPaths, renderActivityShell } from '../activities/activity-shell.js'

const app = document.querySelector('#app')
const state = getState()
let previousPath = ''
let activityControllerCleanup = null
let renderToken = 0

function render() {
  activityControllerCleanup?.()
  activityControllerCleanup = null
  const currentRenderToken = ++renderToken
  const location = currentLocation()
  if (!knownRoutes.includes(location.pathname)) {
    window.history.replaceState({}, '', '/login')
    return render()
  }

  if (location.pathname !== previousPath) {
    resetTransientState()
    previousPath = location.pathname
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }

  if (learningActivityPaths.includes(location.pathname)) {
    mountTemplate(app, renderActivityShell(location.pathname))
    const controllerRequest = ['/student/assembly', '/student/disassembly'].includes(location.pathname)
      ? import('../activities/assembly-controller.js')
      : import('../activities/activity-controller.js')
    controllerRequest.then(({ mountActivityWorkspace }) => {
      if (currentRenderToken !== renderToken || currentLocation().pathname !== location.pathname) return
      activityControllerCleanup = mountActivityWorkspace({ root: app, path: location.pathname })
    }).catch((error) => {
      const status = app.querySelector('[data-activity-status]')
      if (status) status.textContent = `The learning workspace could not start. ${error.message}`
    })
    return
  }

  if (location.pathname === '/') {
    mountTemplate(app, renderLanding(location, state))
  } else if (['/login', '/activate-account', '/forgot-password', '/profile-setup'].includes(location.pathname)) {
    mountTemplate(app, renderAuth(location, state))
  } else {
    const role = dashboardRole(location.pathname)
    const content = location.pathname.startsWith('/student/')
      ? renderStudent(location.pathname, state)
      : renderManagement(location.pathname, location, state)
    mountTemplate(app, dashboardLayout(role === 'settings' ? state.role : role, location.pathname, content, state))
  }

}

function rerenderKeepingSearchFocus(input) {
  const start = input.selectionStart
  const end = input.selectionEnd
  render()
  const next = document.querySelector('[data-student-search]')
  next?.focus()
  if (start !== null && end !== null) next?.setSelectionRange(start, end)
}

function dismissModal() {
  const location = currentLocation()
  state.ui.selectedPerson = null
  state.ui.selectedClass = null
  state.ui.selectedAssessment = null
  state.ui.inviteComplete = false
  state.ui.showInvite = false
  if (new URLSearchParams(location.search).has('invite')) {
    navigate(location.pathname, { replace: true })
  } else render()
}

document.addEventListener('click', (event) => {
  const element = event.target.closest('[data-action]')
  if (!element) {
    if (event.target.classList?.contains('modal-backdrop')) dismissModal()
    const hashAnchor = event.target.closest('a[href^="#"]')
    if (hashAnchor && state.ui.mobileNavOpen) {
      state.ui.mobileNavOpen = false
      document.querySelector('.landing-nav')?.classList.remove('is-open')
      const menuButton = document.querySelector('.landing-mobile-toggle')
      if (menuButton) {
        menuButton.setAttribute('aria-label', 'Open site navigation')
        menuButton.setAttribute('aria-expanded', 'false')
      }
    }
    return
  }

  const action = element.dataset.action
  if (action === 'backdrop-close') {
    if (event.target === element) dismissModal()
  } else if (action === 'toggle-landing-menu') {
    state.ui.mobileNavOpen = !state.ui.mobileNavOpen
    render()
  } else if (action === 'toggle-dashboard-menu') {
    state.ui.mobileNavOpen = !state.ui.mobileNavOpen
    render()
  } else if (action === 'toggle-password') {
    state.ui.passwordVisible = !state.ui.passwordVisible
    render()
  } else if (action === 'setup-avatar') {
    state.ui.setupAvatar = element.dataset.avatar
    render()
  } else if (action === 'setup-save' || action === 'setup-skip') {
    const save = action === 'setup-save'
    finishProfile(state.ui.setupName ?? state.displayName, state.ui.setupAvatar || 'initials', save)
    navigate(dashboardPaths[state.role])
  } else if (action === 'invite-return') {
    state.ui.invitationState = 'valid'
    render()
  } else if (action === 'activation-login') {
    navigate('/login', { state: { activationComplete: true } })
  } else if (action === 'open-invite') {
    state.ui.showInvite = true
    state.ui.inviteComplete = false
    render()
  } else if (action === 'close-modal') {
    dismissModal()
  } else if (action === 'person-details') {
    state.ui.selectedPerson = findPerson(element.dataset.email)
    render()
  } else if (action === 'class-details') {
    state.ui.selectedClass = findClass(element.dataset.code)
    render()
  } else if (action === 'assessment-details') {
    state.ui.selectedAssessment = findAssessment(element.dataset.name)
    render()
  } else if (action === 'review-assessment') {
    const current = state.ui.reviewed || []
    state.ui.reviewed = [...new Set([...current, state.ui.selectedAssessment?.name].filter(Boolean))]
    state.ui.selectedAssessment = null
    render()
  } else if (action === 'toggle-profile-avatars') {
    state.ui.avatarPickerOpen = !state.ui.avatarPickerOpen
    render()
  } else if (action === 'profile-avatar') {
    state.ui.profileAvatar = element.dataset.avatar
    state.ui.avatarPickerOpen = true
    render()
  } else if (action === 'logout') {
    logout()
    navigate('/login')
  }
})

document.addEventListener('input', (event) => {
  const target = event.target
  if (target.matches('[data-student-search]')) {
    state.ui.studentSearch = target.value
    rerenderKeepingSearchFocus(target)
  } else if (target.matches('#profile-name')) {
    state.ui.setupName = target.value
    const preview = document.querySelector('[data-setup-preview-name]')
    if (preview) preview.textContent = target.value.trim() || 'Your display name'
    const avatar = document.querySelector('.avatar-preview')
    if (avatar?.classList.contains('avatar-initials')) avatar.textContent = target.value.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase() || 'A'
  } else if (target.matches('#profile-display-name')) {
    state.ui.profileName = target.value
    state.ui.profileSaved = false
    target.setAttribute('aria-invalid', 'false')
    const error = document.querySelector('#profile-name-error')
    if (error) error.hidden = true
    document.querySelector('.profile-save-status')?.remove()
  } else if (target.matches('#login-email')) {
    state.ui.loginEmail = target.value
  } else if (target.matches('#login-password')) {
    state.ui.loginPassword = target.value
  } else if (target.matches('input[name="workspace-role"]')) {
    state.ui.loginRole = target.value
    render()
  }
})

document.addEventListener('submit', (event) => {
  const form = event.target
  const type = form.dataset.form
  if (!type) return
  event.preventDefault()

  if (type === 'login') {
    const role = form.querySelector('[name="workspace-role"]:checked')?.value || state.ui.loginRole || 'student'
    const email = form.querySelector('[name="email"]')?.value || ''
    chooseRole(role, email)
    state.ui = {}
    navigate('/profile-setup', { state: { role } })
  } else if (type === 'recovery') {
    state.ui.recoverySubmitted = true
    render()
  } else if (type === 'activate') {
    const formData = new FormData(form)
    const error = form.querySelector('[data-form-error]')
    const password = String(formData.get('password') || '')
    const confirmation = String(formData.get('confirmPassword') || '')
    if (password !== confirmation) {
      error.textContent = 'Passwords do not match. Check both fields and try again.'
      error.hidden = false
      form.querySelector('#invite-confirm')?.setAttribute('aria-invalid', 'true')
      return
    }
    state.ui.invitationState = 'complete'
    render()
  } else if (type === 'invite') {
    state.ui.inviteComplete = true
    render()
  } else if (type === 'profile-save') {
    const nameInput = form.querySelector('#profile-display-name')
    const nextName = nameInput?.value.trim() || ''
    if (!nextName) {
      const error = form.querySelector('#profile-name-error')
      nameInput.setAttribute('aria-invalid', 'true')
      error.hidden = false
      return
    }
    const avatar = state.ui.profileAvatar || state.avatarStyle
    updateProfile(nextName, avatar)
    state.ui.profileName = nextName
    state.ui.profileSaved = true
    render()
  }
})

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && document.querySelector('[role="dialog"]')) dismissModal()
})

initializeRouter(render)
