import { Page, PageHead } from '../components/Chrome.jsx'
import { SOURCE, formatMonth } from '../lib/rates.js'
import { href } from '../lib/paths.js'

export default function About() {
  return (
    <Page>
      <PageHead
        title="About the data"
        note="Where these rates come from, how they were sampled, and what the charts do not claim."
      />

      <div className="prose">
        <h2>The source</h2>
        <p>
          Every figure is the official rate published by the{' '}
          <a href={SOURCE.url} target="_blank" rel="noreferrer">{SOURCE.name}</a>,
          read from their public API. Nothing here is modelled, smoothed or filled
          in: where the bank published a number, it is the number.
        </p>
        <p>
          {SOURCE.count} readings, {formatMonth(SOURCE.first)} to{' '}
          {formatMonth(SOURCE.last)} — one per month, taken on the first business day.
          The bank publishes daily; monthly is a deliberate sample, because at this
          span daily readings crowd into noise without changing the shape.
        </p>

        <h2>Why the main chart is indexed</h2>
        <p>
          A pound is about 3.5 lari and a rouble about 0.03. Plotted raw on one axis
          the rouble is a flat line on the floor; plotted on a second axis, the two
          scales can be slid against each other until any story appears. Rebasing
          each series to 100 at the start of the range puts them on one honest scale,
          and the question becomes proportional: which moved most, and when.
        </p>
        <p>
          The second chart shows one currency at its actual value, on its own axis,
          for when the real number is what you want.
        </p>

        <h2>What &ldquo;monthly swing&rdquo; means</h2>
        <p>
          The standard deviation of month-on-month changes across the range. It
          measures how jumpy a rate has been, not how far it travelled — a currency
          can drift a long way calmly, or end where it started after a violent year.
        </p>

        <h2>What this is not</h2>
        <p>
          It is not a live feed. The data ships inside the page, so it is exactly as
          current as the last time the file was updated — the footer says the last
          reading it holds. It is not investment advice, and a monthly sample will
          not tell you what a rate did on any particular day.
        </p>

        <h2>The charts themselves</h2>
        <p>
          Drawn as plain SVG, with no charting library. Colours are assigned per
          currency and never re-used when a filter changes the set, so a series keeps
          its identity. Three of the five sit below 3:1 contrast on the light
          surface, which is why there is always a legend, and why{' '}
          <a href={href('table')}>the full table</a> exists rather than being an
          afterthought.
        </p>

        <p className="prose-actions">
          <a className="btn btn-solid" href={href('')}>Back to the charts</a>
          <a className="btn btn-ghost" href={href('table')}>Read the numbers</a>
        </p>
      </div>
    </Page>
  )
}
