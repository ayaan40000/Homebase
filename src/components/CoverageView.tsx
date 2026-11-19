/**
 * Coverage audit view — static, informational. Content audited 2026-11-18
 * from builder pages, HAR listings and county/district sources; it is NOT
 * part of the listings pipeline and carries no listing data.
 *
 * Why this exists: a TikTok flyer for a $235K "Richmond" home turned out to
 * be Lennar's Cobb plan at Monarch Landing, Needville 77461 — outside the
 * watch's original seven ZIPs (77477, 77489, 77450, 77429, 77406, 77407,
 * 77469). This view maps the adjacent ring the watch did not scan, so a
 * coverage gap is a visible finding, not a silent one.
 *
 * Update 2026-11-18 (owner's decision): 77471 Rosenberg, 77545 Fresno,
 * 77459 Missouri City and 77461 Needville were added to the watch the same
 * day the audit published. They render below as "Added to the watch" and
 * as watched ground on the map; the remaining cards are the areas still
 * outside the eleven-ZIP footprint.
 *
 * Distances are straight-line from Stafford 77477 (ZIP/post-office
 * centroids). Drive times are estimates and are labelled unverified.
 * Tax figures are TOTAL combined rates (county + school + city/MUD/LID)
 * unless a line says "district-only".
 */

type Verdict = 'miss' | 'marginal' | 'out' | 'added'

interface AdjacentArea {
  zip: string
  town: string
  verdict: Verdict
  verdictLabel: string
  direction: string
  miles: number
  drive: string
  district: string
  tax: string
  communities: Array<{ name: string; builder: string; price: string }>
  note: string
  lat: number
  lon: number
  labelSide: 'start' | 'end'
}

