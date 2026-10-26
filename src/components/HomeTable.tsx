import type { Home } from '../lib/types'
import { money, num } from '../lib/types'
import ScoreRing from './ScoreRing'

export default function HomeTable({ homes }: { homes: Home[] }) {
  return (
    <div className="table-wrap">
      <table className="home-table">
        <thead>
          <tr>
            <th>Address</th>
            <th>Area</th>
            <th>Price</th>
            <th>$/sqft</th>
            <th>Beds/Baths</th>
            <th>Sqft</th>
            <th>Year</th>
            <th>DOM</th>
            <th>Deal</th>
            <th>Composite</th>
            <th>PITI %</th>
            <th>Schools</th>
          </tr>
        </thead>
        <tbody>
          {homes.map((h) => (
            <tr key={h.url}>
              <td>
                <a href={h.url} target="_blank" rel="noreferrer">
                  {h.address}
                </a>
              </td>
              <td>{h.area}</td>
              <td className="mono">{money(h.price)}</td>
              <td className="mono">{h.ppsf == null ? '—' : `$${h.ppsf}`}</td>
              <td>
                {num(h.beds)}/{num(h.baths)}
              </td>
              <td className="mono">{num(h.sqft)}</td>
              <td className="mono">{num(h.year)}</td>
              <td className="mono">{h.dom == null ? '—' : h.dom}</td>
              <td>
                <ScoreRing score={h.scores.deal_score} size={56} />
              </td>
              <td className="mono">{h.scores.composite_home_score?.toFixed(1) ?? '—'}</td>
              <td className="mono">{h.ratios.front_end_ratio_pct.toFixed(1)}%</td>
              <td className="mono">{h.scores.school_access_0_10.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
