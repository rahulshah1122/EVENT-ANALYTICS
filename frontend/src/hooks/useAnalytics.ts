import { useQuery } from '@tanstack/react-query'
import { fetchAnalytics } from '../api/client'

export function useAnalytics(hours: number, pausePollingMs: number | null) {
  return useQuery({
    queryKey: ['analytics', hours],
    queryFn: () => fetchAnalytics(hours),
    refetchInterval: pausePollingMs !== null ? false : 30000,
    refetchIntervalInBackground: false,
    retry: (failureCount, error: unknown) => {
      const status = (error as { status?: number })?.status
      if (status === 429 || status === 400) return false
      return failureCount < 2
    },
  })
}
