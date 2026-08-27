# The Lari, weekly

How the Georgian lari has moved against the dollar, euro, pound, lira and rouble
since 2019 — 92 monthly readings of real National Bank of Georgia data, charted
without a charting library.

**Live:** https://greenhugebrain.github.io/gel-rates/

React and Vite. No dependencies beyond React; the charts are hand-drawn SVG.

## The data is real

Every figure is the official rate published by the [National Bank of
Georgia](https://nbg.gov.ge/en/monetary-policy/currency), read from their public
API and committed to `src/data/rates.json`. Nothing is modelled, smoothed or
filled in. Shipping the file rather than fetching at runtime keeps the page fast
and independent of the bank's CORS policy — at the cost of being exactly as
current as the last update, which the footer states.

Sampling is monthly, on the first business day. The bank publishes daily; at a
seven-year span daily readings crowd into noise without changing the shape.

What is in there is not decoration. The lari's 17% drop in April 2020, the
Turkish lira losing 27% in a single month at the end of 2021 and 89% across the
range, the rouble's fall in March 2022 — all of it is in the chart because all of
it happened.

## Why the main chart is indexed

A pound is about 3.5 lari and a rouble about 0.03. On one raw axis the rouble is a
flat line on the floor; on two axes the scales can be slid against each other
until any story appears. **A dual-axis chart is the one thing this deliberately
cannot draw.** Rebasing each series to 100 at the start of the range puts them on
one honest scale and makes the comparison proportional. The second chart shows a
single currency at its actual value, on its own axis, for when the real number is
what you want.

## The charts

Built against a validated categorical palette: the five slots clear the lightness
band, chroma floor, colour-vision-deficiency separation and normal-vision floor in
both light and dark mode. Three light-mode slots fall below 3:1 contrast against
the surface, so the relief ships with them — a legend is always present, and the
full table is a page rather than an afterthought.

- **Colour follows the currency, never its rank.** Switching a series off leaves
  the survivors on their own hues instead of repainting them.
- 2px lines, ≥8px end markers with a 2px surface ring, bars capped at 22px with a
  4px rounded data-end, hairline solid gridlines.
- Crosshair and tooltip on the line charts; per-row highlight on the bars.
- Marks carry the colour; labels, values and legends stay in text tokens.
- Dark mode is a selected set of steps for the dark surface, not an inverted flip.

`src/components/useSize.js` measures each container so the SVG is drawn at real
pixel sizes — scaling one viewBox would scale the 2px strokes with it and change
the weight of every mark on every screen.

## Pages

| Path | What is on it |
|---|---|
| `/` | The dashboard: indexed comparison, change over range, one currency in detail |
| `/table/` | Every number behind the charts, sortable |
| `/about/` | The source, the sampling, and what the charts do not claim |

## Refreshing the data

The dataset is a plain JSON array of `{ date, USD, EUR, GBP, TRY, RUB }`. The NBG
endpoint answers for one currency and one date at a time — asking for several
currencies alongside a date returns an empty list — so a refresh means walking
month starts and requesting each code separately.

## Not investment advice

A monthly sample will not tell you what a rate did on any particular day, and this
is not a live feed.

## Run locally

```bash
npm install
npm run dev
```

`npm run build` outputs to `dist/`, which the GitHub Actions workflow publishes
to Pages on every push to `master`.
