# HomeBase — Houston Home Command Center

A command-center dashboard for one family's Houston home search: 115 scored
single-family homes in the $250K–$300K band across Stafford, Richmond, Katy 77450
and Cypress, ranked by the deal model in *The Houston Book, Edition 2*.
(Listing count as of the Nov 8, 2026 Phase 1 publish; it changes as homes
sell and new ones list.)

**Live site:** https://ayaan40000.github.io/Homebase/
(The address is case-sensitive — the repo is named `Homebase`, so the capital
H matters. The lowercase version returns 404.)

Theme: **Meridian Dark** — a night instrument-panel design (brass and teal on
blue-black ink), mobile-first, built to be read on a phone and shared as a
screenshot. The sibling grocery dashboard (HaulBoard) is the daytime paper-ledger
counterpart.

## What the dashboard shows

- **Pulse header** — homes tracked, median price, median $/sqft, median days on
  market, how many homes sit under the $301K anchor, and the top deal score.
- **Top 5 recommendations** — ranked by Composite Home Score, with the #1
  "Command Pick" featured. If a pick carries a status caution in its source
  listing (for example "Under Contract — verify status"), the caution is shown
  on the card, not buried.
- **Every home, scored** — Book Deal Score ring, Composite score, Schools /
  Highway / Grocer access bars, and a ratio strip: estimated monthly PITI,
  front-end ratio against the 28% rule, price vs the $301K anchor, and $/sqft.
  Search, area filters, quick filters and sorting all run in the browser.
  Cards and the detail view show when a home was first seen and last
  verified, plus its full price-history sequence. Each card also carries a
  **Book Match** caption (score under the deal ring) and a **Small / Large**
  size badge where one applies; the detail view has a collapsed "Book match"
  section with a point-wise note — one generated bullet per Book criterion
  (size, $/sqft value tier, price band, tax) stating whether the home
  matches the Book and by how much. Explore can also sort by Book Match,
  and `CLAUDE.md` at the repo root is the project handoff brief.
- **What changed** — a dedicated view rendering the run delta
  (`data/delta.json`): new homes, price cuts and rises with $ and %, status
  changes and removals, newest run first (the last 12 runs are kept in
  `data/delta-history.json`). These are the same numbers the Wednesday and
  Sunday run reports lead with — one delta, three readers.
