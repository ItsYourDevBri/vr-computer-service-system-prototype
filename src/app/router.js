let renderCallback = () => {}

export function currentLocation() {
  return { pathname: window.location.pathname, search: window.location.search, hash: window.location.hash, state: window.history.state || {} }
}

export function navigate(to, options = {}) {
  const url = new URL(to, window.location.href)
  const historyState = { ...(options.state || {}) }
  if (options.replace) window.history.replaceState(historyState, '', `${url.pathname}${url.search}${url.hash}`)
  else window.history.pushState(historyState, '', `${url.pathname}${url.search}${url.hash}`)
  renderCallback()
}

export function initializeRouter(render) {
  renderCallback = render
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const anchor = event.target.closest('a[href]')
    if (!anchor || anchor.target || anchor.hasAttribute('download')) return
    const target = new URL(anchor.href, window.location.href)
    if (target.origin !== window.location.origin) return
    if (target.pathname === window.location.pathname && target.search === window.location.search && target.hash) return
    event.preventDefault()
    navigate(`${target.pathname}${target.search}${target.hash}`)
  })
  window.addEventListener('popstate', () => renderCallback())
  window.addEventListener('hashchange', () => {
    if (window.location.pathname === '/') renderCallback()
  })
  render()
}
