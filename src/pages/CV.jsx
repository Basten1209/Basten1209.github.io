import { useState } from 'react'
import { Printer, Download, Check, Link } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PageHeading } from '@/components/shared'
import { cvEntries, sharedCVSections, views } from '@/lib/portfolio.mjs'

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

function CVEntry({ entry, section, view, continuation }) {
  const title = entry.organization || entry.lab || entry.institution || entry.titleEn || entry.title
  const period = entry.period || entry.date || entry.year
  const href =
    section === 'projects'
      ? `#projects/${entry.id}`
      : section === 'publications'
        ? `#writing/book/${entry.id}`
        : entry.url || entry.link
  const role = entry.role || entry.degree
  const highlights = sharedCVSections.includes(section)
    ? entry.highlights
    : entry.highlightsByView?.[view] || entry.highlights
  const bullets = [entry.focus, entry.description, ...(highlights || [])].filter(Boolean)
  return (
    <article className={`cv-entry${continuation ? ' cv-continuation' : ''}`}>
      {!continuation && (
        <div className="cv-entry-top">
          <h3>
            <CVLink href={href}>{title}</CVLink>
            {entry.advisor && <span> (Advisor: {entry.advisor})</span>}
            {entry.isbn && <span> (ISBN: {entry.isbn})</span>}
          </h3>
          {!role && <span className="cv-period">{period}</span>}
        </div>
      )}
      {role && (
        <div className="cv-role-line">
          <p className={section === 'education' ? 'cv-degree' : ''}>
            {role}
            {entry.team && <span> · {entry.team}</span>}
          </p>
          <span className="cv-period">{period}</span>
        </div>
      )}
      {!!bullets.length && (
        <ul className="cv-bullets">
          {bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      )}
      {entry.issuer && (
        <p>
          {entry.issuer}
          {entry.value && ` · ${entry.value}`}
        </p>
      )}
      {entry.tracks && (
        <ul className="cv-bullets">
          {entry.tracks.map((t) => (
            <li key={t.name}>
              <CVLink href={t.link}>
                {t.name} · {t.result}
              </CVLink>
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
  const current = config.cv.views[view]
  const affiliations = cvEntries(config, 'affiliations', view)
  const sections = current.sections.filter(
    (s) => s === 'certificates' || cvEntries(config, s, view).length,
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
          location.hash = v === 'all' ? 'cv' : `cv?view=${v}`
        }}
      >
        <div className="cv-toolbar no-print">
          <TabsList aria-label="CV focus">
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
              {r.language === 'en' ? 'PDF · English' : 'PDF · Korean'}
            </a>
          ))}
        </div>
        {copyError && (
          <p role="status" className="no-print">
            Copy the address from your browser to share this view.
          </p>
        )}
        {views.map((v) => (
          <TabsContent value={v} key={v}>
            <div className="cv-document" aria-label={`${current.label} CV`}>
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
                      {Object.entries(config.cv.certificates)
                        .filter(([key]) => view !== 'crypto' || key !== 'finance')
                        .map(([key, items]) => (
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
                    cvEntries(config, section, view).map((entry, i, entries) => (
                      <CVEntry
                        key={entry.id}
                        entry={entry}
                        section={section}
                        view={view}
                        continuation={
                          i > 0 &&
                          !!entry.organization &&
                          entry.organization === entries[i - 1].organization
                        }
                      />
                    ))
                  )}
                  {section === 'extracurricular' && affiliations.length > 0 && (
                    <p className="cv-affiliations">
                      <strong>Affiliations</strong> ·{' '}
                      {affiliations.map((entry) => entry.organization).join(' · ')}
                    </p>
                  )}
                </section>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
