import { useEffect, useMemo, useState } from 'react'
import { FileText } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  PageHeading,
  SearchInput,
  FilterSelect,
  EmptyState,
  BookFeature,
} from '@/components/shared'
import { writingItems, filterWriting, dateLabel } from '@/lib/portfolio.mjs'

const kinds = [
  ['All', 'All'],
  ['Article', 'Articles'],
  ['Report', 'Reports'],
  ['Paper Review', 'Paper reviews'],
  ['Book', 'Books'],
]

export default function Writing({ config, route, onOpenPDF }) {
  const [kind, setKind] = useState(route.parts[0] === 'book' ? 'Book' : 'All')
  const [query, setQuery] = useState('')
  const [organization, setOrganization] = useState('All')
  const items = useMemo(() => writingItems(config), [config])
  useEffect(() => {
    if (route.parts[0] === 'book') {
      setKind('Book')
      setQuery('')
      setOrganization('All')
    }
  }, [route.parts.join('/')])
  const results = filterWriting(items, { kind, query, organization })
  const books = results.filter((r) => r.kind === 'Book')
  const reports = results.filter((r) => r.kind !== 'Book')
  const years = [...new Set(reports.map((r) => r.date.slice(0, 4)))]
  const reset = () => {
    setKind('All')
    setQuery('')
    setOrganization('All')
  }
  const categories = [...new Set(items.map((i) => i.category))]
  return (
    <div className="page-shell">
      <PageHeading title="Writing" />
      <Tabs value={kind} onValueChange={setKind} className="writing-tabs">
        <div className="archive-toolbar">
          <TabsList aria-label="Writing type" className="writing-type-tabs">
            {kinds.map(([value, label]) => (
              <TabsTrigger key={value} value={value}>
                {label}
                <span className="tab-count">
                  {value === 'All' ? items.length : items.filter((r) => r.kind === value).length}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="archive-search">
            <SearchInput
              value={query}
              onChange={setQuery}
              label="Search writing"
              placeholder="Search writing…"
            />
            <FilterSelect
              label="Filter by organization"
              value={organization}
              onChange={setOrganization}
              options={[
                { value: 'All', label: 'All sources' },
                ...categories.map((c) => ({ value: c, label: c })),
              ]}
            />
          </div>
        </div>
        {kinds.map(([value]) => (
          <TabsContent value={value} key={value}>
            <div className="results-meta">
              <span role="status" aria-live="polite">
                {results.length} {results.length === 1 ? 'work' : 'works'}
              </span>
            </div>
            {books.map((book) => (
              <BookFeature key={book.id} book={book} />
            ))}
            {years.map((year) => (
              <section className="writing-year" key={year} aria-label={`${year} writing`}>
                <h2>{year}</h2>
                <div>
                  {reports
                    .filter((r) => r.date.startsWith(year))
                    .map((r) => (
                      <a
                        key={r.id}
                        href={r.href}
                        className="writing-row"
                        target={r.type === 'url' ? '_blank' : undefined}
                        rel={r.type === 'url' ? 'noopener noreferrer' : undefined}
                        onClick={
                          r.type !== 'url'
                            ? (e) => {
                                e.preventDefault()
                                onOpenPDF(r)
                              }
                            : undefined
                        }
                      >
                        <div className="writing-row-date">{dateLabel(r.date)}</div>
                        <div className="writing-row-main">
                          <div className="writing-row-meta">
                            <Badge variant="secondary">{r.kind}</Badge>
                            <span>{r.category}</span>
                            <span className="role-meta">{r.role}</span>
                          </div>
                          <h3>{r.title.replace(/^\[Paper Review\] /, '')}</h3>
                          <p>{r.description}</p>
                        </div>
                        {r.type === 'pdf' && (
                          <span className="writing-destination">
                            <FileText size={16} />
                            <span>PDF</span>
                          </span>
                        )}
                      </a>
                    ))}
                </div>
              </section>
            ))}
            {!results.length && <EmptyState onReset={reset} />}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
