# HomeBase — UX Redesign Spec (Mobile Overhaul)

**Product:** HomeBase command center — 128 scored Houston-area homes, $250K–$300K, Stafford / Richmond / Katy 77450 / Cypress.
**Status:** DECIDED. This spec supersedes the layout sections of `docs/DESIGN.md` (§4 layout order, §5 header form, §7 card form, §8 control deck form). Everything not named here stays as DESIGN.md specifies.
**Problem this fixes:** the v1 single scroll page puts search + 5 area chips + 5 quick-filter chips + sort above the list (about 45% of a phone viewport before the first home), renders 6 KPI tiles as a 2×2-plus block, renders all 128 homes as tall full-detail cards in one endless column, and buries Schools and Areas in the same scroll. The owner verdict: not mobile friendly, neverending.
**Stack constraints:** React + TypeScript + Vite, static GitHub Pages, no backend. No router dependency exists and none is added. No new data fields. Filters, `DEFAULT_FILTERS`, and sort logic in `App.tsx` / `ControlDeck.tsx` are reused as-is — this spec changes presentation and navigation, not the filter model.
**Copy rules:** unchanged from DESIGN.md — plain language, no emojis, no exclamation marks, sentence case.

---

## 0. Decision summary — the view map

The app becomes four views, one per tab. Each view is its own screen with its own scroll position. Nothing is stacked into one page again.

| View | Job | Replaces in v1 |
|---|---|---|
| Home | The answer: pulse strip + Top 5 ranked list + one exit to Explore | PulseHeader + TopFiveHero |
| Explore | The work: search, filter, scan all 128 homes as compact rows | ControlDeck + HomeCard stack / HomeTable |
| Schools | The reference: charter rule, deadlines, campuses, zoned districts | CharterPanel |
| Areas | The comparison: Area Battle bars that filter Explore | AreaBattle |

Cross-view moves are state changes, not navigation: Areas tap sets the Explore area filter and switches view; the Home browse entry switches view; any row tap opens the Detail overlay (Section 4) over the current view.

---

## 1. App shell

### 1.1 State model (in `App.tsx`, no router)

- `view: 'home' | 'explore' | 'schools' | 'areas'`, default `'home'`. Plain `useState`. No hash sync, no history entries — a shared link opens Home, which is correct for a family dashboard.
- Only the active view is mounted. Scroll memory: a `useRef` record keyed by view stores `window.scrollY` on view exit; on view entry the app restores it with `window.scrollTo(0, saved)` after render. First entry to a view starts at 0. Explore resets to 0 only when its filters change (Section 3.4), not on view re-entry.
- `filters` state stays lifted in `App.tsx` exactly as today. `selected: { home: Home, pick?: TopPick } | null` drives the Detail overlay. `drawerOpen` for the MethodologyDrawer is unchanged and global.
- Body scroll locks (`overflow: hidden` on `body`) whenever Detail, the filter sheet, or the MethodologyDrawer is open.

### 1.2 Bottom tab bar — mobile and tablet (under 1100px)

