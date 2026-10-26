import type { Home } from '../lib/types'
import { AREA_BOOK_SCORES, AREA_COLORS, AREAS, median, money } from '../lib/types'
import { useReveal } from '../lib/useReveal'

export default function AreaBattle({
  homes,
  onSelect,
}: {
  homes: Home[]
  onSelect: (area: string) => void
}) {
  const ref = useReveal<HTMLDivElement>()
  const rows = AREAS.map((area) => {
    const inArea = homes.filter((h) => h.area === area)
    return {
      area,
      score: AREA_BOOK_SCORES[area],
      count: inArea.length,
      medianPrice: median(inArea.map((h) => h.price)),
    }
  }).sort((a, b) => b.score - a.score)
  return (
    <section aria-labelledby="battle-title" className="panel area-battle">
      <p className="eyebrow">Areas</p>
      <h2 id="battle-title" className="section-title">
        Area battle — book deal scores
      </h2>
      <p className="panel-note">
        Edition 2, Ch 20B area scores. Tap a row to filter the list to that area.
      </p>
      <div className="battle-rows" ref={ref}>
        {rows.map((row, i) => (
          <button
            key={row.area}
            className="battle-row"
            onClick={() => onSelect(row.area)}
            aria-label={`Filter to ${row.area}, book deal score ${row.score}`}
          >
            <span className="battle-name">
              <span className="area-dot" style={{ background: AREA_COLORS[row.area] }} />
              {row.area}
              {i === 0 && <span className="leader-chip">Leader</span>}
            </span>
            <span className="battle-track">
              <span
                className="battle-fill"
                style={{
                  background: AREA_COLORS[row.area],
                  ['--target' as string]: `${row.score}%`,
                  transitionDelay: `${i * 80}ms`,
                }}
              />
            </span>
            <span className="battle-score">{row.score.toFixed(1)}</span>
            <span className="battle-meta">
              {row.count} homes · median {row.medianPrice == null ? '—' : money(row.medianPrice)}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
