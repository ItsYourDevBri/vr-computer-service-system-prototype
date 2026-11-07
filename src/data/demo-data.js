// Fictional illustrative records for the local UI; these are not real student or school accounts.
export const students = [
  { name: 'Mika Santos', email: 'mika.santos@movers.test', className: 'CSS 11 · Section A', progress: 72, status: 'Active' },
  { name: 'Noah Reyes', email: 'noah.reyes@movers.test', className: 'CSS 11 · Section A', progress: 48, status: 'Active' },
  { name: 'Ava Cruz', email: 'ava.cruz@movers.test', className: 'CSS 11 · Section B', progress: 26, status: 'Invited' },
]

export const classes = [
  { name: 'CSS 11 · Section A', code: 'CSS-11A', students: 18, completion: '64%', next: 'Component identification' },
  { name: 'CSS 11 · Section B', code: 'CSS-11B', students: 16, completion: '42%', next: 'System assembly sequence' },
]

export const assessments = [
  { name: 'Component identification', category: 'Hardware knowledge', steps: '6 items', assigned: '12 students' },
  { name: 'System assembly sequence', category: 'Procedural assessment', steps: '8 steps', assigned: '18 students' },
  { name: 'Safe disassembly sequence', category: 'Procedural assessment', steps: '7 steps', assigned: 'Not assigned' },
]

export const instructors = [
  { name: 'Jordan Lee', email: 'jordan.lee@movers.test', classes: 2, status: 'Active' },
  { name: 'Sam Rivera', email: 'sam.rivera@movers.test', classes: 1, status: 'Active' },
  { name: 'Casey Lim', email: 'casey.lim@movers.test', classes: 0, status: 'Invitation sent' },
]
