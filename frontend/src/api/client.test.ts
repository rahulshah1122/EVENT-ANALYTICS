import { describe, expect, it } from 'vitest'
import { buildEventsQueryString } from './client'

describe('buildEventsQueryString', () => {
  it('builds a query string from all filter fields', () => {
    const qs = buildEventsQueryString({
      page: 2,
      limit: 50,
      event_type: 'user.login',
      search: 'hello world',
    })
    const params = new URLSearchParams(qs)
    expect(params.get('page')).toBe('2')
    expect(params.get('limit')).toBe('50')
    expect(params.get('event_type')).toBe('user.login')
    expect(params.get('search')).toBe('hello world')
  })

  it('omits empty filters', () => {
    const qs = buildEventsQueryString({ page: 1, event_type: '', search: '' })
    const params = new URLSearchParams(qs)
    expect(params.get('page')).toBe('1')
    expect(params.has('event_type')).toBe(false)
    expect(params.has('search')).toBe(false)
  })

  it('returns an empty string when no filters are set', () => {
    expect(buildEventsQueryString({})).toBe('')
  })
})
