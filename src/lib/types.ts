export interface Scores {
  deal_score: number | null
  composite_home_score: number | null
  components_0_100: {
    value: number
    carrying_cost: number
    flood_wind: number
    momentum: number
    schools_in_deal: number
    liquidity: number
    school_access_rescaled: number
    highway_access: number
    grocer_access: number
  }
  school_access_0_10: number
  area_deal_score_book: number
  commute_annual_cost_book: string
  estimated: boolean
  estimated_components: string[]
}

/** Book Match (2026-11-18): how closely a listing matches The Houston Book
 *  Edition 2's recommended buy — computed by the Rust scorer on every run
 *  (docs/SCORING.md §10). Components are points earned; size_fit/value are
 *  null when the source carries no size, in which case the remaining
 *  components were pro-rated to 100 and `estimated` is true. */
export interface BookMatch {
  score: number // 0–100
  band: string // 'Strong Book match' | 'Good' | 'Partial' | 'Off-Book'
  estimated: boolean
  sizeFlag: 'small' | 'large' | null // small: under 1,600 sqft · large: 2,800+ sqft
  components: {
    size_fit: number | null // of 40
    value: number | null // of 25
    price_band: number // of 15
    tax: number // of 20
  }
  notes: string[] // one generated bullet per criterion: size, value, price, tax
}

export function bookBandColor(band: string): string {
  switch (band) {
    case 'Strong Book match':
      return '#2FD1A7'
    case 'Good':
      return '#8FCB6B'
    case 'Partial':
      return '#E3B341'
    default:
      return '#E0655A'
  }
}

export interface Ratios {
  ppsf: number | null
  price_vs_anchor_pct: number
  price_vs_anchor_delta_pct: number
  price_vs_31pct_anchor_pct: number
  loan_usd: number
  principal_interest_monthly_usd: number
  annual_tax_usd: number
  est_monthly_piti_usd: number
  front_end_ratio_pct: number
  assumed_area_median_rent_usd_mo: number
  rent_ratio_pct: number
  gross_rent_yield_pct: number
  hoa_unknown_in_source: boolean
  estimated: boolean
}

export interface PricePoint {
  date: string // ISO date the price was observed
  price: number
}

export interface Home {
  url: string
  address: string
  area: string
  areaRank: number
  subdivision: string
  price: number
  beds: number | null
  baths: number | null
  sqft: number | null
  year: number | null
  dom: number | null
  hoa: string
  schools: string
  flood: number | null
  flags: string[]
  highlights: string[]
  inspector: string
  ppsf: number | null
  // Phase 1 schema fields (carried through the scorer untouched)
  builder: string | null
  status: string // active / under-contract / pending / sold / unknown
  firstSeen: string // ISO date the watch first added this listing
  lastVerified: string // ISO date the listing was last actually checked
  priceHistory: PricePoint[] // append-only, oldest first
  scores: Scores
  ratios: Ratios
  bookMatch: BookMatch
}

export const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  'under-contract': 'Under contract',
  pending: 'Pending',
  sold: 'Sold',
  unknown: 'Status unknown',
}

export const statusLabel = (s: string): string => STATUS_LABELS[s] ?? s

/** One run's mechanical delta (tools/make_delta.py) — the single source
 *  the "What changed" view and both run reports read. */
export interface DeltaRun {
  generated: string
  previousCount: number
  currentCount: number
  added: Array<{ address: string; url: string; price: number }>
  removed: Array<{ address: string; url: string; price: number }>
  priceChanged: Array<{
    address: string
    url: string
    from: number
    to: number
    change: number
    pct: number
  }>
  statusChanged: Array<{ address: string; url: string; from: string; to: string }>
}

export interface DeltaHistory {
  generated: string
  runs: DeltaRun[] // newest first
}

/** '2026-11-07' -> 'Nov 7' (year appended when withYear). */
export function fmtDate(iso: string, withYear = false): string {
  const d = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(d.getTime()) || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return iso
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(withYear ? { year: 'numeric' } : {}),
  })
}

/** Whole days from one ISO date to another (b - a). */
export function daysBetween(a: string, b: string): number {
  const da = new Date(`${a}T12:00:00`).getTime()
  const db = new Date(`${b}T12:00:00`).getTime()
  if (Number.isNaN(da) || Number.isNaN(db)) return 0
  return Math.round((db - da) / 86400000)
}

