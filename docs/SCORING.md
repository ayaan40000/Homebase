# HomeBase Scoring Model — v1 (2026-10-25)

Source of rules: *The Houston Book, Edition 2 (Oct 2026)* — Ch 20A (address costs),
Ch 20B (deal score, ~p123), Ch 21 (field math, ~p130), Ch 20C (charters & schools, ~p138).
Purchase anchor: **2029**. Household income assumption: **$100,000/yr**.
Down payment: **$75,000** (closing costs are on top, per Edition 2).
Outputs produced from this spec: `scored-listings.json` and `top5.json` in this folder.
Scores are a screening tool, not an appraisal, an offer recommendation, or tax advice.

---

## 1. Price anchors (Edition 2)

| Anchor | Value |
|---|---|
| Max price at 28% front-end ratio on $100K income | **$301,000** (the anchor used in ratios) |
| Price at the 31% band on $100K income | **$327,000** |
| No-PMI threshold (20%+ down) | up to $375,000 |
| Current watch band | $250,000–$300,000 — every listing in the set sits at or under the 28% anchor |

## 2. Deal Score (Ch 20B) — 0 to 100, per listing

Every component is first computed on a 0–100 scale, **clamped to 0–100**, then weighted:

```
Deal = 0.25·Value + 0.25·CarryingCost + 0.20·FloodWind
     + 0.10·Momentum + 0.10·Schools + 0.10·Liquidity
```

| Component | Weight | Formula / rule | Data status |
|---|---|---|---|
| Value | 25 | `(185 − $/sqft) / 55 × 100`, clamped. $130/sqft = 100, $185/sqft = 0. | Listing data (price ÷ sqft) |
| Carrying cost | 25 | `(3.20 − total tax rate %) / 1.50 × 100`, clamped. Uses the **area** total tax rate in §6 (no per-listing rate exists in the source). | **Estimate** — area rate |
| Flood / wind | 20 | If a Flood Factor is present: `(10 − factor) / 10 × 100`. If absent: **50, neutral**. Only 2 of 128 listings carry a factor (1 and 6); the other 126 are neutral. | Listing data when present; **estimate (neutral)** when absent |
| Momentum | 10 | Leverage from falling prices / time on market — scale in §2.1. | Listing flags + DOM; **neutral estimate** when DOM is absent |
| Schools | 10 | The listing's **area School Access (§4) rescaled**: `SchoolAccess × 10`. (The book's raw TEA scale — A 100, B 75, C 50, D 25, unknown 50 — is the fallback if a listing ever carries its own zoned-campus rating.) | **Estimate** — area proxy |
| Liquidity | 10 | `(92 − DOM) / 61 × 100`, clamped. DOM absent: **50, neutral** (108 of 128 listings have no DOM). | Listing data; **neutral estimate** when absent |

### 2.1 Momentum scale (defined for v1, applied uniformly)

| Condition | Momentum |
|---|---|
| `price-cut` flag **and** (`stale` flag or DOM ≥ 45) | 100 |
| `price-cut` flag alone | 85 |
| `stale` flag alone, or DOM ≥ 45 alone | 80 |
| DOM 30–44 | 60 |
| DOM 7–29 | 40 |
| DOM 0–6 | 20 (fresh listing, little negotiating leverage yet) |
| DOM absent and neither flag present | 50 (neutral) |

Rationale: in this book's framework, a cut price on a long-sitting home is the
strongest leverage signal a listing page can show; a fresh listing is the weakest.

### 2.2 Area deal scores (book, Ch 20B) — for the Area view, NOT per listing

| Area | Book area deal score |
|---|---|
| Stafford | 75.6 |
| Richmond | 68.3 |
| Katy 77450 | 67.1 |
| Cypress | 64.1 |

These are stored on each listing as `scores.area_deal_score_book` for reference only;
they do not enter the per-listing Deal Score or the Composite.

## 3. Composite Home Score — 0 to 100, per listing (the ranking score)

```
Composite = 0.60·DealScore
          + 0.15·(SchoolAccess × 10)
          + 0.15·HighwayAccess
          + 0.10·GrocerAccess
```

Weights sum to 100 (60 + 15 + 15 + 10). The Deal Score is the base, per the book.
School Access is counted a second time, outside the Deal Score, by design: the user
asked for schools, highways and grocers to be first-class ranking inputs, and
Edition 2's Ch 20C makes school access a location driver in its own right. That
double-count is deliberate and disclosed here — it is the main reason a Katy listing
can out-rank a cheaper Richmond listing on Composite while trailing it on Deal alone.

