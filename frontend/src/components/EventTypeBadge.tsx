import { formatEventType } from '../utils/format'

const PALETTE = [
  'bg-sky-50 text-sky-700 ring-sky-600/20',
  'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  'bg-violet-50 text-violet-700 ring-violet-600/20',
  'bg-amber-50 text-amber-700 ring-amber-600/20',
  'bg-rose-50 text-rose-700 ring-rose-600/20',
  'bg-teal-50 text-teal-700 ring-teal-600/20',
  'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  'bg-orange-50 text-orange-700 ring-orange-600/20',
]

function colorForType(eventType: string): string {
  let hash = 0
  for (let i = 0; i < eventType.length; i++) {
    hash = (hash * 31 + eventType.charCodeAt(i)) % PALETTE.length
  }
  return PALETTE[Math.abs(hash)]
}

export function EventTypeBadge({ eventType }: { eventType: string }) {
  return (
    <span
      title={eventType}
      className={`inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${colorForType(eventType)}`}
    >
      {formatEventType(eventType)}
    </span>
  )
}