const ADJACENT: AdjacentArea[] = [
  {
    zip: '77471',
    town: 'Rosenberg',
    verdict: 'added',
    verdictLabel: 'Added to the watch · Nov 18, 2026',
    direction: 'West',
    miles: 14.9,
    drive: '~26 min',
    district: 'Lamar CISD',
    tax: '≈2.75% total at Sunset Crossing (MUD-dependent)',
    communities: [
      { name: 'Holly Ridge', builder: 'D.R. Horton', price: 'from $239,990' },
      { name: 'Milo Farms', builder: 'D.R. Horton', price: 'from $239,990' },
    ],
    note: 'The closest real miss. Both communities start below the band floor with move-in-ready homes inside $250K–$300K. (Some "Rosenberg" communities carry 77469 addresses the watch already saw; 77471 proper was not scanned until it was added on Nov 18, 2026.)',
    lat: 29.557,
    lon: -95.808,
    labelSide: 'end',
  },
  {
    zip: '77545',
    town: 'Fresno',
    verdict: 'added',
    verdictLabel: 'Added to the watch · Nov 18, 2026',
    direction: 'Southeast',
    miles: 8.5,
    drive: '~20–25 min',
    district: 'Fort Bend ISD',
    tax: '≈2.98–3.01% total at Olympia Falls',
    communities: [
      { name: 'Olympia Falls', builder: 'KB Home', price: 'from $238,995 — many plans $250K–$300K' },
      { name: 'Olympia Fields', builder: 'Long Lake Ltd', price: 'low plans from $267,990' },
    ],
    note: 'The strongest miss in the audit: two builders, multiple detached plans squarely in band, ~9 miles from Stafford.',
    lat: 29.545,
    lon: -95.44,
    labelSide: 'start',
  },
  {
    zip: '77459',
    town: 'Missouri City',
    verdict: 'added',
    verdictLabel: 'Added to the watch · Nov 18, 2026',
    direction: 'Southeast · next door',
    miles: 6.3,
    drive: '~15–20 min',
    district: 'Fort Bend ISD',
    tax: 'Sienna 2.29–2.94% total by MUD (Parkway Commons rate unverified)',
    communities: [
      { name: 'Parkway Commons', builder: 'Meritage Homes', price: 'from $249,990' },
      { name: 'Sienna', builder: 'multiple', price: 'from ~$328,000 — above band' },
    ],
    note: 'Sienna alone would be correctly out — its floor is ~$328K. Parkway Commons, in northern 77459 near the Fort Bend Parkway, is real in-band new construction the watch never saw — 77459 was added on Nov 18, 2026.',
    lat: 29.53,
    lon: -95.5,
    labelSide: 'start',
  },
  {
    zip: '77461',
    town: 'Needville',
    verdict: 'added',
    verdictLabel: 'Added to the watch · Nov 18, 2026',
    direction: 'South',
    miles: 22.6,
    drive: '~35–45 min',
    district: 'Needville ISD',
    tax: '≈3.55% total at Monarch Landing (community rate; Needville town without a MUD totals ≈1.94%)',
    communities: [
      { name: 'Monarch Landing', builder: 'Lennar', price: 'Cobb plan base $282,990; inventory from $247,990' },
      { name: 'August Trails', builder: 'D.R. Horton', price: 'from $234,990' },
    ],
    note: 'The case that prompted this audit. Monarch Landing sits between SH-36 and FM 361, ~7 miles NE of Needville town on the Rosenberg side. The flyer’s $235K was a community-level figure — the Cobb itself bases at $282,990, with discounted inventory homes at $247,990–$272,990.',
    lat: 29.39,
    lon: -95.85,
    labelSide: 'end',
  },
  {
    zip: '77417',
    town: 'Beasley',
    verdict: 'miss',
    verdictLabel: 'Real miss',
    direction: 'Southwest · US-59',
    miles: 22.6,
    drive: '~30–35 min',
    district: 'Lamar CISD',
    tax: '≈3.17% total at Emberly',
    communities: [
      { name: 'Emberly', builder: 'Lennar', price: 'Cottage Collection from $225,990' },
      { name: 'Emberly', builder: 'CastleRock', price: 'plans from $264,990' },
      { name: 'Emberly', builder: 'Davidson Homes', price: 'from $263,990' },
    ],
    note: 'One master-planned community, three builders, deep $250K–$300K inventory — at a drive comparable to Needville.',
    lat: 29.497,
    lon: -95.918,
    labelSide: 'end',
  },
  {
    zip: '77583',
    town: 'Iowa Colony / Rosharon',
    verdict: 'miss',
    verdictLabel: 'Real miss',
    direction: 'South-southeast · SH-288',
    miles: 15.6,
    drive: '~25–35 min',
    district: 'Alvin ISD',
    tax: '≈3.1–3.3% total, typical of the master-planned stock',
    communities: [
      { name: 'Creekhaven', builder: 'Smith Douglas + others', price: 'from $275,990 (flyer pricing from $249K)' },
      { name: 'Canterra Creek', builder: 'D.R. Horton', price: 'from $247,990' },
      { name: 'Meridiana', builder: 'multiple', price: 'detached from ~$339,000 — above band' },
    ],
    note: 'Meridiana itself is above band for detached homes (only its townhomes reach the band, and the watch is single-family). The miss is the smaller communities around it.',
    lat: 29.44,
    lon: -95.42,
    labelSide: 'start',
  },
  {
    zip: '77423',
    town: 'Brookshire',
    verdict: 'miss',
    verdictLabel: 'Real miss',
    direction: 'West-northwest · I-10',
    miles: 26.7,
    drive: '~40–50 min',
    district: 'Royal ISD',
    tax: '≈3.26–3.32% total at Sunterra Lakes',
    communities: [
      { name: 'Sunterra Lakes', builder: 'Lennar / D.R. Horton / Starlight', price: 'from $239,990–$250,000' },
      { name: 'Laurel Farms', builder: 'Century Communities', price: 'from $248,990' },
    ],
    note: 'The densest in-band stock in the audit — multiple communities and builders at $250K–$300K. The caveats are Royal ISD and a ~3.3% MUD-heavy tax rate, not price.',
    lat: 29.782,
    lon: -95.953,
    labelSide: 'end',
  },
  {
    zip: '77493',
    town: 'Katy North',
    verdict: 'miss',
    verdictLabel: 'Real miss',
    direction: 'Northwest · SH-99',
    miles: 20.0,
    drive: '~40–50 min',
    district: 'Katy ISD',
    tax: '≈3.2–3.65% total at Sunterra',
    communities: [
      { name: 'Sunterra', builder: 'multiple builders', price: 'from $249,990 across collections' },
      { name: 'Elyson', builder: 'multiple', price: 'from the low $300,000s — mostly above band' },
    ],
    note: 'Driven by Sunterra alone: a large multi-builder master plan with repeated $250K–$300K detached starting prices. High tax (~3.3%+) is the main downside.',
    lat: 29.85,
    lon: -95.85,
    labelSide: 'start',
  },
  {
    zip: '77441',
    town: 'Fulshear',
    verdict: 'miss',
    verdictLabel: 'Real miss — narrow',
    direction: 'West-northwest',
    miles: 21.3,
    drive: '~35–45 min',
    district: 'Lamar CISD / Katy ISD (split by address)',
    tax: '≈2.60–3.17% total by community',
    communities: [
      { name: 'Tamarron', builder: 'D.R. Horton', price: 'from $279,990' },
      { name: 'Summerview', builder: 'M/I Homes', price: 'from $270,490' },
    ],
    note: 'The flagship Fulshear communities (Cross Creek Ranch, Jordan Ranch) start in the high $300Ks and up — hopeless for the band. Tamarron and Summerview are the real, narrower miss.',
    lat: 29.69,
    lon: -95.897,
    labelSide: 'end',
  },
  {
    zip: '77433',
    town: 'Cypress (Bridgeland side)',
    verdict: 'marginal',
    verdictLabel: 'Marginal',
    direction: 'Northwest · US-290',
    miles: 25.7,
    drive: '~45–55 min',
    district: 'Cy-Fair ISD',
    tax: '≈2.6–3.2% total in Bridgeland, by section',
    communities: [
      { name: 'Marvida', builder: 'M/I Homes', price: 'detached from $290,490; Trails from $275,995' },
      { name: 'Bridgeland', builder: 'multiple', price: 'detached from ~$380,000 — above band' },
    ],
    note: 'The watch’s Bridgeland exclusion checks out: no detached single-family there starts under ~$380K, and the only sub-$300K Bridgeland product is townhomes. A thin in-band detached pocket exists at Marvida, at the top slice of the band and the longest drive in this audit.',
    lat: 29.985,
    lon: -95.85,
    labelSide: 'start',
  },
  {
    zip: '77494',
    town: 'Katy South (Cinco Ranch)',
    verdict: 'marginal',
    verdictLabel: 'Marginal',
    direction: 'West-northwest',
    miles: 17.3,
    drive: '~30–40 min',
    district: 'Katy ISD',
    tax: '≈2.07–2.20% total in established Cinco Ranch',
    communities: [
      { name: 'Cinco Ranch', builder: 'multiple', price: 'new construction from ~$450,000 — above band' },
      { name: 'Tamarron (77494 edge)', builder: 'D.R. Horton', price: '$289,990–$299,990' },
    ],
    note: 'Cinco Ranch proper has no in-band new construction. The only touch is Tamarron spilling into the ZIP’s western edge at the very top of the band — covered if Tamarron is ever added under 77441.',
    lat: 29.735,
    lon: -95.82,
    labelSide: 'start',
  },
  {
    zip: '77485',
    town: 'Wallis',
    verdict: 'marginal',
    verdictLabel: 'Marginal',
    direction: 'West · SH-36',
    miles: 29.4,
    drive: '~40–50 min',
    district: 'Brazos ISD',
    tax: '≈2.12% total in-city (Millbrooke-specific rate unverified)',
    communities: [
      { name: 'Millbrooke', builder: 'D.R. Horton', price: 'from $229,990 — coming soon / to-be-built only' },
    ],
    note: 'In band on paper, but every listing is to-be-built with no move-in-ready inventory yet, at the longest drive in the audit. Worth a re-check once Millbrooke has real inventory.',
    lat: 29.631,
    lon: -96.062,
    labelSide: 'end',
  },
  {
    zip: '77464',
    town: 'Orchard',
    verdict: 'out',
    verdictLabel: 'Correctly out',
    direction: 'West · SH-36',
    miles: 24.0,
    drive: '~35–45 min',
    district: 'Brazos ISD',
    tax: 'Total rate unverified (Brazos ISD district-only 0.9569%)',
    communities: [],
    note: 'No production new-build community exists in this ZIP — searches returned only resales, lots and land. Nothing to miss; its buyers are served by communities in adjacent ZIPs.',
    lat: 29.602,
    lon: -95.968,
    labelSide: 'end',
  },
]

