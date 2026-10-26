# HomeBase — Platform / Architecture Plan

Status: DECIDED 2026-10-25. Scope: repo, stack, update cadence, risks, build order.
Design theme/UI and the scoring model itself are separate specs; this plan only fixes
the platform they land on. One open item by design: repo creation may be an owner step (§1).

Facts this plan is built on (verified 2026-10-25):
- Canonical data today: `hidden_files/listings-for-sortable-page.json` in this goal —
  128 listings, fixed schema (url, address, area, areaRank 1–4, subdivision, price, beds,
  baths, sqft, year, dom, hoa, schools, flood, flags[], highlights[], inspector, ppsf),
  plus `removed_over_20_years` / `removed_55plus` logs. Refreshed by the Sunday scan.
- HaulBoard precedent: repo `ayaan40000/haulboard`, Pages at ayaan40000.github.io/haulboard.
  The GitHub connector's `create_repository` failed 403 "Resource not accessible by
  integration" (Oct 24–25, 2026); Ayaan created the empty repo himself, added it to the
  Muse GitHub App's selected repositories, and connector `push_files` then worked.
  Pushes are logged in a snapshot-sync record (owner/repo/branch/commit_sha/paths).

## 1. Repo plan

- **Name: `homebase`** → `ayaan40000/homebase`, Pages at `ayaan40000.github.io/homebase`.
  No conflict found: his known repos are Orale (public), ayu-studio (private),
  ayu-muse-inbox (private), haulboard (public) — no "homebase" among them (repo list
  cannot be enumerated reliably through the connector, so this is "no known conflict",
  confirmed for real at creation time; names are unique per owner, so nobody else can
  take it inside his account).
- Public repo (Pages free tier + the listings are public data; same call as HaulBoard).
- **Creation path:** try the connector's `create_repository` once. On 403 (expected,
  per HaulBoard history), it becomes an owner step — exact steps that worked for haulboard:
  1. Go to github.com/new, name `homebase`, Public, and create it EMPTY — no README,
     no .gitignore, no license (initial files break the first connector push).
  2. Add the repo to the Muse GitHub App: GitHub → Settings → Applications →
     Muse → Configure → Repository access → "Only select repositories" → add `homebase`.
  3. Tell Muse it's done; Muse verifies empty (list_commits → 409 "Git Repository
     is empty") before the first push.
- After creation, set Pages source to **GitHub Actions** (Settings → Pages → Build and
  deployment → Source: GitHub Actions). No `gh-pages` branch is used.

## 2. Stack

- **Frontend:** React + TypeScript + Vite, static build only — no backend, no database,
  no runtime secrets. Vite `base` set to `/homebase/` so asset/data paths work under Pages.
  Single-page dashboard (no router; if views are added later, use hash routing — Pages
  has no SPA fallback).
