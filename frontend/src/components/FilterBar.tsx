import { useEffect, useState } from 'react'
import { useDebounce } from '../hooks/useDebounce'
import { formatEventType } from '../utils/format'

export interface FilterValues {
  eventType: string
  search: string
  dateFrom: string
  dateTo: string
}

interface Props {
  value: FilterValues
  eventTypes: string[]
  onChange: (value: FilterValues) => void
}

const INPUT_CLASS =
  'w-full min-w-0 rounded-md border border-slate-300 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500'

const LABEL_CLASS = 'text-[11px] font-semibold uppercase tracking-wider text-slate-400'

const DATE_STYLE = { colorScheme: 'light' as const }

function Chevron() {
  return (
    <svg
      className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg
      className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="m21 21-4.35-4.35" />
    </svg>
  )
}

export function FilterBar({ value, eventTypes, onChange }: Props) {
  const [searchInput, setSearchInput] = useState(value.search)
  const debouncedSearch = useDebounce(searchInput, 350)

  useEffect(() => {
    if (debouncedSearch !== value.search) {
      onChange({ ...value, search: debouncedSearch })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const handleClear = () => {
    setSearchInput('')
    onChange({ eventType: '', search: '', dateFrom: '', dateTo: '' })
  }

  const hasFilters =
    value.eventType || value.search || value.dateFrom || value.dateTo

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-[170px_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
        <div className="col-span-2 flex flex-col gap-1 lg:col-span-1">
          <label htmlFor="event-type-filter" className={LABEL_CLASS}>
            Type
          </label>
          <div className="relative">
            <select
              id="event-type-filter"
              value={value.eventType}
              onChange={(e) => onChange({ ...value, eventType: e.target.value })}
              className={`${INPUT_CLASS} appearance-none`}
            >
              <option value="">All types</option>
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {formatEventType(type)}
                </option>
              ))}
            </select>
            <Chevron />
          </div>
        </div>

        <div className="col-span-2 flex flex-col gap-1 lg:col-span-1">
          <label htmlFor="search-filter" className={LABEL_CLASS}>
            Search
          </label>
          <div className="relative">
            <SearchIcon />
            <input
              id="search-filter"
              type="text"
              placeholder="User id, event type, or payload text..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={`${INPUT_CLASS} pl-8 pr-3 placeholder:text-slate-400`}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="date-from-filter" className={LABEL_CLASS}>
            From
          </label>
          <input
            id="date-from-filter"
            type="datetime-local"
            value={value.dateFrom}
            onChange={(e) => onChange({ ...value, dateFrom: e.target.value })}
            style={DATE_STYLE}
            className={`${INPUT_CLASS} pr-2`}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="date-to-filter" className={LABEL_CLASS}>
            To
          </label>
          <input
            id="date-to-filter"
            type="datetime-local"
            value={value.dateTo}
            onChange={(e) => onChange({ ...value, dateTo: e.target.value })}
            style={DATE_STYLE}
            className={`${INPUT_CLASS} pr-2`}
          />
        </div>

        <button
          type="button"
          onClick={handleClear}
          disabled={!hasFilters && !searchInput}
          className="col-span-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 lg:col-span-1"
        >
          Clear
        </button>
      </div>
    </div>
  )
}
