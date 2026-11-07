const shapes = {
  ArrowRight: '<path d="M5 12h14M12 5l7 7-7 7"/>', ArrowLeft: '<path d="M19 12H5m7 7-7-7 7-7"/>', ArrowUpRight: '<path d="M7 17 17 7M7 7h10v10"/>',
  BadgeCheck: '<path d="M12 3 14.5 4l2.7-.1.8 2.6 2 1.8-.9 2.6.5 2.7-2.4 1.2-1.3 2.4-2.7-.4L12 19l-2.2-2.2-2.7.4-1.3-2.4-2.4-1.2.5-2.7L3 8.3l2-1.8.8-2.6 2.7.1L12 3Z"/><path d="m8.5 11.5 2.3 2.3 4.8-5"/>',
  BookOpen: '<path d="M12 7v14m0-14C9.5 4.8 6.5 4 3 4v14c3.5 0 6.5.8 9 3m0-14c2.5-2.2 5.5-3 9-3v14c-3.5 0-6.5.8-9 3"/>',
  CalendarDays: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18m-13 4h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
  ChartNoAxesColumnIncreasing: '<path d="M4 19V5m0 14h17M8 15v-4m5 4V7m5 8V4"/>', Check: '<path d="m5 12 4 4L19 6"/>', ChevronRight: '<path d="m9 18 6-6-6-6"/>',
  CircleAlert: '<circle cx="12" cy="12" r="9"/><path d="M12 8v4m0 4h.01"/>', ClipboardCheck: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5V3h6v1.5M8 12l2.5 2.5L16 9"/>',
  Clock3: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', Cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 9h6v6H9zM9 1v3m6-3v3m6 2h-3m3 6h-3m3 6h-3M9 20v3m6-3v3M4 6H1m3 6H1m3 6H1"/>',
  DoorOpen: '<path d="M13 4H5v16h8M13 4l7 2v12l-7 2V4Zm-1 8h.01M10 12h10m-4-4 4 4-4 4"/>', Eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  EyeOff: '<path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-3.1 3.8M6.2 6.2C3.4 8 2 12 2 12s3.5 7 10 7c1.2 0 2.3-.2 3.3-.6"/>',
  GraduationCap: '<path d="m2 10 10-5 10 5-10 5-10-5Zm4 2v5c3.5 3 8.5 3 12 0v-5M22 10v6"/>', HardDrive: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 16h.01M11 16h.01M15 16h.01M3 13h18"/>',
  Layers3: '<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/>', LayoutDashboard: '<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="5" rx="1"/><rect x="13" y="10" width="8" height="11" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/>',
  LockKeyhole: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/>', LogIn: '<path d="M10 17l5-5-5-5m5 5H3m9-9h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7"/>',
  Mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>', Menu: '<path d="M4 6h16M4 12h16M4 18h16"/>', PackageOpen: '<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 5v9l9 5 9-5V8M12 13v9m-5-12 10-5"/>',
  Phone: '<path d="M7 3H5a2 2 0 0 0-2 2c0 9 7 16 16 16a2 2 0 0 0 2-2v-2l-5-2-2 3a13 13 0 0 1-6-6l3-2-2-5H7Z"/>', Play: '<path d="m7 4 14 8-14 8V4Z"/>', Plus: '<path d="M12 5v14m-7-7h14"/>', Search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/>',
  Send: '<path d="m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13"/>', Settings: '<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.8-.6a8 8 0 0 1-1.5.9l-.3 1.9h-2.8l-.3-1.9a8 8 0 0 1-1.5-.9l-1.8.6-1.4-2.4L7.5 15a8 8 0 0 1 0-1.8L6 12l1.4-2.4 1.8.6a8 8 0 0 1 1.5-.9l.3-1.9h2.8l.3 1.9a8 8 0 0 1 1.5.9l1.8-.6 1.4 2.4-1.5 1.2a8 8 0 0 1 .1 1.8Z"/>',
  ShieldCheck: '<path d="M12 3 20 6v5c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6l8-3Z"/><path d="m8.5 12 2.2 2.2 4.8-4.8"/>', SkipForward: '<path d="m5 5 10 7-10 7V5Zm14 0v14"/>', Sparkles: '<path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4L12 3Zm7 12 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z"/>',
  RotateCcw: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>', Maximize2: '<path d="M8 3H3v5m0-5 7 7m6-7h5v5m0-5-7 7M3 16v5h5m-5 0 7-7m9 7v-5m0 5h-5m5 0-7-7"/>',
  UserPlus: '<path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2m5-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm11-4v6m-3-3h6"/>', UserRound: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>', Users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m7-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  Wrench: '<path d="M14.7 6.3a5 5 0 0 0-6.4 6.4L3 18l3 3 5.3-5.3a5 5 0 0 0 6.4-6.4L14 13l-3-3 3.7-3.7Z"/>', X: '<path d="m18 6-12 12M6 6l12 12"/>',
}

export function icon(name, size = 18, extra = '') {
  const content = shapes[name] ?? shapes.Cpu
  return `<svg class="icon ${extra}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${content}</svg>`
}
