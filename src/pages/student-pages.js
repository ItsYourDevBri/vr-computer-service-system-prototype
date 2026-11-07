import { icon } from '../components/icons.js'
import { escapeHTML, pageHeading, sectionHeading } from '../components/primitives.js'

const activities = [
  { title: 'Hardware exploration', path: '/student/hardware', description: 'Learn what each component does and how it fits into a computer system.', cta: 'Explore components', icon: 'Cpu', index: '01', tone: 'activity-hardware', meta: 'COMPONENT LIBRARY' },
  { title: 'Guided assembly', path: '/student/assembly', description: 'Follow a clear sequence as the system comes together, part by part.', cta: 'Start assembly', icon: 'Wrench', index: '02', tone: 'activity-assembly', meta: 'STEP BY STEP' },
  { title: 'Guided disassembly', path: '/student/disassembly', description: 'Practice removing components safely from an assembled system.', cta: 'Start disassembly', icon: 'PackageOpen', index: '03', tone: 'activity-disassembly', meta: 'REVERSE THE BUILD' },
]

function metric({ label, value, note, iconName }) {
  return `<article class="metric-card"><span class="metric-icon">${icon(iconName, 18)}</span><span class="metric-note">${note}</span><strong>${value}</strong><span class="metric-label">${label}</span></article>`
}

function dashboard(state) {
  const firstName = escapeHTML(state.displayName.split(' ')[0])
  const action = '<a class="button button-secondary button-small" href="/student/progress">View my progress ' + icon('ArrowRight', 15) + '</a>'
  return `<div class="dashboard-page student-page">
    ${pageHeading({ eyebrow: 'STUDENT WORKSPACE', title: `Good morning, ${firstName}.`, description: 'Choose a learning activity and build your understanding at your own pace.', action })}
    <section class="activities-section" aria-labelledby="activity-title">${sectionHeading({ title: 'Your learning activities', detail: 'Guided practice you can revisit whenever you need.', action: `<span class="section-kicker">${icon('Sparkles', 14)} START HERE</span>` })}
      <div class="activity-grid">${activities.map((item) => `<article class="activity-card ${item.tone}"><div class="activity-card-top"><span class="activity-icon">${icon(item.icon, 19)}</span><span class="activity-index">${item.index}</span></div><div class="activity-visual" aria-hidden="true"><div class="visual-line visual-line-one"></div><div class="visual-line visual-line-two"></div><div class="visual-device">${icon(item.icon, 30)}</div><span class="visual-node node-a"></span><span class="visual-node node-b"></span></div><p class="card-meta">${item.meta}</p><h3>${item.title}</h3><p class="activity-description">${item.description}</p><a class="activity-link" href="${item.path}">${item.cta}${icon('ArrowRight', 15)}</a></article>`).join('')}</div>
    </section>
    <div class="student-secondary-grid"><section class="content-panel assignments-panel">${sectionHeading({ title: 'Assigned assessments', detail: 'Separate from independent practice.', action: '<a class="subtle-link" href="/student/assessments">View all ' + icon('ArrowRight', 14) + '</a>' })}
      <div class="assignment-list"><a class="assignment-row" href="/student/assessments"><span class="assignment-number">01</span><span class="assignment-copy"><strong>System assembly sequence</strong><small>Procedural assessment · 8 steps</small></span><span class="assignment-status">Assigned by instructor</span>${icon('ArrowRight', 15, 'assignment-arrow')}</a><a class="assignment-row" href="/student/assessments"><span class="assignment-number">02</span><span class="assignment-copy"><strong>Component identification</strong><small>Hardware knowledge · 6 items</small></span><span class="assignment-status">Not started</span>${icon('ArrowRight', 15, 'assignment-arrow')}</a></div>
    </section><section class="content-panel progress-panel">${sectionHeading({ title: 'My progress', detail: 'A quick look at your practice.', action: '<a class="subtle-link" href="/student/progress">Details ' + icon('ArrowRight', 14) + '</a>' })}
      <div class="progress-visual"><div class="progress-ring"><span>0%</span></div><div><strong>Your learning journey starts here</strong><span>Progress tracking is not available yet.</span></div></div><div class="progress-mini-row"><span>${icon('Clock3', 14)} Practice is self-paced</span><span>${icon('BookOpen', 14)} Repeat any guided activity</span></div>
    </section></div>
    <section class="recent-activity-strip"><span class="recent-icon">${icon('HardDrive', 17)}</span><span><strong>Recent activity</strong><small>No activity yet. Start with hardware exploration.</small></span><a href="/student/hardware" aria-label="Go to hardware exploration">${icon('Play', 14)}</a>${icon('Layers3', 70, 'recent-watermark')}</section>
  </div>`
}

function assessments() {
  return `<div class="dashboard-page">${pageHeading({ eyebrow: 'STUDENT WORKSPACE', title: 'Assigned assessments', description: 'Instructor-assigned procedural activities appear here, separate from independent practice.' })}<section class="content-panel table-panel">${sectionHeading({ title: 'Your assignments', detail: 'Activities assigned by your CSS Instructor.' })}
    <div class="assignment-detail-row"><div class="table-icon">${icon('Wrench', 18)}</div><div class="assignment-detail-copy"><strong>System assembly sequence</strong><span>Procedural assessment · 8 steps · Assigned by CSS Instructor</span></div><span class="status-badge status-assigned">Ready</span><a href="/student/assembly" class="button button-secondary button-small">Open activity ${icon('ArrowRight', 14)}</a></div>
    <div class="assignment-detail-row"><div class="table-icon">${icon('Cpu', 18)}</div><div class="assignment-detail-copy"><strong>Component identification</strong><span>Hardware knowledge · 6 items · Assigned by CSS Instructor</span></div><span class="status-badge status-neutral">Not started</span><a href="/student/hardware" class="button button-secondary button-small">Open activity ${icon('ArrowRight', 14)}</a></div></section></div>`
}

function progress() {
  return `<div class="dashboard-page">${pageHeading({ eyebrow: 'STUDENT WORKSPACE', title: 'My progress', description: 'Progress is based on completed learning activities and assigned procedural assessments.' })}
    <div class="metric-grid">${metric({ label: 'Activities explored', value: '0 / 3', note: 'This visit', iconName: 'Cpu' })}${metric({ label: 'Guided practice', value: '0 sessions', note: 'Independent practice', iconName: 'Wrench' })}${metric({ label: 'Assessments', value: '0 / 2', note: 'Instructor assigned', iconName: 'BookOpen' })}</div>
    <section class="content-panel progress-detail-panel">${sectionHeading({ title: 'Learning overview', detail: 'Your completed activities will appear here.' })}<div class="empty-progress"><div class="empty-progress-mark">${icon('Layers3', 24)}</div><strong>Your practice story starts with one activity.</strong><span>Try component exploration or a guided assembly or disassembly activity.</span><a href="/student/hardware" class="button button-primary button-small">Explore hardware ${icon('ArrowRight', 14)}</a></div></section></div>`
}

export function renderStudent(path, state) {
  if (path === '/student/dashboard') return dashboard(state)
  if (path === '/student/assessments') return assessments()
  if (path === '/student/progress') return progress()
  return ''
}