- Fixed to the bottom, full width, `z-index: 40`. Height: 56px plus `env(safe-area-inset-bottom)`. Background `--bg-raised`, top border 1px `--line`. No shadow.
- Four equal targets, each minimum 56px tall and 25% wide: inline SVG icon (20px, stroke style matching the existing arrow icon) above an 11px Inter 600 label. Labels: Home, Explore, Schools, Areas. Icons: house, magnifier, book, bars — drawn as inline SVG in `App.tsx`, no icon font, no new asset files.
- Active tab: icon and label in `--teal` (#3EC6B8), with a 2px teal indicator bar at the top edge of the tab. Inactive: `--text-2`. Active tab carries `aria-current="page"`. The bar is a `<nav aria-label="Primary">` of `<button>` elements.
- Content clearance: every view's scroll container gets `padding-bottom: calc(56px + env(safe-area-inset-bottom) + 16px)` so the last row is never under the bar. On devices with no inset the bar is exactly 56px.

### 1.3 Desktop shell (1100px and up) — decision: the 4 views stay

- Desktop keeps the same 4 views. It does not merge back into the DESIGN.md 12-column single page. Justification: the merged page is the endless scroll the owner rejected; view separation is the fix, and screen size does not change the information architecture. Desktop widens each view (Section 7); it does not recombine them.
- The bottom tab bar is replaced by a top nav: sticky, 56px, `--bg-raised`, bottom border `--line`. Left: HOMEBASE wordmark in `--cream` with the meridian hairline under it. Right: the same four tabs as horizontal text buttons (44px tall, active = teal text + 2px teal underline). Content `max-width: 1200px`, centred, page padding 32px. No bottom padding clearance is needed.

---

## 2. Home view

Home is one short screen. Target: the whole view is about 670px tall at 390px wide — the Top 5 and the browse entry fit with no scroll or one flick.

### 2.1 Sticky header — 52px maximum

- Sticky at top, `z-index: 30`, `--bg-raised`, bottom border `--line`. One row, 52px including the border: left, the wordmark HOMEBASE (Space Grotesk 700, 1.0625rem, `--cream`) followed by the run stamp on the same baseline (JetBrains Mono, 0.75rem, `--text-3`, format `Oct 25 run · 128 homes`, truncated with ellipsis if needed). Right: a 44px icon button (info icon) labelled "How scoring works" that opens the MethodologyDrawer. The 2px meridian hairline sits at the header's bottom edge, above the border.
- This header is the Home view header only. Explore, Schools, and Areas each carry their own compact header or toolbar (Sections 3, 5, 6) at the same 52px scale. There is no second global header stacked on top.

### 2.2 KPI pulse strip — 56px maximum, one scrollable row

Decision: a single horizontally scrollable row of mini-stats. The 4-across tile grid is rejected — 6 stats need 2 rows (about 112px) and break the fold budget in §2.4.

- Height: 56px total including 8px top and bottom padding. Background `--panel`, bottom border `--line-soft`. `overflow-x: auto`, scrollbar hidden, `scroll-snap-type: x proximity`, edge fade via CSS mask as in DESIGN.md §8.
- Six mini-stats in the current PulseHeader order: Homes tracked, Median price, Median $/sqft, Median DOM, Under $301K anchor, Top deal score. Each item: `min-width: 104px`, snap-aligned, divided by a 1px `--line-soft` rule. Inside: eyebrow label (JetBrains Mono 600, 0.625rem, uppercase, `--text-2`, one line) over the value (JetBrains Mono 600, 1rem, `--text`, one line). The Under-anchor item adds its share inline (`128 · 100%` style is too long — value is the count, the share is dropped on mobile and shown at 720px and up as a second value segment). Top deal score sub-line (area) is dropped in the strip; the area is on the home's own rows.
- The strip is not sticky. It scrolls away with the view; only §2.1 sticks.

### 2.3 Top 5 — compact ranked list

- Section header row, 36px, single line: H2 "Top 5 recommendations" (Space Grotesk 600, 1.125rem) at left; right, a 44px-tall text button "How scoring works" (teal) opening the MethodologyDrawer. This is the primary methodology access point; the header info button is the secondary one. The v1 eyebrow-plus-title stack is not used — it costs a line the fold budget needs.
- Rows are `<button>` elements (full row is the tap target, opens Detail for that home with its TopPick attached). Anatomy per row, left to right: rank numeral, main column, composite chip.
  - Rank numeral: 28px circle. Ranks 2–5: transparent fill, 1px `--brass` border, brass numeral (Space Grotesk 700). Rank 1: see §2.3.1.
  - Main column, two lines maximum. Line 1: address (Inter 600, 0.9375rem, one line, ellipsis). Line 2: price (Space Grotesk 700, 1rem) + ` · $90/sqft` (JetBrains Mono, 0.8125rem, `--text-2`) + ` · Richmond` area name in `--text-2` preceded by its 8px area dot.
  - Composite chip: pill, `--panel-2` fill, 1px `--line` border, JetBrains Mono 600 0.8125rem: `Comp 67.7`. The number is always printed; the chip's left dot (8px) carries the score-band colour for the composite value. The chip never shows the Deal Score — the two scores are never mixed in one element without a label, and this chip is labelled Comp.
- Row heights: ranks 2–5 are 76px (12px padding top and bottom, two 20px lines, 8px internal gap, 1px divider included in the stack gap, not the row). Rows are separated by 8px gaps, not stacked borders.
- Status caution in the row: if the pick has `status_caution`, a third line is added inside the same row — amber (#E3B341) dot 8px + the caution text (Inter 500, 0.8125rem, one line, ellipsis, full text in Detail and in the row's `aria-label`). Row height grows to 100px maximum. The caution is never icon-only, never behind the tap, never truncated away at the row level without Detail carrying the full string (Section 4.1).

#### 2.3.1 Rank 1 — Command Pick, compact

- Same row anatomy, one size up: `--panel-2` background, 1px border with the `--meridian` gradient treatment (padded-wrapper technique from v1), 32px filled `--brass` medallion with the numeral in `--bg`, price at 1.125rem.
- Two additions inside the row, no more: an eyebrow line above the address — COMMAND PICK (JetBrains Mono 600, 0.625rem, uppercase, `--brass`) — and one reason line below line 2: the first 64 characters of `pick.reason` are not used; the row shows one short reason line taken whole from `pick.reason` up to the first sentence end, one line, ellipsis, Inter 400 0.8125rem `--text-2`. The full reason lives in Detail.
- Height: 104px without caution, 124px with the caution line. Rank 1 keeps its identity through the medallion, the gradient border, and the eyebrow — not through size. The v1 88px ring, access bars, and ratio strip do not appear in the Home view; they are Detail content now.

### 2.4 Density budget — 390 × 844, above the fold

All five picks must be visible without scrolling, above the tab bar. Budget (Android test assumption: safe-area inset 0, visible height above the 56px tab bar = 788px):

| Element | Height |
|---|---|
| Sticky header (§2.1) | 52px |
| KPI strip (§2.2) | 56px |
| Gap | 12px |
| Top 5 section header | 36px |
| Rank 1 row (with caution, worst case) | 124px |
| Ranks 2–5 rows (4 × 76px) | 304px |
| Row gaps (4 × 8px) | 32px |
| View top and bottom padding | 16px |
| **Total** | **632px** |

632px against 788px visible leaves 156px of slack for browser chrome variance and font scaling to 110%. If a future run gives two picks cautions, the two extra caution lines cost 48px and the budget still holds at 680px.

### 2.5 Below the Top 5

- One entry only: "Browse all 128 homes" — a full-width button, 56px tall, `--panel` fill, `--line` border, radius 12px. Left: label (Inter 600) + count sub-line is not used; the count is in the label: `Browse all 128 homes`. Right: chevron icon in `--teal`. Tapping switches to Explore with filters untouched.
- Under it, one honesty line (Inter 400, 0.8125rem, `--text-3`, two lines maximum): "Access scores are area-level estimates (v1). Prices as listed on the run date." Then the view footer: run stamp repeated in mono + a "How scoring works" text button. Nothing else is on Home. Charter deadlines and area scores are not teased here — they have their own tabs.

---

## 3. Explore view

### 3.1 Toolbar — sticky, 104px total, list starts by 112px

- Sticky block at top, `z-index: 30`, `--bg-raised`, bottom border `--line`. Two rows:
  - Row 1 (44px): left, H2 "Explore" (Space Grotesk 600, 1.125rem). Right, result count in JetBrains Mono 0.8125rem `--text-2` — `37 of 128 homes` — with `aria-live="polite"`.
  - Row 2 (60px including 8px vertical padding): search field (flex) + Filters button. Search: native `type="search"` input, 44px tall, `--panel` fill, placeholder "Search address or subdivision", filters on `address` + `subdivision` as-you-type exactly as today; a clear (×) button appears inside the field's right edge when text is present (44px target, clears query only). Filters button: 44px tall pill, `--panel` fill, funnel icon + label "Filters" + active-count badge when the count is above 0.
- Active-count badge: 20px circle, `--teal-deep` fill, white 0.75rem number. Count = number of selected areas + number of active quick filters + 1 if sort is not the default (`composite`). Search text is not counted — it is visible in the field.
- First home row's top edge sits at 112px from the viewport top on load (104px toolbar + 8px list padding). No area chips, quick-filter chips, or sort control are rendered outside the sheet. Ever.

### 3.2 Filter sheet — bottom sheet on mobile

- Opens from the Filters button. Mobile: bottom sheet, `max-height: 88dvh`, top radius 16px, `--panel-2`, backdrop `rgba(0,0,0,0.6)`, own vertical scroll. Header (56px, sticky inside the sheet): drag handle (visual only), title "Filters" (Space Grotesk 600), close button (44px, × icon). Footer (sticky, 64px plus safe-area inset): Reset text button at left, primary button at right — "Show 37 homes" — `--teal-deep`, 48px tall, label updates live with the draft result count.
- Draft behaviour: the sheet edits a draft copy of `Filters`. Nothing applies until "Show N homes" is tapped, which commits the draft to App state, closes the sheet, and resets Explore pagination and scroll to top. Backdrop tap, close button, or Escape discards the draft. Reset (in the sheet footer) restores the draft to `DEFAULT_FILTERS` without closing.
- Contents, in this order, each section labelled with an eyebrow:
  1. Areas — multi-select chips with counts, the existing five controls (All, Stafford, Richmond, Katy, Cypress) as 44px toggle buttons with area dot and live count (`Richmond · 124`), `aria-pressed` as today. All clears the selection, as today.
  2. Quick filters — five 44px toggle rows (full-width, label left, state shown by `--teal-deep` fill chip at right or a check), not a chip row: Under $301K anchor, Score 70+, New this run, Price cuts, Schools 8+. Full labels are used in the sheet; the shortened v1 chip labels are retired.
  3. Sort — decision: a radio list, not the native select. Seven full-width radio rows (44px each, `role="radiogroup"`, one selected, teal radio dot): Composite score (default), Deal score, Price: low to high, Price: high to low, $/sqft: low to high, Days on market: longest first, Newest year built. Reason: every option stays visible and thumb-reachable, the OS picker is inconsistent across Android skins, and the sheet has the vertical room the toolbar did not. The v1 `<select>` is removed with the deck.
  4. Result count line — mono, repeats the draft count: `37 of 128 homes match`.
- Focus: on open, focus moves to the close button; on close, focus returns to the Filters button. Escape closes. Same pattern as the MethodologyDrawer.

### 3.3 Compact home row — the only list item in Explore

The v1 `HomeCard` full-detail card is retired from the list. The row is a `<button>` that opens Detail. Right side carries the score; nothing in the row links out — "View listing" exists only in Detail.

- Grid: main column (flex) + score column (48px, centred). Padding 12px. Background `--panel`, border `--line`, radius 12px. Rows separated by 8px gaps.
- Main column, top to bottom:
  1. Address — Inter 600, 0.9375rem, line-height 20px, one line, ellipsis. An 8px area dot precedes it (area colour from DESIGN.md §2).
  2. Price line — price (Space Grotesk 700, 1.125rem) + ` · $129/sqft` (JetBrains Mono, 0.8125rem, `--text-2`; `$/sqft not listed` segment omitted when `ppsf` is null) + ` · Richmond` (Inter 500, 0.8125rem, `--text-2`).
  3. Stat line — Inter 500, 0.8125rem, `--text-2`, one line, ellipsis: `3 bd · 2 ba · 1,935 sqft · Built 2011 · 13 days`. Null segments are omitted in the row (the slot rule from DESIGN.md §7 applies to Detail, not to the row — a row that prints "Not listed" four times carries no information). If every segment is null, the line shows the subdivision instead. DOM renders as `13 days`, `1 day`, or is omitted when null.
  4. Optional fourth line, one only, priority order: (a) status caution — only when the home matches a TopPick by address and that pick has `status_caution`: amber dot + caution text, Inter 500 0.8125rem, one line, ellipsis; (b) otherwise flags — display chips (24px tall, non-interactive, the row is the target): the first 2 flags in `FLAG_LABELS` order as stored, then a text suffix `+2 more` in `--text-3` when more exist. `flood-caution` keeps its amber treatment. No row ever shows both the caution line and the flag line; Detail shows everything.
- Score column: `ScoreRing` at 40px, used exactly as shipped (6px stroke, number inside, band word under the ring — the component's own output, about 62px tall in the column). Book Deal Score only, brand rule unchanged. The score is carried three ways at once, as required: ring colour, printed number, and the visible band word. Composite does not appear in the row; it is in Detail and on the Top 5 chip, each labelled.
- Height budget: 92px with no fourth line (12 + 20 + 24 + 18 + 2×4 gaps + 12, rounded). 112px maximum with the fourth line (adds 20px). A row never exceeds 112px and the address never wraps.

### 3.4 Pagination — 20 at a time, button only

- Explore renders `visibleCount` rows, initial value 20. Below the last row: a full-width "Show more" button (48px) with two-part text — main label "Show more" at left, remaining count in JetBrains Mono at right (`88 left`). Tapping adds 20 rows, or the remainder on the final page, and the button disappears when nothing remains. No infinite scroll, no scroll listener — the endless feeling is the complaint being fixed.
- `visibleCount` resets to 20 and Explore scroll returns to top whenever `filters` commits (sheet Apply, search text change, Reset, or an area arriving from the Areas view). Changing only the view and coming back preserves the count and the scroll position (§1.1).
- DOM cap: the initial mount is 20 rows. Each Show more adds at most 20 more. The full filtered array is computed in memory (existing `useMemo`) but is never rendered whole on first paint.

### 3.5 Empty state

Per DESIGN.md §12, unchanged copy rules: centred `--panel` panel in place of the list — "No homes match these filters." + the active filter names as a plain list + one 44px "Reset filters" primary button (commits `DEFAULT_FILTERS`, resets pagination). When a single area is the only filter: "No homes in Richmond match the current filters." The Show more button is not rendered in the empty state.

### 3.6 Desktop table mode

The Cards/Table toggle survives only in Explore at 1100px and up (Section 7), reusing `HomeTable` unchanged. Table mode renders all filtered rows (desktop table, sticky header, 56px rows) and pagination does not apply; row click in table mode still opens Detail instead of linking out — the address cell keeps its listing link as the secondary action. This is the one place the v1 table behaviour changes, and it is a link-target change inside `HomeTable`'s consumer, not a data change.

---

## 4. Detail view — full-screen overlay

Opened from any Top 5 row, any Explore row, or any Areas-driven Explore row. One overlay for every home. It carries everything the v1 `HomeCard` + `RatioStrip` showed; nothing from the old card is dropped.

### 4.1 Shell and order

- Mobile: fixed overlay, `inset: 0`, `--bg` background, own vertical scroll, `z-index: 60` (above tab bar and toolbar). Tablet and desktop: centred modal (Section 7). Sticky overlay header (56px, `--bg-raised`, bottom border): Back button at left (44px, chevron-left icon + label "Back"), truncated address centred-left (Inter 600, one line), no other controls. Back, Escape, and (on tablet/desktop) backdrop tap close it. Focus moves to the Back button on open and returns to the originating row on close; body scroll is locked while open.
- Content order is fixed (top to bottom). Padding 16px, section gap 20px:
  1. Status caution banner — only when the opened home has a matching TopPick `status_caution`: full text, untruncated, amber treatment as v1 `.caution-banner` (`Caution: {text}. Confirm availability before anything else.`), `role="note"`. It is the first element in the scroll, above the price. Cautions are never collapsed, never in a tab.
  2. Price and score block — price (Space Grotesk 700, 2rem) at left; at right, `ScoreRing` 64px (Deal Score) with its band word under it, and under the ring the composite line: `Composite 67.7` (JetBrains Mono 600) with the composite band word. Address as H2 below the price (Inter 600, 1.125rem, wraps fully — Detail never ellipsises the address), then area chip (dot + area + subdivision on the same pill line, wrapping allowed).
  3. Stat line — the full DESIGN.md §7 line with no omissions: beds · baths · sqft · year built · DOM, each null rendered as "Not listed" in `--text-3`. Then a listing-details definition list (two-column, label `--text-2`, value `--text`): Subdivision, Schools (`home.schools`), Flood factor (`home.flood`, "Not listed" when null), HOA (`home.hoa` as stored), Area rank is not shown (internal field).
  4. Access bars — `ScoreBar` × 3, unchanged component, in this order with these derivations: Schools = `scores.school_access_0_10`; Highway = `scores.components_0_100.highway_access / 10`; Grocer = `scores.components_0_100.grocer_access / 10`. Directly under the block, the estimate label (Inter 400, 0.8125rem, `--text-2`): "Access scores are area-level estimates (v1)." This sentence appears wherever access bars appear — Detail and the Schools zoned strip (§5.4) — and nowhere bars appear without it.
  5. Deal score breakdown — decision: included. A collapsible section (button header, 44px, `aria-expanded`, collapsed by default) titled "Deal score breakdown". Inside: six `ScoreBar` rows with `tone="brass"`, `max={100}`, values from `scores.components_0_100` printed to one decimal: Value (`value`), Carrying cost (`carrying_cost`), Flood and wind (`flood_wind`), Momentum (`momentum`), Schools (`schools_in_deal`), Liquidity (`liquidity`). Included because the ring's number is otherwise unexplained at the exact moment a decision is being weighed, the data already ships in the JSON, and collapsed-by-default keeps Detail scannable. The Composite inputs (school rescaled, highway, grocer at 0–100) are not repeated here — the access bars above already carry them at 0–10.
  6. Ratio grid — `RatioStrip` reused unchanged (its four cells already carry: front-end % with PITI/mo sub-line, anchor delta with % of anchor sub-line, price / annual rent with rent ratio sub-line, $/sqft with tax est. sub-line), followed by a supplementary definition list completing the ratio set: Gross rent yield (`ratios.gross_rent_yield_pct`, %), Assumed area median rent (`ratios.assumed_area_median_rent_usd_mo`, $/mo, labelled as an area assumption), Loan (`ratios.loan_usd`), Principal and interest (`ratios.principal_interest_monthly_usd`, /mo), Price vs 31% anchor (`ratios.price_vs_31pct_anchor_pct`, %). Price / annual rent is derived exactly as `RatioStrip` does today: `100 / gross_rent_yield_pct`, shown in the strip; it is not recomputed differently in Detail.
  7. Honesty block — directly under the ratios, in this order: (a) when `ratios.hoa_unknown_in_source` is true, an amber-outline note: "HOA is not shown in the source listing. The PITI above is a lower bound."; (b) a collapsible "What is estimated here" section (collapsed by default, present in the DOM) listing `scores.estimated_components` followed by the ratios estimated components from the scored record, deduplicated, as plain bullet lines. No estimate is silently dropped.
  8. Flags — all flags, no cap, `FLAG_LABELS` wording, `flood-caution` in amber, display chips as on the v1 card.
  9. Highlights and inspector — highlights as individual lines (not joined), then the inspector note as a paragraph in `--text-2`, each only when present, exactly as stored.
  10. Why it ranks — only when opened with a TopPick attached: eyebrow "Why it ranks" + the pick's full `reason` text + its PITI and front-end figures in mono (already on the pick record). Absent for non-Top-5 homes; no substitute text is invented.
  11. Footer spacing of 16px, then the sticky action bar.

### 4.2 Sticky action bar

- Sticky at the overlay's bottom: 64px plus safe-area inset, `--bg-raised`, top border `--line`. One control: "View listing" — full-width primary button (48px, `--teal-deep`), opens `home.url` in a new tab. It is the only outbound link in Detail, and it is present for every home including cautioned ones (the caution sits at the top; the button does not repeat it).

---

## 5. Schools view

`CharterPanel` content, restructured to compact rows. All data still comes from `src/data/charter.ts` (`CHARTER_RULE`, `DEADLINES`, `CAMPUSES`, `DISTRICTS`, `countdownLabel`) — no data edits.

- View header (52px, same pattern as Home §2.1 minus the wordmark): H2 "Schools" + right-side count line in mono (`10 campuses`). Not sticky beyond the header itself.
- §5.1 Rule block: the Edition 2 rule in `--cream` (Inter 600, 1.0625rem, maximum two lines): "Plan on the zoned campus. A charter seat is lottery upside, never the plan." Under it, the existing panel note (one paragraph, `--text-2`). This block is about 96px. It is the first thing in the view and is never collapsed.
- §5.2 Deadlines: five compact rows (all five `DEADLINES` entries, including the March 15, 2027 Rosenberg/Pearland deadline — the v1 panel already shows five; none are cut). Row height 56px: left, date in JetBrains Mono 600 (0.8125rem, fixed 92px column, display string as stored); middle, event (Inter 500, 0.875rem, up to two lines); right, the countdown chip from `countdownLabel` with its existing tones (teal open, amber within 30 days, `--text-3` closed). Rows are divided by `--line-soft`, not boxed as cards. Section header: "Enrolment deadlines" + eyebrow SCHOOLS is not repeated.
- §5.3 Campuses: ten compact rows, not the v1 tall cards. Row: padding 12px, `--panel` fill, radius 12px, 8px gaps. Line 1: campus name (Inter 600, 0.9375rem, one line, ellipsis) + network chip at right (Harmony brass outline, KIPP teal outline, as today). Line 2 (JetBrains Mono, 0.75rem, `--text-2`, up to two lines, then ellipsis): `K–8 · Rating A · 13522 W Airport Blvd · Serves Stafford, Richmond` — grades, rating exactly as stored (including "Rating not listed" and "New — opens fall 2027" verbatim), address exactly as stored (including "Address not in the Edition 2 extract"), serves list with area dots inline. Target height 68px, maximum 84px when line 2 wraps.
- §5.4 Zoned district strip: five rows as today (including Stafford MSD, labelled with its dismissed-zone area string as stored). Row: district name (Inter 600) + `TEA {rating}` in brass mono, area line under it in `--text-3`, then one `ScoreBar` labelled "School access" with the district's `schoolAccess` value. Row target 76px. Under the strip, the estimate label from §4.1 step 4 appears verbatim. Section header: "Zoned districts — the baseline plan".
- Total Schools view height is about 1,500px (roughly two phone screens). That is accepted: Schools is a reference view visited on purpose, and every section inside it is rows, not cards.

---

## 6. Areas view

- View header (52px pattern): H2 "Areas" + mono line at right: `Book scores · Ch 20B`.
- Intro line (Inter 400, `--text-2`, two lines maximum): "Edition 2 area deal scores. Tap an area to see its homes in Explore."
- `AreaBattle` is reused unchanged as a component: the four battle rows in book-score order (Stafford 75.6, Richmond 68.3, Katy 67.1, Cypress 64.1), each row already carrying the area dot and name, the Leader chip on Stafford, the animated 8px bar in the area colour with the score in mono at right, and the meta line with homes tracked and median price for the area (computed from the homes array as today). Row styling is tightened by CSS only (Section 9): target 76px per row.
- Tap behaviour changes at the `App.tsx` handler only: tapping a row commits `filters = { ...DEFAULT_FILTERS, areas: [area] }` (same reset-then-set behaviour as v1's `selectAreaAndScroll`), resets Explore pagination to 20, and switches `view` to `'explore'` scrolled to top. It does not scroll within a page — there is no shared page anymore.
- Under the bars, one facts line per area is not added. Counts and medians already ride on the rows; school access per area lives in Schools §5.4 and in Detail. The view ends with the honesty line: "Area scores inform the ranking. They do not override a home's own Deal Score."
- DealMap decision: out. The DESIGN.md §10 schematic map is not built in this overhaul. Reasons: v1 already shipped Battle-only and Battle is the spec's own accessible equivalent; the map adds a hand-drawn SVG and a toggle to a view whose job — compare four numbers, then filter — the bars already complete in 76px rows; and the file budget (Section 9) has no room for a new component. Revisit only if the owner asks for the map by name.

---

## 7. Breakpoints

Breakpoints are unchanged: under 720px mobile, 720–1099px tablet, 1100px and up desktop. Deltas per view:

| Surface | Under 720px | 720–1099px | 1100px and up |
|---|---|---|---|
| Shell | Bottom tab bar (§1.2) | Bottom tab bar; content max-width 960px centred | Top nav (§1.3); content max-width 1200px; no bottom bar |
| Home | KPI strip scrolls; Top 5 single column | KPI strip becomes a static 6-across row (no scroll, each item flexes); Top 5: rank 1 full width, ranks 2–5 in a 2×2 grid of the same rows | Top 5: rank 1 panel at 55% width, ranks 2–5 stacked at 45%; rows keep §2.3 heights; KPI strip static 6-across |
| Explore toolbar | 104px sticky (§3.1) | 104px sticky, search field max-width 480px | The same 104px block stays (title and count do not move into the top nav); the Cards/Table toggle (§3.6) is added at the right end of row 1 |
| Explore list | Single column of §3.3 rows | 2-column grid of the same rows (row becomes a grid cell, height fixed at 112px, fourth line always reserved so cells align) | 2-column grid inside 1200px (rows widen, heights unchanged); table mode available |
| Filter sheet | Bottom sheet, 88dvh (§3.2) | Right slide-over, 400px wide, full height (MethodologyDrawer desktop pattern) | Same right slide-over, 400px |
| Detail | Full-screen overlay (§4.1) | Centred modal: 640px wide, max-height 88dvh, radius 16px, backdrop; sticky header and action bar inside the modal | Centred modal: 720px wide, max-height 88dvh; ratio grid inside Detail widens via the existing RatioStrip 4-across rule at 720px and up |
| Schools | Single column rows (§5) | Campuses in a 2-column grid (same row content); deadlines and districts stay single column | Two columns: left = rule + deadlines + districts; right = campuses; max-width 1200px |
| Areas | Rows full width | Rows max-width 800px centred | Rows max-width 800px centred; bar height stays 8px, row height 80px |

Text scaling: all sizes in rem as today; at 200% browser font size the Explore row and Top 5 row grow (heights in this spec are targets at 100%, minimums not ceilings — rows use `min-height`, content may exceed rather than clip, except the one-line ellipsis fields which stay one line by design).

---

## 8. Tokens and rules that do not change

Verbatim from DESIGN.md §2 — the builder copies these, does not re-derive them:

- Surfaces: `--bg #0A0E13`, `--bg-raised #10161F`, `--panel #131B26`, `--panel-2 #182231`, `--line #243144`, `--line-soft #1B2635`.
- Text: `--text #EEF2F6`, `--text-2 #A9B7C6`, `--text-3 #718094` (meta only, never a score number), `--cream #F4E9D4` (wordmark, rank 1 numeral context, charter rule line).
- Brand: `--brass #C9A86A`, `--brass-bright #E8C87E` (focus outline), `--teal #3EC6B8`, `--teal-deep #1E7A72`, `--meridian` gradient brass to teal.
- Score bands, always with the number printed: Elite 80–100 `#2FD1A7`, Strong 65–79 `#8FCB6B`, Fair 50–64 `#E3B341`, Weak 0–49 `#E0655A`. Area colours unchanged (Stafford brass, Richmond teal, Katy `#6EA8E1`, Cypress `#A78BDB`).
- Fonts unchanged: Space Grotesk 600/700 (display, prices), Inter 400/500/600 (body), JetBrains Mono 500/600 (data, labels). No new fonts, no new weights.
- Score rules unchanged: `ScoreRing` shows the Book Deal Score only, anywhere it appears, at any size. Access and sub-scores are `ScoreBar` only. A score is never shown by colour alone — every ring, bar, and chip prints its number.
- Interaction rules unchanged: every interactive element is at least 44×44px (display-only chips inside rows may be 24px tall — they are not targets; the row is). `:focus-visible` is 2px `--brass-bright`, offset 2px, never removed. Filter chips are `button` + `aria-pressed`; result counts are `aria-live="polite"`; missing values in Detail render "Not listed" in `--text-3`; motion stays CSS-only with the existing `prefers-reduced-motion` block disabling it.
- Honesty labels unchanged and non-negotiable: the access-estimate sentence (§4.1 step 4), the PITI lower-bound note (§4.1 step 7), the estimated-components list (§4.1 step 7), and status cautions (§2.3, §4.1 step 1) all survive this redesign at full strength. Compactness is taken from layout, never from disclosure.

---

## 9. File plan — 7 files maximum, no new files

The builder modifies exactly these 7 files and adds none. `docs/UX-REDESIGN.md` (this file) does not count toward the 7. Every other file in the repo is untouched.

| # | File | What changes |
|---|---|---|
| 1 | `src/App.tsx` | Shell: `view` state, per-view scroll memory, bottom tab bar (mobile/tablet) and top nav (desktop, CSS-switched), `selected` state for Detail, Areas handler changed from scroll to view switch, Explore `visibleCount` state (20, reset on filter commit), KPI computation and filter logic unchanged. Renders the four views and hosts Detail + MethodologyDrawer. |
| 2 | `src/components/PulseHeader.tsx` | Becomes the Home header + KPI strip: slim 52px sticky header (wordmark, run stamp, info button) and the 56px scrollable mini-stat row of §2.2. The 6-tile grid markup is removed. Props unchanged (`kpis`, `generated`, `onMethodology`). |
| 3 | `src/components/TopFiveHero.tsx` | Becomes the compact ranked list of §2.3: rank rows as buttons, composite chip, caution line, compact Command Pick. Gains an `onOpen(home, pick)` prop. The 88px ring, access bars, RatioStrip, and why-block leave this component (they live in Detail now). |
| 4 | `src/components/ControlDeck.tsx` | Becomes the Explore toolbar + filter sheet of §3.1–3.2: sticky 104px toolbar (title, count, search, Filters button with badge) and the draft-state bottom sheet (areas, quick filters, sort radio list, count, Reset, Show N). Exports `Filters`, `SortKey`, and `DEFAULT_FILTERS` with identical shapes — `App.tsx` imports keep working. The always-visible chip rows and the native sort select are removed. |
| 5 | `src/components/HomeCard.tsx` | Default export becomes the compact Explore row of §3.3 (button, 40px ring, capped flags, caution line, `onOpen` prop). A named export `HomeDetail` in the same file renders the Section 4 overlay, reusing `ScoreRing`, `ScoreBar`, and `RatioStrip` internally. One file holds both because Detail is the row, expanded — splitting it would spend the budget for no structural gain. |
| 6 | `src/components/CharterPanel.tsx` | Becomes the Schools view of Section 5: same data imports from `src/data/charter.ts`, markup restructured to the rule block, deadline rows, campus rows, and district rows. No data or countdown logic changes. |
| 7 | `src/index.css` | All layout for this spec: tab bar and safe-area clearance, view containers, KPI strip, Top 5 rows, Explore toolbar and rows, filter sheet, Detail overlay/modal, Schools/Areas row tightening, and the Section 7 breakpoint rules. Tokens in `:root` are not edited. Existing class names are reused wherever the markup survives. |

Reused unchanged (no edits, import only): `src/components/ScoreRing.tsx`, `src/components/ScoreBar.tsx`, `src/components/RatioStrip.tsx`, `src/components/AreaBattle.tsx` (Areas rows tighten via CSS only), `src/components/MethodologyDrawer.tsx`, `src/components/HomeTable.tsx`, `src/lib/types.ts`, `src/lib/useReveal.ts`, `src/main.tsx`.

Forbidden — do not modify: `data/listings.json`, everything under `src/data/` (`scored.json`, `top5.json`, `charter.ts`), `scorer/` and its weights, `.github/workflows/`, `vite.config.ts`, `index.html` (the PWA wiring — manifest link and service-worker registration — stays exactly as it is), `public/`, `tools/`, `package.json`. No new dependencies. No router.

---

## 10. Acceptance checklist

The critique agent verifies each item mechanically (viewport 390×844 unless stated).

Shell and views
1. Four views exist (Home, Explore, Schools, Areas); exactly one is mounted at a time; the mobile tab bar is 56px plus the safe-area inset, fixed, with the active tab in teal and `aria-current` set.
2. Switching views and returning restores each view's previous scroll position; Explore is the exception only after a filter commit, where it starts at top with 20 rows.
3. At 1100px and up there is no bottom tab bar; a 56px top nav carries the same four views; the views are not merged into one page.

Home density
4. Home header is at most 52px tall and sticky; the KPI strip is at most 56px tall, one row, horizontally scrollable, showing all six stats in the §2.2 order.
5. At 390×844 with no scrolling, all five Top 5 rows are fully visible above the tab bar (total of header + strip + section header + rows + gaps is at most 680px against the §2.4 worst case).
6. Top 5 rows show rank, address, price, $/sqft, and a composite chip with the number printed; rank 1 has the filled brass medallion, gradient border, COMMAND PICK eyebrow, and one reason line.
7. The rank 1 caution ("Under Contract — verify status" in the current data) is visible in its row without opening Detail.
8. A "Browse all 128 homes" button (56px) below the Top 5 switches to Explore; a "How scoring works" control on Home opens the MethodologyDrawer.

Explore density and behaviour
9. On load, the first home row's top edge is at or above 120px from the viewport top; the only sticky elements are the 104px toolbar block.
10. No area chips, quick-filter chips, or sort control are visible outside the filter sheet; the Filters button shows the correct active-count badge (§3.1 formula).
11. The filter sheet contains: area chips with counts (multi-select), the five quick filters with full labels, sort as a radio list of seven options, a live draft result count, Reset, and a "Show N homes" apply button; backdrop/Escape/close discards the draft, Apply commits it.
12. Each Explore row is at most 112px tall (target 92px without flags), shows address, price, $/sqft, the beds · baths · sqft · year · DOM line, and a 40px Deal ring with its number and band word; flags are capped at 2 chips plus a "+n more" suffix; a matched TopPick caution replaces the flag line.
13. Exactly 20 rows render on first paint; "Show more" adds 20 at a time (or the remainder) and displays the remaining count; the full 128 are never rendered in the initial mount.
14. The empty state shows "No homes match these filters." (or the area variant), the active filter names, and a 44px Reset button.

Detail completeness — no lost data
15. Detail opens from Top 5 rows and Explore rows, full-screen on mobile, with a Back button, Escape close, and focus return to the originating row.
16. When present, the status caution banner is the first element in Detail, full text, above the price.
17. Detail shows, in §4.1 order: price; Deal ring (64px) with band word; composite value with band word; full address; area and subdivision; the complete stat line with "Not listed" for nulls; subdivision, schools, flood factor, and HOA from the record.
18. Detail shows the three access bars with the exact derivations of §4.1 step 4, and the sentence "Access scores are area-level estimates (v1)." directly under them.
19. Detail's ratio set is complete: PITI/mo, front-end % against 28%, price vs $301K anchor (% of anchor and delta), price / annual rent, rent ratio, gross rent yield, assumed area median rent, tax estimate per year, $/sqft, loan, and principal and interest.
20. When `hoa_unknown_in_source` is true, the lower-bound note of §4.1 step 7 appears; the estimated-components list is present in Detail (collapsible allowed) and names the scored record's estimated components.
21. Detail shows all flags (uncapped), all highlights, and the inspector note when present; for Top 5 homes it shows the full pick reason; the Deal score breakdown (§4.1 step 5) is present with all six components at 0–100.
22. "View listing" is a full-width 48px primary button in a sticky bottom bar in Detail, linking to the home's URL in a new tab.

Schools and Areas
23. Schools shows the Edition 2 rule line first, all five deadlines with live countdown chips, all ten campuses as compact rows (target 68px, max 84px) with network, grades, rating, and address exactly as stored, and all five zoned district rows with School Access bars plus the estimate sentence.
24. Areas shows the four battle bars in order 75.6 / 68.3 / 67.1 / 64.1 with per-area home counts and median prices; tapping a row lands in Explore with only that area selected, 20 rows, scrolled to top. No DealMap is rendered.

Rules and build
25. `ScoreRing` renders the Book Deal Score only, everywhere; every score on screen (ring, bar, chip) prints its number; no score is carried by colour alone.
26. All interactive elements are at least 44px in their tap dimension; focus outlines are 2px `--brass-bright`; UI copy has no emojis and no exclamation marks; headings and labels are sentence case.
27. Tokens in `:root`, the three font families, and the PWA wiring in `index.html` are byte-identical to before; no file outside the Section 9 list of 7 is modified; no dependency is added.
28. `npm run build` passes, and the built page loads all four views and Detail with the current scored data (128 homes, Top 5 order unchanged, rank 1 caution intact).
