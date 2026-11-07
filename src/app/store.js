const defaults = {
  student: 'Alex Morgan',
  instructor: 'Jordan Lee',
  principal: 'Taylor Reed',
}

export const roleLabels = {
  student: 'CSS Student',
  instructor: 'CSS Instructor',
  principal: 'Principal',
}

export const dashboardPaths = {
  student: '/student/dashboard',
  instructor: '/instructor/dashboard',
  principal: '/principal/dashboard',
}

const state = {
  role: 'student',
  fullName: defaults.student,
  displayName: defaults.student,
  emailAddress: '',
  avatarStyle: 'initials',
  ui: {},
}

export function getState() { return state }

export function chooseRole(role, emailAddress = '') {
  state.role = role in defaults ? role : 'student'
  state.fullName = defaults[state.role]
  state.displayName = defaults[state.role]
  state.emailAddress = emailAddress.trim()
  state.avatarStyle = 'initials'
}

export function finishProfile(name, avatarStyle, save = true) {
  state.fullName ||= defaults[state.role]
  state.displayName = save && name?.trim() ? name.trim() : defaults[state.role]
  state.avatarStyle = save ? avatarStyle || 'initials' : 'initials'
}

export function updateProfile(name, avatarStyle) {
  state.displayName = name.trim()
  state.avatarStyle = avatarStyle
}

export function logout() {
  state.role = 'student'
  state.fullName = defaults.student
  state.displayName = defaults.student
  state.emailAddress = ''
  state.avatarStyle = 'initials'
  state.ui = {}
}

export function resetTransientState() { state.ui = {} }
