# Changelog

## 2026-11-27 — New logo: the Meridian Dial

The app has a new mark, the **"Meridian Dial"**. It's a brass instrument ring whose
needle is a roof pointing north, with a teal hub and a teal north tick, on the
Meridian Dark blue-black. It replaces the brass house/H icon.

- `public/icons/icon.svg`, `icon-maskable.svg`, the new `favicon.svg` (a simplified
  cut for browser tabs) and `mark.svg` (shown beside the HOMEBASE wordmark in the
  Home header).
- `tools/make-icons.mjs` now draws the dial for the generated PNGs (192, 512 and
  512 maskable), which are also listed in the manifest. They are still built at
  `prebuild` and not committed.
- Service worker cache bumped to `homebase-v2`. Logo masters and usage notes
  are in `docs/brand/`.
- No data, scoring or scope changes.

## 2026-11-18 — Book Match rating, size flags, per-listing Book notes

Owner-ordered: every listing now carries a rating of how well it matches
*The Houston Book, Edition 2*, an indication for abnormally small or large
homes, and a point-wise note on how it matches and differs from the Book.

- **Scorer (`scorer/src/main.rs`):** new per-listing `bookMatch` object,
  computed on every run — score 0–100 from Size fit 40 (Book's recommended
  2,800–3,700 sqft) + Value 25 (Ch 16 $/sqft tiers) + Price band 15
  (honest band $250K–$275K) + Tax 20 (area total vs the Book's 1.73–2.29%
  watch-area range). Bands: 80+ "Strong Book match", 60–79 "Good",
  40–59 "Partial", under 40 "Off-Book". A listing with no size in the
  source is pro-rated on the remaining components and flagged estimated
  (2 listings). **Size flags** from sqft alone: Small under 1,600, Large
  at 2,800+. **Notes:** four generated bullets per listing (size, value,
  price, tax), each with the listing's figure, a matches / partial /
  differs verdict and the Book figure — stored in the record, regenerated
  every run, never hand-edited. Definition: `docs/SCORING.md` §10.
- **App:** Book Match caption under the deal ring on every card (asterisk
  when estimated), Small / Large badge on the card, a "Book" column in
  table view, a collapsed-by-default "Book match" section in the detail
  view (component points + the four note bullets), and a "Book Match:
  highest first" sort in Explore.
- **First distribution (139 listings):** Strong 3 · Good 36 · Partial 98 ·
  Off-Book 2; 40 Small flags, 2 Large. Top by Book Match: 7326 Audubon
  Russet Dr, Richmond — 94 ($290,000, 3,028 sqft, $96/sqft).
- **`CLAUDE.md`** added at the repo root: the project handoff brief for
  Claude (also filed in the goal workspace).

## 2026-11-18 — Watch expands to eleven ZIPs (owner's decision)

Acting on the coverage audit below, the owner added four ZIPs to the home
watch the same day: **77471 Rosenberg, 77545 Fresno, 77459 Missouri City,
77461 Needville**. The watch now scans eleven ZIPs.

- **Coverage view:** the four ZIPs no longer render as "beyond the watch" —
  they appear as watched ground on the map and in a new "Added to the
  watch — Nov 18, 2026" card section; the audit stamp line records the
  update. The remaining nine audited ZIPs stay outside the footprint.
- **Scorer:** `scorer/weights.json` gains the four areas (parameters in the
  scoring model §10, goal workspace): Rosenberg (Lamar CISD, Book school
  access 5.75, total tax 2.75%), Missouri City (Fort Bend ISD, Book school
  access 8.5, total tax 2.60% est), Fresno (Fort Bend ISD, school access
  8.5 est, total tax 3.00%), Needville (Needville ISD 1.2869% — Fort Bend
  CAD 2025 — total tax 3.55% at Monarch Landing, which clamps its
  carrying-cost component to 0 by design).
- **App area tables** (`src/lib/types.ts`): AREAS, colours, book scores and
  school access now include Rosenberg, Missouri City, Fresno and Needville,
  so the new areas filter, colour and battle like the original four.
- The watch's governing records (GOAL.md scope section, shortlist scan
  rules, both scan crons) were updated in the goal workspace in the same
  change; all other watch rules are unchanged.

## 2026-11-18 — Coverage audit view: "Beyond the watch"

Owner-requested after a TikTok flyer for a "Richmond" home turned out to
be Lennar's Cobb plan at Monarch Landing, Needville 77461 — outside the
watch's seven scanned ZIPs, with real in-band homes ($247,990–$272,990
inventory) the scans never see.

- **New Coverage tab:** a static, informational view (no listing data, no
  pipeline change). A hand-built schematic SVG map — Stafford at the
  centre, the seven watched ZIPs marked as covered, and 13 adjacent ZIPs
  placed by ZIP centroid in their true relative directions, colour-coded
  by verdict, with straight-line distance and estimated drive time on
  every marker. Monarch Landing is called out as the case that prompted
  the audit. The map is labelled "schematic — not to scale"; drive times
  are marked as unverified estimates.
