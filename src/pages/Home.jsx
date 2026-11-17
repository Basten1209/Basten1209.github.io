import { siteHref } from '@/lib/site.mjs'

export default function Home({ config }) {
  const background = config.profile.background.map(({ section, id }) =>
    config.cv[section].find((entry) => entry.id === id),
  )
  return (
    <div className="page-shell home-shell">
      <section className="home-hero">
        <div className="hero-copy">
          <h1>
            Seungjun <span>Oh</span>
          </h1>
          <p className="hero-description">{config.profile.tagline}</p>
        </div>
        <img
          className="hero-portrait"
          src={siteHref(config.profile.image)}
          alt="Seungjun Oh’s penguin avatar"
          width="220"
          height="220"
          fetchPriority="high"
        />
      </section>
      <section className="home-background" aria-labelledby="background-heading">
        <div className="section-heading">
          <h2 id="background-heading">Background</h2>
          <a href="/cv/" className="external-link">
            CV
          </a>
        </div>
        <div className="background-list">
          {background.map((entry) => (
            <div className="background-entry" key={entry.id}>
              <div>
                <h3>{entry.organization || entry.lab || entry.institution}</h3>
                <p>
                  {entry.role || entry.degree}
                  {entry.employmentType && ` (${entry.employmentType})`}
                  {entry.degreeNote && ` (${entry.degreeNote})`}
                </p>
              </div>
              <span>{entry.period}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
