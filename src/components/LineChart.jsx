import { useMemo, useState } from 'react'

import useSize from './useSize.js'
import { formatMonth } from '../lib/rates.js'

const PAD = { top: 16, right: 68, bottom: 28, left: 52 }
const HEIGHT = 330

/** Rounds a raw tick interval up to a readable 1 / 2 / 2.5 / 5 × 10ⁿ. */
function niceStep(raw) {
  if (!Number.isFinite(raw) || raw <= 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  const scaled = raw / magnitude
  const snapped = scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 2.5 ? 2.5 : scaled <= 5 ? 5 : 10
  return snapped * magnitude
}

/**
 * Multi-series line chart with a crosshair and tooltip.
 *
 * One y-axis, always — series arriving here are expected to already share a scale
 * (the dashboard rebases them to 100 first). Two scales on one chart is the thing
 * this deliberately cannot do.
 */
export default function LineChart({
  rows, series, valueFormat, yTicks = 5, baseline = null, ariaLabel,
}) {
  const [wrapRef, width] = useSize()
  const [hover, setHover] = useState(null)

  const plotW = Math.max(120, width - PAD.left - PAD.right)
  const plotH = HEIGHT - PAD.top - PAD.bottom

  const { yMin, yMax, points } = useMemo(() => {
    const values = []
    for (const row of rows) {
      for (const s of series) {
        if (row[s.code] != null) values.push(row[s.code])
      }
    }
    if (!values.length) return { yMin: 0, yMax: 1, points: {} }
    let lo = Math.min(...values)
    let hi = Math.max(...values)
    if (baseline != null) { lo = Math.min(lo, baseline); hi = Math.max(hi, baseline) }
    const pad = (hi - lo) * 0.12 || 1
    lo -= pad; hi += pad
    const built = {}
    for (const s of series) {
      built[s.code] = rows.map((row, i) => (row[s.code] == null ? null : {
        x: rows.length === 1 ? plotW / 2 : (i / (rows.length - 1)) * plotW,
        y: plotH - ((row[s.code] - lo) / (hi - lo)) * plotH,
        v: row[s.code],
      }))
    }
    return { yMin: lo, yMax: hi, points: built }
  }, [rows, series, plotW, plotH, baseline])

  const ticks = useMemo(() => {
    const step = niceStep((yMax - yMin) / yTicks)
    const out = []
    const start = Math.ceil(yMin / step) * step
    for (let v = start; v <= yMax + step * 0.001; v += step) {
      // Floating point leaves 91.99999 behind; snap back onto the step.
      const value = Math.round(v / step) * step
      out.push({ v: value, y: plotH - ((value - yMin) / (yMax - yMin)) * plotH })
    }
    return out
  }, [yMin, yMax, yTicks, plotH])

  const xLabels = useMemo(() => {
    if (rows.length < 2) return []
    const step = Math.max(1, Math.round(rows.length / 6))
    const out = []
    for (let i = 0; i < rows.length; i += step) {
      out.push({ i, x: (i / (rows.length - 1)) * plotW, label: formatMonth(rows[i].date, true) })
    }
    return out
  }, [rows, plotW])

  function onMove(e) {
    const box = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - box.left - PAD.left
    if (rows.length < 2) return
    const idx = Math.round((x / plotW) * (rows.length - 1))
    setHover(Math.min(rows.length - 1, Math.max(0, idx)))
  }

  const baseY = baseline == null ? null
    : plotH - ((baseline - yMin) / (yMax - yMin)) * plotH

  return (
    <div className="chart" ref={wrapRef}>
      <svg
        width={width}
        height={HEIGHT}
        role="img"
        aria-label={ariaLabel}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        <g transform={`translate(${PAD.left},${PAD.top})`}>
          {ticks.map((t) => (
            <g key={t.v}>
              <line className="grid" x1={0} x2={plotW} y1={t.y} y2={t.y} />
              <text className="tick" x={-10} y={t.y} dy="0.32em" textAnchor="end">
                {valueFormat(t.v, true)}
              </text>
            </g>
          ))}

          {baseY != null && (
            <>
              <line className="baseline-rule" x1={0} x2={plotW} y1={baseY} y2={baseY} />
              {/* Left edge: the right-hand end of the plot belongs to the markers. */}
              <text className="baseline-label" x={4} y={baseY - 8}>
                start = 100
              </text>
            </>
          )}

          {xLabels.map((l) => (
            <text key={l.i} className="tick" x={l.x} y={plotH + 18} textAnchor="middle">
              {l.label}
            </text>
          ))}

          {hover != null && (
            <line
              className="crosshair"
              x1={(hover / (rows.length - 1)) * plotW}
              x2={(hover / (rows.length - 1)) * plotW}
              y1={0}
              y2={plotH}
            />
          )}

          {series.map((s) => {
            const pts = points[s.code]?.filter(Boolean) ?? []
            if (pts.length < 2) return null
            const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('')
            return (
              <path
                key={s.code}
                d={d}
                fill="none"
                stroke={`var(--series-${s.slot})`}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )
          })}

          {/* End markers carry a surface ring so overlapping ends stay readable. */}
          {series.map((s) => {
            const pts = points[s.code]?.filter(Boolean) ?? []
            const last = pts[pts.length - 1]
            if (!last) return null
            return (
              <circle
                key={s.code}
                cx={last.x}
                cy={last.y}
                r="4.5"
                fill={`var(--series-${s.slot})`}
                stroke="var(--surface-1)"
                strokeWidth="2"
              />
            )
          })}

          {/* Direct labels supplement the legend, and only while they can't collide. */}
          {series.length <= 4 && series.map((s) => {
            const pts = points[s.code]?.filter(Boolean) ?? []
            const last = pts[pts.length - 1]
            if (!last) return null
            return (
              <text key={s.code} className="end-label" x={last.x + 10} y={last.y} dy="0.32em">
                {s.code}
              </text>
            )
          })}

          {hover != null && series.map((s) => {
            const p = points[s.code]?.[hover]
            if (!p) return null
            return (
              <circle
                key={s.code}
                cx={p.x}
                cy={p.y}
                r="4.5"
                fill={`var(--series-${s.slot})`}
                stroke="var(--surface-1)"
                strokeWidth="2"
              />
            )
          })}
        </g>
      </svg>

      {hover != null && (
        <Tooltip
          rows={rows}
          series={series}
          index={hover}
          width={width}
          x={PAD.left + (hover / (rows.length - 1)) * plotW}
          valueFormat={valueFormat}
        />
      )}
    </div>
  )
}

function Tooltip({ rows, series, index, x, width, valueFormat }) {
  const row = rows[index]
  const flip = x > width - 190
  return (
    <div
      className="tooltip"
      style={{ left: `${flip ? x - 176 : x + 14}px` }}
      role="status"
    >
      <p className="tooltip-date">{formatMonth(row.date)}</p>
      <dl>
        {series.map((s) => (
          <div key={s.code}>
            <dt>
              <span className="key" style={{ background: `var(--series-${s.slot})` }} />
              {s.code}
            </dt>
            <dd>{row[s.code] == null ? '—' : valueFormat(row[s.code])}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
