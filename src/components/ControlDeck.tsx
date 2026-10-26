import { AREAS, AREA_COLORS } from '../lib/types'

export type SortKey =
  | 'composite'
  | 'deal'
  | 'price-asc'
  | 'price-desc'
  | 'ppsf'
  | 'dom'
  | 'year'

export interface Filters {
  query: string
  areas: string[]
  sort: SortKey
  underAnchor: boolean
  score70: boolean
  isNew: boolean
  priceCuts: boolean
  schools8: boolean
}

export const DEFAULT_FILTERS: Filters = {
  query: '',
  areas: [],
  sort: 'composite',
  underAnchor: false,
  score70: false,
  isNew: false,
  priceCuts: false,
  schools8: false,
}

const QUICK: Array<{ key: keyof Filters; label: string }> = [
  { key: 'underAnchor', label: 'Under $301K anchor' },
  { key: 'score70', label: 'Score 70+' },
  { key: 'isNew', label: 'New' },
  { key: 'priceCuts', label: 'Price cuts' },
  { key: 'schools8', label: 'Schools 8+' },
]

export default function ControlDeck({
  filters,
  onChange,
  counts,
  shown,
  total,
  onReset,
}: {
  filters: Filters
  onChange: (f: Filters) => void
  counts: Record<string, number>
  shown: number
  total: number
  onReset: () => void
}) {
  const toggleArea = (area: string | null) => {
    if (area === null) return onChange({ ...filters, areas: [] })
    const areas = filters.areas.includes(area)
      ? filters.areas.filter((a) => a !== area)
      : [...filters.areas, area]
    onChange({ ...filters, areas })
  }
  const anyActive =
    filters.query !== '' ||
    filters.areas.length > 0 ||
    QUICK.some((q) => filters[q.key]) ||
    filters.sort !== 'composite'
  return (
    <div className="control-deck">
      <input
        className="search-input"
        type="search"
        value={filters.query}
        placeholder="Search address or subdivision"
        aria-label="Search address or subdivision"
        onChange={(e) => onChange({ ...filters, query: e.target.value })}
      />
      <div className="chip-row" role="group" aria-label="Areas">
        <button
          className="chip"
          aria-pressed={filters.areas.length === 0}
          data-active={filters.areas.length === 0}
          onClick={() => toggleArea(null)}
        >
          All · {total}
        </button>
        {AREAS.map((area) => (
          <button
            key={area}
            className="chip"
            aria-pressed={filters.areas.includes(area)}
            data-active={filters.areas.includes(area)}
            onClick={() => toggleArea(area)}
          >
            <span className="area-dot" style={{ background: AREA_COLORS[area] }} />
            {area} · {counts[area] ?? 0}
          </button>
        ))}
      </div>
      <div className="chip-row" role="group" aria-label="Quick filters">
        {QUICK.map((q) => (
          <button
            key={q.key}
            className="chip"
            aria-pressed={Boolean(filters[q.key])}
            data-active={Boolean(filters[q.key])}
            onClick={() => onChange({ ...filters, [q.key]: !filters[q.key] })}
          >
            {q.label}
          </button>
        ))}
      </div>
      <div className="deck-bottom">
        <label className="sort-label">
          Sort
          <select
            className="sort-select"
            value={filters.sort}
            onChange={(e) => onChange({ ...filters, sort: e.target.value as SortKey })}
          >
            <option value="composite">Composite score</option>
            <option value="deal">Deal score</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="ppsf">$/sqft: low to high</option>
            <option value="dom">Days on market</option>
            <option value="year">Newest year built</option>
          </select>
        </label>
        <span className="result-count" aria-live="polite">
          {shown} of {total} homes
        </span>
        {anyActive && (
          <button className="btn-text" onClick={onReset}>
            Reset
          </button>
        )}
      </div>
    </div>
  )
}
