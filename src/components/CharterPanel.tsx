import { CAMPUSES, CHARTER_RULE, DEADLINES, DISTRICTS, countdownLabel } from '../data/charter'
import { AREA_COLORS } from '../lib/types'
import ScoreBar from './ScoreBar'

export default function CharterPanel() {
  return (
    <div className="schools-view-inner">
      <header className="view-header">
        <h2 className="view-title">Schools</h2>
        <span className="view-header-meta mono">{CAMPUSES.length} campuses</span>
      </header>

      <div className="schools-cols">
        <div className="schools-main">
          <section aria-label="The rule" className="schools-rule-block">
            <p className="charter-rule">{CHARTER_RULE}</p>
            <p className="panel-note">
              Edition 2, Ch 20C: enrolment and lottery dates for the 2027 cycle. A charter seat is
              decided by lottery — the zoned campus below is the plan for every home.
            </p>
          </section>

          <section aria-labelledby="deadlines-title" className="schools-section">
            <h3 id="deadlines-title" className="panel-subtitle">
              Enrolment deadlines
            </h3>
            <div className="deadline-list">
              {DEADLINES.map((d) => {
                const cd = countdownLabel(d.date)
                return (
                  <div key={d.event} className="deadline-row">
                    <span className="deadline-date">{d.display}</span>
                    <span className="deadline-event">{d.event}</span>
                    <span className={`countdown-chip tone-${cd.tone}`}>{cd.text}</span>
                  </div>
                )
              })}
            </div>
          </section>

          <section aria-labelledby="districts-title" className="schools-section">
            <h3 id="districts-title" className="panel-subtitle">
              Zoned districts — the baseline plan
            </h3>
            <div className="district-strip">
              {DISTRICTS.map((d) => (
                <div key={d.district + d.area} className="district-row">
                  <span className="district-name">
                    <span
                      className="area-dot"
                      style={{ background: AREA_COLORS[d.area.split(' ')[0]] ?? '#718094' }}
                    />
                    {d.district} <span className="district-rating">TEA {d.rating}</span>
                  </span>
                  <span className="district-area">{d.area}</span>
                  <div className="district-bar">
                    <ScoreBar label="School access" value={d.schoolAccess} />
                  </div>
                </div>
              ))}
            </div>
            <p className="estimate-line">Access scores are area-level estimates (v1).</p>
          </section>
        </div>

        <div className="schools-side">
          <section aria-labelledby="campuses-title" className="schools-section campuses-section">
            <h3 id="campuses-title" className="panel-subtitle">
              Charter campuses in the model
            </h3>
            <div className="campus-rows">
              {CAMPUSES.map((c) => (
                <article key={c.name} className="campus-row">
                  <div className="campus-head">
                    <span className="campus-name">{c.name}</span>
                    <span className={`network-chip ${c.network === 'Harmony' ? 'harmony' : 'kipp'}`}>
                      {c.network}
                    </span>
                  </div>
                  <p className="campus-line2">
                    {c.grades} · {c.rating.startsWith('Rating') ? c.rating : `Rating ${c.rating}`} · {c.address} · Serves{' '}
                    {c.areas.map((a, i) => (
                      <span key={a} className="serves-item">
                        {i > 0 ? ', ' : ''}
                        <span className="area-dot" style={{ background: AREA_COLORS[a] ?? '#718094' }} />
                        {a}
                      </span>
                    ))}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
