export default function ClassChart({ values, classes, valuesScale }) {
  const scale = valuesScale || 1
  const pcts  = values.map(v => v / scale)
  const total = pcts.reduce((a, b) => a + b, 0)
  if (total === 0) return null

  const visible = classes.map((cls, i) => ({ cls, pct: pcts[i] })).filter(x => x.pct >= 0.3)

  return (
    <div className="class-chart">
      {/* Barra empilhada */}
      <div className="chart-bar">
        {visible.map(({ cls, pct }) => {
          const isWhite = cls.color === '#FFFFFF'
          return (
            <div
              key={cls.id}
              className="chart-segment"
              style={{
                flex: pct,
                backgroundColor: cls.color,
                border: isWhite ? '1px solid #D0D0D0' : 'none',
              }}
              title={`${cls.label}: ${pct.toFixed(1)}%`}
            >
              {pct >= 7 && (
                <span
                  className="seg-label"
                  style={{ color: isWhite || pct < 15 ? '#444' : '#fff' }}
                >
                  {pct.toFixed(1)}%
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Legenda */}
      <div className="chart-legend">
        {visible.map(({ cls, pct }) => {
          const isWhite = cls.color === '#FFFFFF'
          return (
            <div key={cls.id} className="legend-item">
              <span
                className="legend-dot"
                style={{
                  backgroundColor: cls.color,
                  border: isWhite ? '1px solid #D0D0D0' : 'none',
                }}
              />
              <span className="legend-label">{cls.label}</span>
              <strong className="legend-pct">{pct.toFixed(1)}%</strong>
            </div>
          )
        })}
      </div>
    </div>
  )
}
