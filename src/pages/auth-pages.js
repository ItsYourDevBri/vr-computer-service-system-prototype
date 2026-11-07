import { authBrandLockup, authScene, brand, escapeHTML, initials } from '../components/primitives.js'
import { icon } from '../components/icons.js'
import { dashboardPaths, roleLabels } from '../app/store.js'

function loginPage(location, state) {
  const role = state.ui.loginRole || 'student'
  const passwordVisible = Boolean(state.ui.passwordVisible)
  const activatedNotice = location.state?.activationComplete ? '<div class="inline-notice" role="status">Account creation is not connected. Continue to role-based workspace entry.</div>' : ''
  const options = [['student', 'Student', 'GraduationCap'], ['instructor', 'Instructor', 'UserRound'], ['principal', 'Principal', 'ShieldCheck']]
  return authScene(`<div class="auth-card login-card centered-auth-card">
    <div class="auth-brand-lockup">${brand(true)}<p>Movers Institute of Technology and Education</p></div>
    <div class="auth-card-heading"><h1>Welcome Back</h1><p>Access your CSS training workspace.</p></div>
    <div class="auth-tabs" role="tablist" aria-label="Account access"><button class="is-selected" type="button" role="tab" aria-selected="true">Login</button><a href="/activate-account" role="tab" aria-selected="false">Sign Up</a></div>
    ${activatedNotice}
    <form class="auth-form centered-login-form" data-form="login">
        <label class="field-label" for="login-email">Email Address</label><div class="input-wrap">${icon('Mail', 17)}<input id="login-email" name="email" type="email" autocomplete="email" value="${escapeHTML(state.ui.loginEmail || '')}" placeholder="Enter your email"></div>
      <div class="field-row-label"><label class="field-label" for="login-password">Password</label><a href="/forgot-password">Forgot Password?</a></div>
      <div class="input-wrap">${icon('LockKeyhole', 17)}<input id="login-password" name="password" type="${passwordVisible ? 'text' : 'password'}" autocomplete="current-password" value="${escapeHTML(state.ui.loginPassword || '')}" placeholder="Enter your password"><button class="password-toggle" type="button" data-action="toggle-password" aria-label="${passwordVisible ? 'Hide password' : 'Show password'}">${icon(passwordVisible ? 'EyeOff' : 'Eye', 17)}</button></div>
      <button class="button button-primary button-full centered-login-button" type="submit">Continue</button>
    </form>
    <div class="auth-divider"><span></span>or continue as<span></span></div>
    <fieldset class="role-fieldset role-fieldset-centered"><legend>Choose a workspace</legend><div class="role-choice-group" role="radiogroup" aria-label="Choose a workspace">${options.map(([value, label, symbol]) => `<label class="role-choice role-choice-card${role === value ? ' is-selected' : ''}"><input type="radio" name="workspace-role" value="${value}"${role === value ? ' checked' : ''}><span class="role-icon">${icon(symbol, 20)}</span><span>${label}</span></label>`).join('')}</div></fieldset>
    <p class="login-access-note">Sign-in is not connected. Choosing a role opens that workspace.</p>
  </div>`)
}

function activationPage(location, state) {
  let inviteState = state.ui.invitationState
  if (!inviteState) {
    const fixture = new URLSearchParams(location.search).get('invitationFixture')
    inviteState = fixture === 'invalid' || fixture === 'expired' ? fixture : 'valid'
    state.ui.invitationState = inviteState
  }
  const header = `<header class="activation-header"><a class="activation-back-link" href="/login">${icon('ArrowLeft', 17)} Back to Login</a>${brand(true)}</header>`
  const heading = '<div class="auth-card-heading activation-heading"><h2>Activate your account</h2><p>Complete your details to access your CSS training workspace.</p></div>'
  const form = `<form class="auth-form activation-form" data-form="activate"><div class="form-grid form-grid-two">
    <div class="form-field span-two"><label class="field-label" for="invite-email">Invited email</label><div class="input-wrap input-readonly">${icon('Mail', 16)}<input id="invite-email" value="student@movers.test" readonly aria-readonly="true"></div></div>
    <div class="form-field"><label class="field-label" for="invite-role">Assigned role</label><input class="text-input" id="invite-role" value="CSS Student" readonly aria-readonly="true"></div>
    <div class="form-field"><label class="field-label" for="invite-age">Age</label><div class="input-wrap">${icon('CalendarDays', 16)}<input id="invite-age" name="age" type="number" min="12" max="99" placeholder="Optional"></div></div>
    <div class="form-field span-two"><label class="field-label" for="invite-name">Full name</label><div class="input-wrap">${icon('UserRound', 16)}<input id="invite-name" name="fullName" autocomplete="name" placeholder="Your full name" required></div></div>
    <div class="form-field span-two"><label class="field-label" for="invite-contact">Contact number <span class="label-hint">Optional</span></label><div class="input-wrap">${icon('Phone', 16)}<input id="invite-contact" name="contact" type="tel" autocomplete="tel" placeholder="09XX XXX XXXX"></div></div>
    <div class="form-field"><label class="field-label" for="invite-password">Create password</label><input class="text-input" id="invite-password" name="password" type="password" autocomplete="new-password" minlength="8" placeholder="8+ characters" required></div>
    <div class="form-field"><label class="field-label" for="invite-confirm">Confirm password</label><input class="text-input" id="invite-confirm" name="confirmPassword" type="password" autocomplete="new-password" minlength="8" placeholder="Repeat password" required></div>
  </div><p class="form-error" data-form-error role="alert" hidden></p><button class="button button-primary button-full" type="submit">Activate account ${icon('BadgeCheck', 17)}</button></form>`
  const messages = {
    invalid: ['Invitation not recognized', "We couldn't verify these invitation details. Ask your CSS Instructor for a current invitation.", 'CircleAlert'],
    expired: ['Invitation expired', 'This invitation is outside its activation window. Ask the inviter for a current invitation.', 'CalendarDays'],
  }
  let content = form
  if (messages[inviteState]) {
    const [title, text, symbol] = messages[inviteState]
    content = `<div class="invitation-message" role="alert"><span class="invitation-message-icon">${icon(symbol, 21)}</span><h3>${title}</h3><p>${text}</p><button class="button button-secondary button-full" type="button" data-action="invite-return">Return to the form</button></div>`
  } else if (inviteState === 'complete') {
    content = `<div class="invitation-message invitation-message-success" role="status"><span class="invitation-message-icon">${icon('BadgeCheck', 22)}</span><h3>Details checked</h3><p>Account creation isn't connected, so no account was created.</p><button class="button button-primary button-full" type="button" data-action="activation-login">Continue to login</button></div>`
  }
  return authScene(`<div class="auth-card activation-card">${header}${heading}${content}</div>`, true)
}

