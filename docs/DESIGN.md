# HomeBase — Design Spec

**Product:** HomeBase command center — 128 scored Houston-area homes, $250K–$300K, Stafford / Richmond / Katy 77450 / Cypress. Purchase window 2029, $75K down.
**Stack this spec is written for:** React + TypeScript (Vite), static GitHub Pages, one scored JSON file produced by the Rust scorer. No backend, no map-tile APIs, no animation libraries. One build pass must be able to implement everything below without asking further design questions.
**Audience rule that overrides everything else:** Ayaan reads this on an Android phone first. Mobile is the design. Desktop is the expanded view of the same design, not a different product.
**Copy rules:** Plain language. No emojis anywhere in UI copy. No exclamation marks. Sentence case for headings, labels, and buttons.

---

## 1. Theme decision

### Name: **Meridian Dark**

Reason: HaulBoard is "Market Ledger" — deep green, cream, marigold, a daytime paper-ledger feel for groceries. HomeBase is its sibling, not its twin: same family cues (a warm metallic accent, big confident numerals, cream-grade text warmth) but a different world — night, glass, and instruments instead of paper. "Meridian" names the idea: lines of longitude, highways, a position fixed on a map. It is also the visual signature of the theme — a single brass-to-teal hairline (the meridian line) that runs under the header and reappears as the score-ring gradient.

Rejected alternatives, for the record:

- Light theme — rejected. A command center is read at night, on a couch, next to a spouse. Light themes read as spreadsheets; this must read as an instrument panel. Dark also makes score colour legible at a glance.
- Neon / gamer dark (pure black + electric cyan) — rejected. Noisy, cheap, tiring, and wrong for a $300K family decision.
- Green reuse from HaulBoard — rejected. The two products must be tellable apart in one glance on the phone home screen and in screenshots.

### Dark, warm, quiet

Backgrounds are blue-black ink, never pure black. Colour is rationed: brass is for rank and brand, teal is for data and action, and semantic colour appears only inside scores. If everything glows, nothing does.

---

## 2. Colour system (exact hex)

### Surfaces and text

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#0A0E13` | Page background |
| `--bg-raised` | `#10161F` | Sticky header, control deck background |
| `--panel` | `#131B26` | Cards, KPI tiles, panels |
| `--panel-2` | `#182231` | Raised elements inside cards, featured Top 5 card, drawer |
| `--line` | `#243144` | All borders, dividers, ring/bar tracks |
| `--line-soft` | `#1B2635` | Internal card dividers only |
| `--text` | `#EEF2F6` | Primary text (15.8:1 on `--bg`) |
| `--text-2` | `#A9B7C6` | Secondary text, labels (7.4:1 on `--panel`) |
| `--text-3` | `#718094` | Tertiary/meta only — never body copy, never a score number |
| `--cream` | `#F4E9D4` | The sibling cue from Market Ledger. Used only for the wordmark and the #1 rank numeral |

### Brand and action

| Token | Hex | Use |
|---|---|---|
| `--brass` | `#C9A86A` | Brand accent: wordmark rule, rank medallions, Top 5, focus outline is `--brass-bright` |
| `--brass-bright` | `#E8C87E` | Focus rings, the #1 card border gradient start |
| `--teal` | `#3EC6B8` | Primary data colour: score rings default, links, active filter chips, the meridian line end |
| `--teal-deep` | `#1E7A72` | Teal fills behind white/dark text where contrast is needed |

### Score bands (the only semantic colours, always paired with the number)

| Band | Range | Hex | Label copy |
|---|---|---|---|
| Elite | 80–100 | `#2FD1A7` | Elite |
| Strong | 65–79 | `#8FCB6B` | Strong |
| Fair | 50–64 | `#E3B341` | Fair |
| Weak | 0–49 | `#E0655A` | Weak |

Rule: a score is never shown by colour alone. Every ring, bar, and chip also prints the numeric value.

### Area colours (dots, chips, Area Battle bars — muted, never fills behind text)

