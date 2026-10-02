import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { AnalyticsResponse } from '../types/event'
import { AnalyticsCard } from './AnalyticsCard'

function makeAnalytics(): AnalyticsResponse {
  return {
    window_hours: 24,
    generated_at: new Date().toISOString(),
    total_events: 42,
    counts_by_type: [
      { event_type: 'user.login', count: 20 },
      { event_type: 'page.view', count: 15 },
    ],
    timeline: [
      { hour: '2025-06-15T10:00:00Z', count: 3 },
      { hour: '2025-06-15T11:00:00Z', count: 7 },
    ],
  }
}

describe('AnalyticsCard', () => {
  it('shows a loading state', () => {
    render(<AnalyticsCard data={undefined} isLoading isError={false} />)
    expect(screen.getByText(/loading analytics/i)).toBeInTheDocument()
  })

  it('shows an error state', () => {
    render(<AnalyticsCard data={undefined} isLoading={false} isError />)
    expect(screen.getByText(/failed to load analytics/i)).toBeInTheDocument()
  })

  it('renders totals and chart sections when data is present', () => {
    render(<AnalyticsCard data={makeAnalytics()} isLoading={false} isError={false} />)
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText(/top event types/i)).toBeInTheDocument()
    expect(screen.getByText(/events per hour/i)).toBeInTheDocument()
  })
})
