// The deliberately small Markdown subset used by the approved résumé source.
// Text is rendered by React, never interpreted as HTML.
export function inlineTokens(text) {
  const pattern = /\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)]+)\)/g
  const tokens = []
  let offset = 0
  for (const match of text.matchAll(pattern)) {
    if (match.index > offset) tokens.push({ type: 'text', text: text.slice(offset, match.index) })
    if (match[4]) {
      tokens.push({
        type: 'link',
        href: /^(https?:\/\/|mailto:)/.test(match[5]) ? match[5] : undefined,
        children: inlineTokens(match[4]),
      })
    } else {
      tokens.push({
        type: match[1] ? 'strongEm' : match[2] ? 'strong' : 'em',
        children: inlineTokens(match[1] || match[2] || match[3]),
      })
    }
    offset = match.index + match[0].length
  }
  if (offset < text.length) tokens.push({ type: 'text', text: text.slice(offset) })
  return tokens
}

export function inlineText(text) {
  const flatten = (tokens) => tokens.map((t) => t.text ?? flatten(t.children)).join('')
  return flatten(inlineTokens(text))
}

export function parseOnePager(markdown) {
  const document = { name: '', contact: '', sections: [] }
  let section
  let entry
  for (const raw of markdown.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line) continue
    if (line.startsWith('# ')) {
      document.name = line.slice(2)
    } else if (line.startsWith('## ')) {
      const title = line.slice(3)
      const first = title.replace(/^Selected\s+/i, '').split(' ')[0].toLowerCase()
      section = {
        id: { work: 'experience', publication: 'publications' }[first] || first,
        title,
        paragraphs: [],
        bullets: [],
        entries: [],
      }
      document.sections.push(section)
      entry = undefined
    } else if (!section) {
      document.contact = line
    } else if (line.startsWith('- ')) {
      ;(entry || section).bullets.push(line.slice(2))
    } else if (section.id === 'summary' && !entry) {
      section.paragraphs.push(line)
    } else {
      if (line.startsWith('**[')) {
        entry = { rows: [], bullets: [] }
        section.entries.push(entry)
      }
      if (!entry) throw new Error(`One-pager: unexpected line ${line}`)
      const columns = line.split(' | ')
      if (columns.length < 2) throw new Error(`One-pager: missing row separator in ${line}`)
      entry.rows.push({ left: columns.slice(0, -1).join(' | '), right: columns.at(-1) })
    }
  }
  if (!document.name || !document.contact || !document.sections.length)
    throw new Error('One-pager: missing name, contact, or sections')
  return document
}
