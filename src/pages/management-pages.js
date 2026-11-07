import { roleLabels } from '../app/store.js'
import { assessments, classes, instructors, students } from '../data/demo-data.js'
import { icon } from '../components/icons.js'
import { escapeHTML, initials, modal, pageHeading, sectionHeading } from '../components/primitives.js'

const ic = (name, size = 18) => icon(name, size)

function metric({ label, value, note, iconName }) {
  return `<article class="metric-card"><span class="metric-icon">${ic(iconName)}</span><span class="metric-note">${note}</span><strong>${value}</strong><span class="metric-label">${label}</span></article>`
}

function peopleTable(people, mode, selectable = false) {
  return `<div class="people-table"><div class="people-table-head"><span>NAME</span><span>EMAIL</span><span>${mode === 'student' ? 'CLASS / PROGRESS' : 'CLASSES'}</span><span>STATUS</span><span></span></div>${people.map((person) => {
    const detail = mode === 'student' ? `${person.className}<small>${person.progress ?? 0}% activity</small>` : `${person.classes ?? 0} class${person.classes === 1 ? '' : 'es'}`
    return `<div class="people-row"><span class="person-name-cell"><span class="avatar avatar-table">${initials(person.name)}</span><strong>${person.name}</strong></span><span class="person-email">${person.email}</span><span class="person-detail">${detail}</span><span><em class="status-badge ${person.status === 'Active' ? 'status-active' : 'status-neutral'}">${person.status}</em></span>${selectable ? `<button class="table-action" type="button" data-action="person-details" data-email="${person.email}" aria-label="View ${person.name}">View ${ic('ArrowRight', 14)}</button>` : '<span></span>'}</div>`
  }).join('')}${people.length === 0 ? '<p class="empty-search">No records match that search.</p>' : ''}</div>`
}

function personModal(person) {
  if (!person) return ''
  const detailRows = [
    ['Account status', person.status],
    person.className ? ['Class', person.className] : null,
    typeof person.progress === 'number' ? ['Activity', `${person.progress}%`] : null,
    typeof person.classes === 'number' ? ['Classes', person.classes] : null,
  ].filter(Boolean)
  const content = `<div class="modal-summary"><p>${ic('Mail', 15)} ${person.email}</p>${detailRows.map(([label, value]) => `<div class="modal-stat-line"><span>${label}</span><strong>${value}</strong></div>`).join('')}</div><button class="button button-primary button-full" type="button" data-action="close-modal">Close</button>`
  return modal({ title: person.name, description: 'Account details', content })
}

function inviteModal(role, complete) {
  const label = role === 'student' ? 'CSS Student' : 'CSS Instructor'
  const article = role === 'student' ? 'a' : 'an'
  const title = complete ? 'Invitation details reviewed' : `Invite ${article} ${role}`
  const description = complete ? 'This action has not been sent.' : `Prepare ${label} invitation details.`
  const content = complete
    ? `<div class="invite-success" role="status"><span>${ic('Check', 18)}</span><strong>Details reviewed</strong><p>No email was sent. Invitation delivery is not connected.</p><button class="button button-primary button-full" type="button" data-action="close-modal">Done</button></div>`
    : `<form class="modal-form" data-form="invite"><label class="field-label" for="invitee-email">Invitee email</label><input class="text-input" type="email" id="invitee-email" placeholder="name@school.edu" required><label class="field-label" for="invitee-role">Assigned role</label><input class="text-input" id="invitee-role" value="${label}" readonly><label class="field-label" for="invitee-class">Class</label><select class="text-input" id="invitee-class"><option>CSS 11 · Section A</option><option>CSS 11 · Section B</option></select><p class="privacy-note">Invitation delivery is unavailable.</p><div class="modal-actions"><button class="button button-quiet" type="button" data-action="close-modal">Cancel</button><button class="button button-primary" type="submit">Review details ${ic('ArrowRight', 15)}</button></div></form>`
  return modal({ title, description, content })
}

function dashboardPageHeading(eyebrow, title, description, action = '') {
  return pageHeading({ eyebrow, title, description, action })
}