/** Honesty state for an area with zero homes in the $250K–$300K band:
 *  the empty area is a finding, stated in words — never a blank list
 *  presented as if it were a full comparison. */
export function emptyAreaNote(area: string): string {
  switch (area) {
    case 'Stafford':
      return 'No homes in the $250K–$300K band in Stafford this run — the Book’s top-rated area is also its scarcest in band.'
    case 'Cypress':
      return 'No homes in the $250K–$300K band in Cypress this run — only Coles Crossing, Fairfield and Cypress Point count, and none has an in-band listing right now.'
    case 'Katy':
      return 'No homes in the $250K–$300K band in Katy (77450, Katy ISD) this run.'
    default:
      return `No homes in the $250K–$300K band in ${area} this run.`
  }
}

export interface TopPick {
  rank: number
  address: string
  area: string
  subdivision: string
  price: number
  beds: number | null
  baths: number | null
  sqft: number | null
  year: number | null
  dom: number | null
  ppsf: number | null
  url: string
  composite_home_score: number
  deal_score: number
  est_monthly_piti_usd: number
  front_end_ratio_pct: number
  flags: string[]
  reason: string
  status_caution?: string
}

export const AREAS = [
  'Stafford',
  'Richmond',
  'Katy',
  'Cypress',
  'Rosenberg',
  'Missouri City',
  'Fresno',
  'Needville',
] as const

export const AREA_COLORS: Record<string, string> = {
  Stafford: '#C9A86A',
  Richmond: '#3EC6B8',
  Katy: '#6EA8E1',
  Cypress: '#A78BDB',
  Rosenberg: '#E39A5F',
  'Missouri City': '#64B98A',
  Fresno: '#C97B9A',
  Needville: '#9AA86B',
}

/**
 * Area-level book scores (Edition 2, Ch 20B) — also used as AreaBattle filters.
 * Rosenberg uses the Book's Richmond figure (the Book groups them). Missouri
 * City, Fresno and Needville are extension estimates (scoring model §10,
 * 2026-11-18) — the Book does not score those areas separately.
 */
export const AREA_BOOK_SCORES: Record<string, number> = {
  Stafford: 75.6,
  Richmond: 68.3,
  Katy: 67.1,
  Cypress: 64.1,
  Rosenberg: 68.3,
  'Missouri City': 73.0,
  Fresno: 70.0,
  Needville: 60.0,
}

export const AREA_SCHOOL_ACCESS: Record<string, number> = {
  Stafford: 8.5,
  Katy: 8.25,
  Cypress: 8.25,
  Richmond: 5.75,
  Rosenberg: 5.75,
  'Missouri City': 8.5,
  Fresno: 8.5,
  Needville: 5.0,
}

export function bandFor(score: number | null): { label: string; color: string } {
  if (score == null) return { label: 'Not scored', color: '#718094' }
  if (score >= 80) return { label: 'Elite', color: '#2FD1A7' }
  if (score >= 65) return { label: 'Strong', color: '#8FCB6B' }
  if (score >= 50) return { label: 'Fair', color: '#E3B341' }
  return { label: 'Weak', color: '#E0655A' }
}

export const money = (n: number | null | undefined): string =>
  n == null ? 'Not listed' : '$' + Math.round(n).toLocaleString('en-US')

export const num = (n: number | null | undefined): string =>
  n == null ? 'Not listed' : String(n)

export function median(values: number[]): number | null {
  const v = values.filter((x) => x != null && !Number.isNaN(x)).sort((a, b) => a - b)
  if (!v.length) return null
  const mid = Math.floor(v.length / 2)
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2
}

export const FLAG_LABELS: Record<string, string> = {
  new: 'New',
  'price-cut': 'Price cut',
  'new-roof': 'New roof',
  'new-mechanicals': 'New mechanicals',
  renovated: 'Renovated',
  flip: 'Flip',
  'foundation-warranty': 'Foundation warranty',
  stale: 'Stale',
  'flood-caution': 'Flood caution',
  incomplete: 'Incomplete',
}
