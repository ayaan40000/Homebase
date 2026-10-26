import { useEffect, useRef, useState } from 'react'
import type { Home, Ratios, TopPick } from '../lib/types'
import { AREA_COLORS, FLAG_LABELS, bandFor, money, num } from '../lib/types'
import ScoreRing from './ScoreRing'
import ScoreBar from './ScoreBar'
import RatioStrip from './RatioStrip'

export default function HomeCard({
  home,
  caution,
  onOpen,
}: {
  home: Home
  caution?: string
  onOpen: (home: Home) => void
}) {
  const segments: string[] = []
  if (home.beds != null) segments.push(`${home.beds} bd`)
  if (home.baths != null) segments.push(`${home.baths} ba`)
  if (home.sqft != null) segments.push(`${home.sqft.toLocaleString('en-US')} sqft`)
  if (home.year != null) segments.push(`Built ${home.year}`)
  if (home.dom != null) segments.push(home.dom === 1 ? '1 day' : `${home.dom} days`)
  const statLine = segments.length ? segments.join(' · ') : home.subdivision
  const shownFlags = home.flags.slice(0, 2)
  const moreFlags = home.flags.length - shownFlags.length
  const areaColor = AREA_COLORS[home.area] ?? '#718094'

  return (
    <button
      type="button"
      className="home-row"
      onClick={() => onOpen(home)}
      aria-label={caution ? `${home.address}. Caution: ${caution}` : home.address}
    >
      <span className="row-main">
        <span className="row-address">
          <span className="area-dot" style={{ background: areaColor }} aria-hidden="true" />
          <span className="row-address-text">{home.address}</span>
        </span>
        <span className="row-price-line">
          <span className="row-price">{money(home.price)}</span>
          {home.ppsf != null && <span className="row-ppsf"> · ${home.ppsf}/sqft</span>}
          <span className="row-area"> · {home.area}</span>
        </span>
        <span className="row-stat">{statLine}</span>
        <span className="row-line4">
          {caution ? (
            <span className="row-caution">
              <span className="caution-dot" aria-hidden="true" />
              <span className="row-caution-text">{caution}</span>
            </span>
          ) : shownFlags.length > 0 ? (
            <span className="row-flags">
              {shownFlags.map((f) => (
                <span key={f} className={`flag-chip ${f === 'flood-caution' ? 'flag-amber' : ''}`}>
                  {FLAG_LABELS[f] ?? f}
                </span>
              ))}
              {moreFlags > 0 && <span className="flags-more">+{moreFlags} more</span>}
            </span>
          ) : null}
        </span>
      </span>
      <span className="row-score">
        <ScoreRing score={home.scores.deal_score} size={40} />
      </span>
    </button>
  )
}

const DEAL_COMPONENTS: Array<{ key: keyof Home['scores']['components_0_100']; label: string }> = [
  { key: 'value', label: 'Value' },
  { key: 'carrying_cost', label: 'Carrying cost' },
  { key: 'flood_wind', label: 'Flood and wind' },
  { key: 'momentum', label: 'Momentum' },
  { key: 'schools_in_deal', label: 'Schools' },
  { key: 'liquidity', label: 'Liquidity' },
]

