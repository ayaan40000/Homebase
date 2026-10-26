import { bandFor } from '../lib/types'

export default function ScoreRing({
  score,
  size = 56,
}: {
  score: number | null
  size?: number
}) {
  const band = bandFor(score)
  const stroke = size >= 80 ? 8 : 6
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const filled = score == null ? 0 : Math.max(0, Math.min(100, score)) / 100
  return (
    <div className="score-ring" style={{ width: size }}>
      <div className="ring-wrap" style={{ width: size, height: size }}>
        <svg width={size} height={size} role="img" aria-label={`Book Deal Score ${score ?? 'not scored'} of 100, ${band.label}`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
          <circle
            className="ring-progress"
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={band.color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - filled)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <span className="ring-number" style={{ fontSize: size >= 80 ? '1.75rem' : '1.25rem' }}>
          {score == null ? '—' : Math.round(score)}
        </span>
      </div>
      <span className="ring-band">{band.label}</span>
    </div>
  )
}
