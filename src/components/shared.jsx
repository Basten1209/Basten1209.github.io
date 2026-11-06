import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export function PageHeading({ title, children }) {
  return (
    <header className="page-heading">
      <h1>{title}</h1>
      {children}
    </header>
  )
}

export function ExternalLink({ href, children, className = '', ...props }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('external-link', className)}
      {...props}
    >
      {children}
    </a>
  )
}

export function SearchInput({ value, onChange, label, placeholder }) {
  return (
    <div className="search-field">
      <Search size={17} aria-hidden="true" />
      <Input
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button
          className="search-clear"
          type="button"
          aria-label={`Clear ${label.toLowerCase()}`}
          onClick={() => onChange('')}
        >
          <X size={15} />
        </button>
      )}
    </div>
  )
}

export function FilterSelect({ label, value, onChange, options }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className="filter-select">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map(({ value, label }) => (
          <SelectItem value={value} key={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function EmptyState({ title = 'No matches found.', onReset }) {
  return (
    <div className="empty-state">
      <Search size={28} />
      <h3>{title}</h3>
      <p>Try another search or clear the filters.</p>
      <Button variant="outline" onClick={onReset}>
        Clear filters
      </Button>
    </div>
  )
}

export function BookFeature({ book, compact = false }) {
  return (
    <article
      id={`book-${book.id}`}
      className={cn('book-feature', compact && 'book-feature-compact')}
    >
      <a
        href={book.url}
        target="_blank"
        rel="noopener noreferrer"
        className="book-cover"
        aria-label={`${book.title} — Book details & purchase`}
      >
        <img
          src={book.cover}
          alt={`${book.title} cover`}
          loading="lazy"
          width="810"
          height="1200"
        />
      </a>
      <div className="book-info">
        <div className="flex gap-2">
          <Badge variant="secondary">Book</Badge>
          <Badge variant="outline">Co-author</Badge>
        </div>
        <p className="book-meta">
          {book.publisher} <span>·</span> {book.date.slice(0, 4)}
          {book.language === 'ko' && (
            <>
              {' '}
              <span>·</span> Korean edition
            </>
          )}
        </p>
        <h2>{book.title}</h2>
        <p className="book-contribution">{book.description}</p>
        <ExternalLink href={book.url}>Book details & purchase</ExternalLink>
      </div>
    </article>
  )
}
