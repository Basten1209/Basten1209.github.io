// Public paths are real HTML documents on GitHub Pages. Fragments only identify
// content within a document; old hash-router links are migrated at the boundary.
export const siteOrigin = 'https://seungjun.site'

export function pageHref(page) {
  return page === 'home' ? '/' : `/${page}/`
}

export function legacyHref(hash) {
  if (!/^#\/?(home|writing|articles|projects|cv|history|experience)(?:$|[/?])/.test(hash))
    return null
  const [path, query = ''] = hash.replace(/^#\/?/, '').split('?')
  const [name, ...parts] = path.split('/').filter(Boolean)
  const page = { articles: 'writing', experience: 'history' }[name] || name
  const params = new URLSearchParams(query)
  if (page === 'cv') return params.get('view') === 'all' ? '/cv/all/' : '/cv/'
  if (page === 'projects') {
    if (parts[0]) return `/projects/#project-${encodeURIComponent(parts[0])}`
    const type = params.get('type')
    return `/projects/${['inclass', 'other'].includes(type) ? `?type=${type}` : ''}`
  }
  if (page === 'writing' && parts[0] === 'book' && parts[1])
    return `/writing/book/${encodeURIComponent(parts[1])}/`
  return pageHref(page)
}

export function siteHref(href = '') {
  return legacyHref(href) || (/^(assets|data)\//.test(href) ? `/${href}` : href)
}

export function absoluteUrl(href) {
  return new URL(siteHref(href), `${siteOrigin}/`).href
}

export function routeFromLocation({ pathname = '/', search = '', hash = '' } = {}) {
  const parts = pathname.split('/').filter(Boolean)
  const page = parts.shift() || 'home'
  const params = new URLSearchParams(search)
  let project = null
  if (page === 'projects' && hash.startsWith('#project-')) {
    try {
      project = decodeURIComponent(hash.slice('#project-'.length))
    } catch { /* Ignore malformed anchors instead of crashing the page. */ }
  }
  return {
    page,
    parts: project ? [project] : parts,
    view: page === 'cv' && (parts[0] === 'all' || params.get('view') === 'all') ? 'all' : 'onepager',
    projectFilter: page === 'projects' && !project && ['inclass', 'other'].includes(params.get('type'))
      ? params.get('type') : 'all',
  }
}