| Area | Hex |
|---|---|
| Stafford | `#C9A86A` (brass — the book's #1 area gets the brand colour) |
| Richmond | `#3EC6B8` (teal) |
| Katy 77450 | `#6EA8E1` (soft blue) |
| Cypress | `#A78BDB` (soft violet) |

### CSS delivery

All tokens ship as CSS custom properties on `:root` in one `tokens.css`. Components never hard-code a hex. The meridian gradient is one shared token: `--meridian: linear-gradient(90deg, #C9A86A, #3EC6B8)`.

---

## 3. Typography

Three Google Fonts, limited weights, `display=swap`, preconnected. Total font payload target: under 90 KB.

| Role | Font | Weights | Used for |
|---|---|---|---|
| Display | **Space Grotesk** | 600, 700 | Headings, prices, the wordmark. Geometric, technical, confident — this is what makes it feel like an instrument, not a blog |
| Body | **Inter** | 400, 500, 600 | All UI copy, card text, table text. The most legible phone sans available |
| Data / mono | **JetBrains Mono** | 500, 600 | KPI values, $/sqft, ratios, DOM, deadlines, eyebrow labels. Mono numerals stop prices and scores from jittering as they change |

Type scale (rem, 16px base):

- Wordmark: 1.375rem Space Grotesk 700
- H1 / hero price (#1 pick): 2rem Space Grotesk 700, line-height 1.1
- H2 section titles: 1.25rem Space Grotesk 600
- Card price: 1.5rem Space Grotesk 700
- Body: 1rem Inter 400, line-height 1.5 (16px minimum — no body text below this on mobile)
- Secondary: 0.875rem Inter 400/500
- Eyebrow / label: 0.6875rem JetBrains Mono 600, uppercase, letter-spacing 0.12em, `--text-2`
- KPI value: 1.625rem JetBrains Mono 600
- Score ring centre number: 1.25rem JetBrains Mono 600 (large ring 1.75rem)

Fallback stack if fonts fail: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` — layout must not break.

---

## 4. Layout grid and spacing

Spacing scale (4pt): `4 / 8 / 12 / 16 / 24 / 32 / 48`. Nothing uses an off-scale value.
Radii: cards 16px, tiles and inputs 12px, chips and buttons pill (999px), rings are circles. One shadow only, on the featured card and the drawer: `0 12px 32px rgba(0,0,0,0.45)`.

### Mobile — under 720px (the primary layout)

- Single column, page padding 16px, section gap 32px, card gap 12px.
- Vertical order is fixed and is a product decision, not a layout accident:
  1. `<PulseHeader/>` (compact: wordmark, run date, 2×2 KPI grid)
  2. `<TopFiveHero/>`
  3. `<ControlDeck/>` (sticky — see §8)
  4. Home list (`<HomeCard/>` stack)
  5. `<CharterPanel/>`
  6. `<AreaBattle/>`
  7. Methodology link + footer
- Rationale for the order: the answer (Top 5) comes before the work (filtering 128 homes). Charter and Area Battle are reference sections — after the list, reachable, never in the way.
- Sticky elements: one only at a time. The header is not sticky on mobile; the ControlDeck becomes sticky at the top once scrolled to (it carries the result count, so Ayaan always knows what he is looking at).

### Tablet — 720–1099px

- Page padding 24px, max content width 960px.
- KPI grid 3×2. Top 5: #1 featured full width, #2–5 in a 2×2 grid. Home cards in a 2-column grid.

### Desktop — 1100px and up

- 12-column grid, max width 1440px, page padding 32px, gutter 24px.
- `<PulseHeader/>`: wordmark left, 6 KPI tiles in one row right (each tile min 150px).
- `<TopFiveHero/>`: #1 featured card spans 7 columns; #2–5 ranked rows stack in the remaining 5 columns.
- Main region: home list spans 8 columns; a 4-column rail holds `<CharterPanel/>` (sticky, top offset 24px) above `<AreaBattle/>`.
- Card/table toggle (§7) applies to the 8-column list region.

---

## 5. Pulse header — `<PulseHeader/>` and `<KpiTile/>`

The command-center moment. Six KPI tiles, no more. Each tile: eyebrow label (mono, uppercase), value (JetBrains Mono), and one delta line vs the previous run (for example "−$4,000 vs Oct 22 run") with a plain up/down triangle drawn in CSS — direction colour follows meaning, not movement (a price drop is teal/good, a DOM rise is amber/attention).

| # | Tile | Value source |
|---|---|---|
| 1 | Homes tracked | Count of listings in the scored JSON |
| 2 | Median price | Median of `price` |
| 3 | Median $/sqft | Median of `ppsf` |
| 4 | Median days on market | Median of `dom` (listings with DOM only) |
| 5 | Under the $301K anchor | Count and share priced at or under the 28% anchor |
| 6 | Top deal score | Highest Book Deal Score, with that home's area as the sub-line |

Header also carries: the wordmark "HOMEBASE" (Space Grotesk, `--cream`, with the meridian hairline under it), a sub-line "Houston home command center", the run stamp ("Updated Wed Oct 29 · 128 homes scored · Prices as listed"), and the `<MethodologyDrawer/>` trigger button ("How scoring works"). The meridian hairline is 2px, full width, `--meridian` gradient — the one decorative element in the header.

---

## 6. How scores are visualised — the decision

**Primary: a ring. Secondary: micro-bars. Gauges and radial dials are banned.**

### `<ScoreRing/>` — Book Deal Score only

- One SVG ring per home for the headline Book Deal Score (0–100). Nothing else gets a ring, so the ring always means the same thing.
- Sizes: 56px on `<HomeCard/>`, 64px in the desktop table, 88px on the #1 Top 5 card, 72px on Top 5 ranks 2–5.
- Geometry: stroke width 6px (8px on the 88px ring), track `--line`, progress stroke in the score-band colour, round line caps, rotated −90° so progress starts at the top.
- Centre: the score number in JetBrains Mono. Directly under the ring on cards, the band label in 0.6875rem mono uppercase ("ELITE", "STRONG"…).
- Accessibility: `role="img"` with `aria-label="Book Deal Score 82 of 100, Elite"`. The number is real text, not part of the SVG.
- Animation: on first view the stroke sweeps from 0 to value via a CSS transition on `stroke-dashoffset` (600ms, ease-out, staggered 40ms per card, max 8 cards). See §11.

Why a ring and not a gauge: a semicircular gauge wastes the centre (where the number belongs), reads badly at 56px, and implies a red zone the scoring model does not have. A ring is a progress instrument — it says "how complete is this deal" in a shape Ayaan already reads from his watch and phone battery widgets.

### `<ScoreBar/>` — the four sub-scores

Book sub-components and access scores are shown as micro-bars, never rings:

- School Access, Highway Access, Grocer Access — each 0–10 in the data, displayed as a bar scaled to 10 with the value printed right (`8.5`).
- Bar: 4px tall, track `--line`, fill `--teal` for access scores; the Book Deal sub-components, when shown in the expanded card/detail, use `--brass`.
- Layout per bar: 92px label (Inter 500, 0.875rem), flexible bar, 36px right-aligned mono value. Three bars = one compact block, 3 × 20px rows.
- Why bars here: sub-scores are for comparing across homes, and aligned bars compare; three rings per card would triple the visual noise and halve the scan speed.

### Ratio strip — `<RatioStrip/>`

Ratios are numbers, not graphics. One horizontal strip per card, 4 cells divided by `--line-soft`:

| Cell | Display | Colour rule |
|---|---|---|
| PITI ratio | `26.4%` + label "PITI of income" | Teal at or under 28%, amber 28–31%, weak-red above 31% — always with the number |
| Vs $301K anchor | `−7.0%` / `+2.3%` | Teal when under the anchor, `--text-2` when over (over-anchor is information, not failure) |
| Rent ratio | `0.71×` + label "Price / annual rent" | Neutral `--text` |
| Tax estimate | `$6,240/yr` + label "Tax est." | Neutral `--text`; the corrected Edition 2 formula is named in the methodology drawer, not on the card |

---

## 7. Top 5, cards, and table

### `<TopFiveHero/>` — the hero

Section title: eyebrow "THIS RUN" + H2 "Top 5 recommendations". Ranked by Book Deal Score from the scored JSON (`topFive: true` / rank field from the Rust scorer — the UI never re-ranks).

- **Rank 1 — the Command Pick.** One featured card on `--panel-2`, border: 1px transparent with the `--meridian` gradient border treatment (via `border-image` or a padded wrapper — builder's choice, effect is specified, technique is not). Contains: rank medallion (40px circle, `--brass` fill, `#0A0E13` numeral in `--cream`… medallion numeral in `--bg`), 88px `<ScoreRing/>`, price at H1 size, address, area chip, the full stat row, the three access `<ScoreBar/>`s, the `<RatioStrip/>`, and a "Why it ranks first" block: exactly 2 short reason lines generated from the data (for example lowest PITI ratio in the Top 5; priced under the $301K anchor). Reason lines come from the JSON (`reasons[]`) — the UI does not invent them.
- **Ranks 2–5.** Compact ranked rows (cards on mobile): 28px outlined medallion (brass border, brass numeral, transparent fill), 72px ring, price, address, area, PITI chip, listing link. One line of reason each.
- Every Top 5 entry has a full-width-on-mobile "View listing" button (44px, §12) linking to the source listing URL in a new tab.

### `<HomeCard/>` — card anatomy (top to bottom, no reordering)

1. **Header row:** address (Inter 600, 1rem, two lines max, then ellipsis) + area chip right (area-colour dot 8px + area name, pill, `--panel-2` fill).
2. **Price row:** price (Space Grotesk 700, 1.5rem) + `$/sqft` mono sub-line + `<ScoreRing/>` 56px pinned right.
3. **Stat row:** beds · baths · sqft · year built · DOM — one line, Inter 500, separated by middle dots. Missing value renders "Not listed" in `--text-3`; the slot never collapses, so cards stay one rhythm.
4. **Access bars:** `<ScoreBar/>` × 3 — Schools, Highways, Grocers.
5. **`<RatioStrip/>`** (4 cells, §6).
6. **Flags row:** chips from the flags vocabulary only (`new`, `price-cut`, `new-roof`, `new-mechanicals`, `renovated`, `flip`, `foundation-warranty`, `stale`, `flood-caution`, `incomplete`) rendered in plain words ("Price cut", "New roof"). `flood-caution` gets the amber band colour; all others are neutral outline chips.
7. **Footer:** subdivision (secondary text) left; "View listing" text-button right (44px tall hit area, teal, with a small inline SVG arrow). Below, only when present: the inspector/highlights line in 0.875rem `--text-2`.

Card padding 16px (20px desktop). No photos — listing photos are hot-linked, unreliable, and heavy; the score system is the product. This is also the performance decision (§11).

### Cards vs table — the decision

- **Mobile (under 720px): cards only.** The table toggle is not rendered. A 10-column table on a 380px phone is a pinch-zoom chore, and this user will not do it.
- **Desktop: both, defaulting to cards.** `<ControlDeck/>` carries a segmented Cards / Table toggle. `<HomeTable/>` columns: Rank, Address, Area, Price, $/sqft, Beds/Baths, Sqft, Year, DOM, Deal Score (64px ring), PITI %, Schools. Sticky table header on `--bg-raised`, row height 56px, zebra striping none (row borders `--line-soft` only), the whole row is the listing link except the score cell. Sorting in table mode is by clicking a column header (aria-sort); in card mode sorting lives in the ControlDeck (§8). State (mode, sort, filters) persists in the URL hash so a link shared with Nayab opens the same view.

---

## 8. Filter and sort — `<ControlDeck/>`

Sticky bar on `--bg-raised` with a bottom `--line` border. Contents, in order:

1. **Search** — one text input, placeholder "Search address or subdivision", 44px, full width on mobile. Filters on `address` + `subdivision`, case-insensitive, as-you-type.
2. **Area chips** — All, Stafford, Richmond, Katy, Cypress. Multi-select toggle buttons with the area dot and a live count ("Richmond · 96"). `aria-pressed` on each.
3. **Sort** — one native `<select>` (native = free accessibility and the phone's own picker): Deal score (default), Price: low to high, Price: high to low, $/sqft: low to high, Days on market: longest first, Days on market: newest first, PITI ratio: lowest first.
4. **Quick filters** — toggle chips, all combinable: "Under $301K anchor", "Deal score 70+", "New this run", "Price cuts", "Schools 8+ (charter strength)", "Flood caution: hide".
5. **Result count + reset** — "37 of 128 homes" in mono, announced via `aria-live="polite"`; a "Reset" text button appears only when any filter is active.

Mobile layout: search on its own row; area chips and quick filters are each a single horizontally scrollable row (scrollbar hidden, 8px gap, edge fade via a CSS mask — the established phone pattern from HaulBoard); sort select and result count share the last row. The deck collapses to one row (search icon state is **not** used — search stays visible; hiding search behind an icon is a false economy on a 128-item list).

No sliders, no dual-range inputs, no custom dropdowns — every control above is a native element or a button, which is what makes this buildable in one pass and usable with one thumb.

---

## 9. Charter School panel — `<CharterPanel/>`

Placement: after the home list on mobile; top of the desktop rail.

Structure:

1. **Header:** eyebrow "SCHOOLS" + H2 "Charter school access". One rule line, set in `--cream`, from Edition 2 Ch 20C: "Plan on the zoned campus. A charter seat is lottery upside, never the plan." This sentence is the panel's job — everything else supports it.
2. **Deadline timeline** — `<DeadlineTimeline/>`: three dated nodes on one vertical line (mobile) / horizontal line (desktop rail is too narrow — vertical at all sizes, decided):
   - **Nov 1, 2026** — Harmony Public Schools enrolment opens
   - **Jan 25, 2027** — KIPP Texas enrolment deadline
   - **Feb 10, 2027** — Harmony enrolment closes
   - **Feb 2027** — Lotteries held (both networks)
   Each node: date in mono, event in Inter 500, and a countdown chip computed in the browser from the JSON dates ("in 7 days", "in 92 days", "Closed"). Countdown colour: teal while open, amber inside 30 days, `--text-3` once passed. No countdown library — one date subtraction in a `useMemo`.
3. **Campus cards** — `<CampusCard/>` × the campuses in the JSON (Harmony and KIPP campuses serving the four areas): campus name, network chip (Harmony brass / KIPP teal), grades served, rating as supplied in the data (rendered as supplied — the UI never converts or invents a rating; if the field is absent, "Rating not listed"), and which of the four areas it serves (area dots).
4. **Public school strip** — below the campus cards, one row per area: zoned district name and the area's School Access score as a `<ScoreBar/>` (Stafford/Sugar Land 8.5, Katy 8.25, Cypress 8.25, Richmond 5.75 per Edition 2 — values come from the JSON, these are the current ones). This strip is what keeps the panel honest: charters are the upside, the zoned scores are the baseline every home is actually scored on.
5. **Per-home link:** on `<HomeCard/>`, the Schools bar already carries access; homes whose subdivision sits in a charter-served zone get a small "Charter zone" outline chip in the flags row. That chip is the only charter element on a home card — no per-card charter essays.

---

## 10. Area Battle and deal map — `<AreaBattle/>`

One component, two views, segmented toggle: **Battle** (default) / **Map**.

### Battle view — `<BattleBars/>`

The Edition 2 area deal scores as an animated horizontal bar race, best at top:

| Area | Score |
|---|---|
| Stafford | 75.6 |
| Richmond | 68.3 |
| Katy 77450 | 67.1 |
| Cypress | 64.1 |

Row anatomy: area name + dot, bar (8px, area colour, width = score %, on a `--line` track with faint 25/50/75 gridlines), mono score right, and a secondary line: homes tracked + median price for that area. Stafford's row carries a "Leader" chip (brass outline). Bars animate width 0 → score on first scroll into view (CSS transition 700ms, staggered 80ms; §11). Tapping a row applies that area filter in the ControlDeck and scrolls to the list — the battle is a control, not a poster.

### Map view — `<DealMap/>`

A schematic map, deliberately not a geographic one: an inline SVG line drawing of the four areas in their true relative positions (Stafford south-west inner, Richmond further south-west, Katy west, Cypress north-west) joined by simplified highway lines labelled 59 / 99 / 10 / 290. Each area is a node: a circle sized by homes tracked, filled with the area colour at 20% opacity with a solid stroke, containing its deal score; name and median price beside it. No map tiles, no Leaflet, no API key, no licence problem, loads instantly, and it reads correctly on a phone — a real map at this zoom would show four indistinguishable pins. Tapping a node filters the list, same as the battle rows. `role="img"` with a full text `aria-label` summary; the Battle view remains the accessible equivalent and is the default.

---

## 11. Motion and the wow factor

Motion is CSS only. Properties animated: `transform`, `opacity`, `stroke-dashoffset`, `width` on bars (transform-`scaleX` preferred where the builder can — bar fill uses `transform-origin: left`). Durations 160–240ms for interaction, 600–700ms for the one-time score reveals. Easing: `cubic-bezier(0.22, 1, 0.36, 1)`. Reveal triggers use one shared `IntersectionObserver` hook (`useReveal`) that adds a `.revealed` class once — no scroll listeners, no libraries. `@media (prefers-reduced-motion: reduce)` disables every animation and transition and shows final states.

### The three signature moments

1. **The instruments wake up.** On load, the meridian hairline draws across under the wordmark (scaleX 0 → 1, 500ms), KPI values fade up staggered 50ms apart, and the Top 5 score rings sweep to their values. One second of theatre, then the page is still. It feels like a control center powering on because everything arrives in sequence, not at once.
2. **The Command Pick.** The #1 card's gradient border, 88px ring, H1 price, and its two data-generated reason lines make one home feel like a verdict the system reached, not an item in a list. Sharing a screenshot of this card is the product's word of mouth — it is designed to look complete and decisive in a single phone screenshot.
3. **The bar race.** Scrolling to Area Battle fires the four bars to 75.6 / 68.3 / 67.1 / 64.1 in stagger, Stafford taking the lead in brass. It turns a static book table into a result Ayaan watches happen — and both views end in a working filter, so the moment is functional, not decoration.

Performance guardrails that keep the wow cheap: zero images, zero icon fonts (inline SVG only, 6 icons total: arrow, search, reset, external, chevron, info), no webfont beyond §3, target JS bundle under 200 KB gzipped, all animation on compositor properties. If a mid-range Android cannot hold 60fps, the animation is wrong, not the phone.

---

## 12. States and accessibility

### States

- **Loading:** `<SkeletonCard/>` — panel-coloured blocks (price bar, stat line, ring circle) with a single opacity pulse (1.6s, disabled under reduced motion). Six skeletons. The pulse header renders with em-dash placeholders, never zeros.
- **Empty (filters):** centred panel: "No homes match these filters." + the active filter names + one 44px "Reset filters" button. Never a blank list.
- **Empty (area):** selecting an area with no homes shows the same panel with "No homes in Stafford match the current filters."
- **Data error:** if the scored JSON fails to load: "The latest scores could not be loaded." + a "Try again" button (reload). The static shell and methodology still render.
- **Missing fields:** any absent value (beds, year, DOM, rating) renders "Not listed" in `--text-3`. A missing Deal Score renders the ring as a track-only circle with "—" and the band label "Not scored" — never a guessed score.
- **Stale data:** if the JSON `generated` date is more than 10 days old, a slim amber-outline banner under the header: "Scores are from Oct 18. The next run updates them." Wording names the date; it never says "stale".

### Accessibility (hard requirements, not aspirations)

- Contrast: `--text` on `--bg` 15.8:1; `--text-2` on `--panel` 7.4:1; all score-band colours are used at ring/bar size with a numeric label beside them, and each passes 4.5:1 against `--panel` at that usage. `--text-3` is decorative/meta only.
- Tap targets: every interactive element minimum 44×44px — chips pad to 44px tall, card footer links get 44px hit areas, table rows 56px.
- Focus: `:focus-visible` outline 2px solid `--brass-bright`, offset 2px, on every interactive element. Focus is never removed.
- Semantics: `header` / `main` / `section` with `aria-labelledby` per section; one `h1` (the wordmark line is a `p` styled as brand, the page `h1` is "Top 5 recommendations" — the first content heading); sort is a labelled native select; filter chips are `button` + `aria-pressed`; result count is `aria-live="polite"`.
- Colour independence: every colour-coded fact (score band, PITI health, area, countdown urgency) is also a number or a word on screen.
- Text scaling: layout uses rem throughout and must survive 200% browser font size without overlap — card stat rows wrap, the ratio strip wraps to 2×2.

---

## 13. Methodology drawer — `<MethodologyDrawer/>`

Trigger: "How scoring works" button in the header and a footer link. Behaviour: right slide-over panel on desktop (420px, `--panel-2`, the one big shadow), full-height bottom sheet on mobile (92dvh, top radius 16px). Closes on backdrop tap, the close button (44px), and Escape; focus moves into the drawer on open and returns to the trigger on close. Content is static text shipped in the component — it must render even if the JSON fails.

Sections, in order:

1. **Book Deal Score (Edition 2, Ch 20B)** — the weight table: Value 25 · Tax 25 · Flood and wind 20 · Momentum 10 · Schools 10 · Liquidity 10, one plain sentence each on what the component measures.
2. **The ratios** — PITI ratio against the 28% front-end rule on $100K income; the $301K anchor (28% price anchor; $327K at 31% also stated); rent ratio definition; the corrected tax formula written out: *assessed value × total rate − $140,000 × school rate*.
3. **Access scores (0–10)** — how Highway Access (distance/time bands to 59, 99, 10, 290 and the Grand Parkway), Grocer Access (distance bands to H-E-B, Walmart, Kroger, Aldi and the Stafford-area halal and desi grocers), and School Access (zoned campus quality plus charter presence, per Ch 20C) are banded.
4. **Area scores** — the four Edition 2 area scores, restated, with the note that they inform but do not override a home's own deal score.
5. **Data and limits** — sources (HAR, Redfin, Zillow listings as captured by the weekly and mid-week runs), the run date, "Prices and scores are as listed on the run date. Tax is an estimate. Flood risk needs the full protocol before any offer." Plus the standing inspector line: standard inspection protocol applies when a home gets serious.

---

## 14. Component inventory (build contract)

| Component | Job | Key props |
|---|---|---|
| `<PulseHeader/>` | Wordmark, run stamp, 6 KPI tiles, drawer trigger | `kpis`, `generatedAt`, `previousRun` |
| `<KpiTile/>` | One KPI with delta | `label`, `value`, `delta?`, `sub?` |
| `<TopFiveHero/>` | Ranked Top 5, #1 featured | `homes` (ranked, with `reasons[]`) |
| `<ScoreRing/>` | Deal Score ring | `score`, `size`, `label` |
| `<ScoreBar/>` | One 0–10 access/sub bar | `label`, `value`, `max`, `tone` |
| `<RatioStrip/>` | PITI / anchor / rent / tax cells | `pitiRatio`, `anchorDeltaPct`, `rentRatio`, `taxEstAnnual` |
| `<HomeCard/>` | Full home card (§7 anatomy) | `home`, `rank?` |
| `<HomeTable/>` | Desktop dense table + column sort | `homes`, `sort`, `onSort` |
| `<ControlDeck/>` | Search, area chips, sort, quick filters, count, reset | `filters`, `onChange`, `counts`, `total` |
| `<CharterPanel/>` | Rule line, timeline, campuses, public strip | `campuses`, `deadlines`, `areaSchoolScores` |
| `<DeadlineTimeline/>` | Dated nodes + computed countdown chips | `deadlines` |
| `<CampusCard/>` | One Harmony/KIPP campus | `campus` |
| `<AreaBattle/>` | Battle/Map toggle shell | `areas` |
| `<BattleBars/>` | Animated area score bars; row = filter | `areas`, `onSelect` |
| `<DealMap/>` | Schematic SVG area map; node = filter | `areas`, `onSelect` |
| `<MethodologyDrawer/>` | Bottom sheet / slide-over, static content | `open`, `onClose` |
| `<SkeletonCard/>` | Loading placeholder | — |
| `<EmptyState/>` | Filter/area empty + reset | `message`, `onReset` |

### Scored JSON fields this design requires

Existing listing fields (`url, address, area, subdivision, price, beds, baths, sqft, year, dom, hoa, schools, flood, flags, highlights, inspector, ppsf`) plus, per home: `dealScore`, `scoreBand`, `subScores { value, tax, floodWind, momentum, schools, liquidity }`, `access { schools, highways, grocers }`, `ratios { pitiPct, anchorDeltaPct, rentRatio, taxEstAnnual }`, `charterZone` (boolean), `rank` and `reasons[]` for the Top 5. Top level: `generated`, `kpis { count, medianPrice, medianPpsf, medianDom, underAnchorCount, topScore }`, `previousRun` deltas for the KPI tiles, `areas[] { name, dealScore, count, medianPrice }`, `charter { deadlines[], campuses[], areaSchoolScores[] }`. Any field may be null — §12 missing-field rules apply. If the Rust scorer emits different names, the mapping happens in one `adapt.ts` at the data boundary, never inside components.

---

## 15. What this design deliberately does not do

- No photos, no map tiles, no charts library, no animation library — performance and one-pass buildability.
- No accounts, no favourites sync, no backend — favourites, if ever, are `localStorage` and a later spec.
- No light mode. One theme, done properly.
- No per-home essays. The card is data; the reasons live only on the Top 5, where a decision is actually being recommended.
