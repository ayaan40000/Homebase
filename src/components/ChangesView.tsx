import type { DeltaHistory, DeltaRun, Home } from '../lib/types'
import { AREA_COLORS, fmtDate, money, statusLabel } from '../lib/types'
import { formatRunDate } from './PulseHeader'

function signedMoney(n: number): string {
  const abs = '$' + Math.abs(Math.round(n)).toLocaleString('en-US')
  return n < 0 ? `−${abs}` : `+${abs}`
}

function signedPct(p: number): string {
  const abs = `${Math.abs(p).toFixed(1)}%`
  return p < 0 ? `−${abs}` : `+${abs}`
}

function ChangeRow({
  address,
  url,
  detail,
  homesByUrl,
  onOpen,
}: {
  address: string
  url: string
  detail: string
  homesByUrl: Map<string, Home>
  onOpen: (home: Home) => void
}) {
  const home = homesByUrl.get(url)
  const inner = (
    <>
      <span className="change-address">
        {home && (
          <span
            className="area-dot"
            style={{ background: AREA_COLORS[home.area] ?? '#718094' }}
            aria-hidden="true"
          />
        )}
        <span className="change-address-text">{address}</span>
      </span>
      <span className="change-detail mono">{detail}</span>
    </>
  )
  if (home) {
    return (
      <button type="button" className="change-row" onClick={() => onOpen(home)} aria-label={address}>
        {inner}
      </button>
    )
  }
  return (
    <a className="change-row" href={url} target="_blank" rel="noreferrer" aria-label={address}>
      {inner}
    </a>
  )
}

function RunBlock({
  run,
  homesByUrl,
  onOpen,
}: {
  run: DeltaRun
  homesByUrl: Map<string, Home>
  onOpen: (home: Home) => void
}) {
  const cuts = run.priceChanged.filter((p) => p.change < 0).sort((a, b) => a.change - b.change)
  const rises = run.priceChanged.filter((p) => p.change > 0).sort((a, b) => b.change - a.change)
  const total =
    run.added.length + run.removed.length + run.priceChanged.length + run.statusChanged.length

  const summary: string[] = []
  if (run.added.length) summary.push(`${run.added.length} new`)
  if (cuts.length) summary.push(`${cuts.length} price cut${cuts.length === 1 ? '' : 's'}`)
  if (rises.length) summary.push(`${rises.length} price rise${rises.length === 1 ? '' : 's'}`)
  if (run.statusChanged.length)
    summary.push(`${run.statusChanged.length} status change${run.statusChanged.length === 1 ? '' : 's'}`)
  if (run.removed.length) summary.push(`${run.removed.length} removed`)

  return (
    <section className="change-run" aria-label={`Run of ${fmtDate(run.generated, true)}`}>
      <header className="change-run-head">
        <h3 className="change-run-title">{formatRunDate(run.generated)} run</h3>
        <span className="change-run-meta mono">
          {fmtDate(run.generated, true)} · {run.previousCount} → {run.currentCount} homes
        </span>
      </header>
      {total === 0 ? (
        <p className="panel-note">No changes recorded this run.</p>
      ) : (
        <>
          <p className="change-summary mono">{summary.join(' · ')}</p>

          {run.added.length > 0 && (
            <div className="change-group">
              <h4 className="change-group-title">New in band</h4>
              {run.added.map((a) => (
                <ChangeRow
                  key={a.url}
                  address={a.address}
                  url={a.url}
                  detail={money(a.price)}
                  homesByUrl={homesByUrl}
                  onOpen={onOpen}
                />
              ))}
            </div>
          )}

          {cuts.length > 0 && (
            <div className="change-group">
              <h4 className="change-group-title">Price cuts</h4>
              {cuts.map((p) => (
                <ChangeRow
                  key={p.url}
                  address={p.address}
                  url={p.url}
                  detail={`${money(p.from)} → ${money(p.to)} · ${signedMoney(p.change)} (${signedPct(p.pct)})`}
                  homesByUrl={homesByUrl}
                  onOpen={onOpen}
                />
              ))}
            </div>
          )}

          {rises.length > 0 && (
            <div className="change-group">
              <h4 className="change-group-title">Price rises</h4>
              {rises.map((p) => (
                <ChangeRow
                  key={p.url}
                  address={p.address}
                  url={p.url}
                  detail={`${money(p.from)} → ${money(p.to)} · ${signedMoney(p.change)} (${signedPct(p.pct)})`}
                  homesByUrl={homesByUrl}
                  onOpen={onOpen}
                />
              ))}
            </div>
          )}

          {run.statusChanged.length > 0 && (
            <div className="change-group">
              <h4 className="change-group-title">Status changes</h4>
              {run.statusChanged.map((s) => (
                <ChangeRow
                  key={s.url}
                  address={s.address}
                  url={s.url}
                  detail={`${statusLabel(s.from)} → ${statusLabel(s.to)}`}
                  homesByUrl={homesByUrl}
                  onOpen={onOpen}
                />
              ))}
            </div>
          )}

          {run.removed.length > 0 && (
            <div className="change-group">
              <h4 className="change-group-title">Removed</h4>
              {run.removed.map((r) => (
                <ChangeRow
                  key={r.url}
                  address={r.address}
                  url={r.url}
                  detail={`was ${money(r.price)}`}
                  homesByUrl={homesByUrl}
                  onOpen={onOpen}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default function ChangesView({
  history,
  homesByUrl,
  onOpen,
}: {
  history: DeltaHistory
  homesByUrl: Map<string, Home>
  onOpen: (home: Home) => void
}) {
  return (
    <div className="changes-view-inner">
      <header className="view-header">
        <h2 className="view-title">What changed</h2>
        <span className="view-header-meta mono">
          {history.runs.length} run{history.runs.length === 1 ? '' : 's'} · newest first
        </span>
      </header>
      <p className="areas-intro">
        Every run&rsquo;s findings, straight from the run delta — the same numbers the Wednesday
        and Sunday reports lead with.
      </p>
      {history.runs.length === 0 ? (
        <p className="panel-note">No run deltas recorded yet.</p>
      ) : (
        history.runs.map((run) => (
          <RunBlock key={run.generated} run={run} homesByUrl={homesByUrl} onOpen={onOpen} />
        ))
      )}
    </div>
  )
}
