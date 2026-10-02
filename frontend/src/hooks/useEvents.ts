import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchEvents } from '../api/client'
import type { EventFilters } from '../types/event'

export function useEvents(filters: EventFilters, pausePollingMs: number | null) {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: () => fetchEvents(filters),
    placeholderData: keepPreviousData,
    refetchInterval: pausePollingMs !== null ? false : 5000,
    refetchIntervalInBackground: false,
    retry: (failureCount, error: unknown) => {
      const status = (error as { status?: number })?.status
      if (status === 429 || status === 400) return false
      return failureCount < 2
    },
  })
}
