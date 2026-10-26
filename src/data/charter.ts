export interface Deadline {
  date: string // ISO date, or '' when month-only
  display: string
  event: string
}

export const CHARTER_RULE =
  'Plan on the zoned campus. A charter seat is lottery upside, never the plan.'

export const DEADLINES: Deadline[] = [
  { date: '2026-11-01', display: 'Nov 1, 2026', event: 'Harmony Public Schools enrolment opens' },
  { date: '2027-01-25', display: 'Jan 25, 2027', event: 'KIPP Texas enrolment deadline' },
  { date: '2027-02-10', display: 'Feb 10, 2027', event: 'Harmony enrolment closes' },
  { date: '', display: 'Feb 2027', event: 'Lotteries held (both networks)' },
  {
    date: '2027-03-15',
    display: 'Mar 15, 2027',
    event: 'New Harmony Rosenberg / Pearland enrolment deadline (campuses open fall 2027)',
  },
]

export interface Campus {
  name: string
  network: 'Harmony' | 'KIPP'
  grades: string
  rating: string
  address: string
  areas: string[]
}

export const CAMPUSES: Campus[] = [
  { name: 'Harmony School of Excellence — Sugar Land', network: 'Harmony', grades: 'K–8', rating: 'A', address: '13522 W Airport Blvd', areas: ['Stafford', 'Richmond'] },
  { name: 'Harmony School of Science — Sugar Land', network: 'Harmony', grades: 'K–5', rating: 'A', address: '13415 W Bellfort Ave', areas: ['Stafford', 'Richmond'] },
  { name: 'Harmony School of Exploration', network: 'Harmony', grades: 'PK–5', rating: 'B', address: '9305 W Sam Houston Pkwy S', areas: ['Stafford'] },
  { name: 'Harmony School of Science — Katy', network: 'Harmony', grades: 'PK–7', rating: 'A', address: '22400 Grand Corner Dr', areas: ['Katy'] },
  { name: 'Harmony School of Excellence — Katy', network: 'Harmony', grades: 'PK–9', rating: 'A', address: 'Address not in the Edition 2 extract', areas: ['Katy'] },
  { name: 'Harmony School of Science — Bridgeland (Cypress)', network: 'Harmony', grades: 'PK–6/7', rating: 'A', address: 'Address not in the Edition 2 extract', areas: ['Cypress'] },
  { name: 'Harmony School of Science — Rosenberg', network: 'Harmony', grades: 'PK–5', rating: 'New — opens fall 2027', address: '2425 Spacek Rd, Richmond', areas: ['Richmond'] },
  { name: 'KIPP SHINE Prep (Alief)', network: 'KIPP', grades: 'PK–4', rating: 'Gold Ribbon', address: 'Address not in the Edition 2 extract', areas: ['Stafford'] },
  { name: 'KIPP Mosaic Primary', network: 'KIPP', grades: 'PK–5', rating: 'Rating not listed', address: '12751 Hillcroft Ave', areas: ['Stafford'] },
  { name: 'KIPP CONNECT Primary', network: 'KIPP', grades: 'PK–5', rating: 'Rating not listed', address: '6700 Bellaire Blvd', areas: ['Stafford'] },
]

export interface District {
  area: string
  district: string
  rating: string
  schoolAccess: number
}

export const DISTRICTS: District[] = [
  { area: 'Stafford', district: 'Fort Bend ISD', rating: 'B', schoolAccess: 8.5 },
  { area: 'Katy', district: 'Katy ISD', rating: 'B', schoolAccess: 8.25 },
  { area: 'Cypress', district: 'Cy-Fair ISD', rating: 'B', schoolAccess: 8.25 },
  { area: 'Richmond', district: 'Lamar CISD', rating: 'B', schoolAccess: 5.75 },
  { area: 'Stafford (dismissed zone)', district: 'Stafford MSD', rating: 'C', schoolAccess: 5.75 },
]

export function countdownLabel(iso: string, today = new Date()): { text: string; tone: 'open' | 'soon' | 'closed' | 'plain' } {
  if (!iso) return { text: 'Feb 2027', tone: 'plain' }
  const target = new Date(iso + 'T12:00:00')
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const days = Math.round((target.getTime() - start.getTime()) / 86400000)
  if (days < 0) return { text: 'Closed', tone: 'closed' }
  if (days === 0) return { text: 'Today', tone: 'soon' }
  return { text: `in ${days} days`, tone: days <= 30 ? 'soon' : 'open' }
}