## 4. School Access (Ch 20C) — 0 to 10, area level

Book definition of the composite: **Harmony 0–3 + KIPP 0–1.5 + other charter 0–0.5 +
zoned (public) fallback 0–5 = 0–10.** The book supplies the composite totals below;
v1 uses those totals directly and does not invent per-area sub-scores.

| Area | School Access (0–10) | In Deal (×10) | In Composite (×10, weighted 15%) |
|---|---|---|---|
| Stafford / Sugar Land / Missouri City | **8.5** | 85.0 | 85.0 |
| Katy | **8.25** | 82.5 | 82.5 |
| Cypress | **8.25** | 82.5 | 82.5 |
| Richmond / Rosenberg / Fulshear | **5.75** | 57.5 | 57.5 |

**Book rule that governs all of this: plan on the zoned campus; a charter seat is
upside, never the plan.** Charter admission is by lottery, with waitlists. A charter
also adds a twice-daily drive (drop-off + pick-up, every school day) that the zoned
campus — usually walkable or a bus route — does not. School Access therefore measures
*option value in the area*, not a guaranteed seat.

### 4.1 Public (zoned) districts — TEA 2026 ratings

| District | Rating | Note |
|---|---|---|
| Fort Bend ISD | B | Zoned option for FBISD/Dulles-zoned Stafford — the only Stafford this watch counts |
| Katy ISD | B | Katy 77450 |
| Cy-Fair ISD | B | Cypress target subdivisions |
| Lamar CISD | B | Most of Richmond / Rosenberg in the set |
| Stafford MSD | C (elementary **D**) | Stafford-zoned to Stafford MSD is dismissed by this watch, not scored |

### 4.2 Charter campuses in the model (Edition 2, Ch 20C)

| Campus | Rating | Address | Grades |
|---|---|---|---|
| Harmony School of Excellence — Sugar Land | A | 13522 W Airport Blvd | K–8 |
| Harmony School of Science — Sugar Land | A | 13415 W Bellfort Ave | K–5 |
| Harmony School of Exploration | B | 9305 W Sam Houston Pkwy S | PK–5 |
| Harmony School of Science — Katy | A | 22400 Grand Corner Dr | PK–7 |
| Harmony School of Excellence — Katy | A | Address not in the Edition 2 extract — not invented here | PK–9 |
| Harmony School of Science — Bridgeland (Cypress) | A | Address not in the Edition 2 extract — not invented here | PK–6/7 |
| Harmony School of Science — Rosenberg | **New — opens fall 2027** | 2425 Spacek Rd, Richmond | PK–5 |
| KIPP SHINE Prep (Alief) | Gold Ribbon | Address not in the Edition 2 extract — not invented here | PK–4 |
| KIPP Mosaic Primary | — | 12751 Hillcroft Ave | PK–5 |
| KIPP CONNECT Primary | — | 6700 Bellaire Blvd | PK–5 |

Timing that matters for a 2029 purchase (from Edition 2 / memory): Harmony enrolment
runs Nov 1, 2026 – Feb 2027 for the following year; the KIPP lottery deadline is
Jan 25, 2027. The Rosenberg Harmony campus (fall 2027) is the one structural change
that could lift Richmond's 5.75 School Access before 2029 — v1 does **not** pre-credit
it; the score updates when the campus is open and rated.

## 5. Highway & Grocer access — area-level proxy scores, 0–100 (v1 estimates)

These are **area-level estimates, v1 — not per-address geocodes.** Every listing in an
area inherits that area's two scores. They are labelled as estimates on every listing
in the JSON (`scores.estimated_components`).

| Area | Highway | Grocer | Commute cost/yr (Ch 20A) |
|---|---|---|---|
| Stafford | **95** | **95** | ~$250 |
| Katy 77450 | **78** | **82** | ~$1,600–$3,000 |
| Richmond | **70** | **65** | ~$1,200–$2,300 |
| Cypress | **55** | **70** | ~$5,000–$7,000 |

**Stafford — Highway 95, Grocer 95.** Three freeways at the door: US-59/I-69, Hwy 6 and
90A, and the user's office is 0–4 mi away (the ~$250/yr commute in Ch 20A — the cheapest
in the book). Grocer access is the densest in the set: Patel Brothers / the Hillcroft
corridor plus H-E-B nearby, and the densest South Asian grocery infrastructure of any
target area.

