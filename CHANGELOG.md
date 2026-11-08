# Changelog

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
