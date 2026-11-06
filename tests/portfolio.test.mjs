import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import {
  parseRoute,
  writingItems,
  filterWriting,
  cvEntries,
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
  assert.equal(parseRoute('#cv?view=finance').view, 'finance')
  assert.equal(parseRoute('#cv?view=invalid').view, 'all')
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
test('CV audience views retain facts and use shared project/publication records', () => {
  for (const section of ['experience', 'research']) {
    for (const view of ['all', 'finance', 'crypto']) {
      assert.deepEqual(cvEntries(config, section, view), config.cv[section])
    }
  }
  assert.equal(config.cv.views.finance.sections[0], 'education')
  assert.equal(config.cv.views.all.sections.at(-1), 'education')
  assert.equal(config.cv.views.crypto.sections.at(-1), 'education')
  const financeActivities = cvEntries(config, 'extracurricular', 'finance')
  assert.equal(financeActivities.filter((e) => e.organization.includes('PDAO')).length, 2)
  assert.ok(!financeActivities.some((e) => e.organization === 'NinjaLabsKR'))
  assert.deepEqual(cvEntries(config, 'affiliations', 'all'), [])
  assert.deepEqual(cvEntries(config, 'affiliations', 'finance'), [])
  assert.deepEqual(
    cvEntries(config, 'affiliations', 'crypto').map((e) => e.organization),
    ['NinjaLabsKR', 'SuperteamKR', 'POSTECH CCBR'],
  )
  for (const view of ['all', 'finance', 'crypto']) {
    const sections = config.cv.views[view].sections
    assert.equal(sections[sections.indexOf('experience') + 1], 'publications')
    assert.ok(!sections.includes('expertise'))
    assert.ok(!cvEntries(config, 'experience', view).some((e) => e.id === 'experience-3'))
    assert.equal(
      cvEntries(config, 'extracurricular', view).filter((e) => e.id === 'experience-3').length,
      1,
    )
    assert.equal(config.cv.views[view].sections.filter((s) => s === 'extracurricular').length, 1)
    assert.ok(!config.cv.views[view].sections.includes('affiliations'))
    assert.ok(
      cvEntries(config, 'extracurricular', view).every(
        (entry) => !config.cv.affiliations.some((affiliation) => affiliation.id === entry.id),
      ),
    )
  }
  assert.equal(cvEntries(config, 'publications', 'all')[0], config.publications[0])
  assert.ok(cvEntries(config, 'projects', 'finance').every((p) => p.audiences.includes('finance')))
  assert.equal(cvEntries(config, 'experience', 'all').length, config.cv.experience.length)
})
test('common CV experience cannot be hidden or reranked by view metadata', () => {
  const edited = structuredClone(config)
  for (const section of ['experience', 'research']) {
    edited.cv[section][0].audiences = ['crypto']
    edited.cv[section][0].order = { finance: 99, crypto: 99 }
    edited.cv[section][1].order = { finance: 0, crypto: 0 }
    for (const view of ['finance', 'crypto']) {
      assert.deepEqual(cvEntries(edited, section, view), edited.cv[section])
    }
  }
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
