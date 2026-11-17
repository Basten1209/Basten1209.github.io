export const pages = ['home', 'writing', 'projects', 'cv', 'history']
export const views = ['onepager', 'all']
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
    // Old Finance/Crypto links now open the curated one-pager.
    view: views.includes(requestedView) ? requestedView : 'onepager',
    projectFilter:
      page === 'projects' && !parts[0] && ['inclass', 'other'].includes(requestedType)
        ? requestedType
        : 'all',
  }
}

export function reportHref(report) {
  return report.type === 'url' ? report.url : `/data/reports/${encodeURIComponent(report.filename)}`
}

export const dateLabel = (date) => date?.replaceAll('-', '.') || ''

// Keep the original month precision, multiple periods, and expected/current labels.
export function cvPeriod(value = '') {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return value.replace(/\b(\d{4})[.-](0[1-9]|1[0-2])\b/g, (_, year, month) =>
    `${months[Number(month) - 1]} ${year}`,
  )
}

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

export function cvEntries(config, section) {
  // Preserve the existing All view, which never displayed supporting affiliations.
  if (section === 'affiliations') return []
  let entries
  if (section === 'publications')
    entries = config.cv.publicationIds.map((id) => config.publications.find((p) => p.id === id))
  else if (section === 'projects')
    entries = config.cv.projectIds.map((id) => config.projects.find((p) => p.id === id))
  else entries = config.cv[section] || []
  // CV wording may be tailored without rewriting the Writing/Projects pages.
  if (section === 'publications' || section === 'projects')
    entries = entries.map((entry) => entry?.cv ? { ...entry, ...entry.cv } : entry)
  // Employment and research retain their canonical chronology.
  if (sharedCVSections.includes(section)) return entries.filter(Boolean)
  return entries.filter(Boolean).sort((a, b) => (a.order?.all ?? 99) - (b.order?.all ?? 99))
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
