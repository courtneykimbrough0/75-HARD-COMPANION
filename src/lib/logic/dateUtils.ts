import type { DateString } from '@/types'

/** Formats a Date as a local (not UTC) YYYY-MM-DD calendar-day string. */
export function dateToLocalString(date: Date): DateString {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayLocalDateString(): DateString {
  return dateToLocalString(new Date())
}

/** Parses a YYYY-MM-DD string into a local Date at midnight. */
export function parseLocalDateString(date: DateString): Date {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function addDays(date: DateString, days: number): DateString {
  const d = parseLocalDateString(date)
  d.setDate(d.getDate() + days)
  return dateToLocalString(d)
}

/** Negative when `a` is before `b`, positive when after, 0 when equal. */
export function compareDateStrings(a: DateString, b: DateString): number {
  return a < b ? -1 : a > b ? 1 : 0
}

export function isDateBefore(a: DateString, b: DateString): boolean {
  return compareDateStrings(a, b) < 0
}

/** Start of the calendar week (Sunday) containing `date`, matching JS Date#getDay (0=Sun..6=Sat). */
export function getWeekStartDate(date: DateString): DateString {
  const d = parseLocalDateString(date)
  return addDays(date, -d.getDay())
}

export function getWeekEndDate(weekStartDate: DateString): DateString {
  return addDays(weekStartDate, 6)
}

export function formatDisplayDate(date: DateString): string {
  return parseLocalDateString(date).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}
