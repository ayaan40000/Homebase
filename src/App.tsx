import { useMemo, useState } from 'react'
import scoredData from './data/scored.json'
import top5Data from './data/top5.json'
import type { Home, TopPick } from './lib/types'
import { median } from './lib/types'
import PulseHeader from './components/PulseHeader'
import TopFiveHero from './components/TopFiveHero'
import ControlDeck, { DEFAULT_FILTERS, type Filters } from './components/ControlDeck'
import HomeCard from './components/HomeCard'
import HomeTable from './components/HomeTable'
import CharterPanel from './components/CharterPanel'
import AreaBattle from './components/AreaBattle'
import MethodologyDrawer from './components/MethodologyDrawer'

const homes = (scoredData as unknown as { listings: Home[] }).listings
const generated = (scoredData as unknown as { generated: string }).generated
const picks = (top5Data as unknown as { top5: TopPick[] }).top5

const ANCHOR = 301000

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

export default function App() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [tableMode, setTableMode] = useState(false)

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

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase()
    const list = homes.filter((h) => {
      if (filters.areas.length && !filters.areas.includes(h.area)) return false
      if (q && !`${h.address} ${h.subdivision}`.toLowerCase().includes(q)) return false
      if (filters.underAnchor && h.price > ANCHOR) return false
      if (filters.score70 && (h.scores.deal_score ?? 0) < 70 && (h.scores.composite_home_score ?? 0) < 70)
        return false
      if (filters.isNew && !h.flags.includes('new')) return false
      if (filters.priceCuts && !h.flags.includes('price-cut')) return false
      if (filters.schools8 && h.scores.school_access_0_10 < 8) return false
      return true
    })
    return sortHomes(list, filters.sort)
  }, [filters])

  const homesByAddress = useMemo(() => new Map(homes.map((h) => [h.address, h])), [])

  const selectAreaAndScroll = (area: string) => {
    setFilters({ ...DEFAULT_FILTERS, areas: [area] })
    document.getElementById('home-list')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="app">
      <PulseHeader kpis={kpis} generated={generated} onMethodology={() => setDrawerOpen(true)} />
      <main>
        <TopFiveHero picks={picks} homesByAddress={homesByAddress} />
        <div className="desktop-layout">
          <div className="list-region">
            <ControlDeck
              filters={filters}
              onChange={setFilters}
              counts={counts}
              shown={filtered.length}
              total={homes.length}
              onReset={() => setFilters(DEFAULT_FILTERS)}
            />
            <div className="view-toggle" role="group" aria-label="View mode">
              <button data-active={!tableMode} aria-pressed={!tableMode} onClick={() => setTableMode(false)}>
                Cards
              </button>
              <button data-active={tableMode} aria-pressed={tableMode} onClick={() => setTableMode(true)}>
                Table
              </button>
            </div>
            <section id="home-list" aria-label="Scored homes">
              {filtered.length === 0 ? (
                <div className="empty-state">
                  <p>No homes match these filters.</p>
                  <button className="btn-primary" onClick={() => setFilters(DEFAULT_FILTERS)}>
                    Reset filters
                  </button>
                </div>
              ) : tableMode ? (
                <HomeTable homes={filtered} />
              ) : (
                <div className="card-stack">
                  {filtered.map((h) => (
                    <HomeCard key={h.url} home={h} />
                  ))}
                </div>
              )}
            </section>
          </div>
          <aside className="rail">
            <CharterPanel />
            <AreaBattle homes={homes} onSelect={selectAreaAndScroll} />
          </aside>
        </div>
      </main>
      <footer className="footer">
        <p>
          HomeBase · Meridian Dark · Scores from HomeBase Scoring v1 (Edition 2). Access scores are
          area-level estimates in v1. Prices as listed on {generated}.
        </p>
        <button className="btn-text" onClick={() => setDrawerOpen(true)}>
          How scoring works
        </button>
      </footer>
      <MethodologyDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  )
}
