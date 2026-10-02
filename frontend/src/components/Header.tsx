import { toAbsoluteTime } from '../utils/time'

interface Props {
  lastUpdated: Date | null
}

export function Header({ lastUpdated }: Props) {
  return (
    <header className="flex flex-col gap-1 border-b border-gray-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <h1 className="text-lg font-bold text-gray-900">Real-Time Event Dashboard</h1>
      <p className="text-xs text-gray-500">
        {lastUpdated ? `Last updated: ${toAbsoluteTime(lastUpdated.toISOString())}` : 'Loading...'}
      </p>
    </header>
  )
}
