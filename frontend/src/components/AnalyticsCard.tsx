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
import { formatEventType } from '../utils/format'

interface Props {
  data: AnalyticsResponse | undefined
  isLoading: boolean
  isError: boolean
}

const AXIS_STYLE = { fontSize: 11, fill: '#94a3b8' }

export function AnalyticsCard({ data, isLoading, isError }: Props) {
  const barData = (data?.counts_by_type ?? []).map((row) => ({
    name: formatEventType(row.event_type),
    count: row.count,
  }))

  const timelineData = (data?.timeline ?? []).map((bucket) => ({
    hour: new Date(bucket.hour).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
    }),
    count: bucket.count,
  }))

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Analytics
        </h2>
        <span className="text-xs text-slate-400">
          last {data?.window_hours ?? 24}h
        </span>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-5 p-4" role="status" aria-label="Loading analytics...">
          <span className="sr-only">Loading analytics...</span>
          <div className="h-9 w-24 animate-pulse rounded bg-slate-100" />
          <div className="h-48 animate-pulse rounded bg-slate-100" />
          <div className="h-32 animate-pulse rounded bg-slate-100" />
        </div>
      )}
      {isError && !isLoading && (
        <div className="flex flex-col items-center gap-2 p-10 text-center">
          <p className="text-sm font-medium text-slate-700">
            Failed to load analytics.
          </p>
          <p className="text-xs text-slate-400">Will retry automatically.</p>
        </div>
      )}

      {!isLoading && !isError && data && (
        <div className="flex flex-col gap-5 p-4">
          <div>
            <p className="text-3xl font-semibold tabular-nums tracking-tight text-slate-900">
              {data.total_events.toLocaleString()}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">events in window</p>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-medium text-slate-500">
              Top event types
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="#e2e8f0" />
                  <XAxis type="number" allowDecimals={false} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" width={105} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="count" fill="#334155" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-medium text-slate-500">
              Hourly timeline
            </h3>
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="2 4" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="hour" tick={AXIS_STYLE} interval="preserveStartEnd" axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={AXIS_STYLE} width={28} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#0d9488"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
