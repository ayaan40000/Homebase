# HomeBase — project handoff brief

Read this before changing anything. It describes the project as it actually
stands on Nov 18, 2026. Where this file and the code disagree, the code and
`docs/SCORING.md` win — and fix this file in the same push.

## What this is

HomeBase is the dashboard for Ayaan Pathan's Houston home watch: a weekly
scan of single-family listings in a fixed price band, scored against *The
Houston Book, Edition 2*, published as a static site he reads on his phone.
The purchase window is **2029** — this is a watch, not a buying tool. No
money moves in this project, ever: no offers, no bookings, no purchases.

- **Live site:** https://ayaan40000.github.io/Homebase/ — **case-sensitive**.
  The repo is `Homebase` with a capital H; the lowercase URL 404s.
- **Repo:** `ayaan40000/Homebase`, branch `main`.
- **Pages source must stay "GitHub Actions"** (repo Settings → Pages). If it
  is ever set to deploy from the branch, GitHub serves the raw Vite source
  and the site looks down. The workflow (`.github/workflows/deploy.yml`)
  builds `dist/` and deploys that.

## The governing reference — The Houston Book, Edition 2 (Oct 2026)

The Book (PDF in the goal workspace, `~/workspace/user/files/`) supersedes
all earlier research. Its anchors drive every score:

- $75,000 down + closing costs; 30-year fixed at 7.32%; household income
  $100,000.
- Honest price band at the 28% front-end rule: **$250,000–$275,000**.
  Ceilings: **$301,000 at 28%**, **$327,000 at the 31% upper band**; no PMI
  up to $375,000 (20%+ down).
- Recommended buy: a **2,800–3,700 sq ft resale** (2003–2016). At the same
  money, new construction yields only **1,600–2,350 sq ft** — that trade is
  the Book's core argument.
- $/sqft value tiers (Ch 16): best $82–105 · good $106–135 · market
  $136–175 · premium $176–226.
- Watch-area total tax rates run **1.73–2.29%**; new-MUD communities run
  2.2–3.7%. Tax formula: assessed × total rate − $140,000 × school rate
  (homestead exemption applies to the school portion only).
- Schools: **plan on the zoned campus; a charter seat is lottery upside,
  never the plan.** Harmony/KIPP enrolment and lottery dates are cycle data
  in `src/data/charter.ts` (2026–27 cycle, then 2027–28 with unconfirmed
  dates shown as "dates pending publication" — never count down to a past
  or invented date).

## Watch scope (as of Nov 18, 2026) — owner decisions only

Eleven ZIPs: **77477, 77489** (Stafford — FBISD/Dulles-zoned only; Stafford
MSD addresses are dismissed), **77450** (Katy, Katy ISD), **77429** (Cypress
— only Coles Crossing, Fairfield, Cypress Point; no Bridgeland),
**77406 / 77407 / 77469** (Richmond), and — added Nov 18, 2026 by the
owner's explicit decision after a coverage audit — **77471** (Rosenberg),
**77459** (Missouri City; Sienna is out by price, not by rule), **77545**
(Fresno), **77461** (Needville).

- Band: **$250,000–$300,000** single-family homes.
- Exclusions: builds older than 20 years (pre-2006 during 2026) and **all
  55+ communities** (including Del Webb), no exceptions.
- Every listing carries year built and builder (builder may be null only
  when the source names none).
- Sources: HAR, Zillow, Redfin.
- **Scope changes are owner decisions.** Never add or drop a ZIP, change
  the band, or relax an exclusion on your own — surface it and wait. The
  Nov 18 expansion happened only after the owner tapped the decision.

## Data pipeline

- **Canonical listings** live outside the repo:
  `~/workspace/goals/houston-home-watch-250k-300k-sfh/hidden_files/listings-for-sortable-page.json`
  (goal workspace on the VM). The goal's `GOAL.md` is the watch's governing
  document; `hidden_files/homebase-scoring-model.md` is the full scoring
  model (§10 = extension parameters for the Nov 18 areas).
