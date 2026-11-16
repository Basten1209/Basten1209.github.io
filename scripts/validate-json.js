/** Validate content, references, and local files before a static build. */
const fs = require('node:fs')
const path = require('node:path')
const root = path.join(__dirname, '..')

function validatePortfolio(config, history, fileExists = (p) => fs.existsSync(path.join(root, p))) {
  const errors = []
  const requireField = (record, field, label) => {
    if (!record?.[field]) errors.push(`${label}: missing ${field}`)
  }
  const localFile = (file, label) => {
    if (!file || !fileExists(file)) errors.push(`${label}: missing file ${file || '(empty)'}`)
  }
  const checkURL = (url, label) => {
    try {
      if (!['https:', 'http:'].includes(new URL(url).protocol)) throw Error()
    } catch {
      errors.push(`${label}: invalid URL`)
    }
  }
  for (const field of ['profile', 'resumes', 'reports', 'publications', 'projects', 'cv'])
    requireField(config, field, 'portfolio')
  if (errors.length) return errors
  for (const field of ['name', 'email', 'image', 'tagline', 'heroIdentity'])
    requireField(config.profile, field, 'profile')
  localFile(config.profile.image, 'profile')
  for (const { section, id } of config.profile.background || []) {
    if (!config.cv[section]?.some((entry) => entry.id === id))
      errors.push(`profile: unknown background entry ${id}`)
  }
  for (const [name, records] of Object.entries({
    reports: config.reports,
    publications: config.publications,
    projects: config.projects,
    resumes: config.resumes,
    history,
  })) {
    if (!Array.isArray(records)) {
      errors.push(`${name}: expected array`)
      continue
    }
    const ids = new Set()
    for (const record of records) {
      requireField(record, 'id', name)
      if (ids.has(record.id)) errors.push(`${name}: duplicate id ${record.id}`)
      ids.add(record.id)
      if (record.cover) localFile(record.cover, record.id)
    }
  }
  if (errors.length) return errors
  for (const r of config.reports) {
    for (const key of ['title', 'description', 'contribution', 'date', 'kind'])
      requireField(r, key, r.id)
    if (r.type === 'url') checkURL(r.url, r.id)
    else if (r.type === 'pdf') localFile(`data/reports/${r.filename}`, r.id)
    else errors.push(`${r.id}: invalid report type`)
  }
  for (const r of config.resumes) localFile(r.file, r.id)
  for (const b of config.publications) {
    requireField(b, 'title', b.id)
    checkURL(b.url, b.id)
    localFile(b.cover, b.id)
  }
  for (const p of config.projects) {
    for (const key of ['title', 'description', 'year', 'category', 'status', 'stack', 'links'])
      requireField(p, key, p.id)
    const types = [
      'In-class term project',
      'Competition',
      'Research project',
      'Side project',
      'Startup project',
      'Personal project',
    ]
    if (!types.includes(p.context?.type)) errors.push(`${p.id}: invalid project context type`)
    if (
      ['In-class term project', 'Competition', 'Research project', 'Side project'].includes(
        p.context?.type,
      )
    )
      requireField(p.context, 'name', `${p.id} context`)
    for (const link of p.links || []) {
      if (link.url?.startsWith('data/projects/')) localFile(link.url, p.id)
      else checkURL(link.url, p.id)
    }
    for (const id of p.reportIds || [])
      if (!config.reports.some((r) => r.id === id)) errors.push(`${p.id}: unknown report ${id}`)
  }
  for (const id of config.featuredProjectIds || []) {
    const project = config.projects.find((p) => p.id === id)
    if (!project) errors.push(`unknown featured project ${id}`)
    else {
      requireField(project, 'cover', id)
      requireField(project, 'coverAlt', id)
    }
  }
  for (const [key, source] of [
    ['publicationIds', 'publications'],
    ['projectIds', 'projects'],
  ]) {
    for (const id of config.cv[key] || [])
      if (!config[source].some((x) => x.id === id)) errors.push(`cv: unknown ${source} ${id}`)
  }
  for (const view of ['onepager', 'all']) {
    requireField(config.cv.views, view, 'CV views')
    requireField(config.cv.views?.[view], 'label', `CV ${view}`)
  }
  requireField(config.cv.views?.all, 'sections', 'CV All')
  for (const e of history) {
    if (!/^\d{4}\.\d{2}$/.test(e.start)) errors.push(`${e.id}: invalid start date`)
    requireField(e, 'contents', e.id)
    if (!Array.isArray(e.tags)) errors.push(`${e.id}: tags must be an array`)
    if (
      e.href?.startsWith('#projects/') &&
      !config.projects.some((p) => e.href === `#projects/${p.id}`)
    )
      errors.push(`${e.id}: unknown project link`)
    if (
      e.href?.startsWith('#writing/book/') &&
      !config.publications.some((p) => e.href === `#writing/book/${p.id}`)
    )
      errors.push(`${e.id}: unknown book link`)
  }
  return errors
}

if (require.main === module) {
  try {
    const config = JSON.parse(
      fs.readFileSync(path.join(root, 'data/portfolio-config.json'), 'utf8'),
    )
    const history = JSON.parse(fs.readFileSync(path.join(root, 'data/proof-of-work.json'), 'utf8'))
    const errors = validatePortfolio(config, history)
    if (errors.length) {
      console.error(errors.join('\n'))
      process.exitCode = 1
    } else
      console.log(
        `Content validated: ${config.reports.length} writings, ${config.publications.length} book, ${config.projects.length} projects, ${history.length} history entries.`,
      )
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
module.exports = { validatePortfolio }
