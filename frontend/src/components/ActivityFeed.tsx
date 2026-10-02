import type { PaginatedResponse, Event } from '../types/event'
import { EventRow } from './EventRow'
import { Pagination } from './Pagination'

interface Props {
  data: PaginatedResponse<Event> | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
  onRetry: () => void
  page: number
  onPageChange: (page: number) => void
}

export function ActivityFeed({
  data,
  isLoading,
  isError,
  error,
  onRetry,
  page,
  onPageChange,
}: Props) {
  return (
    <div
      className="rounded-lg border border-gray-200 bg-white shadow-sm"
      aria-live="polite"
    >
      <div className="border-b border-gray-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-700">Activity Feed</h2>
      </div>

      {isLoading && (
        <div className="p-8 text-center text-sm text-gray-500">Loading events...</div>
      )}

      {isError && !isLoading && (
        <div className="flex flex-col items-center gap-3 p-8 text-center">
          <p className="text-sm text-red-600">
            {error?.message ?? 'Failed to load events.'}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && data && data.results.length === 0 && (
        <div className="p-8 text-center text-sm text-gray-500">
          No events match the current filters.
        </div>
      )}

      {!isLoading && !isError && data && data.results.length > 0 && (
        <>
          <ul>
            {data.results.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </ul>
          <Pagination page={page} totalPages={data.total_pages} onPageChange={onPageChange} />
        </>
      )}
    </div>
  )
}
