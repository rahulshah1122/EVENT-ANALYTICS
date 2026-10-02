import { describe, expect, it } from 'vitest'
import { toAbsoluteTime, toRelativeTime } from './time'

describe('toRelativeTime', () => {
  const now = new Date('2025-06-15T12:00:00Z')

  it('returns "just now" for timestamps under a second old', () => {
    expect(toRelativeTime('2025-06-15T11:59:59.500Z', now)).toBe('just now')
  })

  it('formats seconds, minutes, hours and days ago', () => {
    expect(toRelativeTime('2025-06-15T11:59:30Z', now)).toBe('30 seconds ago')
    expect(toRelativeTime('2025-06-15T11:55:00Z', now)).toBe('5 minutes ago')
    expect(toRelativeTime('2025-06-15T09:00:00Z', now)).toBe('3 hours ago')
    expect(toRelativeTime('2025-06-13T12:00:00Z', now)).toBe('2 days ago')
  })

  it('returns empty string for invalid timestamps', () => {
    expect(toRelativeTime('not-a-date', now)).toBe('')
  })
})

describe('toAbsoluteTime', () => {
  it('returns a non-empty formatted string for valid ISO input', () => {
    const result = toAbsoluteTime('2025-06-15T12:00:00Z')
    expect(result).not.toBe('')
  })

  it('returns empty string for invalid input', () => {
    expect(toAbsoluteTime('bogus')).toBe('')
  })
})
