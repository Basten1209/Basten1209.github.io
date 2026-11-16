import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import {
  parseRoute,
  writingItems,
  filterWriting,
  cvEntries,
  cvPeriod,
  historyGroups,
  historyPeriod,
} from '../src/lib/portfolio.mjs'
const require = createRequire(import.meta.url)
const { validatePortfolio } = require('../scripts/validate-json.js')
const config = JSON.parse(readFileSync(new URL('../data/portfolio-config.json', import.meta.url)))
const history = JSON.parse(readFileSync(new URL('../data/proof-of-work.json', import.meta.url)))
test('legacy links, unknown pages, and invalid CV views remain usable', () => {
  assert.equal(parseRoute('#articles').page, 'writing')
  assert.equal(parseRoute('#experience').page, 'history')
  assert.equal(parseRoute('#does-not-exist').page, 'home')
  assert.equal(parseRoute('#cv').view, 'onepager')
  assert.equal(parseRoute('#cv?view=all').view, 'all')
  for (const view of ['onepager', 'finance', 'crypto', 'invalid'])
    assert.equal(parseRoute(`#cv?view=${view}`).view, 'onepager')
  assert.equal(parseRoute('#projects?type=inclass').projectFilter, 'inclass')
  assert.equal(parseRoute('#projects?type=other').projectFilter, 'other')
  assert.equal(parseRoute('#projects?type=invalid').projectFilter, 'all')
  assert.equal(parseRoute('#projects/lift?type=other').projectFilter, 'all')
  assert.deepEqual(parseRoute('#writing/book/digital-asset-era').parts, [
    'book',
    'digital-asset-era',
  ])
})
test('the co-authored book is searchable alongside all existing writing', () => {
  const items = writingItems(config)
  assert.equal(items.length, config.reports.length + config.publications.length)
  assert.equal(filterWriting(items, { query: 'The Digital Asset Era' }).at(0).kind, 'Book')
  assert.equal(filterWriting(items, { query: '디지털자산 시대' }).at(0).kind, 'Book')
  assert.equal(filterWriting(items, { kind: 'Book' }).length, 1)
  assert.equal(filterWriting(items, { kind: 'Book', organization: 'Bithumb' }).length, 0)
  assert.ok(
    filterWriting(items, { kind: 'Report', organization: 'Bithumb' }).every(
      (x) => x.type === 'pdf',
    ),
  )
})
test('All CV retains archive records, chronology, and shared project/publication references', () => {
  assert.deepEqual(Object.keys(config.cv.views), ['onepager', 'all'])
  const sections = config.cv.views.all.sections
  assert.equal(sections[0], 'education')
  assert.equal(sections[sections.indexOf('experience') + 1], 'publications')
  assert.ok(!sections.includes('affiliations'))
  assert.ok(!sections.includes('expertise'))
  assert.deepEqual(cvEntries(config, 'affiliations'), [])
  const book = cvEntries(config, 'publications')[0]
  assert.equal(book.id, config.publications[0].id)
  assert.equal(book.url, config.publications[0].url)
  assert.equal(book.isbn, config.publications[0].isbn)
  assert.equal(book.title, config.publications[0].cv.title)
  assert.equal(config.publications[0].title, 'The Digital Asset Era Is Coming')
  assert.deepEqual(
    new Set(cvEntries(config, 'projects').map((entry) => entry.id)),
    new Set(config.cv.projectIds),
  )
  for (const section of ['experience', 'research'])
    assert.deepEqual(cvEntries(config, section), config.cv[section])
  assert.ok(!cvEntries(config, 'experience').some((entry) => entry.id === 'experience-3'))
  assert.equal(
    cvEntries(config, 'extracurricular').filter((entry) => entry.id === 'experience-3').length,
    1,
  )
})
test('CV month formatting retains distinct research periods and date precision', () => {
  assert.equal(cvPeriod('2025.06 - 2025.12, 2026.06 - Present'), 'Jun 2025 - Dec 2025, Jun 2026 - Present')
  assert.equal(cvPeriod('2021.02 - (Expected) 2028.02'), 'Feb 2021 - (Expected) Feb 2028')
  assert.equal(cvPeriod('2023-10'), 'Oct 2023')
  assert.equal(cvPeriod('2026'), '2026')
})
test('All CV ignores legacy audience filters and preserves canonical employment chronology', () => {
  const edited = structuredClone(config)
  for (const section of ['experience', 'research']) {
    edited.cv[section][0].audiences = ['crypto']
    edited.cv[section][0].order = { all: 99 }
    edited.cv[section][1].order = { all: 0 }
    assert.deepEqual(cvEntries(edited, section), edited.cv[section])
  }
  edited.cv.extracurricular[0].audiences = ['crypto']
  assert.equal(cvEntries(edited, 'extracurricular').length, edited.cv.extracurricular.length)
})
test('all historical records survive grouping and search', () => {
  const groups = historyGroups(history)
  assert.equal(
    groups.reduce((n, g) => n + g.entries.length, 0),
    history.length,
  )
  assert.equal(groups[0].year, [...groups.map((g) => g.year)].sort().at(-1))
  assert.ok(
    historyGroups(history, { query: 'PDAO' })
      .flatMap((g) => g.entries)
      .every((e) => [e.contents, ...e.tags].join(' ').toLowerCase().includes('pdao')),
  )
  assert.ok(historyGroups(history, { year: '2024' }).every((g) => g.year === '2024'))
  assert.equal(historyPeriod({ start: '2024.06', end: '', kind: 'qualification' }), '2024.06')
})
test('validation catches broken cross-page references and missing assets', () => {
  assert.deepEqual(validatePortfolio(config, history), [])
  const invalid = structuredClone(config)
  invalid.cv.projectIds.push('missing-project')
  assert.ok(validatePortfolio(invalid, history).some((e) => e.includes('missing-project')))
  assert.ok(validatePortfolio(config, history, () => false).some((e) => e.includes('missing file')))
})
