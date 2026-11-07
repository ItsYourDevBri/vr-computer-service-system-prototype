import { icon } from '../components/icons.js'
import { brand } from '../components/primitives.js'
import { escapeHTML } from '../components/primitives.js'

const features = [
  { title: 'Hardware Exploration', icon: 'Cpu', points: ['Browse a catalog of common computer hardware.', 'Review component names, purposes, and identifying features.', 'Rotate and zoom the Computer Case in the interactive 3D viewer.'] },
  { title: 'Guided Assembly', icon: 'Layers3', points: ['Follow step-by-step computer assembly procedures.', 'Understand component placement and installation sequence.', 'Guided virtual hardware assembly is planned for a future implementation.'] },
  { title: 'Guided Disassembly', icon: 'Wrench', points: ['Follow step-by-step component removal procedures.', 'Understand the sequence for disassembling computer hardware.', 'Guided virtual hardware removal is planned for a future implementation.'] },
]

export function renderLanding(location, state) {
  const active = location.hash || '#home'
  const menuOpen = Boolean(state.ui.mobileNavOpen)
  return `<main class="landing-page" id="home">
    <div class="cinematic-photo" aria-hidden="true"></div>
    <header class="landing-header">
      <div class="landing-identity">${brand(true)}</div>
      <nav class="landing-nav${menuOpen ? ' is-open' : ''}" id="landing-navigation" aria-label="Main navigation">
        ${[['#home', 'Home'], ['#about', 'About'], ['#features', 'Features']].map(([hash, label]) => `<a class="${active === hash ? 'is-current' : ''}" aria-current="${active === hash ? 'location' : 'false'}" href="${hash}">${label}</a>`).join('')}
      </nav>
      <div class="landing-controls">
        <button class="landing-mobile-toggle" type="button" aria-label="${menuOpen ? 'Close' : 'Open'} site navigation" aria-expanded="${menuOpen}" aria-controls="landing-navigation" data-action="toggle-landing-menu">${icon(menuOpen ? 'X' : 'Menu', 19)}</button>
        <a class="button button-primary landing-login-link" href="/login">${icon('LogIn', 15)} Login / Sign Up</a>
      </div>
    </header>
    <section class="landing-hero" aria-labelledby="landing-title">
      <p class="landing-institution">Movers Institute of Technology and Education</p>
      <p class="landing-eyebrow"><span></span> COMPUTER SYSTEMS SERVICING</p>
      <h1 id="landing-title">VR-Based Computer Systems Servicing (CSS) Training Application</h1>
      <p class="landing-description">An interactive learning tool for exploring computer hardware and becoming familiar with basic assembly and disassembly procedures through guided virtual activities.</p>
      <div class="landing-actions"><a class="button button-primary landing-start" href="/login">${icon('LogIn', 16)} Get Started ${icon('ArrowRight', 16)}</a><a class="button button-outline-light" href="#about">${icon('GraduationCap', 16)} Learn More</a></div>
    </section>
    <section class="landing-about" id="about" aria-labelledby="about-title">
      <div class="landing-section-heading"><p class="landing-section-eyebrow">ABOUT THE PROJECT</p><h2 id="about-title">About the CSS Training Application</h2></div>
      <div class="landing-about-copy"><p>The VR-Based Computer Systems Servicing (CSS) Training Application is an interactive learning tool developed for Movers Institute of Technology and Education. It is designed to help students explore computer hardware components, understand their functions, and become familiar with basic computer assembly and disassembly procedures through guided virtual activities.</p><p class="landing-support-note">This application supplements classroom instruction and physical hands-on training.</p></div>
    </section>
    <section class="landing-feature-section" id="features" aria-labelledby="features-title">
      <div class="landing-feature-heading"><div class="landing-section-heading"><p class="landing-section-eyebrow">LEARNING ACTIVITIES</p><h2 id="features-title">Explore the Learning Experience</h2></div><p class="landing-planned-note">These describe the intended learning experience. Interactive 3D activities are planned for a later phase.</p></div>
      <div class="landing-feature-grid">${features.map((feature) => `<article class="landing-feature-card"><div class="landing-feature-card-heading">${icon(feature.icon, 23)}<h3>${feature.title}</h3></div><ul>${feature.points.map((point) => `<li>${escapeHTML(point)}</li>`).join('')}</ul></article>`).join('')}</div>
    </section>
    <footer class="landing-footer"><span>SUPPLEMENTARY LEARNING TOOL</span><span>Supports classroom instruction and physical hands-on training</span></footer>
  </main>`
}
