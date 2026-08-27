import { useState } from 'react'

import useSize from './useSize.js'
import { formatPercent } from '../lib/rates.js'

const PAD = { top: 10, right: 20, bottom: 26, left: 58 }
const ROW = 42
const BAR = 22        // ≤ 24px, with the band's leftover left as air

/**
 * Change over the selected range, one bar per currency.
 *
 * Colour follows the currency, not the sign — a filter that drops a series must
 * never repaint the survivors. Direction carries the sign, and the value sits at
 * the tip where it cannot be clipped.
 */
export default function ChangeBars({ items, ariaLabel }) {
  const [wrapRef, width] = useSize()
  const [hover, setHover] = useState(null)

  const height = PAD.top + PAD.bottom + items.length * ROW
  const plotW = Math.max(120, width - PAD.left - PAD.right)

  const extent = Math.max(1, ...items.map((i) => Math.abs(i.change ?? 0)))
  const zeroX = plotW / 2
  // Leave room at each end for the value label, so it never lands on the name.
  const scale = (v) => (v / extent) * Math.max(20, plotW / 2 - 58)

  return (
    <div className="chart" ref={wrapRef}>
      <svg width={width} height={height} role="img" aria-label={ariaLabel}>
        <g transform={`translate(${PAD.left},${PAD.top})`}>
          <line className="grid" x1={zeroX} x2={zeroX} y1={0} y2={items.length * ROW} />

          {items.map((item, i) => {
            const value = item.change ?? 0
            const w = Math.abs(scale(value))
            const x = value >= 0 ? zeroX : zeroX - w
            const y = i * ROW + (ROW - BAR) / 2
            const labelX = value >= 0 ? zeroX + w + 9 : zeroX - w - 9
            return (
              <g
                key={item.code}
                onPointerEnter={() => setHover(item.code)}
                onPointerLeave={() => setHover(null)}
              >
                <rect
                  x={0}
                  y={i * ROW}
                  width={plotW}
                  height={ROW}
                  fill="transparent"
                />
                <rect
                  x={x}
                  y={y}
                  width={Math.max(2, w)}
                  height={BAR}
                  rx="4"
                  fill={`var(--series-${item.slot})`}
                  opacity={hover && hover !== item.code ? 0.45 : 1}
                />
                <text className="bar-name" x={-10} y={y + BAR / 2} dy="0.32em" textAnchor="end">
                  {item.code}
                </text>
                <text
                  className="bar-value"
                  x={labelX}
                  y={y + BAR / 2}
                  dy="0.32em"
                  textAnchor={value >= 0 ? 'start' : 'end'}
                >
                  {formatPercent(item.change)}
                </text>
              </g>
            )
          })}

          <text className="tick" x={zeroX} y={items.length * ROW + 17} textAnchor="middle">
            no change
          </text>
        </g>
      </svg>
    </div>
  )
}
