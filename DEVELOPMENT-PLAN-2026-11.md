# HomeBase — Development Plan

**Written:** 2026-11-03 · **Status:** Phase 1 BUILT 2026-11-08 (owner green-lit
2026-11-08, "using the document as a guide", Book Edition 2 governs — purchase
window 2029 confirmed). Phases 2–5 completed as plan text 2026-11-08; they
remain plan-only until separately green-lit.
**Scope:** HomeBase dashboard (https://ayaan40000.github.io/Homebase/, repo `ayaan40000/Homebase`),
its data pipeline (home-watch goal → `tools/sync_data.py` → Rust scorer → GitHub Actions → Pages),
and the features worth building between now and the 2029 purchase window.

---

## 1. Current-state review

### 1.1 What exists (verified in the files, 2026-11-03)

**App** — Vite + React + TypeScript, "Meridian Dark" theme, mobile-first. Components:
`PulseHeader` (tracked count, median price / $/sqft / DOM, under-anchor count, top score),
`TopFiveHero` (Top 5 by Composite, Command Pick, status cautions surfaced on-card),
`HomeCard` / `HomeTable` (Deal Score ring, Composite, Schools/Highway/Grocer bars, PITI +
front-end-ratio strip), `ControlDeck` (search, area filters, quick filters — under-anchor,
score 70+, new-this-run, price cuts, schools 8+ — and 7 sort orders), `AreaBattle` (book area
scores as filters), `CharterPanel` (charter rule, enrolment deadlines with **live countdowns**,
campus table, district strip), `MethodologyDrawer` (formulas in plain language).

**Scoring** — Rust scorer in CI (`scorer/`), weights in `scorer/weights.json` (book changes are
data edits). Book Deal Score = Value 25 / Carrying cost 25 / Flood-wind 20 / Momentum 10 /
Schools 10 / Liquidity 10. Composite = 0.60·Deal + 0.15·(Schools×10) + 0.15·Highway +
0.10·Grocer. Ratios at 7.32% / 30-yr / $75K down / $100K income, corrected homestead tax
formula. Honesty rules are documented (`docs/SCORING.md` §9): estimates are labelled per
component, missing data scores neutral and says so.

**Pipeline** — canonical listings JSON in the goal workspace →
`tools/sync_data.py` (field-for-field copy + hard privacy gate; exactly one allowlisted phone —
the inspector's business number, owner decision 2026-10-28) → repo `data/listings.json` →
GitHub Actions runs the scorer, commits `data/scored.json` back, copies it into `src/data/`,
builds and deploys to Pages. Cadence: Sunday full scan (Redfin + HAR + Zillow), Wednesday
light refresh (~09:37 CT, `data:` commits) is the publishing run.

### 1.2 What's stale

| Item | State |
|---|---|
| Live site data | Oct 28, 2026 refresh: 123 homes. The canonical set has been **131 since Nov 1** (7 scan matches + the Zillow-supplement Harmony Summit home). The 8 newest homes reach the site only on the Wed Nov 4 midweek run. |
| Local checkout consistency | `data/scored.json` in the local tree is generated **2026-10-25 with 128 listings**, while `data/listings.json` beside it is 2026-10-28 with **123**. CI regenerates scored data on push, so the live site is safe — but nothing in the pipeline *checks* that scored output matches its input before publish. |
| README | Still says "123 scored homes … as of the Oct 28 refresh" — correct for the live site today, wrong the moment the 131 sync lands. |
| Top 5 source | `src/data/top5.json` is a second, hand-carried Top 5 file (generated 2026-10-28) alongside the scorer's own ranking — two sources of truth for the same list. |
| Charter deadlines | Hard-coded in `src/data/charter.ts` for the 2026–27 cycle (Harmony close Feb 10, 2027; KIPP Jan 25, 2027; lotteries Feb 2027; new Harmony Rosenberg/Pearland Mar 15, 2027). After Mar 2027 they go silently stale — no rollover mechanism. |
| Purchase window | `GOAL.md` says **2028**; *The Houston Book Edition 2* (the model's source) says **2029**. One-line fix, but it must be reconciled deliberately, not by accident — phase timing below assumes the Book's 2029. |

### 1.3 Data-quality health (canonical JSON, 131 listings, checked 2026-11-03)

- **DOM missing on 106 of 131 (81%).** Momentum and Liquidity are 20 of the Deal Score's 100
  points and are neutral-by-default without DOM. The Oct 28 run deliberately carried DOMs
  forward rather than fill them for only the Top 5 — the right call, still unfixed.
- **Flood Factor on 1 of 131.** Flood/wind is 20% of the Deal Score and is the neutral 50 for
  ~99% of homes. The single biggest gap between the score's precision and its inputs.
- **Year built missing on 16**, beds on 3, baths on 7. Year matters: the post-2006 screen is a
  hard filter and unknown-year homes are kept on trust.
- **No `builder` field exists in the schema at all** — despite the standing requirement
  (2026-10-11) that every listing carry year built *and builder*.
- **No status field.** Sold/pending/under-contract lives in free-text `flags`/`highlights`;
  the app renders cautions from it, but nothing can count, filter, or alert on status reliably.
- **No price history.** A price cut is a flag plus prose in the watch log (Oct 28 alone found
  14 cuts totalling $122,091). The amounts, dates, and sequences are not in the data.
- **No first-seen / last-verified timestamps** per listing, so "new this run" depends on run
  bookkeeping outside the data, and staleness per home is invisible.
- **Area skew:** Richmond 128, Katy 3, **Stafford 0, Cypress 0** — yet Stafford is the book's
  top area (75.6) and the dashboard presents a four-area battle where two areas have no
  homes in band. The watch's value in Stafford/Cypress is currently "nothing qualifies,"
  which the UI never says out loud.
- **Duplicate risk is manual:** 7607 Marbella Mtn (HAR) and 7607 Marbella Mountain (Zillow)
  are the same house held as two records since Oct 28, flagged for a merge decision.
- `docs/SCORING.md` §8 says the same thing from the model side: 4 of 6 Deal components are
  area proxies or neutrals; access scores are inherited from the area, never measured at the
  address; HOA is hidden on most listings, so most PITIs are lower bounds.

### 1.4 Pipeline fragility

- **Pages source** must stay "GitHub Actions." The Nov 1 flip to branch deploy served raw
  source and took the site down; the fix is documented in the README but nothing automated
  watches for a recurrence.
- **Source access is the ceiling.** Zillow PerimeterX limited the Nov 1 supplement to page 1
  of every ZIP; HAR gates on press-and-hold; Redfin has thrown CloudFront 403s for whole
  ZIPs (Oct 18). Partial scans are a normal week, not an exception — and partial results
  have been published before without a coverage marker.
- **The privacy gate works** (it stopped the Oct 28 publish for a day until the inspector's
  number was allowlisted by owner decision) — keep it exactly as strict as it is.
- **Push mechanics:** Homebase bulk pushes return 403; publishing is per-file Contents API
  writes with `data:` commit messages, reconciled via the snapshot-sync record. Slow but
  reliable; any new published file must fit that pattern.
- **Bus factor:** the scorer is a Rust crate only this toolchain builds; CI caches it, but a
  weights/schema change needs the full Actions loop to verify.

---

## 2. Phased development plan

Horizon logic: buying is a **2029** event (Book Edition 2). Phases 1–2 make the *watch*
trustworthy now; Phase 3 replaces proxy data with per-address fact during 2027; Phase 4 makes
the money numbers lender-grade in 2028; Phase 5 is purchase execution, deliberately last.

### Phase 1 — Data trust & freshness (Nov–Dec 2026) · Effort: S–M (2–3 build sessions + 2 scan cycles) · **BUILT 2026-11-08**

Built as specified: schema fields (`builder`, `status`, `firstSeen`,
`lastVerified`, `priceHistory`) on all 115 canonical listings (builder filled
only where a source names one — never guessed; the Marbella pair closed out
sold in the 2026-11-07 run, so deliverable 5's dedupe was already resolved);
`data/delta.json` emitted mechanically by the sync; `tools/check_consistency.py`
guard written and required before any push; coverage stamp in
`data/coverage.json` and in the app footer; DOM backfill run over every
null-DOM listing (HAR/Redfin server fetches are hard-blocked, so reads ran in
the Pi browser over CDP — final filled count is in the coverage stamp);
GOAL.md purchase window reconciled to the Book's 2029.

**Scope:** fix the inputs and the guardrails; no new user-facing features except honesty labels.

Deliverables:
1. Sync the 131-listing canonical set through the existing pipeline (already scheduled for
   the Nov 4 midweek run) and update the README count in the same push (repo rule).
2. **Consistency guard in the publish path:** a step that fails the run if
   `scored.json` listing count ≠ `listings.json` count, or if the generated dates disagree —
   the Oct 25/Oct 28 mismatch in §1.2 should be impossible to publish again.
3. **Run-delta file as a pipeline output:** every run emits `data/delta.json` — new,
   removed, price-changed (with $ and %), status-changed — computed mechanically from the
   previous canonical JSON, not reconstructed from prose.
4. **Schema additions to canonical listings:** `builder` (nullable), `status`
   (active / under-contract / pending / sold / unknown), `firstSeen`, `lastVerified`,
   `priceHistory` (append-only [{date, price}]). Scorer passes them through untouched;
   sync_data privacy gate unchanged.
5. **DOM backfill + Marbella dedupe:** one Sunday scan cycle that re-pulls DOM for all 131
   and merges the 7607 Marbella duplicate pair under one canonical record.
6. **Coverage stamp:** scored.json metadata records which sources completed (HAR/Redfin
   full, Zillow page-1-only, etc.) and the app footer shows "Data as of <date> · coverage:
   …". A thin week becomes visible instead of silent.
7. Reconcile GOAL.md's purchase window (2028 vs the Book's 2029) with the owner and fix the
   wrong document.

**Done looks like:** live site carries 131 homes with builder/status/history fields present,
a delta file and coverage stamp ship with every run, and a deliberately corrupted test sync
fails the guard instead of publishing.

Dependencies: none beyond the existing crons. Risks: schema change touches scorer
passthrough only — no weight changes.

### Phase 2 — Watch value: deltas, alerts, deadlines (Dec 2026–Feb 2027) · Effort: M (3–4 build sessions)

**Scope:** turn the pipeline's findings into signals Ayaan actually sees, timed to the
school-enrolment season that is open **right now**.

Deliverables:
1. **"What changed" view in the app:** renders `data/delta.json` — new homes, price cuts
   with amounts, status changes, removals — as its own view, newest run first,
   so a run's findings are readable without diffing prose watch-logs.
2. **Price-cut and status alerts in the run reports:** the Wednesday and
   Sunday reports lead with the delta (cuts with $ and %, homes going
   under-contract / pending / sold, new-in-band), computed from
   `data/delta.json` — the same numbers the app shows, never re-derived.
3. **Charter-deadline rollover:** the deadlines in `src/data/charter.ts`
   become cycle data, not constants — after the Mar 2027 dates pass, the
   panel rolls to the 2027–28 cycle (Harmony enrolment Nov 2027 – Feb 2028,
   KIPP lottery Jan 2028) and shows "dates pending publication" until the
   districts publish, instead of silently counting down to a past date.
   The Book's rule does not change: plan on the zoned campus; a charter
   seat is lottery upside, never the plan.
4. **Stafford / Cypress honesty state:** when an area has zero homes in
   band, the Area Battle and the area filter say so in words ("No homes in
   the $250K–$300K band in Stafford this run — the Book's top-rated area is
   also its scarcest in band") instead of presenting an empty list as if
   it were a full comparison.
5. **Freshness surfacing:** `firstSeen` / `lastVerified` / `priceHistory`
   from Phase 1 render on the card (age of the record, cut sequence), and
   the "new this run" quick filter reads `firstSeen` instead of run
   bookkeeping.

**Done looks like:** every Wednesday/Sunday report and the app show the same
delta; no charter countdown can point at a past date; an empty area reads as
an honest finding, not a blank.

Dependencies: Phase 1 (delta file, schema fields). Risks: none to scoring —
presentation and reporting only.

### Phase 3 — Per-address facts (2027) · Effort: L (spread across the year's scan cycles)

**Scope:** replace the v1 area proxies and neutral defaults with facts
measured at the address, one component at a time, each labelled with its
source and date. The Book's weights do not change; the inputs stop being
guesses.

Deliverables:
1. **Measured flood:** Flood Factor (or FEMA zone + elevation where Factor is
   unavailable) on every listing, refreshed when a listing is re-verified —
   Flood/wind is 20% of the Deal Score and was neutral-50 for ~99% of homes
   at the Phase 1 baseline. Each value carries its source and read date.
2. **Real tax at the address:** county appraisal district lookup per listing
   (actual taxing entities and rates for the parcel, homestead exemption as
   the Book's corrected formula applies it), replacing the one-rate-per-area
   carrying-cost input.
3. **Real HOA at the address:** HOA amount and frequency from the listing /
   subdivision record on every listing; where HOA stays hidden, PITI keeps
   its "lower bound" label — never a silent zero.
4. **Schools at the address:** zoned campus names and ratings per listing
   (not district-level), so the Schools component and the RatioStrip reflect
   the actual zoned schools the Book says to plan on.
5. **Access measured, not inherited:** highway and grocer access scored from
   the address (drive-time / distance to the named corridors and stores)
   instead of the area constant all Richmond homes currently share.
6. **DOM and price history kept live:** the Wednesday run maintains `dom`
   and appends to `priceHistory` on every observed change, so Momentum and
   Liquidity run on data, not defaults.

**Done looks like:** every Deal Score component on every card is either a
measured value with a source + date, or is visibly labelled an estimate —
the §9 honesty rules graduate from disclosure to fact.

Dependencies: Phase 1 schema (fields to hold the facts), Phase 2 freshness
surfacing. Risks: source rate limits (appraisal and flood lookups pace like
the listing sources do); a measured component can move a home's rank — that
is the point, and the delta report shows it.

### Phase 4 — Lender-grade money numbers (2028) · Effort: M

**Scope:** the year before the purchase window, make every dollar figure on
the board defensible to a lender, an insurer, and the family's own budget —
still the Book's model, now fed with real inputs.

Deliverables:
1. **PITI with confidence:** principal + interest at the Book's 7.32% /
   30-year / $75K-down structure (rate refreshed to the then-current Freddie
   Mac figure as a data edit), tax from Phase 3's per-parcel rates,
   insurance quoted per area/flood profile instead of the flat $200/mo book
   estimate, HOA from Phase 3's actuals. Each PITI shows which inputs are
   measured and which are still estimates.
2. **Anchor tracking against live income:** the front-end ratio is computed
   against the Book's anchors ($301K at 28% on $100K; $327K at 31%; $350K
   at $120K income) with the income figure itself a dated input, so a raise
   or a rate move re-anchors the board instead of silently aging it.
3. **Total-cost view:** closing-cost and cash-to-close estimate per finalist
   (down + closing on top, per Edition 2), and the no-PMI boundary ($375K
   at 20%+ down) shown where a price approaches it.
4. **Finalist shortlist mode:** a maintained top-10 by Composite with full
   Phase 3 facts and Phase 4 money, replacing the all-115 board as the
   default working view for the purchase year.

**Done looks like:** for any finalist, the family can see one number for
monthly cost and one for cash to close, each with its inputs named, and
both traceable to the Book's anchors.

Dependencies: Phase 3 (per-address tax/HOA/insurance inputs). Risks: rate
and income inputs go stale — both are dated and the board shows the dates.

### Phase 5 — Purchase execution (2029) · Effort: M, timed to the window

**Scope:** the Book's endgame — turn the watch into a purchase, in the 2029
window Edition 2 sets.

Deliverables:
1. **Finalist workflow:** a per-home checklist state (tour, disclosures,
   flood/tax verification, inspection booked, offer, contract) carried in
   the data, so the finalist's file is the dashboard, not a chat thread.
2. **Inspector handoff:** one tap from a finalist card to Liju Varghese,
   Calv's Inspection Services LLC (TREC #27107-PI) — the inspector already
   named in the listings disclaimer — with the home's Phase 3 facts
   attached to the booking note.
3. **Offer math against the anchors:** offer price tested live against the
   Book's front-end anchors and the no-PMI boundary before it is made;
   price cuts on a finalist alert the same run they are seen (Phase 2
   alerts, finalist-priority).
4. **Close-out:** on purchase, the board freezes as the search record —
   final delta, the bought home's full history, and the watch crons retire
   per the goal's own completion rule.

**Done looks like:** one home bought inside the Book's anchors, with the
whole trail — first seen, every cut, every fact, the inspection, the offer
math — in the data the dashboard already keeps.

Dependencies: Phases 2–4. Risks: none technical; timing is the family's,
and the system stays a watch until they say otherwise.
...[truncated 9278 chars]