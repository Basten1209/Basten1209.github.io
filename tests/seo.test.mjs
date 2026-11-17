import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { legacyHref, routeFromLocation, siteHref } from '../src/lib/site.mjs'
import { renderHead, sitePages } from '../src/lib/seo.mjs'

test('legacy deep links resolve to crawlable pages and document anchors', () => {
  assert.equal(legacyHref('#articles'), '/writing/')
  assert.equal(legacyHref('#experience'), '/history/')
  assert.equal(legacyHref('#cv?view=all'), '/cv/all/')
  assert.equal(legacyHref('#cv?view=finance'), '/cv/')
  assert.equal(legacyHref('#projects/lift?type=other'), '/projects/#project-lift')
  assert.equal(legacyHref('#writing/book/digital-asset-era'), '/writing/book/digital-asset-era/')
  assert.equal(legacyHref('#projects?type=inclass'), '/projects/?type=inclass')
  assert.equal(legacyHref('#main'), null)
  assert.equal(legacyHref('#project-lift'), null)
  assert.equal(siteHref('data/projects/stablecoin-deposit.pdf'), '/data/projects/stablecoin-deposit.pdf')
  assert.equal(routeFromLocation({ pathname: '/cv/all/' }).view, 'all')
  const project = routeFromLocation({ pathname: '/projects/', search: '?type=other', hash: '#project-lift' })
  assert.deepEqual(project.parts, ['lift'])
  assert.equal(project.projectFilter, 'all')
  assert.deepEqual(routeFromLocation({ pathname: '/projects/', hash: '#project-%' }).parts, [])
})

test('metadata safely escapes content in HTML and JSON-LD', () => {
  const config = JSON.parse(readFileSync(new URL('../data/portfolio-config.json', import.meta.url)))
  config.profile.name = 'Test </script><script>alert("x")</script>'
  const head = renderHead(sitePages(config)[0], config)
  assert.ok(!head.includes('</script><script>'))
  const json = JSON.parse(head.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])
  assert.equal(json['@graph'][0].name, config.profile.name)
})
