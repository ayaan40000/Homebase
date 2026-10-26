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

export function formatRunDate(generated: string): string {
  const d = new Date(`${generated}T12:00:00`)
  if (!Number.isNaN(d.getTime()) && /^\d{4}-\d{2}-\d{2}/.test(generated)) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  return generated
}

function KpiMini({
  label,
  value,
  share,
}: {
  label: string
  value: string
  share?: string
}) {
  return (
    <div className="kpi-mini">
      <span className="kpi-mini-label">{label}</span>
      <span className="kpi-mini-value">
        {value}
        {share && <span className="kpi-mini-share">{share}</span>}
      </span>
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
    <>
      <header className="home-header">
        <div className="home-header-left">
          <p className="wordmark wordmark-sm">HOMEBASE</p>
          <span className="run-stamp-inline">
            {formatRunDate(generated)} run · {kpis.count} homes
          </span>
        </div>
        <button className="icon-btn" onClick={onMethodology} aria-label="How scoring works">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M12 11v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="8" r="1.4" fill="currentColor" />
          </svg>
        </button>
        <span className="meridian-line header-meridian" aria-hidden="true" />
      </header>
      <div className="kpi-strip" aria-label="Run summary">
        <KpiMini label="Homes tracked" value={String(kpis.count)} />
        <KpiMini label="Median price" value={kpis.medianPrice == null ? '—' : money(kpis.medianPrice)} />
        <KpiMini
          label="Median $/sqft"
          value={kpis.medianPpsf == null ? '—' : `$${Math.round(kpis.medianPpsf)}`}
        />
        <KpiMini label="Median DOM" value={kpis.medianDom == null ? '—' : String(Math.round(kpis.medianDom))} />
        <KpiMini
          label="Under $301K anchor"
          value={String(kpis.underAnchor)}
          share={`${kpis.underAnchorPct.toFixed(0)}%`}
        />
        <KpiMini label="Top deal score" value={kpis.topScore == null ? '—' : kpis.topScore.toFixed(1)} />
      </div>
    </>
  )
}
