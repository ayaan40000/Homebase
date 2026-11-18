export interface Deadline {
  date: string // ISO date, or '' when month-only / not yet published
  display: string
  event: string
  /** false = the district has not published this date yet; the panel
   *  shows "dates pending publication" and never counts down to it. */
  confirmed?: boolean
}

export const CHARTER_RULE =
  'Plan on the zoned campus. A charter seat is lottery upside, never the plan.'

/** Deadlines are cycle data, not constants (Phase 2). Each cycle carries
 *  an `endsAfter` date: once it passes, the panel rolls to the next
 *  cycle, so no countdown can ever point at a past cycle's dates. A
 *  cycle whose districts have not published yet shows its expected
 *  windows with every date marked unconfirmed. */
export interface CharterCycle {
  id: string
  label: string
  endsAfter: string // ISO date; the panel rolls over the day after
  deadlines: Deadline[]
}

export const CYCLES: CharterCycle[] = [
  {
    id: '2026-27',
    label: '2026–27',
    endsAfter: '2027-03-31',
    deadlines: [
      { date: '2026-11-01', display: 'Nov 1, 2026', event: 'Harmony Public Schools enrolment opens' },
      { date: '2027-01-25', display: 'Jan 25, 2027', event: 'KIPP Texas enrolment deadline' },
      { date: '2027-02-10', display: 'Feb 10, 2027', event: 'Harmony enrolment closes' },
      { date: '', display: 'Feb 2027', event: 'Lotteries held (both networks)' },
      {
        date: '2027-03-15',
        display: 'Mar 15, 2027',
        event: 'New Harmony Rosenberg / Pearland enrolment deadline (campuses open fall 2027)',
      },
    ],
  },
  {
    id: '2027-28',
    label: '2027–28',
    endsAfter: '2028-03-31',
    deadlines: [
      { date: '', display: 'Nov 2027', event: 'Harmony Public Schools enrolment opens', confirmed: false },
      { date: '', display: 'Jan 2028', event: 'KIPP Texas enrolment deadline', confirmed: false },
      { date: '', display: 'Feb 2028', event: 'Harmony enrolment closes', confirmed: false },
      { date: '', display: 'Feb 2028', event: 'Lotteries held (both networks)', confirmed: false },
    ],
  },
]

/** The cycle in force today: the first whose rollover date has not
 *  passed. If every known cycle has passed, the last one stays up —
 *  its unconfirmed dates read "dates pending publication", never a
 *  countdown to a past date. */
export function currentCycle(today = new Date()): CharterCycle {
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  for (const c of CYCLES) {
    if (t <= new Date(`${c.endsAfter}T12:00:00`).getTime()) return c
  }
  return CYCLES[CYCLES.length - 1]
}

/** The current cycle's deadlines (kept for existing imports). */
export const DEADLINES: Deadline[] = currentCycle().deadlines

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
  if (!iso) return { text: 'Date in cycle', tone: 'plain' }
  const target = new Date(iso + 'T12:00:00')
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const days = Math.round((target.getTime() - start.getTime()) / 86400000)
  if (days < 0) return { text: 'Closed', tone: 'closed' }
  if (days === 0) return { text: 'Today', tone: 'soon' }
  return { text: `in ${days} days`, tone: days <= 30 ? 'soon' : 'open' }
}

/** The chip shown next to a deadline. Unconfirmed dates never count
 *  down — they read "Dates pending publication" until the district
 *  publishes and the cycle data is updated. Month-only confirmed
 *  entries show their display window. */
export function deadlineChip(
  d: Deadline,
  today = new Date(),
): { text: string; tone: 'open' | 'soon' | 'closed' | 'plain' } {
  if (d.confirmed === false) return { text: 'Dates pending publication', tone: 'plain' }
  if (!d.date) return { text: d.display, tone: 'plain' }
  return countdownLabel(d.date, today)
}