function instructorDashboard(state) {
  const first = escapeHTML(state.displayName.split(' ')[0])
  return `<div class="dashboard-page">${dashboardPageHeading('INSTRUCTOR WORKSPACE', `Good morning, ${first}.`, 'A clear view of your classes, learner activity, and next teaching actions.', '<a class="button button-primary button-small" href="/instructor/students?invite=1">' + ic('Plus', 15) + ' Invite students</a>')}
    <div class="metric-grid">${metric({ label: 'Your classes', value: '2', note: 'Current term', iconName: 'BookOpen' })}${metric({ label: 'Students', value: '34', note: 'Class roster', iconName: 'Users' })}${metric({ label: 'Assessment activity', value: '68%', note: 'Activity overview', iconName: 'ClipboardCheck' })}</div>
    <div class="management-grid instructor-overview-grid"><section class="content-panel">${sectionHeading({ title: 'Your classes', detail: 'Open a class overview to see roster details.', action: `<a class="subtle-link" href="/instructor/classes">View classes ${ic('ArrowRight', 14)}</a>` })}<div class="class-list">${classes.map((item) => `<a class="class-row" href="/instructor/classes"><span class="class-symbol">${ic('BookOpen')}</span><span class="class-row-copy"><strong>${item.name}</strong><small>${item.students} students · ${item.code}</small></span><span class="class-progress"><span>${item.completion} activity</span><i><b style="width:${item.completion}"></b></i></span>${ic('ChevronRight', 16)}</a>`).join('')}</div></section>
      <section class="content-panel next-action-panel"><span class="action-eyebrow">TEACHING TOOL</span><div class="action-icon">${ic('ClipboardCheck', 21)}</div><h2>Prepare an assessment</h2><p>Choose from predefined hardware and procedural activities for your classes.</p><a class="button button-secondary button-small" href="/instructor/assessments">Browse assessments ${ic('ArrowRight', 14)}</a></section></div>
    <section class="content-panel">${sectionHeading({ title: 'Student activity', detail: 'Recent learner activity across your classes.', action: `<a class="subtle-link" href="/instructor/progress">View progress ${ic('ArrowRight', 14)}</a>` })}${peopleTable(students.slice(0, 2), 'student')}</section></div>`
}

function instructorClasses(state) {
  const selected = state.ui.selectedClass
  const content = `<div class="dashboard-page">${dashboardPageHeading('INSTRUCTOR WORKSPACE', 'My classes', 'Review classes assigned to this instructor.')}<section class="content-panel">${sectionHeading({ title: 'Class overview', detail: 'Review class activity and upcoming assessments.' })}<div class="class-card-grid">${classes.map((item) => `<article class="class-card"><div class="class-card-heading"><span class="class-symbol">${ic('BookOpen')}</span><span class="status-badge status-active">ACTIVE</span></div><h2>${item.name}</h2><p>${item.code} <span>·</span> ${item.students} students</p><div class="class-card-meter"><span>Activity overview <strong>${item.completion}</strong></span><i><b style="width:${item.completion}"></b></i></div><div class="class-card-footer"><span>Next assessment<br><strong>${item.next}</strong></span><button class="button button-secondary button-small" type="button" data-action="class-details" data-code="${item.code}">View class</button></div></article>`).join('')}</div></section></div>`
  if (!selected) return content
  return content + modal({ title: selected.name, description: `${selected.code} · class overview`, content: `<div class="modal-summary"><p><strong>${selected.students} students</strong></p><div class="modal-stat-line"><span>Activity overview</span><strong>${selected.completion}</strong></div><div class="modal-stat-line"><span>Next assessment</span><strong>${selected.next}</strong></div></div><button class="button button-primary button-full" type="button" data-action="close-modal">Done</button>` })
}

function instructorStudents(location, state) {
  const inviteByQuery = new URLSearchParams(location.search).get('invite') === '1'
  const modalOpen = Boolean(state.ui.showInvite || inviteByQuery)
  const filtered = students.filter((item) => `${item.name} ${item.email} ${item.className}`.toLowerCase().includes((state.ui.studentSearch || '').toLowerCase()))
  const content = `<div class="dashboard-page">${dashboardPageHeading('INSTRUCTOR WORKSPACE', 'Student list', 'Review your class roster or prepare invitation details.', `<button class="button button-primary button-small" type="button" data-action="open-invite">${ic('Plus', 15)} Invite student</button>`)}
    <section class="content-panel"><div class="list-toolbar">${sectionHeading({ title: 'Students', detail: 'Class roster' })}<label class="search-field">${ic('Search', 16)}<input aria-label="Search students" data-student-search value="${escapeHTML(state.ui.studentSearch || '')}" placeholder="Search students"></label></div>${peopleTable(filtered, 'student', true)}</section></div>`
  return content + (modalOpen ? inviteModal('student', Boolean(state.ui.inviteComplete)) : '') + personModal(state.ui.selectedPerson)
}