function profileSetup(location, state) {
  const avatar = state.ui.setupAvatar || 'initials'
  const name = state.ui.setupName ?? state.displayName
  const preview = avatar === 'initials' ? initials(name) : avatar === 'systems' ? icon('Cpu', 22) : '<span></span>'
  const choices = [['initials', 'Initials', 'UserRound'], ['systems', 'Systems', 'Cpu'], ['teal', 'Teal', 'Check']]
  return authScene(`<div class="auth-card profile-card">
    ${authBrandLockup()}<div class="auth-card-heading"><h2>Set up your profile</h2><p>Personalize your learning experience. You can change this later.</p></div>
    <div class="avatar-picker-block"><span class="field-label">Profile avatar</span><div class="profile-preview-row"><div class="avatar avatar-preview avatar-${avatar}">${preview}</div><div><strong data-setup-preview-name>${escapeHTML(name.trim() || 'Your display name')}</strong><span>${roleLabels[state.role]}</span></div></div>
      <div class="avatar-options" role="radiogroup" aria-label="Avatar style">${choices.map(([key, label, symbol]) => `<button type="button" class="avatar-option${avatar === key ? ' is-selected' : ''}" aria-pressed="${avatar === key}" data-action="setup-avatar" data-avatar="${key}">${icon(symbol, 15)}${label}</button>`).join('')}</div>
    </div>
    <div class="form-field profile-name-field"><label for="profile-name" class="field-label">Display name <span class="label-hint">Optional</span></label><input class="text-input" id="profile-name" maxlength="40" value="${escapeHTML(name)}" placeholder="How should we address you?"></div>
    <div class="profile-actions"><button class="button button-primary button-full" type="button" data-action="setup-save">Save &amp; continue ${icon('ArrowRight', 16)}</button><button class="button button-quiet button-full" type="button" data-action="setup-skip">${icon('SkipForward', 15)} Skip for now</button></div>
  </div>`, true)
}

function forgotPassword(state) {
  const submitted = Boolean(state.ui.recoverySubmitted)
  return authScene(`<div class="auth-card recovery-card">${authBrandLockup()}<div class="auth-card-heading"><h2>Forgot your password?</h2><p>Password recovery is not connected. No email will be sent.</p></div>${submitted ? '<div class="inline-notice" role="status">Recovery is unavailable here. No message was sent.</div>' : `<form class="auth-form" data-form="recovery"><label class="field-label" for="recovery-email">Account email</label><div class="input-wrap">${icon('Mail', 16)}<input id="recovery-email" type="email" required placeholder="name@school.edu"></div><button class="button button-primary button-full" type="submit">Check recovery availability ${icon('Send', 15)}</button></form>`}<div class="auth-card-footer"><a href="/login">${icon('ArrowLeft', 13)} Return to login</a><span>Invitation-only access</span></div></div>`, true)
}

export function renderAuth(location, state) {
  switch (location.pathname) {
    case '/login': return loginPage(location, state)
    case '/activate-account': return activationPage(location, state)
    case '/profile-setup': return profileSetup(location, state)
    case '/forgot-password': return forgotPassword(state)
    default: return ''
  }
}

export function setupDestination(role) { return dashboardPaths[role] || dashboardPaths.student }
