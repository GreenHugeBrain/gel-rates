import { useMemo, useState } from 'react'

import { Page, PageHead } from '../components/Chrome.jsx'
import LineChart from '../components/LineChart.jsx'
import ChangeBars from '../components/ChangeBars.jsx'
import {
  CURRENCIES, RANGES, changeOver, formatMonth, formatPercent, formatRate,
  indexed, rowsFor, statsFor,
} from '../lib/rates.js'
import { href } from '../lib/paths.js'

export default function Dashboard() {
  const [rangeId, setRangeId] = useState('all')
  const [shown, setShown] = useState(CURRENCIES.map((c) => c.code))
  const [focus, setFocus] = useState('USD')

  const rows = useMemo(() => rowsFor(rangeId), [rangeId])
  const series = CURRENCIES.filter((c) => shown.includes(c.code))
  const indexedRows = useMemo(
    () => indexed(rows, series.map((s) => s.code)),
    [rows, series],
  )

  const bars = useMemo(() => CURRENCIES
    .filter((c) => shown.includes(c.code))
    .map((c) => ({ ...c, change: changeOver(rows, c.code) }))
    .sort((a, b) => (b.change ?? 0) - (a.change ?? 0)), [rows, shown])

  const focusCurrency = CURRENCIES.find((c) => c.code === focus) ?? CURRENCIES[0]
  const focusStats = statsFor(rows, focus)
  const rangeLabel = RANGES.find((r) => r.id === rangeId)?.label ?? ''

  function toggle(code) {
    setShown((current) => (current.includes(code)
      ? (current.length > 1 ? current.filter((c) => c !== code) : current)
      : CURRENCIES.filter((c) => current.includes(c.code) || c.code === code)
        .map((c) => c.code)))
  }

  return (
    <Page>
      <PageHead
        title="What the lari has been doing"
        note={`Monthly official rates from the National Bank of Georgia. One lari buys
               more or less of each of these than it did at the start of the range —
               the chart below asks which moved, and when.`}
      />

      <div className="controls">
        <div className="control">
          <span className="control-label">Range</span>
          <div className="segmented" role="group" aria-label="Time range">
            {RANGES.map((r) => (
              <button
                key={r.id}
                type="button"
                aria-pressed={rangeId === r.id}
                onClick={() => setRangeId(r.id)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="control">
          <span className="control-label">Currencies</span>
          <div className="chips" role="group" aria-label="Currencies shown">
            {CURRENCIES.map((c) => {
              const on = shown.includes(c.code)
              return (
                <button
                  key={c.code}
                  type="button"
                  className={on ? 'chip is-on' : 'chip'}
                  aria-pressed={on}
                  onClick={() => toggle(c.code)}
                >
                  <span className="key" style={{ background: `var(--series-${c.slot})` }} />
                  {c.code}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Indexed to 100 at {formatMonth(rows[0].date)}</h2>
            <p className="panel-note">
              Rebased so the five can share one axis — a rouble is about 0.03 lari and a
              pound about 3.5, so the raw rates would need two scales, and two scales on
              one chart is a lie about proportion. Above 100 means the lari buys less of
              that currency than it did.
            </p>
          </div>
          <Legend series={series} />
        </div>

        <LineChart
          rows={indexedRows}
          series={series}
          baseline={100}
          valueFormat={(v) => v.toFixed(0)}
          ariaLabel={`Exchange rates indexed to 100 at ${formatMonth(rows[0].date)}`}
        />

        <p className="panel-foot">
          Every value behind this chart is on <a href={href('table')}>the numbers page</a>.
        </p>
      </section>

      <div className="two-up">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Change over {rangeLabel.toLowerCase()}</h2>
              <p className="panel-note">
                How much a lari&rsquo;s worth of each currency moved across the range.
              </p>
            </div>
          </div>
          <ChangeBars items={bars} ariaLabel={`Percentage change over ${rangeLabel}`} />
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>{focusCurrency.name}, actual rate</h2>
              <p className="panel-note">
                One currency at its real value in lari, on its own scale.
              </p>
            </div>
            <label className="field-inline">
              <span className="sr-only">Currency to show</span>
              <select value={focus} onChange={(e) => setFocus(e.target.value)}>
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </label>
          </div>

          {focusStats && (
            <div className="tiles">
              <Tile label="Latest" value={`${formatRate(focusStats.latest)} ₾`} />
              <Tile
                label={`Change over ${rangeLabel.toLowerCase()}`}
                value={formatPercent(focusStats.change)}
              />
              <Tile label="Monthly swing" value={`${focusStats.volatility.toFixed(1)}%`} />
            </div>
          )}

          <LineChart
            rows={rows}
            series={[focusCurrency]}
            valueFormat={(v) => (v >= 1 ? v.toFixed(2) : v.toFixed(3))}
            ariaLabel={`${focusCurrency.name} rate in lari`}
          />
        </section>
      </div>
    </Page>
  )
}

function Legend({ series }) {
  return (
    <ul className="legend">
      {series.map((s) => (
        <li key={s.code}>
          <span className="key" style={{ background: `var(--series-${s.slot})` }} />
          {s.code}
        </li>
      ))}
    </ul>
  )
}

/** No up-is-good colouring: a rate falling is not good or bad, only a direction. */
function Tile({ label, value }) {
  return (
    <div className="tile">
      <p className="tile-label">{label}</p>
      <p className="tile-value">{value}</p>
    </div>
  )
}
