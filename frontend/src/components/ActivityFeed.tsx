import { ApiError } from '../api/client'
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

function SkeletonRows() {
  return (
    <div className="divide-y divide-slate-100" role="status" aria-label="Loading events...">
      <span className="sr-only">Loading events...</span>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="grid animate-pulse grid-cols-[80px_60px_1fr_60px] items-center gap-4 px-4 py-4"
        >
          <div className="h-5 rounded-md bg-slate-100" />
          <div className="h-4 rounded bg-slate-100" />
          <div className="h-4 rounded bg-slate-100" />
          <div className="h-4 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  )
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
    <section
      className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
      aria-live="polite"
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Activity Feed
        </h2>
        {data && (
          <span className="text-xs tabular-nums text-slate-400">
            {data.count} events
          </span>
        )}
      </div>

      {isLoading && <SkeletonRows />}

      {isError && !isLoading && (
        <div className="flex flex-col items-center gap-3 p-10 text-center">
          <svg
            className="h-8 w-8 text-slate-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
            />
          </svg>
          <p className="text-sm font-medium text-slate-700">
            {error?.message ?? 'Failed to load events.'}
          </p>
          {error instanceof ApiError && Object.keys(error.details).length > 0 && (
            <ul className="text-xs text-red-500">
              {Object.entries(error.details).map(([field, errors]) => (
                <li key={field}>
                  {field}: {Array.isArray(errors) ? errors.join(', ') : String(errors)}
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={onRetry}
            className="mt-1 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && data && data.results.length === 0 && (
        <div className="flex flex-col items-center gap-2 p-10 text-center">
          <svg
            className="h-8 w-8 text-slate-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-4.35-4.35M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
            />
          </svg>
          <p className="text-sm font-medium text-slate-700">No events found</p>
          <p className="text-xs text-slate-400">
            Try widening the date range or clearing the filters.
          </p>
        </div>
      )}

      {!isLoading && !isError && data && data.results.length > 0 && (
        <>
          <div className="hidden grid-cols-[120px_80px_1fr_96px] gap-4 border-b border-slate-200 bg-slate-50/70 px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-slate-400 sm:grid">
            <span>Type</span>
            <span>User</span>
            <span>Payload</span>
            <span className="text-right">Time</span>
          </div>
          <ul className="divide-y divide-slate-100">
            {data.results.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </ul>
          <Pagination page={page} totalPages={data.total_pages} onPageChange={onPageChange} />
        </>
      )}
    </section>
  )
}
