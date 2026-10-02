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
  'w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500'

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

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-end">
      <div className="flex flex-col gap-1">
        <label htmlFor="event-type-filter" className="text-xs font-medium text-slate-500">
          Event type
        </label>
        <select
          id="event-type-filter"
          value={value.eventType}
          onChange={(e) => onChange({ ...value, eventType: e.target.value })}
          className={INPUT_CLASS}
        >
          <option value="">All types</option>
          {eventTypes.map((type) => (
            <option key={type} value={type}>
              {formatEventType(type)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor="search-filter" className="text-xs font-medium text-slate-500">
          Search
        </label>
        <input
          id="search-filter"
          type="text"
          placeholder="User id, event type, or payload text..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className={`${INPUT_CLASS} placeholder:text-slate-400`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <label htmlFor="date-from-filter" className="text-xs font-medium text-slate-500">
            From
          </label>
          <input
            id="date-from-filter"
            type="datetime-local"
            value={value.dateFrom}
            onChange={(e) => onChange({ ...value, dateFrom: e.target.value })}
            className={INPUT_CLASS}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <label htmlFor="date-to-filter" className="text-xs font-medium text-slate-500">
            To
          </label>
          <input
            id="date-to-filter"
            type="datetime-local"
            value={value.dateTo}
            onChange={(e) => onChange({ ...value, dateTo: e.target.value })}
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleClear}
        className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      >
        Clear
      </button>
    </div>
  )
}
