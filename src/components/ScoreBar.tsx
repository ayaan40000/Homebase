export default function ScoreBar({
  label,
  value,
  max = 10,
  tone = 'teal',
}: {
  label: string
  value: number
  max?: number
  tone?: 'teal' | 'brass'
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className="score-bar">
      <span className="score-bar-label">{label}</span>
      <span className="score-bar-track">
        <span
          className={`score-bar-fill ${tone}`}
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="score-bar-value">{value.toFixed(1)}</span>
    </div>
  )
}
