import { useEffect, useRef, useState } from 'react'
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

const QUICK: Array<{ key: 'underAnchor' | 'score70' | 'isNew' | 'priceCuts' | 'schools8'; label: string }> = [
  { key: 'underAnchor', label: 'Under $301K anchor' },
  { key: 'score70', label: 'Score 70+' },
  { key: 'isNew', label: 'New this run' },
  { key: 'priceCuts', label: 'Price cuts' },
  { key: 'schools8', label: 'Schools 8+' },
]

const SORTS: Array<{ key: SortKey; label: string }> = [
  { key: 'composite', label: 'Composite score' },
  { key: 'deal', label: 'Deal score' },
  { key: 'price-asc', label: 'Price: low to high' },
  { key: 'price-desc', label: 'Price: high to low' },
  { key: 'ppsf', label: '$/sqft: low to high' },
  { key: 'dom', label: 'Days on market: longest first' },
  { key: 'year', label: 'Newest year built' },
]

export function activeFilterCount(f: Filters): number {
  return (
    f.areas.length +
    QUICK.filter((q) => f[q.key]).length +
    (f.sort !== 'composite' ? 1 : 0)
  )
}

export default function ControlDeck({
  filters,
  onChange,
  counts,
  shown,
  total,
  countFor,
  tableMode,
  onTableMode,
}: {
  filters: Filters
  onChange: (f: Filters) => void
  counts: Record<string, number>
  shown: number
  total: number
  countFor?: (f: Filters) => number
  tableMode?: boolean
  onTableMode?: (table: boolean) => void
}) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [draft, setDraft] = useState<Filters>(filters)
  const filtersBtnRef = useRef<HTMLButtonElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  const badge = activeFilterCount(filters)
  const draftCount = countFor ? countFor(draft) : shown

  useEffect(() => {
    if (!sheetOpen) return
    closeBtnRef.current?.focus()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSheetOpen(false)
        filtersBtnRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [sheetOpen])

  const openSheet = () => {
    setDraft(filters)
    setSheetOpen(true)
  }
  const discard = () => {
    setSheetOpen(false)
    filtersBtnRef.current?.focus()
  }
  const apply = () => {
    onChange(draft)
    setSheetOpen(false)
    filtersBtnRef.current?.focus()
  }
  const toggleDraftArea = (area: string | null) => {
    if (area === null) return setDraft({ ...draft, areas: [] })
    const areas = draft.areas.includes(area)
      ? draft.areas.filter((a) => a !== area)
      : [...draft.areas, area]
    setDraft({ ...draft, areas })
  }

  return (
    <div className="explore-toolbar">
      <div className="toolbar-row1">
        <h2 className="view-title">Explore</h2>
        <span className="result-count" aria-live="polite">
          {shown} of {total} homes
        </span>
        {onTableMode && (
          <div className="view-toggle" role="group" aria-label="View mode">
            <button
              type="button"
              data-active={!tableMode}
              aria-pressed={!tableMode}
              onClick={() => onTableMode(false)}
            >
              Cards
            </button>
            <button
              type="button"
              data-active={tableMode}
              aria-pressed={tableMode}
              onClick={() => onTableMode(true)}
            >
              Table
            </button>
          </div>
        )}
      </div>
      <div className="toolbar-row2">
        <div className="search-wrap">
          <input
            className="search-input"
            type="search"
            value={filters.query}
            placeholder="Search address or subdivision"
            aria-label="Search address or subdivision"
            onChange={(e) => onChange({ ...filters, query: e.target.value })}
          />
          {filters.query !== '' && (
            <button
              type="button"
              className="search-clear"
              aria-label="Clear search"
              onClick={() => onChange({ ...filters, query: '' })}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
        <button type="button" className="filters-btn" ref={filtersBtnRef} onClick={openSheet}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 6h16M7 12h10M10 18h4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          Filters
          {badge > 0 && <span className="filter-badge">{badge}</span>}
        </button>
      </div>

      {sheetOpen && (
        <div className="sheet-backdrop" onClick={discard}>
          <div
            className="filter-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="filters-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sheet-head">
              <span className="sheet-handle" aria-hidden="true" />
              <h2 id="filters-title" className="sheet-title">
                Filters
              </h2>
              <button
                type="button"
                className="sheet-close"
                ref={closeBtnRef}
                onClick={discard}
                aria-label="Close filters"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="sheet-body">
              <section aria-labelledby="sheet-areas-title">
                <p className="eyebrow" id="sheet-areas-title">
                  Areas
                </p>
                <div className="sheet-chips" role="group" aria-label="Areas">
                  <button
                    type="button"
                    className="chip"
                    aria-pressed={draft.areas.length === 0}
                    data-active={draft.areas.length === 0}
                    onClick={() => toggleDraftArea(null)}
                  >
                    All · {total}
                  </button>
                  {AREAS.map((area) => (
                    <button
                      type="button"
                      key={area}
                      className="chip"
                      aria-pressed={draft.areas.includes(area)}
                      data-active={draft.areas.includes(area)}
                      onClick={() => toggleDraftArea(area)}
                    >
                      <span className="area-dot" style={{ background: AREA_COLORS[area] }} />
                      {area} · {counts[area] ?? 0}
                    </button>
                  ))}
                </div>
              </section>
              <section aria-labelledby="sheet-quick-title">
                <p className="eyebrow" id="sheet-quick-title">
                  Quick filters
                </p>
                <div className="quick-list">
                  {QUICK.map((q) => {
                    const active = Boolean(draft[q.key])
                    return (
                      <button
                        type="button"
                        key={q.key}
                        className="quick-row"
                        aria-pressed={active}
                        data-active={active}
                        onClick={() => setDraft({ ...draft, [q.key]: !active })}
                      >
                        <span>{q.label}</span>
                        <span className={`quick-check${active ? ' on' : ''}`} aria-hidden="true">
                          {active && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M5 13l4 4L19 7"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </section>
              <section aria-labelledby="sheet-sort-title">
                <p className="eyebrow" id="sheet-sort-title">
                  Sort
                </p>
                <div className="sort-list" role="radiogroup" aria-label="Sort">
                  {SORTS.map((s) => {
                    const selected = draft.sort === s.key
                    return (
                      <button
                        type="button"
                        key={s.key}
                        className="sort-row"
                        role="radio"
                        aria-checked={selected}
                        data-active={selected}
                        onClick={() => setDraft({ ...draft, sort: s.key })}
                      >
                        <span className={`radio-dot${selected ? ' on' : ''}`} aria-hidden="true" />
                        <span>{s.label}</span>
                      </button>
                    )
                  })}
                </div>
              </section>
              <p className="sheet-count" aria-live="polite">
                {draftCount} of {total} homes match
              </p>
            </div>
            <div className="sheet-foot">
              <button type="button" className="btn-text" onClick={() => setDraft(DEFAULT_FILTERS)}>
                Reset
              </button>
              <button type="button" className="btn-apply" onClick={apply}>
                Show {draftCount} homes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
