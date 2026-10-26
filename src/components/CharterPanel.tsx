import { CAMPUSES, CHARTER_RULE, DEADLINES, DISTRICTS, countdownLabel } from '../data/charter'
import { AREA_COLORS } from '../lib/types'
import ScoreBar from './ScoreBar'

export default function CharterPanel() {
  return (
    <section aria-labelledby="charter-title" className="panel charter-panel">
      <p className="eyebrow">Schools</p>
      <h2 id="charter-title" className="section-title">
        Charter school access
      </h2>
      <p className="charter-rule">{CHARTER_RULE}</p>
      <p className="panel-note">
        Edition 2, Ch 20C: enrolment and lottery dates for the 2027 cycle. A charter seat is
        decided by lottery — the zoned campus below is the plan for every home.
      </p>

      <div className="timeline">
        {DEADLINES.map((d) => {
          const cd = countdownLabel(d.date)
          return (
            <div key={d.event} className="timeline-node">
              <span className="timeline-dot" aria-hidden="true" />
              <div>
                <span className="timeline-date">{d.display}</span>
                <span className="timeline-event">{d.event}</span>
              </div>
              <span className={`countdown-chip tone-${cd.tone}`}>{cd.text}</span>
            </div>
          )
        })}
      </div>

      <h3 className="panel-subtitle">Charter campuses in the model</h3>
      <div className="campus-list">
        {CAMPUSES.map((c) => (
          <article key={c.name} className="campus-card">
            <div className="campus-head">
              <span className="campus-name">{c.name}</span>
              <span className={`network-chip ${c.network === 'Harmony' ? 'harmony' : 'kipp'}`}>
                {c.network}
              </span>
            </div>
            <p className="campus-meta">
              Grades {c.grades} · Rating {c.rating}
            </p>
            <p className="campus-meta">{c.address}</p>
            <p className="campus-areas">
              Serves{' '}
              {c.areas.map((a) => (
                <span key={a} className="serves-item">
                  <span className="area-dot" style={{ background: AREA_COLORS[a] ?? '#718094' }} />
                  {a}
                </span>
              ))}
            </p>
          </article>
        ))}
      </div>

      <h3 className="panel-subtitle">Zoned districts — the baseline plan</h3>
      <div className="district-strip">
        {DISTRICTS.map((d) => (
          <div key={d.district + d.area} className="district-row">
            <span className="district-name">
              <span className="area-dot" style={{ background: AREA_COLORS[d.area.split(' ')[0]] ?? '#718094' }} />
              {d.district} <span className="district-rating">TEA {d.rating}</span>
            </span>
            <span className="district-area">{d.area}</span>
            <div className="district-bar">
              <ScoreBar label="School access" value={d.schoolAccess} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
