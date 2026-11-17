import { siteHref } from '@/lib/site.mjs'
import { useEffect } from 'react'
import { PageHeading, ExternalLink } from '@/components/shared'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { reportHref } from '@/lib/portfolio.mjs'

export default function Projects({ config, route, onOpenPDF }) {
  const projects = config.projects
    .filter((project) => {
      const inClass = project.context.type === 'In-class term project'
      return (
        route.projectFilter === 'all' || (route.projectFilter === 'inclass' ? inClass : !inClass)
      )
    })
    .sort((a, b) => (b.date || b.year).localeCompare(a.date || a.year))
  const featured = (config.featuredProjectIds || [])
    .map((id) => config.projects.find((p) => p.id === id))
    .filter(Boolean)
  useEffect(() => {
    if (!route.parts[0]) return
    const element = document.getElementById(`project-${route.parts[0]}`)
    element?.scrollIntoView({ block: 'start' })
    element?.focus({ preventScroll: true })
  }, [route.parts[0]])
  return (
    <div className="page-shell projects-shell">
      <PageHeading title="Projects" />
      {!!featured.length && (
        <section className="featured-projects" aria-labelledby="featured-heading">
          <h2 id="featured-heading">Featured</h2>
          <ul>
            {featured.map((p) => (
              <li key={p.id}>
                <a className="featured-card" href={`/projects/#project-${p.id}`} aria-label={p.title}>
                  <div className={`featured-image featured-image-${p.id}`}>
                    <img
                      src={siteHref(p.cover)}
                      alt={p.coverAlt}
                      style={{ objectFit: p.coverFit || 'cover' }}
                      decoding="async"
                    />
                  </div>
                  <div className="featured-caption">
                    <span>{p.title}</span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="project-archive" aria-labelledby="archive-heading">
        <h2 id="archive-heading" className="sr-only">
          Project archive
        </h2>
        <Tabs value={route.projectFilter}>
          <TabsList aria-label="Project type">
            <TabsTrigger value="all" asChild><a href="/projects/">All</a></TabsTrigger>
            <TabsTrigger value="inclass" asChild><a href="/projects/?type=inclass">In-class</a></TabsTrigger>
            <TabsTrigger value="other" asChild><a href="/projects/?type=other">Other</a></TabsTrigger>
          </TabsList>
          <TabsContent value={route.projectFilter}>
            {projects.map((p) => (
              <article className="project-entry" key={p.id} id={`project-${p.id}`} tabIndex={-1}>
                <div className="project-date">{(p.date || p.year).replaceAll('-', '.')}</div>
                <div className="project-content">
                  <h3>
                    <a href={`/projects/#project-${p.id}`}>{p.title}</a>
                  </h3>
                  <p className="project-context">
                    <span className="project-type">{p.context.type}</span>
                    {p.context.name && <> · {p.context.name}</>}
                  </p>
                  {p.award && <p className="project-award">{p.award}</p>}
                  <p className="project-description">{p.details || p.description}</p>
                  {p.role && <p className="project-role">{p.role}</p>}
                  {p.highlights && (
                    <ul className="project-highlights">
                      {p.highlights.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  )}
                  <div className="project-links">
                    {p.links.map((link) => (
                      <ExternalLink key={link.url} href={link.url}>
                        {link.label}
                      </ExternalLink>
                    ))}
                    {p.reportIds?.map((id) => {
                      const r = config.reports.find((r) => r.id === id)
                      return (
                        <a
                          key={id}
                          className="external-link"
                          href={reportHref(r)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={
                            r.type === 'pdf'
                              ? (e) => {
                                  e.preventDefault()
                                  onOpenPDF(r)
                                }
                              : undefined
                          }
                        >
                          Report
                        </a>
                      )
                    })}
                    {p.materialNote && (
                      <span className="project-material-note">{p.materialNote}</span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  )
}
