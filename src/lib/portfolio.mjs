export const pages = ['home', 'writing', 'projects', 'cv', 'history']
export const views = ['all', 'finance', 'crypto']
export const sharedCVSections = ['experience', 'research']

export function parseRoute(hash = '') {
  const [path, query = ''] = hash.replace(/^#\/?/, '').split('?')
  let [page = 'home', ...parts] = path.split('/')
  if (page === 'articles') page = 'writing'
  if (page === 'experience') page = 'history'
  if (!pages.includes(page)) page = 'home'
  const requestedView = new URLSearchParams(query).get('view')
  const requestedType = new URLSearchParams(query).get('type')
  return {
    page,
    parts,
    view: views.includes(requestedView) ? requestedView : 'all',
    projectFilter:
      page === 'projects' && !parts[0] && ['inclass', 'other'].includes(requestedType)
        ? requestedType
        : 'all',
  }
}

export function reportHref(report) {
  return report.type === 'url' ? report.url : `data/reports/${encodeURIComponent(report.filename)}`
}

export const dateLabel = (date) => date?.replaceAll('-', '.') || ''
export const inView = (entry, view) =>
  view === 'all' || !entry.audiences || entry.audiences.includes(view)

export function writingItems(config) {
  return [
    ...config.reports.map((r) => ({
      ...r,
      kind: r.kind || 'Report',
      href: reportHref(r),
      role: r.contribution,
    })),
    ...config.publications.map((b) => ({ ...b, kind: 'Book', href: b.url, category: b.publisher })),
  ].sort((a, b) => b.date.localeCompare(a.date))
}

export function filterWriting(items, { kind = 'All', query = '', organization = 'All' } = {}) {
  const q = query.trim().toLocaleLowerCase()
  return items.filter(
    (item) =>
      (kind === 'All' || item.kind === kind) &&
      (organization === 'All' || item.category === organization) &&
      [item.title, item.originalTitle, item.description, item.category, item.role, item.kind]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase()
        .includes(q),
  )
}

export function cvEntries(config, section, view) {
  // Memberships are supporting context shown only in Crypto, not in All or Finance.
  if (section === 'affiliations' && view !== 'crypto') return []
  let entries
  if (section === 'publications')
    entries = config.cv.publicationIds.map((id) => config.publications.find((p) => p.id === id))
  else if (section === 'projects')
    entries = config.cv.projectIds.map((id) => config.projects.find((p) => p.id === id))
  else entries = config.cv[section] || []
  // Employment and research are a shared chronology, never audience-filtered or reranked.
  if (sharedCVSections.includes(section)) return entries.filter(Boolean)
  const result = entries.filter(Boolean).filter((entry) => inView(entry, view))
  return [...result].sort((a, b) => (a.order?.[view] ?? 99) - (b.order?.[view] ?? 99))
}

export function historyGroups(entries, { query = '', year = 'All' } = {}) {
  const q = query.trim().toLocaleLowerCase()
  const filtered = entries.filter(
    (e) =>
      (year === 'All' || e.start.startsWith(year)) &&
      [e.contents, ...e.tags, e.start].join(' ').toLocaleLowerCase().includes(q),
  )
  return [...new Set(filtered.map((e) => e.start.slice(0, 4)))]
    .sort()
    .reverse()
    .map((year) => ({
      year,
      entries: filtered
        .filter((e) => e.start.startsWith(year))
        .sort((a, b) => b.start.localeCompare(a.start)),
    }))
}

export function historyPeriod(entry) {
  if (entry.kind === 'qualification' || entry.end === entry.start) return entry.start
  if (!entry.end) return `${entry.start} —`
  return `${entry.start} — ${entry.end}`
}
