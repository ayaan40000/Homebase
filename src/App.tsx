import { useEffect, useMemo, useRef, useState } from 'react'
import scoredData from './data/scored.json'
import top5Data from './data/top5.json'
import type { Home, TopPick } from './lib/types'
import { median } from './lib/types'
import PulseHeader, { formatRunDate } from './components/PulseHeader'
import TopFiveHero from './components/TopFiveHero'
import ControlDeck, { DEFAULT_FILTERS, type Filters } from './components/ControlDeck'
import HomeCard, { HomeDetail } from './components/HomeCard'
import HomeTable from './components/HomeTable'
import CharterPanel from './components/CharterPanel'
import AreaBattle from './components/AreaBattle'
import MethodologyDrawer from './components/MethodologyDrawer'

const homes = (scoredData as unknown as { listings: Home[] }).listings
const generated = (scoredData as unknown as { generated: string }).generated
const picks = (top5Data as unknown as { top5: TopPick[] }).top5

const ANCHOR = 301000
const PAGE_SIZE = 20

type View = 'home' | 'explore' | 'schools' | 'areas'

function sortHomes(list: Home[], sort: Filters['sort']): Home[] {
  const arr = [...list]
  const by = (fn: (h: Home) => number, dir: 1 | -1 = -1) =>
    arr.sort((a, b) => dir * (fn(a) - fn(b)))
  switch (sort) {
    case 'deal':
      return by((h) => h.scores.deal_score ?? -1)
    case 'price-asc':
      return by((h) => h.price, 1)
    case 'price-desc':
      return by((h) => h.price)
    case 'ppsf':
      return by((h) => h.ppsf ?? Number.MAX_SAFE_INTEGER, 1)
    case 'dom':
      return by((h) => h.dom ?? -1)
    case 'year':
      return by((h) => h.year ?? -1)
    default:
      return by((h) => h.scores.composite_home_score ?? -1)
  }
}

function matchesFilters(h: Home, filters: Filters): boolean {
  const q = filters.query.trim().toLowerCase()
  if (filters.areas.length && !filters.areas.includes(h.area)) return false
  if (q && !`${h.address} ${h.subdivision}`.toLowerCase().includes(q)) return false
  if (filters.underAnchor && h.price > ANCHOR) return false
  if (filters.score70 && (h.scores.deal_score ?? 0) < 70 && (h.scores.composite_home_score ?? 0) < 70)
    return false
  if (filters.isNew && !h.flags.includes('new')) return false
  if (filters.priceCuts && !h.flags.includes('price-cut')) return false
  if (filters.schools8 && h.scores.school_access_0_10 < 8) return false
  return true
}

const QUICK_LABELS: Array<{ key: 'underAnchor' | 'score70' | 'isNew' | 'priceCuts' | 'schools8'; label: string }> = [
  { key: 'underAnchor', label: 'Under $301K anchor' },
  { key: 'score70', label: 'Score 70+' },
  { key: 'isNew', label: 'New this run' },
  { key: 'priceCuts', label: 'Price cuts' },
  { key: 'schools8', label: 'Schools 8+' },
]

const SORT_LABELS: Record<Filters['sort'], string> = {
  composite: 'Composite score',
  deal: 'Deal score',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
  ppsf: '$/sqft: low to high',
  dom: 'Days on market: longest first',
  year: 'Newest year built',
}

