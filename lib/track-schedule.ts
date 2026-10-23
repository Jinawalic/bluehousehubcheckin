export type DayGroup = 'mwf' | 'tthf'

const MWF = [1, 3, 5]
const TTHF = [2, 4, 5]
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const TRACK_GROUPS: Record<string, DayGroup> = {
  'Front End Development': 'mwf',
  'Back End Development': 'mwf',
  'Data Science': 'mwf',
  'Data Analysis': 'mwf',
  'Software Engineering': 'mwf',
  'Web Development': 'mwf',
  'Project Management': 'mwf',
  Cybersecurity: 'tthf',
  'Digital Marketing': 'tthf',
  'Social Media Management': 'tthf',
  'Prompt Engineering': 'tthf',
  'Graphics Design': 'tthf',
  'Product Design': 'tthf',
  'UI/UX Design': 'tthf',
}

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '')

const GROUP_BY_KEY = new Map(Object.entries(TRACK_GROUPS).map(([track, group]) => [normalize(track), group]))

export function trackGroup(track: string | null | undefined): DayGroup | null {
  return GROUP_BY_KEY.get(normalize(track ?? '')) ?? null
}

export function scheduleDays(group: DayGroup) {
  return group === 'mwf' ? MWF : TTHF
}

export function dayOfWeek(isoDate: string) {
  return new Date(`${isoDate}T12:00:00Z`).getUTCDay()
}

export function dayName(isoDate: string) {
  return DAY_NAMES[dayOfWeek(isoDate)]
}

export function scheduleLabel(group: DayGroup, short = false) {
  const names = short ? DAY_SHORT : DAY_NAMES
  return scheduleDays(group).map((d) => names[d]).join(', ')
}

export function isScheduledDay(group: DayGroup, isoDate: string) {
  return scheduleDays(group).includes(dayOfWeek(isoDate))
}
