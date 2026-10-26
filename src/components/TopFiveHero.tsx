import type { Home, TopPick } from '../lib/types'
import { AREA_COLORS, bandFor, money } from '../lib/types'

function firstSentence(reason: string): string {
  const m = reason.match(/^.*?\.(?=\s|$)/s)
  return (m ? m[0] : reason).trim()
}

function PickRow({
  pick,
  home,
  onOpen,
}: {
  pick: TopPick
  home?: Home
  onOpen: (home: Home, pick: TopPick) => void
}) {
  const isFirst = pick.rank === 1
  const band = bandFor(pick.composite_home_score)
  const caution = pick.status_caution
  const ariaLabel = `${pick.address}. Composite ${pick.composite_home_score.toFixed(1)}.${
    caution ? ` Caution: ${caution}.` : ''
  }`
  const button = (
    <button
      type="button"
      className={`pick-row${isFirst ? ' pick-row-1' : ''}`}
      disabled={!home}
      onClick={() => home && onOpen(home, pick)}
      aria-label={ariaLabel}
    >
      <span className={`medallion${isFirst ? ' filled' : ''}`}>{pick.rank}</span>
      <span className="pick-main">
        {isFirst && <span className="pick-eyebrow">Command pick</span>}
        <span className="pick-address">{pick.address}</span>
        <span className="pick-line2">
          <span className={isFirst ? 'pick-price pick-price-1' : 'pick-price'}>{money(pick.price)}</span>
          {pick.ppsf != null && <span className="pick-ppsf"> · ${pick.ppsf}/sqft</span>}
          <span className="pick-area">
            {' · '}
            <span className="area-dot" style={{ background: AREA_COLORS[pick.area] ?? '#718094' }} />
            {pick.area}
          </span>
        </span>
        {isFirst && <span className="pick-reason">{firstSentence(pick.reason)}</span>}
        {caution && (
          <span className="pick-caution">
            <span className="caution-dot" aria-hidden="true" />
            <span className="pick-caution-text">{caution}</span>
          </span>
        )}
      </span>
      <span className="comp-chip">
        <span className="comp-dot" style={{ background: band.color }} aria-hidden="true" />
        Comp {pick.composite_home_score.toFixed(1)}
      </span>
    </button>
  )
  if (isFirst) return <span className="command-wrap">{button}</span>
  return button
}

export default function TopFiveHero({
  picks,
  homesByAddress,
  onOpen,
  onMethodology,
}: {
  picks: TopPick[]
  homesByAddress: Map<string, Home>
  onOpen: (home: Home, pick: TopPick) => void
  onMethodology: () => void
}) {
  if (!picks.length) return null
  return (
    <section aria-labelledby="top5-title" className="topfive">
      <div className="topfive-head">
        <h1 id="top5-title" className="topfive-title">
          Top 5 recommendations
        </h1>
        <button type="button" className="btn-text topfive-method" onClick={onMethodology}>
          How scoring works
        </button>
      </div>
      <div className="pick-list">
        {picks.map((pick) => (
          <PickRow
            key={pick.rank}
            pick={pick}
            home={homesByAddress.get(pick.address)}
            onOpen={onOpen}
          />
        ))}
      </div>
    </section>
  )
}
