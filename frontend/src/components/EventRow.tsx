import { useState } from 'react'
import type { Event } from '../types/event'
import { formatPayloadEntries, formatUserId } from '../utils/format'
import { toAbsoluteTime, toRelativeTime } from '../utils/time'
import { EventTypeBadge } from './EventTypeBadge'

export function EventRow({ event }: { event: Event }) {
  const [expanded, setExpanded] = useState(false)
  const entries = formatPayloadEntries(event.payload)
  const hiddenCount = Object.keys(event.payload).length - entries.length

  return (
    <li className="grid grid-cols-1 gap-2 px-4 py-3 transition-colors hover:bg-slate-50 sm:grid-cols-[120px_80px_1fr_96px] sm:items-center sm:gap-4">
      <div>
        <EventTypeBadge eventType={event.event_type} />
      </div>

      <div
        className="truncate text-sm font-medium text-slate-700"
        title={event.user_id}
      >
        {formatUserId(event.user_id)}
      </div>

      <div className="min-w-0">
        {expanded ? (
          <pre className="overflow-x-auto rounded-md border border-slate-200 bg-slate-50 p-2 font-mono text-xs text-slate-700">
            {JSON.stringify(event.payload, null, 2)}
          </pre>
        ) : (
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-[13px]">
            {entries.map(({ key, value }) => (
              <span key={key} className="whitespace-nowrap">
                <span className="text-slate-400">{key}</span>
                {' '}
                <span className="font-medium text-slate-700">{value}</span>
              </span>
            ))}
            {hiddenCount > 0 && (
              <span className="text-slate-400">+{hiddenCount} more</span>
            )}
            {entries.length === 0 && (
              <span className="italic text-slate-400">empty</span>
            )}
          </div>
        )}

        {Object.keys(event.payload).length > 0 && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="mt-0.5 text-xs text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
          >
            {expanded ? 'Hide' : 'JSON'}
          </button>
        )}
      </div>

      <div
        className="font-mono text-xs tabular-nums text-slate-400 sm:text-right"
        title={toAbsoluteTime(event.timestamp)}
      >
        {toRelativeTime(event.timestamp)}
      </div>
    </li>
  )
}
