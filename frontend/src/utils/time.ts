const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 1000 * 60 * 60 * 24 * 365],
  ['month', 1000 * 60 * 60 * 24 * 30],
  ['day', 1000 * 60 * 60 * 24],
  ['hour', 1000 * 60 * 60],
  ['minute', 1000 * 60],
  ['second', 1000],
]

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

/** "5 minutes ago", "3 days ago", etc. for an ISO timestamp. */
export function toRelativeTime(isoTimestamp: string, now: Date = new Date()): string {
  const date = new Date(isoTimestamp)
  const diffMs = date.getTime() - now.getTime()

  if (Number.isNaN(diffMs)) return ''
  if (Math.abs(diffMs) < 1000) return 'just now'

  for (const [unit, unitMs] of UNITS) {
    if (Math.abs(diffMs) >= unitMs || unit === 'second') {
      const value = Math.round(diffMs / unitMs)
      return rtf.format(value, unit)
    }
  }
  return 'just now'
}

/** Absolute locale string, used for the timestamp tooltip. */
export function toAbsoluteTime(isoTimestamp: string): string {
  const date = new Date(isoTimestamp)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString()
}