/** The eleven watched ZIPs — shown as covered ground on the map. */
const WATCHED: Array<{ zip: string; town: string; lat: number; lon: number; labelSide: 'start' | 'end' }> = [
  { zip: '77489', town: 'Missouri City', lat: 29.648, lon: -95.506, labelSide: 'start' },
  { zip: '77450', town: 'Katy', lat: 29.786, lon: -95.803, labelSide: 'end' },
  { zip: '77429', town: 'Cypress', lat: 29.969, lon: -95.685, labelSide: 'start' },
  { zip: '77406', town: 'Richmond', lat: 29.6, lon: -95.75, labelSide: 'end' },
  { zip: '77407', town: 'Richmond', lat: 29.53, lon: -95.78, labelSide: 'end' },
  { zip: '77469', town: 'Richmond', lat: 29.52, lon: -95.65, labelSide: 'start' },
  { zip: '77471', town: 'Rosenberg', lat: 29.557, lon: -95.808, labelSide: 'end' },
  { zip: '77459', town: 'Missouri City', lat: 29.53, lon: -95.5, labelSide: 'start' },
  { zip: '77545', town: 'Fresno', lat: 29.545, lon: -95.44, labelSide: 'start' },
  { zip: '77461', town: 'Needville', lat: 29.39, lon: -95.85, labelSide: 'end' },
]

