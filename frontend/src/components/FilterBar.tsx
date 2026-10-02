import { useEffect, useState } from 'react'
import { useDebounce } from '../hooks/useDebounce'

const KNOWN_EVENT_TYPES = [
  'user.login',
  'user.logout',
  'page.view',
  'button.click',
  'purchase.completed',
  'cart.updated',
  'signup.completed',
  'error.raised',
]

export interface FilterValues {
  eventType: string
  search: string
}

interface Props {
  value: FilterValues
  onChange: (value: FilterValues) => void
}

export function FilterBar({ value, onChange }: Props) {
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
    onChange({ eventType: '', search: '' })
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end">
      <div className="flex flex-col gap-1">
        <label htmlFor="event-type-filter" className="text-xs font-medium text-gray-600">
          Event type
        </label>
        <select
          id="event-type-filter"
          value={value.eventType}
          onChange={(e) => onChange({ ...value, eventType: e.target.value })}
          className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">All types</option>
          {KNOWN_EVENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor="search-filter" className="text-xs font-medium text-gray-600">
          Search payload / user
        </label>
        <input
          id="search-filter"
          type="text"
          placeholder="Search payload or user id..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <button
        type="button"
        onClick={handleClear}
        className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Clear
      </button>
    </div>
  )
}
