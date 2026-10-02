import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { AnalyticsResponse } from '../types/event'

interface Props {
  data: AnalyticsResponse | undefined
  isLoading: boolean
  isError: boolean
}

export function AnalyticsCard({ data, isLoading, isError }: Props) {
  const barData = (data?.counts_by_type ?? []).map((row) => ({
    name: row.event_type,
    count: row.count,
  }))

  const timelineData = (data?.timeline ?? []).map((bucket) => ({
    hour: new Date(bucket.hour).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    count: bucket.count,
  }))

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-gray-700">
        Analytics (last {data?.window_hours ?? 24}h)
      </h2>

      {isLoading && <p className="text-sm text-gray-500">Loading analytics...</p>}
      {isError && !isLoading && (
        <p className="text-sm text-red-600">Failed to load analytics.</p>
      )}

      {!isLoading && !isError && data && (
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-2xl font-bold text-gray-900">{data.total_events}</p>
            <p className="text-xs text-gray-500">total events</p>
          </div>

          <div>
            <h3 className="mb-1 text-xs font-medium text-gray-600">Top event types</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} fontSize={12} />
                  <YAxis dataKey="name" type="category" width={110} fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="mb-1 text-xs font-medium text-gray-600">Hourly timeline</h3>
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <XAxis dataKey="hour" fontSize={10} interval="preserveStartEnd" />
                  <YAxis allowDecimals={false} fontSize={10} width={28} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
