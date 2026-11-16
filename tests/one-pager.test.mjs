import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { inlineTokens, inlineText, parseOnePager } from '../src/lib/one-pager.mjs'

test('one-pager markup preserves emphasis, linked names, and plain-text meaning', () => {
  const text = '**[Company](https://example.com/)** | *Researcher* | ***Degree***'
  assert.equal(inlineText(text), 'Company | Researcher | Degree')
  const tokens = inlineTokens(text)
  assert.equal(tokens[0].type, 'strong')
  assert.equal(tokens[0].children[0].href, 'https://example.com/')
  assert.equal(tokens[2].type, 'em')
  assert.equal(tokens[4].type, 'strongEm')
  assert.equal(inlineTokens('[Unsafe](javascript:alert)')[0].href, undefined)
  assert.equal(inlineTokens('<script>text</script>')[0].type, 'text')
})

test('approved source keeps the curated order, combined roles, and consistent bullet endings', () => {
  const source = readFileSync(new URL('../data/resume/one-pager.md', import.meta.url), 'utf8')
  const document = parseOnePager(source)
  assert.deepEqual(document.sections.map((section) => section.id), [
    'summary', 'education', 'experience', 'publications', 'research', 'extracurricular', 'awards', 'certifications',
  ])
  assert.equal(document.sections[0].bullets.length, 0)
  assert.equal(document.sections[0].paragraphs.length, 1)
  const work = document.sections.find((section) => section.id === 'experience')
  assert.equal(work.entries.length, 4)
  assert.equal(inlineText(work.entries[0].rows[0].left), 'B-Harvest TechBD · Technical Writer (Internship); Researcher (Freelance)')
  assert.equal(work.entries[0].rows[0].right, 'Dec 2025 - Jun 2026')
  for (const section of document.sections) {
    const bullets = [...section.bullets, ...section.entries.flatMap((entry) => entry.bullets)]
    assert.ok(bullets.every((bullet) => !inlineText(bullet).endsWith('.')), section.title)
    assert.notEqual(section.title, section.title.toUpperCase())
  }
})

test('invalid résumé rows fail explicitly instead of silently dropping their content', () => {
  assert.throws(() => parseOnePager('# Missing contact'), /missing/)
  assert.throws(() => parseOnePager('# Name\nContact\n## Work experience\nUnexpected'), /unexpected/)
  assert.throws(() => parseOnePager('# Name\nContact\n## Work experience\n**[Company](https://example.com/)**'), /separator/)
})
