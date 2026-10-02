import type { EventPayload } from '../types/event'

const WORDS_TO_UPPERCASE = new Set([
  'id',
  'url',
  'api',
  'ip',
  'os',
  'ui',
  'ux',
  'cta',
  'sso',
  'http',
  'https',
  'usd',
  'eur',
  'gbp',
])

function toTitleCase(text: string): string {
  return text
    .split(/[._\-\s]+/)
    .filter(Boolean)
    .map((part) =>
      WORDS_TO_UPPERCASE.has(part.toLowerCase())
        ? part.toUpperCase()
        : part[0].toUpperCase() + part.slice(1),
    )
    .join(' ')
}

/** "user_31" -> "User 31" */
export function formatUserId(userId: string): string {
  const match = userId.match(/^([a-zA-Z]+)[_-]?(\d+)$/)
  if (!match) return userId
  return `${match[1][0].toUpperCase() + match[1].slice(1)} ${match[2]}`
}

/** "page.view" -> "Page View" */
export function formatEventType(eventType: string): string {
  return toTitleCase(eventType)
}

function formatValue(value: unknown): string {
  if (value === null) return 'null'
  if (typeof value === 'object') return JSON.stringify(value)
  if (typeof value === 'string' && /^[a-z][a-z0-9_-]*$/.test(value)) {
    return toTitleCase(value)
  }
  return String(value)
}

/** payload {source: "web"} -> [{key: "Source", value: "Web"}] */
export function formatPayloadEntries(
  payload: EventPayload,
  max = 3,
): { key: string; value: string }[] {
  return Object.entries(payload)
    .slice(0, max)
    .map(([key, value]) => ({ key: toTitleCase(key), value: formatValue(value) }))
}