const STAFFORD = { lat: 29.616, lon: -95.558 }
/** Monarch Landing sits NE of Needville town, on the Rosenberg side of 77461. */
const MONARCH = { lat: 29.47, lon: -95.72 }

const VERDICT_FILL: Record<Verdict, string> = {
  miss: '#E8C87E',
  marginal: '#6EA8E1',
  out: '#0A0E13',
  added: '#3EC6B8',
}
const VERDICT_STROKE: Record<Verdict, string> = {
  miss: '#E8C87E',
  marginal: '#6EA8E1',
  out: '#718094',
  added: '#3EC6B8',
}

function project(lat: number, lon: number): [number, number] {
  const x = 40 + ((lon + 96.12) / 0.8) * 680
  const y = 560 - ((lat - 29.32) / 0.74) * 520
  return [Math.round(x), Math.round(y)]
}

function CoverageMap() {
  const [sx, sy] = project(STAFFORD.lat, STAFFORD.lon)
  const [mx, my] = project(MONARCH.lat, MONARCH.lon)
  return (
    <svg
      className="cov-map"
      viewBox="0 0 760 600"
      role="img"
      aria-label="Schematic map of the watch footprint and the adjacent areas audited around it"
    >
      {/* Schematic highway traces — orientation only */}
      <g stroke="#243144" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.7">
        {/* I-69 / US-59: Beasley → Rosenberg → Stafford → NE */}
        <polyline points="212,437 305,394 355,363 518,352 620,300" />
        {/* SH-36: Wallis → Orchard → Rosenberg → Needville → SE */}
        <polyline points="89,342 169,363 305,394 380,454 270,511 420,560" />
        {/* SH-99 arc: Cypress → Katy → Fulshear → Richmond */}
        <polyline points="410,104 309,233 230,300 329,413" />
        {/* US-290: Cypress 77433 → NW corner */}
        <polyline points="270,89 410,104 560,120" />
        {/* SH-288: Stafford → Iowa Colony */}
        <polyline points="518,352 560,420 635,476" />
      </g>
      <g fill="#718094" fontSize="10" fontFamily="'JetBrains Mono', monospace">
        <text x="470" y="330">I-69</text>
        <text x="330" y="490">SH-36</text>
        <text x="252" y="360">SH-99</text>
        <text x="330" y="86">US-290</text>
        <text x="580" y="440">SH-288</text>
      </g>

      {/* Watched ZIPs */}
      {WATCHED.map((w) => {
        const [x, y] = project(w.lat, w.lon)
        const anchor = w.labelSide
        const tx = anchor === 'start' ? x + 12 : x - 12
        return (
          <g key={w.zip}>
            <circle cx={x} cy={y} r="6" fill="#3EC6B8" opacity="0.9" />
            <text
              x={tx}
              y={y - 2}
              textAnchor={anchor}
              fill="#A9B7C6"
              fontSize="11.5"
              fontWeight="600"
            >
              {w.town} {w.zip}
            </text>
            <text x={tx} y={y + 12} textAnchor={anchor} fill="#718094" fontSize="10">
              watched
            </text>
          </g>
        )
      })}

      {/* Adjacent audited areas still outside the watch */}
      {ADJACENT.filter((a) => a.verdict !== 'added').map((a) => {
        const [x, y] = project(a.lat, a.lon)
        const anchor = a.labelSide
        const tx = anchor === 'start' ? x + 13 : x - 13
        return (
          <g key={a.zip}>
            <circle
              cx={x}
              cy={y}
              r="8"
              fill={VERDICT_FILL[a.verdict]}
              stroke={VERDICT_STROKE[a.verdict]}
              strokeWidth="2"
            />
            <text
              x={tx}
              y={y - 2}
              textAnchor={anchor}
              fill="#EEF2F6"
              fontSize="12"
              fontWeight="600"
            >
              {a.town} {a.zip}
            </text>
            <text x={tx} y={y + 12} textAnchor={anchor} fill="#A9B7C6" fontSize="10.5">
              {a.miles.toFixed(1)} mi · {a.drive}
            </text>
          </g>
        )
      })}

      {/* Monarch Landing callout */}
      <g>
        <line x1={mx} y1={my} x2={mx - 58} y2={my - 34} stroke="#C9A86A" strokeWidth="1.2" />
        <rect x={mx - 12} y={my - 12} width="9" height="9" transform={`rotate(45 ${mx} ${my})`} fill="#C9A86A" />
        <text x={mx - 62} y={my - 40} textAnchor="end" fill="#E8C87E" fontSize="11.5" fontWeight="700">
          ◆ Monarch Landing
        </text>
        <text x={mx - 62} y={my - 27} textAnchor="end" fill="#A9B7C6" fontSize="10">
          the Cobb case — in 77461, NE of town
        </text>
      </g>

      {/* Stafford — home */}
      <g>
        <circle cx={sx} cy={sy} r="17" fill="none" stroke="#F4E9D4" strokeWidth="1.2" opacity="0.55" />
        <path
          d={`M ${sx} ${sy - 9} L ${sx + 2.6} ${sy - 2.6} L ${sx + 9} ${sy - 2.4} L ${sx + 3.8} ${sy + 1.8} L ${sx + 5.6} ${sy + 8.6} L ${sx} ${sy + 4.4} L ${sx - 5.6} ${sy + 8.6} L ${sx - 3.8} ${sy + 1.8} L ${sx - 9} ${sy - 2.4} L ${sx - 2.6} ${sy - 2.6} Z`}
          fill="#F4E9D4"
        />
        <text x={sx} y={sy + 32} textAnchor="middle" fill="#F4E9D4" fontSize="12.5" fontWeight="700">
          STAFFORD 77477
        </text>
        <text x={sx} y={sy + 46} textAnchor="middle" fill="#A9B7C6" fontSize="10.5">
          home · watched
        </text>
      </g>

      {/* Compass */}
      <g transform="translate(716 44)">
        <circle r="17" fill="none" stroke="#243144" />
        <path d="M0 -12 L4 3 L0 0 L-4 3 Z" fill="#C9A86A" />
        <text y="-22" textAnchor="middle" fill="#A9B7C6" fontSize="11" fontWeight="700">
          N
        </text>
      </g>

      {/* Legend */}
      <g transform="translate(36 566)" fontSize="11" fill="#A9B7C6">
        <circle cx="6" cy="-4" r="5" fill="#3EC6B8" />
        <text x="16" y="0">Watched</text>
        <circle cx="96" cy="-4" r="6" fill="#E8C87E" />
        <text x="108" y="0">Real miss</text>
        <circle cx="186" cy="-4" r="6" fill="#6EA8E1" />
        <text x="198" y="0">Marginal</text>
        <circle cx="272" cy="-4" r="6" fill="#0A0E13" stroke="#718094" strokeWidth="2" />
        <text x="284" y="0">Correctly out</text>
      </g>
    </svg>
  )
}

