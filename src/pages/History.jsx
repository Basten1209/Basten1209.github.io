import { useState } from 'react'
import { PageHeading, SearchInput, FilterSelect, EmptyState } from '@/components/shared'
import { historyGroups, historyPeriod } from '@/lib/portfolio.mjs'

export default function History({ entries }) {
  const [query, setQuery] = useState('')
  const [year, setYear] = useState('All')
  const years = [...new Set(entries.map((e) => e.start.slice(0, 4)))].sort().reverse()
  const groups = historyGroups(entries, { query, year })
  const count = groups.reduce((sum, g) => sum + g.entries.length, 0)
  return (
    <div className="page-shell history-shell">
      <PageHeading title="History" />
      <div className="history-toolbar">
        <SearchInput
          label="Search history"
          placeholder="Search history…"
          value={query}
          onChange={setQuery}
        />
        <FilterSelect
          label="Filter history by year"
          value={year}
          onChange={setYear}
          options={[
            { value: 'All', label: 'All years' },
            ...years.map((y) => ({ value: y, label: y })),
          ]}
        />
      </div>
      <div className="results-meta">
        <span role="status" aria-live="polite">
          {count} entries · {years.at(-1)}—{years[0]}
        </span>
      </div>
      <div className="history-timeline">
        {groups.map((group) => (
          <section className="history-year" key={group.year} aria-label={`${group.year} history`}>
            <div className="history-year-heading">
              <h2>{group.year}</h2>
            </div>
            <div className="history-year-items">
              {group.entries.map((entry) => (
                <article
                  key={entry.id}
                  className={`history-entry ${entry.importance ? 'history-milestone' : ''}`}
                >
                  <div className="timeline-node" />
                  <div className="history-entry-content">
                    <p className="history-date">{historyPeriod(entry)}</p>
                    <h3>{entry.contents}</h3>
                    <div className="history-tags">
                      {entry.tags.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                      {entry.href && <a href={entry.href}>View work</a>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
      {!count && (
        <EmptyState
          onReset={() => {
            setQuery('')
            setYear('All')
          }}
        />
      )}
    </div>
  )
}
