import { useState } from 'react'
import { Printer, Download, Check, Link } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PageHeading } from '@/components/shared'
import { cvEntries, cvPeriod, sharedCVSections, views } from '@/lib/portfolio.mjs'
import { inlineTokens } from '@/lib/one-pager.mjs'
import OnePager from '@/components/OnePager'

const labels = {
  research: 'Research experience',
  experience: 'Work experience',
  education: 'Education',
  publications: 'Publication',
  projects: 'Projects',
  awards: 'Awards & scholarships',
  extracurricular: 'Extracurricular experience',
  events: 'Events',
  certificates: 'Qualifications',
}

function CVLink({ href, children }) {
  return href ? (
    <a
      href={href}
      {...(href.startsWith('#') ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
    >
      {children}
    </a>
  ) : (
    children
  )
}

function CVText({ text, tokens = inlineTokens(text) }) {
  return tokens.map((token, index) => {
    if (token.type === 'text') return token.text
    const children = <CVText tokens={token.children} />
    if (token.type === 'strong') return <strong key={index}>{children}</strong>
    if (token.type === 'em') return <em key={index}>{children}</em>
    if (token.type === 'strongEm') return <strong key={index}><em>{children}</em></strong>
    return <CVLink key={index} href={token.href}>{children}</CVLink>
  })
}

function CVEntry({ entry, section, continuation }) {
  const title = entry.organization || entry.lab || entry.institution || entry.titleEn || entry.title
  const period = cvPeriod(entry.period || entry.date || entry.year)
  const href =
    section === 'projects'
      ? `#projects/${entry.id}`
      : section === 'publications'
        ? `#writing/book/${entry.id}`
        : entry.url || entry.link
  const role = entry.role || entry.degree
  const highlights = sharedCVSections.includes(section)
    ? entry.highlights
    : entry.highlightsByView?.all || entry.highlights
  const bullets = [entry.focus, entry.description, ...(highlights || [])].filter(Boolean)
  return (
    <article className={`cv-entry${continuation ? ' cv-continuation' : ''}`} data-entry={entry.id}>
      <div className="cv-entry-top">
        <div className="cv-entry-main">
          {!continuation && (
            <>
              <h3 className={entry.result ? 'cv-award-title' : undefined}>
                {entry.result && <><strong>{entry.result}</strong> in </>}
                <CVLink href={href}>{title}</CVLink>
                {entry.value && <span> ({entry.value})</span>}
              </h3>{' '}
              {entry.organizationNote && <span className="cv-entry-detail">({entry.organizationNote}) </span>}
              {entry.advisor && <span className="cv-entry-detail">(Advisor: {entry.advisor}) </span>}
              {entry.lab && entry.institution && <span className="cv-entry-detail">{entry.institution} </span>}
              {entry.isbn && <span className="cv-entry-detail">(ISBN: {entry.isbn}) </span>}
            </>
          )}
          {role && section !== 'education' && (
            <span className="cv-role">
              {entry.team && <>{entry.team} · </>}
              <em>{role}</em>
              {entry.employmentType && <> ({entry.employmentType})</>}
            </span>
          )}
        </div>
        <span className="cv-period">{entry.dateLabel && `${entry.dateLabel} `}{period}</span>
      </div>
      {section === 'education' && <p><em>{role}</em>{entry.degreeNote && ` (${entry.degreeNote})`}</p>}
      {entry.rank && <p>Rank: {entry.rank}</p>}
      {!!bullets.length && (
        <ul className="cv-bullets">
          {bullets.map((b) => (
            <li key={b}><CVText text={b} /></li>
          ))}
        </ul>
      )}
      {entry.issuer && <p>by {entry.issuer}</p>}
      {entry.topic && <p>Topic: {entry.topic}</p>}
      {entry.fundingPeriod && <p>Funding period: {cvPeriod(entry.fundingPeriod)}</p>}
      {entry.tracks && (
        <ul className="cv-bullets">
          {entry.tracks.map((t) => (
            <li key={t.name}>
              <CVLink href={t.link}>
                <strong>{t.result}</strong> · {t.name}
              </CVLink>
              {t.topic && <> · Topic: {t.topic}</>}
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

export default function CV({ config, view }) {
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const lastUpdated = config.cv.lastUpdated?.replaceAll('.', '-')
  const lastUpdatedLabel = lastUpdated && new Date(`${lastUpdated}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
  })
  const sections = config.cv.views.all.sections.filter(
    (s) => s === 'certificates' || cvEntries(config, s).length,
  )
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(location.href)
      setCopied(true)
      setCopyError(false)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      setCopyError(true)
    }
  }
  return (
    <div className="page-shell cv-shell">
      <div className="no-print">
        <PageHeading title="CV" />
      </div>
      <Tabs
        value={view}
        onValueChange={(v) => {
          location.hash = v === 'onepager' ? 'cv' : `cv?view=${v}`
        }}
      >
        <div className="cv-toolbar no-print">
          <TabsList aria-label="CV view">
            {views.map((v) => (
              <TabsTrigger value={v} key={v}>
                {config.cv.views[v].label}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="cv-tools">
            <Button variant="ghost" size="sm" onClick={copy} aria-label="Copy link to this CV view">
              {copied ? <Check /> : <Link />}
              {copied ? 'Copied' : 'Share'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer />
              Print current view
            </Button>
          </div>
        </div>
        <div className="cv-downloads no-print">
          {config.resumes.map((r) => (
            <a key={r.id} href={r.file} target="_blank" rel="noopener noreferrer">
              <Download size={15} />
              {r.language === 'en' ? 'PDF · One-pager' : 'PDF · Korean'}
            </a>
          ))}
          {lastUpdated && (
            <p className="cv-last-updated">
              Last updated: <time dateTime={lastUpdated}>{lastUpdatedLabel}</time>
            </p>
          )}
        </div>
        {copyError && (
          <p role="status" className="no-print">
            Copy the address from your browser to share this view.
          </p>
        )}
        <TabsContent value="onepager">
          <OnePager />
        </TabsContent>
        <TabsContent value="all">
          <div className="cv-document" aria-label="All CV">
            <header className="cv-document-header">
              <h2>{config.profile.name}</h2>
              <p>
                Pohang, South Korea <span>·</span>{' '}
                <a href={`mailto:${config.profile.email}`}>{config.profile.email}</a>{' '}
                <span>·</span>{' '}
                <a
                  href={config.profile.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>{' '}
                <span>·</span> <a href="https://seungjun.site">Homepage</a>
              </p>
            </header>
            {sections.map((section) => (
              <section className="cv-section" key={section} data-section={section}>
                <h2>{labels[section]}</h2>
                {section === 'certificates' ? (
                  <div className="cv-qualifications">
                    {Object.entries(config.cv.certificates).map(([key, items]) => (
                      <div key={key}>
                        <h3>
                          {{ finance: 'Finance', cs: 'Computing', general: 'General' }[key]}
                        </h3>
                        <ul>
                          {items.map((i) => (
                            <li key={i.name}>
                              {i.name} <span>({i.issuer})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  cvEntries(config, section).map((entry, i, entries) => (
                    <CVEntry
                      key={entry.id}
                      entry={entry}
                      section={section}
                      continuation={
                        i > 0 &&
                        !!entry.organization &&
                        entry.organization === entries[i - 1].organization
                      }
                    />
                  ))
                )}
              </section>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