const TABS: Array<{ view: View; label: string; icon: React.ReactNode }> = [
  {
    view: 'home',
    label: 'Home',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-8z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    view: 'explore',
    label: 'Explore',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
        <path d="M20 20l-4.3-4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    view: 'schools',
    label: 'Schools',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 6c-2-1.4-4.6-2-8-2v14c3.4 0 6 .6 8 2 2-1.4 4.6-2 8-2V4c-3.4 0-6 .6-8 2z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M12 6v14" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    view: 'areas',
    label: 'Areas',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M5 20v-5M11 20V5M17 20v-8M3 20h18"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
]

export default function App() {
  const [view, setView] = useState<View>('home')
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [tableMode, setTableMode] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [selected, setSelected] = useState<{ home: Home; pick?: TopPick } | null>(null)

  const scrollMem = useRef<Record<View, number>>({ home: 0, explore: 0, schools: 0, areas: 0 })
  const pendingScroll = useRef<number | null>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const viewRef = useRef<View>('home')
  viewRef.current = view

  const kpis = useMemo(() => {
    const under = homes.filter((h) => h.price <= ANCHOR)
    const top = [...homes].sort(
      (a, b) => (b.scores.deal_score ?? -1) - (a.scores.deal_score ?? -1),
    )[0]
    return {
      count: homes.length,
      medianPrice: median(homes.map((h) => h.price)),
      medianPpsf: median(homes.map((h) => h.ppsf).filter((x): x is number => x != null)),
      medianDom: median(homes.map((h) => h.dom).filter((x): x is number => x != null)),
      underAnchor: under.length,
      underAnchorPct: (under.length / homes.length) * 100,
      topScore: top?.scores.deal_score ?? null,
      topArea: top ? top.area : '',
    }
  }, [])

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    homes.forEach((h) => {
      c[h.area] = (c[h.area] ?? 0) + 1
    })
    return c
  }, [])

  const filtered = useMemo(
    () => sortHomes(homes.filter((h) => matchesFilters(h, filters)), filters.sort),
    [filters],
  )

  const countFor = useMemo(
    () => (f: Filters) => homes.filter((h) => matchesFilters(h, f)).length,
    [],
  )

  const homesByAddress = useMemo(() => new Map(homes.map((h) => [h.address, h])), [])
  const picksByAddress = useMemo(() => new Map(picks.map((p) => [p.address, p])), [])

  useEffect(() => {
    if (pendingScroll.current != null) {
      window.scrollTo(0, pendingScroll.current)
      pendingScroll.current = null
    }
  }, [view])

  useEffect(() => {
    if (!selected && !drawerOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [selected, drawerOpen])

  const switchView = (next: View) => {
    if (next === viewRef.current) return
    scrollMem.current[viewRef.current] = window.scrollY
    pendingScroll.current = scrollMem.current[next] ?? 0
    setView(next)
  }

  const commitFilters = (f: Filters) => {
    setFilters(f)
    setVisibleCount(PAGE_SIZE)
    scrollMem.current.explore = 0
    if (viewRef.current === 'explore') {
      pendingScroll.current = null
      window.scrollTo(0, 0)
    }
  }

  const selectArea = (area: string) => {
    commitFilters({ ...DEFAULT_FILTERS, areas: [area] })
    scrollMem.current.explore = 0
    if (viewRef.current !== 'explore') {
      scrollMem.current[viewRef.current] = window.scrollY
      pendingScroll.current = 0
      setView('explore')
    } else {
      window.scrollTo(0, 0)
    }
  }

  const openDetail = (home: Home, pick?: TopPick) => {
    triggerRef.current = (document.activeElement as HTMLElement) ?? null
    setSelected({ home, pick: pick ?? picksByAddress.get(home.address) })
  }

  const closeDetail = () => {
    setSelected(null)
    const el = triggerRef.current
    triggerRef.current = null
    requestAnimationFrame(() => el?.focus?.())
  }

  const activeNames: string[] = []
  if (filters.query.trim()) activeNames.push(`Search: ${filters.query.trim()}`)
  filters.areas.forEach((a) => activeNames.push(a))
  QUICK_LABELS.forEach((q) => {
    if (filters[q.key]) activeNames.push(q.label)
  })
  if (filters.sort !== 'composite') activeNames.push(`Sort: ${SORT_LABELS[filters.sort]}`)

  const onlyAreaFilter =
    filters.areas.length === 1 &&
    !filters.query.trim() &&
    !QUICK_LABELS.some((q) => filters[q.key])

  const visible = tableMode ? filtered : filtered.slice(0, visibleCount)
  const remaining = filtered.length - visible.length

  const onTableClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('a')) return
    const row = (e.target as HTMLElement).closest('tbody tr')
    if (!row) return
    const rows = Array.from(row.parentElement?.children ?? [])
    const idx = rows.indexOf(row)
    const home = filtered[idx]
    if (home) {
      triggerRef.current = row as HTMLElement
      setSelected({ home, pick: picksByAddress.get(home.address) })
    }
  }

  return (
    <div className="app">
      <nav className="shell-nav" aria-label="Primary">
        <span className="nav-wordmark" aria-hidden="true">
          HOMEBASE
        </span>
        <div className="nav-tabs">
          {TABS.map((t) => (
            <button
              key={t.view}
              type="button"
              className="tab-btn"
              aria-current={view === t.view ? 'page' : undefined}
              data-active={view === t.view}
              onClick={() => switchView(t.view)}
            >
              {t.icon}
              <span className="tab-label">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main>
        {view === 'home' && (
          <div className="view view-home">
            <PulseHeader kpis={kpis} generated={generated} onMethodology={() => setDrawerOpen(true)} />
            <TopFiveHero
              picks={picks}
              homesByAddress={homesByAddress}
              onOpen={openDetail}
              onMethodology={() => setDrawerOpen(true)}
            />
            <button type="button" className="browse-btn" onClick={() => switchView('explore')}>
              <span>Browse all {homes.length} homes</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <p className="honesty-line">
              Access scores are area-level estimates (v1). Prices as listed on the run date.
            </p>
            <footer className="view-footer">
              <span className="mono">
                {formatRunDate(generated)} run · {homes.length} homes scored
              </span>
              <button type="button" className="btn-text" onClick={() => setDrawerOpen(true)}>
                How scoring works
              </button>
            </footer>
          </div>
        )}

        {view === 'explore' && (
          <div className="view view-explore">
            <ControlDeck
              filters={filters}
              onChange={commitFilters}
              counts={counts}
              shown={filtered.length}
              total={homes.length}
              countFor={countFor}
              tableMode={tableMode}
              onTableMode={setTableMode}
            />
            <section aria-label="Scored homes" className="explore-list">
              {filtered.length === 0 ? (
                <div className="empty-state">
                  <p>
                    {onlyAreaFilter
                      ? `No homes in ${filters.areas[0]} match the current filters.`
                      : 'No homes match these filters.'}
                  </p>
                  {activeNames.length > 0 && (
                    <ul className="empty-filters">
                      {activeNames.map((n) => (
                        <li key={n}>{n}</li>
                      ))}
                    </ul>
                  )}
                  <button
                    type="button"
                    className="btn-primary empty-reset"
                    onClick={() => commitFilters(DEFAULT_FILTERS)}
                  >
                    Reset filters
                  </button>
                </div>
              ) : tableMode ? (
                <div onClick={onTableClick}>
                  <HomeTable homes={filtered} />
                </div>
              ) : (
                <>
                  <div className="card-stack">
                    {visible.map((h) => (
                      <HomeCard
                        key={h.url}
                        home={h}
                        caution={picksByAddress.get(h.address)?.status_caution}
                        onOpen={(home) => openDetail(home)}
                      />
                    ))}
                  </div>
                  {remaining > 0 && (
                    <button
                      type="button"
                      className="show-more"
                      onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    >
                      <span>Show more</span>
                      <span className="show-more-count">{remaining} left</span>
                    </button>
                  )}
                </>
              )}
            </section>
          </div>
        )}

        {view === 'schools' && (
          <div className="view view-schools">
            <CharterPanel />
          </div>
        )}

        {view === 'areas' && (
          <div className="view view-areas">
            <header className="view-header">
              <h2 className="view-title">Areas</h2>
              <span className="view-header-meta mono">Book scores · Ch 20B</span>
            </header>
            <p className="areas-intro">
              Edition 2 area deal scores. Tap an area to see its homes in Explore.
            </p>
            <AreaBattle homes={homes} onSelect={selectArea} />
            <p className="areas-honesty">
              Area scores inform the ranking. They do not override a home&apos;s own Deal Score.
            </p>
          </div>
        )}
      </main>

      {selected && (
        <HomeDetail home={selected.home} pick={selected.pick} onClose={closeDetail} />
      )}
      <MethodologyDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  )
}
