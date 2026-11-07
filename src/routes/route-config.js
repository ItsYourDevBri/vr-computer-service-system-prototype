export const dashboardNavigation = {
  student: [
    { label: 'Overview', path: '/student/dashboard', icon: 'LayoutDashboard' },
    { label: 'Hardware exploration', path: '/student/hardware', icon: 'Cpu' },
    { label: 'Guided assembly', path: '/student/assembly', icon: 'Wrench' },
    { label: 'Guided disassembly', path: '/student/disassembly', icon: 'PackageOpen' },
    { label: 'Assessments', path: '/student/assessments', icon: 'ClipboardCheck' },
    { label: 'My progress', path: '/student/progress', icon: 'ChartNoAxesColumnIncreasing' },
  ],
  instructor: [
    { label: 'Overview', path: '/instructor/dashboard', icon: 'LayoutDashboard' },
    { label: 'My classes', path: '/instructor/classes', icon: 'BookOpen' },
    { label: 'Invite students', path: '/instructor/students?invite=1', icon: 'UserPlus' },
    { label: 'Student list', path: '/instructor/students', icon: 'Users' },
    { label: 'Assign assessments', path: '/instructor/assessments', icon: 'ClipboardCheck' },
    { label: 'Student progress', path: '/instructor/progress', icon: 'ChartNoAxesColumnIncreasing' },
  ],
  principal: [
    { label: 'Overview', path: '/principal/dashboard', icon: 'LayoutDashboard' },
    { label: 'Invite instructor', path: '/principal/instructors?invite=1', icon: 'UserPlus' },
    { label: 'Instructor list', path: '/principal/instructors', icon: 'Users' },
    { label: 'CSS classes', path: '/principal/classes', icon: 'BookOpen' },
  ],
}

export const knownRoutes = [
  '/', '/login', '/activate-account', '/forgot-password', '/profile-setup',
  '/student/dashboard', '/student/hardware', '/student/assembly', '/student/disassembly', '/student/assessments', '/student/progress',
  '/instructor/dashboard', '/instructor/classes', '/instructor/students', '/instructor/assessments', '/instructor/progress',
  '/principal/dashboard', '/principal/instructors', '/principal/classes', '/settings',
]