function instructorAssessments(state) {
  const selected = state.ui.selectedAssessment
  const reviewed = state.ui.reviewed || []
  const content = `<div class="dashboard-page">${dashboardPageHeading('INSTRUCTOR WORKSPACE', 'Assign assessments', 'Review the predefined activities available for classes.')}<section class="content-panel">${sectionHeading({ title: 'Assessment library', detail: 'Predefined hardware and procedural activities.' })}<div class="assessment-grid">${assessments.map((item) => `<article class="assessment-card"><span class="assessment-icon">${ic('ClipboardCheck')}</span><p class="card-meta">${item.category}</p><h2>${item.name}</h2><p>${item.steps} · ${item.assigned}</p><button class="button button-secondary button-small" type="button" data-action="assessment-details" data-name="${item.name}">${reviewed.includes(item.name) ? 'Reviewed' : 'Review assignment'} ${ic('ArrowRight', 14)}</button></article>`).join('')}</div></section></div>`
  if (!selected) return content
  const modalContent = `<div class="modal-summary"><p>Review <strong>${selected.name}</strong> before assigning it to a class.</p><label class="field-label" for="class-select">Class</label><select class="text-input" id="class-select"><option>CSS 11 · Section A</option><option>CSS 11 · Section B</option></select><p class="privacy-note">${selected.category} · ${selected.steps}</p></div><button class="button button-primary button-full" type="button" data-action="review-assessment">Review assignment ${ic('Check', 15)}</button>`
  return content + modal({ title: selected.name, description: 'Assessment details', content: modalContent })
}

function instructorProgress(state) {
  const selected = state.ui.selectedPerson
  const content = `<div class="dashboard-page">${dashboardPageHeading('INSTRUCTOR WORKSPACE', 'Student progress', 'Review learning activity and assessment progress.')}<div class="metric-grid">${metric({ label: 'Students with activity', value: '2', note: 'Activity overview', iconName: 'Users' })}${metric({ label: 'Average completion', value: '60%', note: 'Current period', iconName: 'ClipboardCheck' })}${metric({ label: 'Assessments', value: '3', note: 'Procedural activities', iconName: 'BookOpen' })}</div><section class="content-panel">${sectionHeading({ title: 'Learner overview', detail: 'Select a learner to review activity details.' })}${peopleTable(students, 'student', true)}</section></div>`
  return content + personModal(selected)
}

function principalDashboard(state) {
  const first = escapeHTML(state.displayName.split(' ')[0])
  return `<div class="dashboard-page">${dashboardPageHeading('PRINCIPAL WORKSPACE', `Welcome, ${first}.`, 'Manage CSS instructor access and review a concise class overview.', '<a class="button button-primary button-small" href="/principal/instructors?invite=1">' + ic('Plus', 15) + ' Invite instructor</a>')}
    <div class="metric-grid">${metric({ label: 'CSS instructors', value: '3', note: 'Directory', iconName: 'UserRound' })}${metric({ label: 'Active classes', value: '2', note: 'Current term', iconName: 'BookOpen' })}${metric({ label: 'Learner participation', value: '58%', note: 'Activity overview', iconName: 'Users' })}</div>
    <div class="management-grid principal-overview-grid"><section class="content-panel">${sectionHeading({ title: 'Instructor accounts', detail: 'Instructor directory.', action: `<a class="subtle-link" href="/principal/instructors">Manage instructors ${ic('ArrowRight', 14)}</a>` })}${peopleTable(instructors, 'instructor')}</section><section class="content-panel">${sectionHeading({ title: 'CSS class overview', detail: 'Class activity.', action: `<a class="subtle-link" href="/principal/classes">View classes ${ic('ArrowRight', 14)}</a>` })}<div class="principal-class-list">${classes.map((item) => `<div class="principal-class-row"><span><strong>${item.name}</strong><small>${item.students} students</small></span><b>${item.completion}</b></div>`).join('')}</div></section></div></div>`
}

function principalInstructors(location, state) {
  const inviteByQuery = new URLSearchParams(location.search).get('invite') === '1'
  const content = `<div class="dashboard-page">${dashboardPageHeading('PRINCIPAL WORKSPACE', 'Manage instructors', 'Review the CSS instructor directory or prepare invitation details.', `<button class="button button-primary button-small" type="button" data-action="open-invite">${ic('Plus', 15)} Invite instructor</button>`)}<section class="content-panel">${sectionHeading({ title: 'Instructor directory', detail: 'Instructor records' })}${peopleTable(instructors, 'instructor', true)}</section></div>`
  return content + ((state.ui.showInvite || inviteByQuery) ? inviteModal('instructor', Boolean(state.ui.inviteComplete)) : '') + personModal(state.ui.selectedPerson)
}