- **Audit findings (community-level evidence, audited Nov 18, 2026):**
  nine real misses with in-band new construction outside the footprint —
  Rosenberg 77471 (Holly Ridge / Milo Farms from $239,990), Fresno 77545
  (Olympia Falls from $238,995), Missouri City 77459 (Parkway Commons
  from $249,990), Needville 77461, Beasley 77417 (Emberly, three
  builders), Iowa Colony 77583, Brookshire 77423 (Sunterra Lakes),
  Katy North 77493 (Sunterra) and Fulshear 77441 (Tamarron / Summerview,
  narrow). Three marginal: Cypress 77433 (Bridgeland exclusion verified —
  detached from ~$380K; only a thin Marvida pocket in band), Katy South
  77494 (Tamarron edge only) and Wallis 77485 (Millbrooke to-be-built
  only). One correctly out: Orchard 77464 (no new-build community).
- **Per-area cards** under the map carry district, total tax rate
  (like-with-like totals — Monarch Landing ≈3.55% community total vs the
  Book's watch-area totals of 1.73–2.29%; district-only rates are named
  as such), notable communities with builders and starting prices, and a
  one-line verdict note.
- The entrance is unchanged — the view is a new tab only. Adding any of
  these ZIPs to the watch remains an owner decision; this view changes
  no scope.

## 2026-11-17 — Phase 2: watch value (deltas, alerts, deadlines)

Built from `DEVELOPMENT-PLAN-2026-11.md` Phase 2 (owner green-lit
2026-11-17 as the first of the repo development sequence).

- **"What changed" view:** new Changes tab rendering the run delta —
  new homes, price cuts and rises with $ and %, status changes and
  removals, newest run first. Rows for homes still on the board open the
  listing detail; removed homes link out to the listing.
- **Delta history:** `tools/make_delta.py` / `tools/sync_data.py` now
  keep `data/delta-history.json` (newest first, last 12 runs) and copy it
  to `src/data/delta.json` for the app. One delta, three readers: the
  app, the Wednesday report and the Sunday report all read the same
  numbers. The consistency guard fails when the history's newest run
  disagrees with `data/delta.json` or the app copy differs.
- **Run reports lead with the delta:** the Wednesday mid-week cron and
  the Sunday home-watch cron were updated so their chat reports open
  with price cuts (with $ and %), status changes to under-contract /
  pending / sold, and new-in-band counts from `data/delta.json` before
  anything else.
- **Charter-deadline rollover:** `src/data/charter.ts` deadlines are now
  cycle data. After the 2026–27 cycle's March 2027 dates pass, the panel
  rolls to the 2027–28 cycle (Harmony enrolment Nov 2027 – Feb 2028,
  KIPP lottery Jan 2028) and shows "dates pending publication" until the
  districts publish — never a countdown to a past date. The Book's rule
  stands: plan on the zoned campus; charter is lottery upside only.
- **Stafford/Cypress honesty state:** when an area has zero homes in the
  $250K–$300K band, Area Battle and the Explore empty state say so in
  words ("No homes in the $250K–$300K band in Stafford this run — the
  Book's top-rated area is also its scarcest in band.") instead of an
  empty list presented as a full comparison.
- **Freshness surfacing:** listing cards show "Watching since … ·
  checked …" when no flag or caution takes the line; the detail view
  gains Builder and Status rows plus first-seen (with days on the
  watch), last-verified, and the full price-history sequence with
  per-step changes. The "new this run" quick filter now reads
  `firstSeen` (a home is new in the run whose date it was first seen)
  instead of the sticky `new` flag, which no longer drives anything.

## 2026-11-08 — Phase 1: data trust & freshness

Built from `DEVELOPMENT-PLAN-2026-11.md` Phase 1, guided by *The Houston
Book, Edition 2* (purchase window 2029 confirmed by the owner 2026-11-08;
scoring weights and formulas unchanged).

- **Schema:** every listing in `data/listings.json` now carries `builder`
  (nullable — filled only where a source names one, never guessed),
  `status` (active / under-contract / pending / sold / unknown, derived
  from on-record evidence), `firstSeen` and `lastVerified` dates, and an
  append-only `priceHistory`. The Rust scorer passes the new fields
  through untouched.
- **Delta:** `tools/sync_data.py` now keeps the previous payload at
  `data/listings.json.prev` and emits a mechanical `data/delta.json`
  (added / removed / price-changed with $ and % / status-changed) on every
  sync; a copy is kept in the goal workspace as `delta-latest.json`.
  Standalone differ: `tools/make_delta.py`.
- **Consistency guard:** `tools/check_consistency.py` fails the publish
  when canonical and repo counts (or URL sets) differ, when a Top 5 entry
  is missing from `listings.json`, or when `delta.json` does not
  reconcile. It must pass before any push, on both publish paths.
- **DOM backfill:** days-on-market pulled for previously null listings
  from HAR / Redfin / Zillow detail pages read in the Pi browser
  (server-side fetches of HAR and Redfin are hard-blocked). Coverage is
  stated honestly in `data/coverage.json` — what was filled, what is
  still null.
- **Coverage stamp:** `data/coverage.json` ships with the data, and the
  app footer now shows "Data as of <date> · coverage: <summary>".
- **Plan:** `DEVELOPMENT-PLAN-2026-11.md` completed — Phase 2 finished,
  Phases 3–5 (per-address facts 2027, lender-grade money 2028, purchase
  execution 2029) written out. Goal purchase window reconciled 2028 →
  2029 per Edition 2.
