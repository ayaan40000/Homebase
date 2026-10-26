import type { Home } from '../lib/types'
import { AREA_COLORS, FLAG_LABELS, money, num } from '../lib/types'
import ScoreRing from './ScoreRing'
import ScoreBar from './ScoreBar'
import RatioStrip from './RatioStrip'

export default function HomeCard({ home }: { home: Home }) {
  const s = home.scores
  const access: Array<[string, number]> = [
    ['Schools', s.school_access_0_10],
    ['Highway', s.components_0_100.highway_access / 10],
    ['Grocer', s.components_0_100.grocer_access / 10],
  ]
  return (
    <article className="home-card">
      <div className="card-head">
        <h3 className="card-address">{home.address}</h3>
        <span className="area-chip">
          <span className="area-dot" style={{ background: AREA_COLORS[home.area] ?? '#718094' }} />
          {home.area}
        </span>
      </div>
      <div className="card-price-row">
        <div>
          <div className="card-price">{money(home.price)}</div>
          <div className="card-ppsf">{home.ppsf == null ? 'Not listed' : `$${home.ppsf}/sqft`}</div>
        </div>
        <div className="card-scores">
          <ScoreRing score={s.deal_score} size={56} />
          <div className="composite-line">
            Composite <strong>{s.composite_home_score == null ? '—' : s.composite_home_score.toFixed(1)}</strong>
          </div>
        </div>
      </div>
      <p className="card-stats">
        {num(home.beds)} bd · {num(home.baths)} ba · {num(home.sqft)} sqft · Built {num(home.year)} ·{' '}
        {home.dom == null ? 'DOM not listed' : `${home.dom} days`}
      </p>
      <div className="card-bars">
        {access.map(([label, v]) => (
          <ScoreBar key={label} label={label} value={v} />
        ))}
      </div>
      <RatioStrip ratios={home.ratios} />
      {home.flags.length > 0 && (
        <div className="flag-row">
          {home.flags.map((f) => (
            <span key={f} className={`flag-chip ${f === 'flood-caution' ? 'flag-amber' : ''}`}>
              {FLAG_LABELS[f] ?? f}
            </span>
          ))}
        </div>
      )}
      <div className="card-foot">
        <span className="card-subdivision">{home.subdivision}</span>
        <a className="view-link" href={home.url} target="_blank" rel="noreferrer">
          View listing
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M7 17L17 7M17 7H9M17 7v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </a>
      </div>
      {(home.inspector || home.highlights.length > 0) && (
        <p className="card-note">{[home.highlights.join(' · '), home.inspector].filter(Boolean).join(' — ')}</p>
      )}
    </article>
  )
}