- **Scorer (Rust):** a small binary crate at `scorer/` (`Cargo.toml`, `src/main.rs`).
  Contract: `scorer --in data/listings.json --out data/scored.json` (plus a scoring-config
  JSON argument once the scoring spec lands — weights live in config, never hard-coded,
  so book/band changes like Edition 2's are data edits, not code edits). Output: the
  listings enriched with ratios and component + total scores, a per-area Top 5 and an
  overall Top 5, and a metadata block (generated timestamp, scorer version, source
  coverage). Why Rust here: the scoring is the one place correctness matters more than
  convenience — strong types make ratio/unit mistakes (per-sqft vs total, tax formula
  inputs) compile errors instead of silent wrong numbers, serde gives strict schema
  validation of the canonical JSON (a malformed listing fails the build loudly), and a
  single deterministic binary means Sunday, Wednesday, and CI all score identically.
- **Where the scorer runs:** in the GitHub Actions workflow on every push to `main`
  (the update pipeline's second half). The workflow runs the scorer, and if the result
  differs from the committed `data/scored.json` it commits the fresh one back with a
  `[skip ci]` message and a diff-guard so it cannot loop. This keeps `data/scored.json`
  in the repo exactly as the update jobs intend — generated and committed by the update
  pipeline — while the VM/cron side never needs a local Rust toolchain.
  Slow-build fallback: `Swatinem/rust-cache` keyed on `scorer/Cargo.lock` (the crate is
  tiny; cold build ~1–2 min, cached <20 s). If Actions minutes ever become a problem,
  the fallback is a prebuilt scorer binary committed under `scorer/bin/` — not v1.
- **Data sync (Python):** one small script, `tools/sync_data.py`, run by the Sunday and
  Wednesday jobs on the VM: copies the canonical goal JSON to the repo staging folder as
  `data/listings.json` (field-for-field, no transforms — transforms belong to the scorer),
  runs the privacy scan (§3), and hands the file set to the connector push.
- **Repo layout (app at root — chosen over an `app/` subdir: one Vite root keeps the
  Pages base path, the workflow, and data paths simple; subdirs are for data and scorer):**

```
homebase/
├── index.html                  # Vite entry
├── vite.config.ts              # base: '/homebase/'
├── package.json / tsconfig.json
├── src/                        # React + TS app (components, hooks, lib)
│   └── data.ts                 # loads data/scored.json at runtime
├── data/
│   ├── listings.json           # canonical copy, pushed by Sun/Wed jobs
│   └── scored.json             # generated by the update pipeline (Actions scorer)
├── scorer/
│   ├── Cargo.toml
│   ├── Cargo.lock
│   └── src/main.rs             # listings.json -> scored.json, strict serde schema
├── tools/
│   └── sync_data.py            # canonical JSON -> data/listings.json + privacy scan
├── .github/workflows/
│   └── deploy.yml              # scorer -> vite build -> Pages deploy, on push to main
├── .nojekyll
└── README.md                   # what this is, data sources, last-update stamp
```

- **Deploy:** `deploy.yml` = checkout → setup-node (npm ci) → rust-cache → cargo build
  --release → run scorer → commit scored.json if changed ([skip ci]) → `npm run build`
  (scored.json copied into `dist/data/`) → actions/upload-pages-artifact →
  actions/deploy-pages. The site reads only `dist/data/scored.json`; it never calls an API.

## 3. Update cadence

| | Sunday (existing, extended) | Wednesday (NEW) |
|---|---|---|
| When | ~9:37 AM CT (unchanged) | ~9:37 AM CT (matches his other 9:37 jobs) |
| Scope | FULL scan: Redfin + HAR + Zillow, all target ZIPs, new-listing discovery, dismissals, age (>20 yr) and 55+ screens, canonical JSON rebuilt locally | LIGHT refresh: re-fetch the known listing URLs already in the JSON (HAR/Redfin detail first), update price / DOM / status, mark sold/pending/under-contract, drop dead URLs to a removed list |
| Scoring | Re-score all, regenerate Top 5 overall + Top 5 per area | Re-score all, regenerate Top 5s (mid-week Top 5 can move on price cuts/DOM alone) |
| School/highway/grocer data | Refreshed if an area table changed | Not re-researched — v1 data is area-level (per area/subdivision), carried in the scoring config |
| Publish | Copy → privacy scan → connector push → Actions scorer+deploy → verify live | Same pipeline, same push pattern |
| Chat | Existing rule: silent unless new matches | Silent unless a Top 5 changes or a tracked listing cuts price / goes pending |

- **Push mechanics (same as HaulBoard):** connector `push_files` to `main`, then append a
  record to `hidden_files/homebase-github-snapshot-sync.json` in this goal (owner, repo,
  branch, source, commit_sha, paths) — the HaulBoard snapshot-sync pattern, so every
  published state is reconcilable and a half-landed push is detectable before any retry.
- **Pre-push privacy scan (hard gate, any hit stops the push):** regex/term scan of every
  file in the push for phone-number patterns, email addresses, and his personal strings
  (his own home address / apartment / name as a resident). Listing addresses are public
  MLS data and are expected; personal data is not. Same gate HaulBoard's Friday job uses.
- **Verify live, not just pushed:** after deploy, fetch ayaan40000.github.io/homebase and
  check the generated timestamp in the page footer / scored.json metadata matches this
  run. A push is not "live" until that check passes (HaulBoard lesson).

## 4. Risks / limits and mitigations

1. **Connector cannot create the repo (403, happened for haulboard).** Mitigation: §1
   owner-steps are the planned path, not a surprise; attempt connector once, fall back
   immediately, verify empty before first push.
2. **Pages propagation delay (seen with HaulBoard — push landed, site stale).**
   Mitigation: generated timestamp rendered in the UI footer and in scored.json metadata;
   the publishing job polls the live URL until the stamp matches or ~10 min pass, then
   reports "pushed, not yet live" instead of claiming success.
3. **School / highway / grocer ratings are area-level in v1** (one value per area or
   subdivision, incl. charter access — Harmony/KIPP presence is an area fact in v1).
   Mitigation: label them "area-level" in the UI and in scored.json metadata; never
   present them as per-address measurements. Per-address enrichment (distance lookups
   per listing) is a v2 scorer input, not a v1 blocker.
4. **Zillow blocking** (press-and-hold walls already hit the Sunday scan). Mitigation:
   HAR + Redfin are the primary sources; Zillow is best-effort (via the Pi browser where
   needed) and a Zillow-blocked run still publishes — scored.json metadata records which
   sources completed, so a thin week is visible, never papered over.
5. **Cargo build time in Actions.** Mitigation: rust-cache (§2); scorer stays
   dependency-light (serde/serde_json only).
6. **Scorer auto-commit loop.** Mitigation: `[skip ci]` + commit only on diff + the
   workflow ignores commits by the Actions bot touching only `data/scored.json`.

## 5. Build order (after design + scoring specs land)

1. Attempt connector `create_repository` for `ayaan40000/homebase` (public, empty).
2. On 403, owner creates the empty repo and adds it to the Muse GitHub App (§1 steps); verify empty via the connector.
3. Enable Pages with source = GitHub Actions in repo settings.
4. Scaffold the Vite + React + TS app at repo root per the §2 tree; set `base: '/homebase/'`.
5. Write `scorer/` crate (Cargo.toml + src/main.rs) implementing the scoring spec's contract in §2, weights from config.
6. Write `tools/sync_data.py` (canonical copy + privacy scan, hard-fail on any hit).
7. Seed `data/listings.json` from the current canonical goal JSON via sync_data.py.
8. Write `.github/workflows/deploy.yml` (scorer → scored.json commit-back → build → Pages deploy).
9. First connector push of the full tree; record it in `hidden_files/homebase-github-snapshot-sync.json`.
10. Confirm the Actions run is green and the scorer commit-back landed without looping.
11. Verify ayaan40000.github.io/homebase loads on mobile with the current generated timestamp and a correct Top 5.
12. Create the Wednesday ~9:37 AM CT mid-week job (light refresh per §3) under this goal, pushing via the same pipeline.
13. Extend the existing Sunday home-watch job to run sync + push + live-verify after its full scan.
14. End-to-end test: one Wednesday run and one Sunday run observed start-to-live before calling it done.
