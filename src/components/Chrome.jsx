import { NAV } from './Nav.js'
import { href, isCurrent } from '../lib/paths.js'
import { SOURCE } from '../lib/rates.js'

/** Wraps every page. Static header — this is a reading tool, not a brochure. */
export function Page({ children }) {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>

      <header className="app-header">
        <div className="shell header-inner">
          <a className="wordmark" href={href('')}>
            The Lari<span>, weekly</span>
          </a>
          <nav aria-label="Main">
            {NAV.map((item) => (
              <a
                key={item.path}
                href={href(item.path)}
                aria-current={isCurrent(item.path) ? 'page' : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main id="main" className="shell">{children}</main>

      <footer className="app-footer">
        <div className="shell">
          <p>
            Rates from the{' '}
            <a href={SOURCE.url} target="_blank" rel="noreferrer">{SOURCE.name}</a>
            {' '}— {SOURCE.count} monthly readings, {SOURCE.first} to {SOURCE.last}.
          </p>
          <p className="fine">
            A demonstration build. Not investment advice, and not a live feed — the
            data ships with the page and is only as current as the last update.
          </p>
        </div>
      </footer>
    </>
  )
}

export function PageHead({ title, note }) {
  return (
    <div className="page-head">
      <h1>{title}</h1>
      {note && <p className="page-note">{note}</p>}
    </div>
  )
}
