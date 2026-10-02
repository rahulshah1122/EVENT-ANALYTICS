import { useEffect, useMemo, useState } from 'react'
import { ActivityFeed } from './components/ActivityFeed'
import { AnalyticsCard } from './components/AnalyticsCard'
import { FilterBar, type FilterValues } from './components/FilterBar'
import { Header } from './components/Header'
import { RateLimitBanner } from './components/RateLimitBanner'
import { useAnalytics } from './hooks/useAnalytics'
import { useEvents } from './hooks/useEvents'
import { useRateLimit } from './hooks/useRateLimit'
import type { EventFilters } from './types/event'

const PAGE_SIZE = 20

function App() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<FilterValues>({ eventType: '', search: '' })
  const rateLimit = useRateLimit()

  const eventFilters: EventFilters = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      event_type: filters.eventType,
      search: filters.search,
    }),
    [page, filters],
  )

  const pausePollingMs = rateLimit.isLimited ? rateLimit.retryAtMs : null
  const eventsQuery = useEvents(eventFilters, pausePollingMs)
  const analyticsQuery = useAnalytics(24, pausePollingMs)

  useEffect(() => {
    if (eventsQuery.error) rateLimit.reportError(eventsQuery.error)
    if (analyticsQuery.error) rateLimit.reportError(analyticsQuery.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventsQuery.error, analyticsQuery.error])

  const { isLimited, retryAtMs, clearIfExpired } = rateLimit
  useEffect(() => {
    if (!isLimited) return
    const interval = setInterval(() => clearIfExpired(), 1000)
    return () => clearInterval(interval)
  }, [isLimited, clearIfExpired])

  const handleFilterChange = (next: FilterValues) => {
    setFilters(next)
    setPage(1)
  }

  const lastUpdated = eventsQuery.data ? new Date() : null

  return (
    <div className="min-h-screen bg-gray-50">
      <Header lastUpdated={lastUpdated} />

      <main className="mx-auto flex max-w-6xl flex-col gap-4 p-4 sm:p-6">
        <RateLimitBanner retryAtMs={isLimited ? retryAtMs : null} />

        <FilterBar value={filters} onChange={handleFilterChange} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <AnalyticsCard
              data={analyticsQuery.data}
              isLoading={analyticsQuery.isLoading}
              isError={analyticsQuery.isError}
            />
          </div>

          <div className="lg:col-span-2">
            <ActivityFeed
              data={eventsQuery.data}
              isLoading={eventsQuery.isLoading}
              isError={eventsQuery.isError}
              error={eventsQuery.error as Error | null}
              onRetry={() => eventsQuery.refetch()}
              page={page}
              onPageChange={setPage}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
