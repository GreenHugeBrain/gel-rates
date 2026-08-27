import { useMemo, useState } from 'react'

import { Page, PageHead } from '../components/Chrome.jsx'
import { CURRENCIES, ROWS, formatMonth, formatRate } from '../lib/rates.js'

/**
 * The table is not a fallback — it is the accessible twin of the charts, and the
 * relief the palette's contrast warning requires. Every plotted number is here.
 */
export default function TableView() {
  const [sort, setSort] = useState({ key: 'date', dir: 'desc' })

  const rows = useMemo(() => {
    const copy = [...ROWS]
    copy.sort((a, b) => {
      const av = a[sort.key]
      const bv = b[sort.key]
      if (av == null) return 1
      if (bv == null) return -1
      const cmp = sort.key === 'date' ? String(av).localeCompare(String(bv)) : av - bv
      return sort.dir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [sort])

  function sortBy(key) {
    setSort((s) => ({
      key,
      dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc',
    }))
  }

  const header = (key, label) => {
    const active = sort.key === key
    return (
      <th scope="col" className={key === 'date' ? '' : 'num'} aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
        <button type="button" onClick={() => sortBy(key)}>
          {label}
          <span aria-hidden="true" className={active ? 'arrow is-on' : 'arrow'}>
            {active && sort.dir === 'asc' ? '↑' : '↓'}
          </span>
        </button>
      </th>
    )
  }

  return (
    <Page>
      <PageHead
        title="Every number behind the charts"
        note="Lari per one unit of each currency, on the first business day of the month. Click a heading to sort."
      />

      <div className="table-wrap">
        <table className="data-table">
          <caption className="sr-only">
            Monthly exchange rates, Georgian lari per unit of foreign currency
          </caption>
          <thead>
            <tr>
              {header('date', 'Month')}
              {CURRENCIES.map((c) => header(c.code, c.code))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.date}>
                <td>{formatMonth(row.date)}</td>
                {CURRENCIES.map((c) => (
                  <td key={c.code} className="num">{formatRate(row[c.code])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Page>
  )
}