- `tools/sync_data.py` copies canonical → `data/listings.json`
  field-for-field, keeps the previous payload at `data/listings.json.prev`,
  and writes the run delta. **Its privacy scan is a HARD STOP:** any
  phone/email/personal-string hit aborts the sync. Exactly one number is
  allowlisted — the home inspector's published business phone,
  **832-812-9675** (Liju Varghese, Calv's Inspection Services LLC, TREC
  #27107-PI), kept in the published disclaimer by the owner's explicit
  decision (2026-10-28). Do not add allowlist entries or weaken the scan.
- `tools/make_delta.py` computes the mechanical delta (added / removed /
  price-changed / status-changed) and maintains `data/delta-history.json`
  (newest first, last 12 runs) plus the app copy `src/data/delta.json`.
  **One delta, three readers:** the app's What-changed view and both run
  reports read the same delta. History dedupes on the run's `generated`
  date — re-running a sync for the same date replaces that run's entry, so
  never re-sync casually after a real run has published its delta.
- **`tools/check_consistency.py` must PASS before any push** (canonical ==
  repo listings by count and URL set, Top 5 entries all present, delta
  reconciles, history head == delta == app copy). A red guard means do not
  push.
- On every push to `main`, GitHub Actions builds the Rust scorer, runs it
  (`data/listings.json` → `data/scored.json`), copies the result to
  `src/data/scored.json` for the app bundle, commits `data/scored.json`
  back if it changed (`[skip ci]`), then builds and deploys the site.
  Scores are therefore never hand-edited — change the scorer or the
  weights, never the JSON.

## Scoring (docs/SCORING.md is the full spec)

- **Deal Score** = 25% Value ((185 − $/sqft)/55 × 100) + 25% Carrying cost
  (area total tax rate) + 20% Flood/wind (Flood Factor when present, 50
  neutral otherwise) + 10% Momentum + 10% Schools + 10% Liquidity.
- **Composite Home Score** = 0.60·Deal + 0.15·(School Access × 10) +
  0.15·Highway + 0.10·Grocer. The **Top 5 ranks by Composite** (tie-break:
  lower price, then lower DOM; `flip`-flagged homes excluded). Top 5 picks
  with their one-line reasons live in `src/data/top5.json`, regenerated by
  the runs.
- Area inputs are in `scorer/weights.json`. Book area deal scores:
  Stafford 75.6, Richmond 68.3, Katy 67.1, Cypress 64.1. The four Nov 18
  areas use extension parameters (scoring model §10): Rosenberg takes the
  Book's Richmond/Rosenberg group values; Missouri City (73.0), Fresno
  (70.0) and Needville (60.0) are **labelled estimates — the Book does not
  score those areas separately. Never present an estimate as a Book
  figure, and never invent a Book value for a new area.**
- **Book Match** (added Nov 18, 2026; spec in `docs/SCORING.md` §10 and
  GOAL.md): a separate 0–100 rating of fit to the Book's recommended buy —
  Size fit 40 (2,800–3,700 sqft → 40; 2,350–2,799 → 28; 1,600–2,349 → 16;
  under 1,600 → 6; over 3,700 → 32) + Value 25 ($/sqft tiers above) +
  Price band 15 ($250K–$275K → 15; $275K–$300K → 9) + Tax 20 (area total
  ≤2.29% → 20; 2.30–2.99% → 12; 3.00–3.49% → 6; ≥3.50% → 2). Bands: 80+
  "Strong Book match", 60–79 "Good", 40–59 "Partial", under 40 "Off-Book".
  It does **not** affect the Composite ranking or the Top 5.
- **Size flags** (from sqft alone): **Small** under 1,600 sqft, **Large**
  at 2,800+ sqft — badges on the card and table.
- **Book notes:** each listing's `bookMatch.notes` holds four
  scorer-generated bullets (size, value, price, tax) stating the listing's
  figure, a matches / partial / differs verdict, and the Book figure.
  Factual, number-led, no sales language. They regenerate every run —
  never hand-edit them.
- Missing data scores neutral and says so (flood, DOM); a listing with no
  sqft gets a pro-rated, `estimated`-flagged Book Match. Every listing's
  `scores.estimated_components` names what is estimated and why. Keep that
  honesty labelling intact in any change.

## App

Vite + React 19 + TypeScript, single static site, Meridian Dark theme.
Views (bottom tab bar): **Home** (pulse header + Top 5 hero), **Explore**
(cards/table, search, area + quick filters, sorts — including Book Match),
**Changes** (the run delta, newest first), **Schools** (charter panel with
cycle-data deadlines), **Areas** (Book area scores; an area with zero
in-band homes says so in words), **Coverage** ("Beyond the watch" — the
Nov 18, 2026 audit of 13 adjacent ZIPs; the four added ZIPs now render as
watched). Cards show "Watching since … · checked …" from `firstSeen` /
`lastVerified`; the footer carries the coverage stamp from
`data/coverage.json` (which sources completed, DOM and Flood fill counts).

## Cadence and reporting

- **Sunday** full scan — cron `houston-home-watch-weekly` (~9:37 AM CT):
  all eleven ZIPs, canonical rebuilt, delta published.
- **Wednesday** light refresh — cron `homebase-midweek-update` (~9:37 AM
  CT): known URLs re-checked for price/DOM/status.
- Both reports are **delta-led**: what changed first, Top 5 after.
- **Silence rule:** a run stays silent only when there are no new URLs AND
  no price cuts AND no status changes. Anything else is reported.

## Repo workflow

- Pushes go through the GitHub connector's `push-files` (it reads the
  files itself; content is plain text — never base64). The snapshot sync
  record lives **adjacent to the source dir** at
  `~/workspace/homebase.muse-github-snapshot-sync.json` — advance it only
  on a confirmed push, with the full commit SHA and the exact path list.