- **Beyond the watch (Coverage)** — a static coverage-audit view (audited
  Nov 18, 2026): a schematic map of the watched ZIPs plus the 13
  adjacent ZIPs checked for the same in-band new construction the footprint
  misses — prompted by Lennar's Cobb plan at Monarch Landing, Needville
  77461, which sat outside the scanned ZIPs. Each adjacent area is
  colour-coded by verdict (real miss / marginal / correctly out) with its
  district, total tax rate, notable communities and starting prices.
  Informational only — it carries no listing data. **Update (Nov 18, 2026,
  owner's decision):** Rosenberg 77471, Fresno 77545, Missouri City 77459
  and Needville 77461 were added to the watch — the view now shows them as
  watched, and the watch scans eleven ZIPs.
- **Charter school access** — the Edition 2 rule ("Plan on the zoned campus. A
  charter seat is lottery upside, never the plan"), enrolment deadlines with
  live countdowns, the Harmony and KIPP campuses in the model, and the zoned
  district strip (Fort Bend B, Katy B, Cy-Fair B, Lamar B, Stafford MSD C).
  Deadlines are cycle data: after the 2026–27 cycle's March 2027 dates pass,
  the panel rolls to the 2027–28 cycle and shows "dates pending publication"
  for dates the districts have not published — it never counts down to a
  past date.
- **Area Battle** — the book's area deal scores (Stafford 75.6, Richmond 68.3,
  Katy 67.1, Cypress 64.1) as animated bars that also work as list filters.
  An area with zero homes in band says so in words — the empty area is a
  finding, not a blank comparison.
- **Methodology drawer** — the full formulas and the v1 estimate labels, in
  plain language.

## Scoring summary (HomeBase Scoring v1)

- **Book Deal Score (0–100)** = 25% Value + 25% Carrying cost + 20% Flood/wind
  + 10% Momentum + 10% Schools + 10% Liquidity, each component clamped 0–100.
  Value comes from $/sqft; carrying cost from the area total tax rate; flood
  from a Flood Factor when a listing carries one (50 neutral otherwise).
- **Composite Home Score (0–100)** = 60% Deal + 15% (School Access × 10) +
  15% Highway Access + 10% Grocer Access. The Top 5 ranks by Composite.
- **Book Match (0–100, added 2026-11-18)** — how closely a home matches the
  Book's recommended buy, separate from the ranking scores: Size fit 40
  (2,800–3,700 sqft full marks; 2,350–2,799 → 28; 1,600–2,349 → 16; under
  1,600 → 6; over 3,700 → 32) + Value 25 (the Book's $/sqft tiers: ≤$105 →
  25, $106–135 → 19, $136–175 → 12, over $175 → 5) + Price band 15
  ($250K–$275K → 15; $275K–$300K → 9) + Tax 20 (area total ≤2.29% → 20;
  2.30–2.99% → 12; 3.00–3.49% → 6; ≥3.50% → 2). Bands: 80+ "Strong Book
  match", 60–79 "Good", 40–59 "Partial", under 40 "Off-Book". Size flags:
  **Small** under 1,600 sqft, **Large** at 2,800+ sqft. A home with no size
  in the source is pro-rated on the remaining components and flagged
  estimated. Full definition: `docs/SCORING.md` §10.
- **Ratios** — 7.32%, 30-year fixed, $75,000 down on a $100,000 income.
  Corrected tax formula: assessed value × total rate − $140,000 × school rate
  (the homestead exemption applies to the school portion only).

## Data labels — read these before trusting a number

- Access scores (Schools, Highway, Grocer) are **area-level estimates in v1**,
  not per-address measurements. Every home lists which of its components are
  estimates.
- Tax uses one total rate per area; insurance is the book estimate of $200/mo;
  rent ratios use one assumed area median rent. Where a listing hides its HOA,
  PITI is a **lower bound**.
- Scores are a screening tool — not an appraisal, an offer recommendation, or
  tax advice. Flood, tax, campus and inspection checks still run before any
  tour or offer.

## How updates work

| Run | When | What happens |
|---|---|---|
| Sunday full scan | Sundays ~9:37 AM CT | Redfin + HAR + Zillow scan of all target ZIPs, new listings and dismissals applied, canonical JSON rebuilt and re-scored locally. |
| Wednesday light run | Wednesdays ~9:37 AM CT | Known listing URLs re-fetched for price / DOM / status changes, re-scored, Top 5 regenerated, pushed here and redeployed — this is the run that publishes to GitHub. |

Every push to `main` runs the GitHub Actions workflow: it builds the **Rust
scorer** (`scorer/`), regenerates `data/scored.json` from `data/listings.json`
and commits it back if it changed, then builds the Vite site and deploys it to
GitHub Pages. Scoring weights live in `scorer/weights.json` — book changes are
data edits, not code edits.

**Phase 1 data pipeline (2026-11-08).** Each listing now carries `builder`
(nullable, source-named only), `status`, `firstSeen`, `lastVerified` and an
append-only `priceHistory` alongside the original fields. `tools/sync_data.py`
keeps the previous payload at `data/listings.json.prev` and emits a mechanical
run delta to `data/delta.json` (added / removed / price-changed with $ and % /
status-changed) on every sync. **Publish guard: `tools/check_consistency.py`
must pass before any push, on both the Sunday and Wednesday paths** — it fails
when canonical and repo listings differ, when a Top 5 entry is missing from
`listings.json`, or when the delta does not reconcile. `data/coverage.json`
stamps each publish with its source coverage (which sources completed, DOM and
Flood Factor fill counts), and the app footer shows it as "Data as of <date> ·
coverage: …".

**Phase 2 watch value (2026-11-17).** Every sync also prepends the run delta
to `data/delta-history.json` (newest first, last 12 runs) and copies it to
`src/data/delta.json`, which the app's **What changed** view renders — new
homes, price cuts/rises with amounts, status changes, removals. The Wednesday
and Sunday run reports lead with the same delta. The guard now also fails
when the history's newest run disagrees with `data/delta.json` or the app
copy differs from the history. Charter deadlines became cycle data
(`src/data/charter.ts`) with automatic rollover to the next cycle; areas
with zero homes in band state that in words in Area Battle and Explore; and
the "new this run" quick filter reads `firstSeen` (a home is new in the run
whose date it was first seen) instead of the sticky `new` flag.

**Pages source must stay on "GitHub Actions"** (repo Settings → Pages → Build
and deployment). If it is ever set to deploy from the `main` branch instead,
GitHub serves the raw repo root — the unbuilt Vite source — and the site
appears down (blank page, `/src/main.tsx` in the HTML). The workflow publishes
the built `dist/`; branch serving publishes the source. (Diagnosed
2026-10-31, when the live site was found serving raw source.)

## Repo layout

```
index.html / vite.config.ts / src/   React + TypeScript app (Meridian Dark)
data/listings.json                   canonical listings, copied field-for-field
data/listings.json.prev              previous published payload (for the delta)
data/scored.json                     generated by the Rust scorer
data/delta.json                      mechanical run delta (added/removed/prices/status)
data/delta-history.json              run-delta history, newest first (last 12 runs)
src/data/delta.json                  app copy of the delta history (What changed view)
data/coverage.json                   source-coverage stamp for the publish
scorer/                              Rust crate: listings.json -> scored.json
tools/sync_data.py                   canonical JSON -> data/listings.json + privacy scan + delta
tools/make_delta.py                  standalone two-payload differ -> data/delta.json + history
tools/check_consistency.py           pre-push publish guard (must pass)
.github/workflows/deploy.yml         scorer -> build -> Pages deploy
docs/                                design, scoring, platform and build docs
```

## Documentation

- [Design spec](docs/DESIGN.md) — the Meridian Dark theme: colour tokens,
  typography, layout, component contracts, score visualisation, and the
  accessibility rules the app is built to.
- [Scoring model](docs/SCORING.md) — the full model behind every number on the
  board: Deal Score and Composite formulas, school / highway / grocer access
  tables with rationale, the corrected tax formula, the charter campus table,
  and a critique of the model's own weaknesses.
- [Platform plan](docs/PLATFORM.md) — repo and Pages architecture, the Rust
  scorer's place in the pipeline, the Sunday / Wednesday update cadence, and
  the risks register.
- [Build report](docs/BUILD-REPORT.md) — what was built and verified for v1,
  including bundle sizes, the Rust scorer validation against the model, and
  the known v1 deviations.
