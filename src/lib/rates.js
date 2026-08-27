import raw from '../data/rates.json'

/** Monthly GEL rates from the National Bank of Georgia, oldest first. */
export const ROWS = raw

export const CURRENCIES = [
  { code: 'USD', name: 'US dollar', slot: 1 },
  { code: 'EUR', name: 'Euro', slot: 2 },
  { code: 'GBP', name: 'Pound sterling', slot: 3 },
  { code: 'TRY', name: 'Turkish lira', slot: 4 },
  { code: 'RUB', name: 'Russian rouble', slot: 5 },
]

export const RANGES = [
  { id: '3y', label: '3 years', months: 36 },
  { id: '5y', label: '5 years', months: 60 },
  { id: 'all', label: 'Since 2019', months: null },
]

export function rowsFor(rangeId) {
  const range = RANGES.find((r) => r.id === rangeId) ?? RANGES[2]
  if (!range.months) return ROWS
  return ROWS.slice(Math.max(0, ROWS.length - range.months))
}

/**
 * Rebased so every currency starts at 100.
 *
 * The five rates differ by two orders of magnitude — a rouble is about 0.03 lari,
 * a pound about 3.5 — so plotting them raw would need two y-axes. Indexing to a
 * common base puts them on one scale and asks the question the chart is actually
 * for: which moved most, and when.
 */
export function indexed(rows, codes) {
  const base = {}
  for (const code of codes) {
    const first = rows.find((r) => r[code] != null)
    base[code] = first ? first[code] : null
  }
  return rows.map((r) => {
    const point = { date: r.date }
    for (const code of codes) {
      point[code] = base[code] && r[code] != null ? (r[code] / base[code]) * 100 : null
    }
    return point
  })
}

export function changeOver(rows, code) {
  const values = rows.map((r) => r[code]).filter((v) => v != null)
  if (values.length < 2) return null
  return (values[values.length - 1] / values[0] - 1) * 100
}

export function statsFor(rows, code) {
  const values = rows.map((r) => r[code]).filter((v) => v != null)
  if (!values.length) return null
  const steps = values.slice(1).map((v, i) => v / values[i] - 1)
  const mean = steps.reduce((a, b) => a + b, 0) / (steps.length || 1)
  const variance = steps.reduce((a, b) => a + (b - mean) ** 2, 0) / (steps.length || 1)
  return {
    latest: values[values.length - 1],
    first: values[0],
    min: Math.min(...values),
    max: Math.max(...values),
    change: (values[values.length - 1] / values[0] - 1) * 100,
    // Standard deviation of month-on-month moves — how jumpy, not how far.
    volatility: Math.sqrt(variance) * 100,
  }
}

export function formatRate(value) {
  if (value == null) return '—'
  return value >= 1 ? value.toFixed(4) : value.toFixed(4)
}

export function formatPercent(value, digits = 1) {
  if (value == null) return '—'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(digits)}%`
}

export function formatMonth(iso, short = false) {
  const [y, m] = iso.split('-')
  const name = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(m) - 1]
  return short ? `${name} ${y.slice(2)}` : `${name} ${y}`
}

export const SOURCE = {
  name: 'National Bank of Georgia',
  url: 'https://nbg.gov.ge/en/monetary-policy/currency',
  note: 'Official rate on the first business day of each month.',
  first: ROWS[0]?.date,
  last: ROWS[ROWS.length - 1]?.date,
  count: ROWS.length,
}