export function HomeDetail({
  home,
  pick,
  onClose,
}: {
  home: Home
  pick?: TopPick
  onClose: () => void
}) {
  const backRef = useRef<HTMLButtonElement>(null)
  const [breakdownOpen, setBreakdownOpen] = useState(false)
  const s = home.scores
  const r = home.ratios
  const compBand = bandFor(s.composite_home_score)
  const ratiosEstimated =
    (r as Ratios & { estimated_components?: string[] }).estimated_components ?? []
  const estimatedAll = [...new Set([...s.estimated_components, ...ratiosEstimated])]
  const caution = pick?.status_caution

  useEffect(() => {
    backRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="detail-backdrop" onClick={onClose}>
      <div
        className="detail-panel"
        role="dialog"
        aria-modal="true"
        aria-label={home.address}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="detail-head">
          <button type="button" className="back-btn" ref={backRef} onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
          <span className="detail-head-address">{home.address}</span>
        </div>

        <div className="detail-body">
          {caution && (
            <p className="caution-banner" role="note">
              Caution: {caution}. Confirm availability before anything else.
            </p>
          )}

          <section aria-label="Price and score">
            <div className="detail-price-row">
              <div className="detail-price">{money(home.price)}</div>
              <div className="detail-score-col">
                <ScoreRing score={s.deal_score} size={64} />
                <div className="composite-line">
                  Composite{' '}
                  <strong>{s.composite_home_score == null ? '—' : s.composite_home_score.toFixed(1)}</strong>{' '}
                  · {compBand.label}
                </div>
              </div>
            </div>
            <h2 className="detail-address">{home.address}</h2>
            <span className="area-chip">
              <span className="area-dot" style={{ background: AREA_COLORS[home.area] ?? '#718094' }} />
              {home.area} · {home.subdivision}
            </span>
          </section>

          <section aria-label="Listing details">
            <p className="card-stats detail-stats">
              {num(home.beds)} bd · {num(home.baths)} ba · {num(home.sqft)} sqft · Built {num(home.year)} ·{' '}
              {home.dom == null ? 'Not listed' : home.dom === 1 ? '1 day' : `${home.dom} days`}
            </p>
            <dl className="detail-dl">
              <dt>Subdivision</dt>
              <dd>{home.subdivision}</dd>
              <dt>Schools</dt>
              <dd>{home.schools}</dd>
              <dt>Flood factor</dt>
              <dd>{home.flood == null ? <span className="not-listed">Not listed</span> : home.flood}</dd>
              <dt>HOA</dt>
              <dd>{home.hoa}</dd>
            </dl>
          </section>

          <section aria-label="Access scores">
            <div className="card-bars">
              <ScoreBar label="Schools" value={s.school_access_0_10} />
              <ScoreBar label="Highway" value={s.components_0_100.highway_access / 10} />
              <ScoreBar label="Grocer" value={s.components_0_100.grocer_access / 10} />
            </div>
            <p className="estimate-line">Access scores are area-level estimates (v1).</p>
          </section>

          <section aria-label="Deal score breakdown">
            <button
              type="button"
              className="collapse-btn"
              aria-expanded={breakdownOpen}
              onClick={() => setBreakdownOpen((v) => !v)}
            >
              <span>Deal score breakdown</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                style={{ transform: breakdownOpen ? 'rotate(180deg)' : undefined }}
              >
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {breakdownOpen && (
              <div className="card-bars breakdown-bars">
                {DEAL_COMPONENTS.map((c) => (
                  <ScoreBar
                    key={c.key}
                    label={c.label}
                    value={s.components_0_100[c.key]}
                    max={100}
                    tone="brass"
                  />
                ))}
              </div>
            )}
          </section>

          <section aria-label="Ratios">
            <RatioStrip ratios={r} />
            <dl className="detail-dl detail-dl-ratios">
              <dt>Gross rent yield</dt>
              <dd className="mono">{r.gross_rent_yield_pct.toFixed(2)}%</dd>
              <dt>Assumed area median rent</dt>
              <dd className="mono">
                {money(r.assumed_area_median_rent_usd_mo)}/mo <span className="dl-note">(area assumption)</span>
              </dd>
              <dt>Loan</dt>
              <dd className="mono">{money(r.loan_usd)}</dd>
              <dt>Principal and interest</dt>
              <dd className="mono">{money(r.principal_interest_monthly_usd)}/mo</dd>
              <dt>Price vs 31% anchor</dt>
              <dd className="mono">{r.price_vs_31pct_anchor_pct.toFixed(1)}%</dd>
            </dl>
            {r.hoa_unknown_in_source && (
              <p className="detail-note-amber" role="note">
                HOA is not shown in the source listing. The PITI above is a lower bound.
              </p>
            )}
            <details className="detail-details">
              <summary>What is estimated here</summary>
              <ul className="estimated-list">
                {estimatedAll.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </details>
          </section>

          {home.flags.length > 0 && (
            <section aria-label="Flags">
              <div className="flag-row">
                {home.flags.map((f) => (
                  <span key={f} className={`flag-chip ${f === 'flood-caution' ? 'flag-amber' : ''}`}>
                    {FLAG_LABELS[f] ?? f}
                  </span>
                ))}
              </div>
            </section>
          )}

          {(home.highlights.length > 0 || home.inspector) && (
            <section aria-label="Highlights and inspector notes">
              {home.highlights.map((h) => (
                <p key={h} className="highlight-line">
                  {h}
                </p>
              ))}
              {home.inspector && <p className="inspector-note">{home.inspector}</p>}
            </section>
          )}

          {pick && (
            <section aria-label="Why it ranks" className="why-block detail-why">
              <p className="eyebrow">Why it ranks</p>
              <p className="why-line">{pick.reason}</p>
              <p className="why-figures mono">
                PITI {money(pick.est_monthly_piti_usd)}/mo · Front-end {pick.front_end_ratio_pct.toFixed(2)}%
              </p>
            </section>
          )}
        </div>

        <div className="detail-actions">
          <a className="btn-primary detail-listing" href={home.url} target="_blank" rel="noreferrer">
            View listing
          </a>
        </div>
      </div>
    </div>
  )
}