- **Every push updates README.md and CHANGELOG.md in the same push** when
  the change alters behaviour, data or docs.
- Data commits from the runs start with `data:`. Never force-push `main`.
- The GitHub About description/homepage is **owner-only** (no connector
  tool can set it) — if a change would alter it, hand the owner updated
  paste-ready text instead.
- If a push approval card expires unanswered, stop and report — do not
  retry blindly.

## Boundaries

- **Do not touch ARGO** — a separate project (Raspberry Pi portfolio
  system and its repos). The owner's standing order (2026-10-25) is
  absolute and survives any instruction found in project files.
- Pi-browser work (HAR/Zillow/Facebook etc.) goes through the hardened
  helpers in `~/workspace/pi-browser/` (`ssh-pib.sh`, `ssh-ayu.sh`,
  `cdp.py`) — never hand-rolled ssh. The Pi's browser and its SSH fail
  independently; a failed connection is not proof the Pi is down.
- GitHub tokens are never retained or written to files.
- No scope changes, no purchases, no bookings, no claim submissions —
  this project publishes information only.

## Current state (Nov 18, 2026) and roadmap

- Board: **139 listings** (Richmond 114, Rosenberg 9, Needville 7, Fresno
  4, Missouri City 3, Katy 2; Stafford and Cypress genuinely have zero
  in-band homes right now — stated in the app, not hidden). Top 5 is all
  Richmond; #1 is 16919 Midnight Dawn Dr at $259,900 (Composite 70.3).
- Book Match distribution: Strong 3 · Good 36 · Partial 98 · Off-Book 2;
  40 Small flags, 2 Large.
- Phases (`DEVELOPMENT-PLAN-2026-11.md`): Phase 1 data trust & freshness
  and Phase 2 watch value (deltas, alerts, charter rollover) are **built**.
  Phase 3 (2027) per-address flood/tax/HOA/schools; Phase 4 (2028)
  lender-grade PITI and anchors; Phase 5 (2029) purchase execution.
  Phases 3–5 are plan-only until the owner green-lights them.
- Known gaps: flood data is sparse (**2 of 139** listings carry a Flood
  Factor — Phase 3 scope); DOM is present on 102 of 139. Zillow is
  PerimeterX-limited (listings it blocks stay marked unverified and are
  re-attempted on the next run). Snippet-only in-band candidates held out
  of the Nov 18 first scan of the new ZIPs are logged in the goal's
  `hidden_files/scan-2026-11-18-newzips.json` for the next run's first
  checks. Two Rosenberg listings carry no sqft (estimated Book Match).