**Katy 77450 — Highway 78, Grocer 82.** I-10 and the Grand Parkway (99) are both strong,
but the area sits 22–26 mi from Stafford, which is what the $1,600–$3,000/yr commute
prices in. Retail is strong — H-E-B and Kroger are well covered; Patel Brothers Katy
exists but is thinner than the Hillcroft corridor.

**Richmond — Highway 70, Grocer 65.** Grand Parkway 99, the Westpark Tollway and FM 1093
give real options, but the area is 15–20 mi from Stafford ($1,200–$2,300/yr). Everyday
grocers (H-E-B, Walmart) are covered; specialty / South Asian grocers are thinner and
usually mean a second trip toward Stafford or Sugar Land.

**Cypress — Highway 55, Grocer 70.** US-290 and the Grand Parkway, but 35–45 mi from
Stafford and tolls of $10–14/day drive the book's $5,000–$7,000/yr commute — the most
expensive in the set, which is why Highway scores lowest despite two good roads.
H-E-B and Kroger coverage is good; South Asian infrastructure is little to none.

Commute cost is **context, not a scored component** in v1: it is stored on each listing
(`scores.commute_annual_cost_book`) so the dashboard can show it, but it does not move
the Composite. Folding a dollar cost into a 0–100 score without double-counting the
Highway score is a v2 decision.

## 6. Ratios (Ch 21) — per listing, in `ratios`

Mortgage maths throughout: **7.32%, 30-year fixed, $75,000 down**,
loan = price − $75,000, monthly P&I by the standard amortisation formula.

| Field | Definition |
|---|---|
| `ppsf` | Price ÷ sqft, rounded to the whole dollar (source value where the source carried one). |
| `price_vs_anchor_pct` | `price / $301,000 × 100`. 100.0 = exactly at the 28% anchor. (Also stored: `price_vs_anchor_delta_pct` = % over/under the anchor, and `price_vs_31pct_anchor_pct` vs $327,000.) |
| `annual_tax_usd` | **Corrected Edition 2 formula:** `price × totalRate − $140,000 × schoolRate`. The $140K homestead exemption applies to the school portion only — that correction is the whole point of the Ch 21 formula. Assumes assessed value = price; that assumption is stated, not hidden. |
| `total_tax_rate_pct_area` | Area total rate used: **Richmond 2.29, Katy 2.08, Stafford 1.73, Cypress 2.20**. **Estimate** — no per-listing rate exists in the source. |
| `school_tax_rate_pct` / `school_district_for_tax` | District school rate used in the corrected formula — mapping in §6.1. |
| `insurance_monthly_usd_estimate` | **$200/mo**, the book estimate used where a listing shows no insurance figure (no listing in the source shows one). Labelled an estimate on every listing. |
| `hoa_monthly_usd_counted` | Parsed from the listing's HOA field. Where the source shows "—" (124 of 128 listings), HOA is counted as $0 and the listing is flagged `hoa_unknown_in_source: true` — **its PITI is a lower bound**, not a complete carrying cost. |
| `est_monthly_piti_usd` | P&I + (annual tax ÷ 12) + $200 insurance + HOA counted. |
| `front_end_ratio_pct` | `est_monthly_piti / ($100,000 / 12) × 100`. Current set: **20.94%–26.21%** — every listing passes the 28% rule on these assumptions, which is expected: the whole band sits under the $301K anchor. PITI range: **$1,745.41–$2,184.29/mo**. |
| `rent_ratio_pct` | `assumed area median rent / price × 100` (monthly). See the rent assumption in §6.2. Also stored: `gross_rent_yield_pct` = rent × 12 / price × 100. |

### 6.1 School-district tax mapping (stated, applied uniformly)

| Listing | District rate used |
|---|---|
| Katy (all) | Katy ISD — **1.1171%** |
| Cypress (all) | Cy-Fair ISD — **1.0669%** |
| Stafford (none currently in the set) | Fort Bend ISD — **0.9869%** (this watch only counts FBISD/Dulles-zoned Stafford; Stafford MSD 1.0021% is recorded here for completeness) |
| Richmond (all) | Lamar CISD — **1.1469%**, as the area default. The named-campus listings in the data (Smith Elem / Lamar Jr High / Lamar Cons High; Cora Thomas Elem / Wright Jr High / Randle High) are Lamar campuses, so the default is exact for them; for "—" and "verify by subdivision" records it is an **estimate**, flagged as such. No separate Needville ISD rate was supplied in the Edition 2 extract, so none is invented; a listing later verified as Needville ISD must be re-run with its real rate. Fort Bend ISD 0.9869% applies only where a Richmond listing is verified FBISD by subdivision. |

