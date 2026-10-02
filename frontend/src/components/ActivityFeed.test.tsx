import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Event, PaginatedResponse } from '../types/event'
import { ActivityFeed } from './ActivityFeed'

function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    user_id: 'user_1',
    event_type: 'user.login',
    payload: { source: 'web' },
    timestamp: new Date().toISOString(),
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

function makeResponse(events: Event[] = [makeEvent()]): PaginatedResponse<Event> {
  return {
    count: events.length,
    page: 1,
    limit: 20,
    total_pages: 1,
    next: null,
    previous: null,
    results: events,
  }
}

describe('ActivityFeed', () => {
  it('shows a loading state', () => {
    render(
      <ActivityFeed
        data={undefined}
        isLoading
        isError={false}
        error={null}
        onRetry={vi.fn()}
        page={1}
        onPageChange={vi.fn()}
      />,
    )
    expect(screen.getByText(/loading events/i)).toBeInTheDocument()
  })

  it('shows an empty state when there are no results', () => {
    render(
      <ActivityFeed
        data={makeResponse([])}
        isLoading={false}
        isError={false}
        error={null}
        onRetry={vi.fn()}
        page={1}
        onPageChange={vi.fn()}
      />,
    )
    expect(screen.getByText(/no events match/i)).toBeInTheDocument()
  })

  it('shows an error state with a retry button that triggers onRetry', async () => {
    const onRetry = vi.fn()
    render(
      <ActivityFeed
        data={undefined}
        isLoading={false}
        isError
        error={new Error('boom')}
        onRetry={onRetry}
        page={1}
        onPageChange={vi.fn()}
      />,
    )
    expect(screen.getByText('boom')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /retry/i }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('renders events with type badge, user id and relative time', () => {
    render(
      <ActivityFeed
        data={makeResponse([makeEvent()])}
        isLoading={false}
        isError={false}
        error={null}
        onRetry={vi.fn()}
        page={1}
        onPageChange={vi.fn()}
      />,
    )
    expect(screen.getByText('user.login')).toBeInTheDocument()
    expect(screen.getByText('user_1')).toBeInTheDocument()
  })
})
