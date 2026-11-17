import { siteHref } from '@/lib/site.mjs'
import { Fragment } from 'react'
import markdown from '../../data/resume/one-pager.md?raw'
import { inlineTokens, parseOnePager } from '@/lib/one-pager.mjs'
import './one-pager.css'

const document = parseOnePager(markdown)

function InlineNodes({ tokens }) {
  return tokens.map((token, index) => {
    if (token.type === 'text') return token.text
    const children = <InlineNodes tokens={token.children} />
    if (token.type === 'strong') return <strong key={index}>{children}</strong>
    if (token.type === 'em') return <em key={index}>{children}</em>
    if (token.type === 'strongEm') return <strong key={index}><em>{children}</em></strong>
    return token.href ? (
      <a key={index} href={siteHref(token.href)} target="_blank" rel="noopener noreferrer">{children}</a>
    ) : <span key={index}>{children}</span>
  })
}

function Inline({ text }) {
  return text.split(' | ').map((part, index) => (
    <Fragment key={index}>
      {index > 0 && <span className="onepager-inline-gap">{' '}</span>}
      <InlineNodes tokens={inlineTokens(part)} />
    </Fragment>
  ))
}

function Bullets({ items, alignPeriods = false }) {
  return items.length > 0 && (
    <ul className="onepager-bullets">
      {items.map((text, index) => {
        const separator = alignPeriods ? text.lastIndexOf(' | ') : -1
        return (
          <li key={index}>
            {separator < 0 ? <Inline text={text} /> : (
              <div className="onepager-row">
                <span className="onepager-row-main"><Inline text={text.slice(0, separator)} /></span>
                <span className="onepager-period"><Inline text={text.slice(separator + 3)} /></span>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default function OnePager() {
  return (
    <article className="onepager" aria-label="One-pager CV">
      <header className="onepager-header">
        <h2>{document.name}</h2>
        <p>
          {document.contact.split(' | ').map((part, index) => (
            <span key={index}>
              {index > 0 && <span className="onepager-contact-divider"> · </span>}
              {part.includes('@') && !part.startsWith('[')
                ? <a href={`mailto:${part}`}>{part}</a>
                : <Inline text={part} />}
            </span>
          ))}
        </p>
      </header>
      {document.sections.map((section) => (
        <section className="onepager-section" data-section={section.id} key={section.id}>
          <h2>{section.title}</h2>
          {section.paragraphs.map((text, index) => <p key={index}><Inline text={text} /></p>)}
          <Bullets items={section.bullets} alignPeriods={section.id === 'awards'} />
          {section.entries.map((entry, index) => (
            <div className="onepager-entry" key={index}>
              {entry.rows.map((row, rowIndex) => {
                const Tag = rowIndex === 0 ? 'h3' : 'p'
                return (
                  <div className="onepager-row" key={rowIndex}>
                    <Tag className="onepager-row-main"><Inline text={row.left} /></Tag>
                    <span className="onepager-period"><Inline text={row.right} /></span>
                  </div>
                )
              })}
              <Bullets items={entry.bullets} />
            </div>
          ))}
        </section>
      ))}
    </article>
  )
}