### 6.2 Rent assumption (ASSUMPTION — labelled, not observed comps)

No rent is invented per home. One **area median rent assumption** is used for every
listing in an area, stated here so it can be challenged and replaced:

| Area | Assumed median rent (3–4 bd SFH in $250K–$300K subdivisions) |
|---|---|
| Stafford | $1,850/mo |
| Richmond | $1,950/mo |
| Katy | $2,050/mo |
| Cypress | $2,100/mo |

These are **assumptions for v1 screening only** — a single area figure, not a rent
comp for any individual house. Every listing's `ratios.estimated_components` says so.
Any investment-style conclusion needs real rent comps first (§8).

## 7. Top 5 — method

- Rank by **Composite Home Score**, descending.
- Tie-break: **lower price**, then **lower DOM** (a listing with no DOM sorts last in a tie).
- Exclude any listing flagged `flip` (none exist in the current 128).
- Each pick carries a one-line reason built **only from facts in its own record**
  ($/sqft, price, flags, highlights, year, DOM).
- Current Top 5 is in `top5.json`. All five are Richmond — expected in v1: Richmond
  dominates the dataset (124 of 128), its low $/sqft drives the Value component, and
  its weaker School Access / access scores are not enough to offset that at these
  prices. The #1 pick carries an explicit caution: its source highlight says
  **"Under Contract — verify status"**, so it is the top score, not a confirmed
  available home.

## 8. Critique — 3 weaknesses of v1, and the data that fixes each

1. **Four of the six Deal components are area proxies or neutrals, not listing facts.**
   Carrying cost uses one tax rate per area; Schools uses area School Access; Flood is
   neutral 50 for 126 of 128 listings; Momentum and Liquidity are neutral for the 108
   listings with no DOM. Scores inside an area therefore differ mainly on $/sqft, flags
   and DOM — the ranking is real, but thinner than the two-decimal output suggests.
   **Fix:** per-listing tax rate (HAR detail pages / county appraisal), a Flood Factor
   or FEMA panel per address, and DOM on every record (re-pull listings missing it).

2. **Highway, Grocer and School Access are inherited from the area, never measured at
   the address.** Two Richmond homes 8 miles apart score identically on access, and
   the charter story is an area average — a home 5 minutes from Harmony Rosenberg and
   a home 35 minutes from it are treated the same, when the book's own warning is that
   a charter means a twice-daily drive.
   **Fix:** per-address geocoding — drive time from each listing to the office
   (323 Dulles Ave, Stafford), to the nearest H-E-B / Walmart, to the nearest South
   Asian grocer, and to its zoned campuses and the §4.2 charter campuses — then score
   access from minutes, not from the area label.

3. **The money ratios rest on three stated assumptions stacked together:** assessed
   value = price, a $200/mo insurance placeholder, and a single area median rent.
   Front-end ratios and rent ratios are therefore comparable *inside* this dataset but
   are not yet numbers to take to a lender or an investment decision; an HOA that the
   source hides ("—" on 124 of 128) also makes most PITIs lower bounds.
   **Fix:** real per-listing HOA and tax-assessed value from HAR/county records, an
   insurance quote band for the target ZIPs, and actual rent comps (recent leased
   listings in the same subdivisions) in place of the §6.2 assumption.

## 9. Honesty rules applied in the JSON

- Every listing carries `scores.estimated: true` and `ratios.estimated: true`, with an
  `estimated_components` list naming **which** components are estimates and why.
  There is no listing in v1 with zero estimated components — Highway, Grocer, School
  Access and Carrying Cost are area-level for all 128.
- No value is invented to fill a gap: missing DOM and missing Flood Factor score
  neutral and say so; an unshown HOA counts as $0 and is flagged; addresses the book
  extract did not give are recorded in §4.2 as "not in the extract", not filled in.
- All scores are rounded to 1 decimal and all ratios to 2 decimals — the rounding is
  presentational; the underlying inputs are the area-level figures above, and the
  model should be read at that precision, not finer.
