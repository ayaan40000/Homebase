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
  scores: Scores
  ratios: Ratios
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

export const AREAS = ['Stafford', 'Richmond', 'Katy', 'Cypress'] as const

export const AREA_COLORS: Record<string, string> = {
  Stafford: '#C9A86A',
  Richmond: '#3EC6B8',
  Katy: '#6EA8E1',
  Cypress: '#A78BDB',
}

/** Area-level book scores (Edition 2, Ch 20B) — also used as AreaBattle filters. */
export const AREA_BOOK_SCORES: Record<string, number> = {
  Stafford: 75.6,
  Richmond: 68.3,
  Katy: 67.1,
  Cypress: 64.1,
}

export const AREA_SCHOOL_ACCESS: Record<string, number> = {
  Stafford: 8.5,
  Katy: 8.25,
  Cypress: 8.25,
  Richmond: 5.75,
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
