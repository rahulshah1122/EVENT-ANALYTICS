const COLOR_PALETTE = [
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800',
  'bg-purple-100 text-purple-800',
  'bg-amber-100 text-amber-800',
  'bg-pink-100 text-pink-800',
  'bg-teal-100 text-teal-800',
  'bg-rose-100 text-rose-800',
  'bg-indigo-100 text-indigo-800',
]

function colorForType(eventType: string): string {
  let hash = 0
  for (let i = 0; i < eventType.length; i++) {
    hash = (hash * 31 + eventType.charCodeAt(i)) % COLOR_PALETTE.length
  }
  return COLOR_PALETTE[Math.abs(hash)]
}

export function EventTypeBadge({ eventType }: { eventType: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorForType(eventType)}`}
    >
      {eventType}
    </span>
  )
}
