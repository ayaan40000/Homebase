import { useEffect } from 'react'

export default function MethodologyDrawer({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="method-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drawer-head">
          <h2 id="method-title" className="section-title">
            How scoring works
          </h2>
          <button className="btn-ghost" onClick={onClose} aria-label="Close methodology">
            Close
          </button>
        </div>

        <h3>Book Deal Score (Edition 2, Ch 20B)</h3>
        <p>
          Deal = 25% Value + 25% Carrying cost + 20% Flood and wind + 10% Momentum + 10% Schools +
          10% Liquidity. Every component is computed on a 0–100 scale and clamped.
        </p>
        <ul>
          <li>Value: (185 − $/sqft) / 55 × 100. $130/sqft scores 100, $185/sqft scores 0.</li>
          <li>Carrying cost: (3.20 − area total tax rate %) / 1.50 × 100.</li>
          <li>Flood and wind: (10 − Flood Factor) / 10 × 100 when a factor exists, else 50 neutral.</li>
          <li>Momentum: price cuts and time on market — a cut on a stale home scores 100, a fresh listing 20, no DOM 50 neutral.</li>
          <li>Schools: the area School Access score × 10.</li>
          <li>Liquidity: (92 − DOM) / 61 × 100, or 50 neutral when DOM is not listed.</li>
        </ul>

        <h3>Composite Home Score — the ranking score</h3>
        <p>
          Composite = 60% Deal Score + 15% (School Access × 10) + 15% Highway Access + 10% Grocer
          Access. School Access is counted a second time outside the Deal Score by design — Edition
          2 makes school access a location driver in its own right. The Top 5 ranks by Composite,
          ties broken by lower price, then lower DOM.
        </p>

        <h3>The ratios (Ch 21)</h3>
        <ul>
          <li>Mortgage maths: 7.32%, 30-year fixed, $75,000 down. Loan = price − $75,000.</li>
          <li>Front-end ratio: estimated monthly PITI ÷ ($100,000 ÷ 12). The rule is 28%; the $301K price anchor is the 28% price, $327K is the 31% price.</li>
          <li>
            Corrected tax formula: assessed value × total rate − $140,000 × school rate. The $140K
            homestead exemption applies to the school portion only. Assessed value is assumed
            equal to price.
          </li>
          <li>Rent ratio: one assumed area median rent per area (Stafford $1,850, Richmond $1,950, Katy $2,050, Cypress $2,100 per month) — an assumption for screening, not a rent comp.</li>
          <li>Insurance is the book estimate of $200/mo. Where a listing hides its HOA, HOA counts as $0 and the PITI is a lower bound.</li>
        </ul>

        <h3>Access scores — v1 estimates</h3>
        <p>
          Highway, Grocer and School Access are area-level estimates in v1, not per-address
          measurements. Every home in an area inherits that area&apos;s scores, and each home is
          labelled with the components that are estimates. School Access (0–10) follows Ch 20C:
          Stafford / Sugar Land 8.5, Katy 8.25, Cypress 8.25, Richmond 5.75 — and the governing
          rule is to plan on the zoned campus; a charter seat is lottery upside, never the plan.
        </p>

        <h3>Area scores</h3>
        <p>
          Book area deal scores: Stafford 75.6, Richmond 68.3, Katy 67.1, Cypress 64.1. They inform
          the Area Battle view; they do not override a home&apos;s own Deal Score.
        </p>

        <h3>Data and limits</h3>
        <p>
          Sources: HAR, Redfin and Zillow listings as captured by the Sunday full scan and the
          Wednesday light run. Prices and scores are as listed on the run date. Tax is an estimate.
          Flood risk needs the full protocol before any offer. Standard inspection protocol
          applies when a home gets serious.
        </p>
      </div>
    </div>
  )
}
