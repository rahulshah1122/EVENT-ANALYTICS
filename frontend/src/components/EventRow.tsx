import { useState } from 'react'
import type { Event } from '../types/event'
import { toAbsoluteTime, toRelativeTime } from '../utils/time'
import { EventTypeBadge } from './EventTypeBadge'

export function EventRow({ event }: { event: Event }) {
  const [expanded, setExpanded] = useState(false)
  const payloadPreview = JSON.stringify(event.payload)
  const isLong = payloadPreview.length > 60

  return (
    <li className="flex flex-col gap-2 border-b border-gray-100 px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex min-w-[140px] items-center gap-2">
        <EventTypeBadge eventType={event.event_type} />
      </div>
      <div className="min-w-[100px] text-sm font-medium text-gray-700">{event.user_id}</div>
      <div className="flex-1 overflow-hidden">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="block w-full truncate text-left text-sm text-gray-600 hover:text-gray-900"
          title={isLong ? 'Click to expand payload' : undefined}
        >
          <code className={expanded ? 'whitespace-pre-wrap break-words' : ''}>
            {expanded ? JSON.stringify(event.payload, null, 2) : payloadPreview}
          </code>
        </button>
      </div>
      <div
        className="min-w-[90px] text-right text-xs text-gray-500"
        title={toAbsoluteTime(event.timestamp)}
      >
        {toRelativeTime(event.timestamp)}
      </div>
    </li>
  )
}
