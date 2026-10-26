import type { Home, TopPick } from '../lib/types'
import { AREA_COLORS, money, num } from '../lib/types'
import ScoreRing from './ScoreRing'
import ScoreBar from './ScoreBar'
import RatioStrip from './RatioStrip'

function reasonsFor(pick: TopPick, home?: Home): string[] {
  const lines: string[] = []
  if (home) {
    if (home.ratios.price_vs_anchor_delta_pct <= 0)
      lines.push(`Priced under the $301K anchor at ${home.ratios.price_vs_anchor_pct.toFixed(1)}% of it`)
    lines.push(`Front-end ratio ${home.ratios.front_end_ratio_pct.toFixed(2)}% against the 28% rule`)
    if (home.ppsf != null) lines.push(`$${home.ppsf}/sqft — among the lowest in the set`)
  }
  if (lines.length < 2) lines.push(pick.reason)
  return lines.slice(0, 2)
}

export default function TopFiveHero({
  picks,
  homesByAddress,
}: {
  picks: TopPick[]
  homesByAddress: Map<string, Home>
}) {
  const [first, ...rest] = picks
  if (!first) return null
  const firstHome = homesByAddress.get(first.address)
  return (
    <section aria-labelledby="top5-title" className="topfive">
      <p className="eyebrow">This run</p>
      <h1 id="top5-title" className="section-title">
        Top 5 recommendations
      </h1>
      <div className="topfive-grid">
        <article className="command-pick">
          <div className="pick-head">
            <span className="medallion">1</span>
            <ScoreRing score={first.deal_score} size={88} />
          </div>
          <div className="pick-price">{money(first.price)}</div>
          <h2 className="pick-address">{first.address}</h2>
          <span className="area-chip">
            <span className="area-dot" style={{ background: AREA_COLORS[first.area] }} />
            {first.area} · {first.subdivision}
          </span>
          {first.status_caution && (
            <p className="caution-banner" role="note">
              Caution: {first.status_caution}. Confirm availability before anything else.
            </p>
          )}
          <p className="card-stats">
            {num(first.beds)} bd · {num(first.baths)} ba · {num(first.sqft)} sqft · Built {num(first.year)} ·{' '}
            {first.dom == null ? 'DOM not listed' : `${first.dom} days`}
          </p>
          {firstHome && (
            <>
              <div className="card-bars">
                <ScoreBar label="Schools" value={firstHome.scores.school_access_0_10} />
                <ScoreBar label="Highway" value={firstHome.scores.components_0_100.highway_access / 10} />
                <ScoreBar label="Grocer" value={firstHome.scores.components_0_100.grocer_access / 10} />
              </div>
              <RatioStrip ratios={firstHome.ratios} />
            </>
          )}
          <div className="why-block">
            <p className="eyebrow">Why it ranks first</p>
            {reasonsFor(first, firstHome).map((r) => (
              <p key={r} className="why-line">
                {r}
              </p>
            ))}
            <p className="why-line muted">{first.reason}</p>
          </div>
          <a className="btn-primary" href={first.url} target="_blank" rel="noreferrer">
            View listing
          </a>
        </article>
        <div className="pick-rows">
          {rest.map((pick) => {
            const home = homesByAddress.get(pick.address)
            return (
              <article key={pick.rank} className="pick-row">
                <span className="medallion outline">{pick.rank}</span>
                <ScoreRing score={pick.deal_score} size={72} />
                <div className="pick-row-main">
                  <div className="pick-row-price">{money(pick.price)}</div>
                  <p className="pick-row-address">{pick.address}</p>
                  <p className="pick-row-meta">
                    {pick.area} · Composite {pick.composite_home_score.toFixed(1)} · Front-end{' '}
                    {pick.front_end_ratio_pct.toFixed(2)}%
                  </p>
                  {pick.status_caution && <p className="caution-inline">Caution: {pick.status_caution}</p>}
                  <p className="pick-row-reason">{pick.reason}</p>
                  {home && <span className="sr-only">Composite {home.scores.composite_home_score}</span>}
                </div>
                <a className="view-link" href={pick.url} target="_blank" rel="noreferrer">
                  View listing
                </a>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
