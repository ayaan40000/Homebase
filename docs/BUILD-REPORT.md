# HomeBase — Build Report (2026-10-25)

## What was built

Local repo: `~/workspace/homebase/` — local git repo on branch `main`, initial
commit `d8c9a98` (39 files), push-ready.

```
homebase/
├── index.html / vite.config.ts (base "/homebase/") / package.json / tsconfig*.json
├── src/
│   ├── App.tsx, main.tsx, index.css (single stylesheet, Meridian Dark tokens)
│   ├── components/  PulseHeader, TopFiveHero, ControlDeck, HomeCard, HomeTable,
│   │                ScoreRing, ScoreBar, RatioStrip, CharterPanel, AreaBattle,
│   │                MethodologyDrawer
│   ├── data/        scored.json (copy of scored-listings), top5.json, charter.ts
│   └── lib/         types.ts (band/area constants), useReveal.ts
├── data/            listings.json (canonical copy), scored.json
├── scorer/          Cargo.toml, Cargo.lock, weights.json, src/main.rs
├── tools/sync_data.py
├── .github/workflows/deploy.yml
├── .gitignore, .nojekyll, README.md
```

Features verified in code: search (address + subdivision), area chips
(All/Stafford/Richmond/Katy/Cypress with live counts), sort select (Composite,
Deal Score, Price low-high, Price high-low, $/sqft, DOM, Newest year), quick
filters (Under $301K anchor, Score 70+, New, Price cuts, Schools 8+) — all
client-side over the bundled scored data. ScoreRing = Book Deal Score only;
ScoreBars = Schools / Highway / Grocer (0–10); RatioStrip = est. PITI/mo,
front-end % vs 28%, price vs $301K anchor %, $/sqft (+ rent ratio and tax est.
as sub-lines). Every card links to its listing ("View listing"). Top 5 hero
from top5.json; **rank 1 (4602 Highland Crest Dr) shows a visible amber
caution banner: "Under Contract — verify status."** CharterPanel includes the
Edition 2 rule line, computed deadline countdowns (Harmony enrolment Nov 1
2026–Feb 10 2027; KIPP deadline Jan 25 2027; lotteries Feb 2027; new Harmony
Rosenberg/Pearland deadline Mar 15 2027), all 10 charter campuses from the
scoring model, and the zoned-district strip (Fort Bend B, Katy B, Cy-Fair B,
Lamar B, Stafford MSD C). AreaBattle shows book area scores (Stafford 75.6,
Richmond 68.3, Katy 67.1, Cypress 64.1) as animated bars that also act as area
filters. MethodologyDrawer summarizes the formulas and v1 estimate labels.
Mobile-first: single column under 720px in spec order (Pulse → Top 5 →
ControlDeck → list → Charter → Area Battle); desktop 12-col equivalent with a
sticky rail and a Cards/Table toggle.

## Build verification

- `npm install` OK (Node v24.22.1). `npm run build` **succeeds**: dist/index.html
  (0.94 KB), CSS 15.09 KB (gzip 3.44 KB), JS 518.19 KB raw / **97.04 KB gzip**
  (the raw size is the embedded 352 KB scored JSON; gzip is inside the spec's
  200 KB target). dist total 528 KB.
- Sanity greps on the built bundle: "Highland Crest" present, "Meridian"
  present, base "/homebase/" present in dist/index.html.

## Rust validation

- rustup minimal toolchain installed to `~/.cargo` (persists).
- `cargo run --release` on data/listings.json → **scored 128 listings**;
  compared against the provided scored-listings.json: **zero listings with a
  notable diff** (deal/composite within 0.15, PITI/front-end within 0.5 on all
  128) and the Rust Top 5 order is **identical** to top5.json (Highland Crest,
  Barrett Knolls, Marbella Mtn, Santa Cruz Bay, Alder Bend).

## GitHub result — OWNER STEP NEEDED (App repository access)

- Owner created the repo himself, as planned: `ayaan40000/homebase` exists,
  accessible via the connector, with one initial commit `46df33f` ("Initial
  commit", placeholder README). No create_repository attempt was made.
- **Push attempted once and failed:** `push_files` → 403 "failed to create
  tree … Resource not accessible by integration". This is the haulboard
  pattern: the repo is not yet in the Muse GitHub App's selected repositories
  (or the App's contents permission does not cover it yet).
- **Exact owner steps:** GitHub → Settings → Applications → Muse →
  Configure → Repository access → "Only select repositories" → add
  `homebase` → Save. Then tell Muse; the push (39 files, manifest ready) can
  be re-run immediately. Overwriting the placeholder README with the project
  README is already the intent (owner: "Readme is on so we can document stuff
  there" — the project README documents the dashboard, scoring, cadence and
  data labels).
- After the push lands, one more settings step: repo Settings → Pages → Build
  and deployment → Source: **GitHub Actions** (the workflow deploys via
  Actions; no gh-pages branch).
- **Pages URL state:** https://ayaan40000.github.io/homebase/ is **not live**
  (nothing pushed yet). Not claimed otherwise.

## Privacy scan (pre-push)

- No emails found. No owner home address (1020 Brand Lane), no apartment, no
  owner phone anywhere in the repo.
- One hit, flagged for the owner's awareness: the phone number in the data
  files' `disclaimer` field is the **home inspector's business number**
  (Liju Varghese, Calv's Inspection Services LLC, TREC #27107-PI) carried
  field-for-field from the canonical listings JSON — a professional contact
  already recorded in the goal's public shortlist, not the owner's personal
  data. If the owner wants it stripped, it should be stripped at the canonical
  source and re-synced.

## Spec deviations (with reasons)

1. RatioStrip's 4th cell shows $/sqft with the tax estimate as its sub-line,
   and the PITI cell carries the front-end % with PITI/mo as sub-line — the
   brief required PITI/mo, front-end %, anchor % and $/sqft on the strip;
   the spec's own strip (PITI ratio / anchor / rent ratio / tax est.) is
   covered across value + sub-lines (rent ratio appears as a sub-line with
   price/annual rent as the value). All required numbers are present.
2. ControlDeck sort includes "Price: high to low" from the design spec in
   addition to the brief's list. Quick-filter chip labels are shortened
   ("Score 70+", "New", "Schools 8+") for mobile fit; behaviour matches.
3. AreaBattle ships the Battle view only — the spec's schematic Map view is
   not in v1 (Battle is the spec's default and accessible equivalent). Charter
   "Charter zone" per-card chips and KPI delta lines vs previous run are not
   in v1 (no charter-zone or previous-run data in the scored JSON).
4. The scorer commit-back in Actions regenerates data/scored.json only; the
   app bundles src/data/scored.json at build time, so the Sunday/Wednesday
   jobs must copy data/scored.json → src/data/scored.json when they push
   (sync step for the cron jobs to own; the local repo currently has both
   copies identical).