function principalClasses() {
  return `<div class="dashboard-page">${dashboardPageHeading('PRINCIPAL WORKSPACE', 'CSS class overview', 'A concise institutional view of CSS classes and participation.')}<div class="metric-grid">${metric({ label: 'Classes', value: '2', note: 'Current term', iconName: 'BookOpen' })}${metric({ label: 'Enrolled students', value: '34', note: 'Enrollment overview', iconName: 'Users' })}${metric({ label: 'Instructors', value: '3', note: 'Directory', iconName: 'UserRound' })}</div><section class="content-panel">${sectionHeading({ title: 'Class activity', detail: 'Participation across CSS classes.' })}<div class="principal-class-table"><div class="principal-table-head"><span>CLASS</span><span>INSTRUCTOR</span><span>STUDENTS</span><span>ACTIVITY OVERVIEW</span></div>${classes.map((item, index) => `<div class="principal-table-row"><strong>${item.name}</strong><span>${instructors[index % instructors.length].name}</span><span>${item.students}</span><span class="class-progress"><i><b style="width:${item.completion}"></b></i>${item.completion}</span></div>`).join('')}</div></section></div>`
}

function profilePage(state) {
  const name = state.ui.profileName ?? state.displayName
  const avatar = state.ui.profileAvatar ?? state.avatarStyle
  const pickerOpen = Boolean(state.ui.avatarPickerOpen)
  const preview = avatar === 'initials' ? initials(name) : avatar === 'systems' ? ic('Cpu', 26) : '<span></span>'
  const choices = [['initials', 'Initials', 'UserRound'], ['systems', 'Systems', 'Cpu'], ['teal', 'Teal', 'Check']]
  const selected = (key) => avatar === key ? ' is-selected' : ''
  const expanded = pickerOpen ? 'true' : 'false'
  return `<div class="dashboard-page profile-settings-page">${pageHeading({ title: 'My Profile', description: 'Manage your personal information and preferences.' })}
    <form class="profile-settings-form" data-form="profile-save"><section class="content-panel profile-editor-panel" aria-label="Profile details">
      <div class="profile-avatar-column"><button class="profile-avatar-trigger" type="button" aria-label="Choose profile avatar" aria-expanded="${expanded}" aria-controls="profile-avatar-options" data-action="toggle-profile-avatars"><span class="avatar avatar-profile avatar-${avatar}">${preview}</span><span>Change avatar</span></button>
        ${pickerOpen ? `<div class="avatar-options profile-avatar-options" id="profile-avatar-options" role="group" aria-label="Avatar appearance">${choices.map(([key, label, symbol]) => `<button class="avatar-option${selected(key)}" type="button" aria-pressed="${avatar === key}" data-action="profile-avatar" data-avatar="${key}">${ic(symbol, 15)}${label}</button>`).join('')}</div>` : ''}
      </div>
      <div class="profile-fields-column"><div class="profile-identity-grid">
        <div class="form-field"><label class="field-label" for="profile-full-name">Full name</label><input class="text-input" id="profile-full-name" value="${escapeHTML(state.fullName)}" readonly></div>
        <div class="form-field"><label class="field-label" for="profile-role">Assigned role</label><input class="text-input" id="profile-role" value="${roleLabels[state.role]}" readonly></div>
        <div class="form-field"><label class="field-label" for="profile-email">Email address</label><input class="text-input" id="profile-email" value="${escapeHTML(state.emailAddress || 'Not provided')}" readonly></div>
        <div class="form-field"><label class="field-label" for="profile-display-name">Display name</label><input class="text-input" id="profile-display-name" name="displayName" value="${escapeHTML(name)}" maxlength="40" autocomplete="nickname" required aria-invalid="false" aria-describedby="profile-name-error"></div>
      </div><p class="form-error" id="profile-name-error" role="alert" hidden>Enter a display name to continue.</p><div class="profile-save-row"><button class="button button-primary" type="submit">Save Changes ${ic('Check', 16)}</button>${state.ui.profileSaved ? '<p class="profile-save-status" role="status">Profile updated for this session.</p>' : ''}</div></div>
    </section></form></div>`
}

export function renderManagement(path, location, state) {
  switch (path) {
    case '/instructor/dashboard': return instructorDashboard(state)
    case '/instructor/classes': return instructorClasses(state)
    case '/instructor/students': return instructorStudents(location, state)
    case '/instructor/assessments': return instructorAssessments(state)
    case '/instructor/progress': return instructorProgress(state)
    case '/principal/dashboard': return principalDashboard(state)
    case '/principal/instructors': return principalInstructors(location, state)
    case '/principal/classes': return principalClasses()
    case '/settings': return profilePage(state)
    default: return ''
  }
}

export function findPerson(email) { return [...students, ...instructors].find((person) => person.email === email) }
export function findClass(code) { return classes.find((item) => item.code === code) }
export function findAssessment(name) { return assessments.find((item) => item.name === name) }