function AreaCard({ area }: { area: AdjacentArea }) {
  return (
    <section className="cov-card" aria-label={`${area.town} ${area.zip}`}>
      <header className="cov-card-head">
        <h3 className="cov-card-title">
          {area.town} · {area.zip}
        </h3>
        <span className={`cov-badge cov-badge-${area.verdict}`}>{area.verdictLabel}</span>
      </header>
      <p className="cov-card-meta mono">
        {area.direction} · {area.miles.toFixed(1)} mi · {area.drive} drive (est.)
      </p>
      <dl className="cov-facts">
        <div>
          <dt>Schools</dt>
          <dd>{area.district}</dd>
        </div>
        <div>
          <dt>Tax</dt>
          <dd>{area.tax}</dd>
        </div>
      </dl>
      {area.communities.length > 0 && (
        <ul className="cov-communities">
          {area.communities.map((c) => (
            <li key={`${c.name}-${c.builder}`}>
              <span className="cov-community-name">{c.name}</span>
              <span className="cov-community-detail">
                {c.builder} — {c.price}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="cov-note">{area.note}</p>
    </section>
  )
}

export default function CoverageView() {
  const added = ADJACENT.filter((a) => a.verdict === 'added')
  const misses = ADJACENT.filter((a) => a.verdict === 'miss')
  const marginal = ADJACENT.filter((a) => a.verdict === 'marginal')
  const out = ADJACENT.filter((a) => a.verdict === 'out')
  return (
    <div className="coverage-view-inner">
      <header className="view-header">
        <h2 className="view-title">Beyond the watch</h2>
        <span className="view-header-meta mono">Coverage audit · Nov 18, 2026 · updated Nov 18, 2026 — four ZIPs added to the watch</span>
      </header>
      <p className="areas-intro">
        The watch scanned seven ZIPs when this audit ran. A “Richmond” flyer for Lennar’s Cobb
        plan turned out to sit in Needville — real in-band homes the scans never saw. This is
        the audit of the ring around the footprint: 13 adjacent ZIPs checked for the same
        pattern. Four of them joined the watch on Nov 18, 2026 (owner’s decision); the watch
        now scans eleven ZIPs.
      </p>

      <div className="cov-map-wrap">
        <CoverageMap />
        <p className="cov-map-caption">
          Schematic — not to scale. Positions follow ZIP centroids; distances are straight-line
          from Stafford 77477 and drive times are estimates (unverified).
        </p>
      </div>

      <p className="cov-tax-note">
        <strong>Tax, compared like with like:</strong> every rate in these cards is a TOTAL
        combined rate. The Book’s watch areas total Stafford 1.73% · Katy 2.08% · Cypress 2.20% ·
        Richmond 2.29%. Monarch Landing’s ≈3.55% is its community total — the gap is MUD/special
        districts, not the town (Needville without a MUD totals ≈1.94%). District-only rates are a
        different figure: Fort Bend ISD is 0.9869% on its own.
      </p>

      <h3 className="cov-section-title">Added to the watch — Nov 18, 2026 (owner’s decision)</h3>
      {added.map((a) => (
        <AreaCard key={a.zip} area={a} />
      ))}

      <h3 className="cov-section-title">Real misses — in-band new construction still outside the footprint</h3>
      {misses.map((a) => (
        <AreaCard key={a.zip} area={a} />
      ))}

      <h3 className="cov-section-title">Marginal — thin, top-of-band, or not built yet</h3>
      {marginal.map((a) => (
        <AreaCard key={a.zip} area={a} />
      ))}

      <h3 className="cov-section-title">Correctly out</h3>
      {out.map((a) => (
        <AreaCard key={a.zip} area={a} />
      ))}

      <p className="cov-footer mono">
        Coverage audit · audited Nov 18, 2026 · updated Nov 18, 2026 · Community-level evidence
        from builder pages, HAR listings and district/county sources. Starting prices move with
        inventory and incentives. Rosenberg 77471, Fresno 77545, Missouri City 77459 and
        Needville 77461 were added to the watch on Nov 18, 2026 by owner decision; the other
        areas on this page remain outside it.
      </p>
    </div>
  )
}
