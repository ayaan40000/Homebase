import { money } from '../lib/types'

export interface Kpis {
  count: number
  medianPrice: number | null
  medianPpsf: number | null
  medianDom: number | null
  underAnchor: number
  underAnchorPct: number
  topScore: number | null
  topArea: string
}

function KpiTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="kpi-tile">
      <span className="eyebrow">{label}</span>
      <span className="kpi-value">{value}</span>
      {sub && <span className="kpi-sub">{sub}</span>}
    </div>
  )
}

export default function PulseHeader({
  kpis,
  generated,
  onMethodology,
}: {
  kpis: Kpis
  generated: string
  onMethodology: () => void
}) {
  return (
    <header className="pulse-header">
      <div className="header-top">
        <div>
          <p className="wordmark">HOMEBASE</p>
          <div className="meridian-line" aria-hidden="true" />
          <p className="header-sub">Houston home command center · Meridian Dark</p>
          <p className="run-stamp">
            Updated {generated} · {kpis.count} homes scored · Prices as listed
          </p>
        </div>
        <button className="btn-ghost" onClick={onMethodology}>
          How scoring works
        </button>
      </div>
      <div className="kpi-grid">
        <KpiTile label="Homes tracked" value={String(kpis.count)} />
        <KpiTile label="Median price" value={kpis.medianPrice == null ? '—' : money(kpis.medianPrice)} />
        <KpiTile
          label="Median $/sqft"
          value={kpis.medianPpsf == null ? '—' : `$${Math.round(kpis.medianPpsf)}`}
        />
        <KpiTile
          label="Median days on market"
          value={kpis.medianDom == null ? '—' : String(Math.round(kpis.medianDom))}
        />
        <KpiTile
          label="Under the $301K anchor"
          value={String(kpis.underAnchor)}
          sub={`${kpis.underAnchorPct.toFixed(0)}% of homes`}
        />
        <KpiTile
          label="Top deal score"
          value={kpis.topScore == null ? '—' : kpis.topScore.toFixed(1)}
          sub={kpis.topArea}
        />
      </div>
    </header>
  )
}
