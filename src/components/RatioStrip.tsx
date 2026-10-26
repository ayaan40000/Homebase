import type { Ratios } from '../lib/types'
import { money } from '../lib/types'

export default function RatioStrip({ ratios }: { ratios: Ratios }) {
  const piti = ratios.front_end_ratio_pct
  const pitiColor = piti <= 28 ? 'var(--teal)' : piti <= 31 ? '#E3B341' : '#E0655A'
  const delta = ratios.price_vs_anchor_delta_pct
  // Rent ratio in the data is monthly rent as % of price; the strip shows price / annual rent.
  const pricePerAnnualRent = ratios.gross_rent_yield_pct
    ? 100 / ratios.gross_rent_yield_pct
    : null
  return (
    <div className="ratio-strip" aria-label="Ratios">
      <div className="ratio-cell">
        <span className="ratio-value" style={{ color: pitiColor }}>
          {piti.toFixed(1)}%
        </span>
        <span className="ratio-label">Front-end vs 28%</span>
        <span className="ratio-sub">{money(ratios.est_monthly_piti_usd)}/mo PITI</span>
      </div>
      <div className="ratio-cell">
        <span
          className="ratio-value"
          style={{ color: delta <= 0 ? 'var(--teal)' : 'var(--text-2)' }}
        >
          {delta <= 0 ? '−' : '+'}
          {Math.abs(delta).toFixed(1)}%
        </span>
        <span className="ratio-label">Vs $301K anchor</span>
        <span className="ratio-sub">{ratios.price_vs_anchor_pct.toFixed(1)}% of anchor</span>
      </div>
      <div className="ratio-cell">
        <span className="ratio-value">
          {pricePerAnnualRent == null ? '—' : `${pricePerAnnualRent.toFixed(2)}×`}
        </span>
        <span className="ratio-label">Price / annual rent</span>
        <span className="ratio-sub">Rent ratio {ratios.rent_ratio_pct.toFixed(2)}%</span>
      </div>
      <div className="ratio-cell">
        <span className="ratio-value">
          {ratios.ppsf == null ? '—' : `$${ratios.ppsf}`}
        </span>
        <span className="ratio-label">Per sqft</span>
        <span className="ratio-sub">Tax est. {money(ratios.annual_tax_usd)}/yr</span>
      </div>
    </div>
  )
}
