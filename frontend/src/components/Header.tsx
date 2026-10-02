import { toAbsoluteTime } from '../utils/time'

interface Props {
  lastUpdated: Date | null
  paused: boolean
}

export function Header({ lastUpdated, paused }: Props) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <h1 className="text-sm font-semibold tracking-tight text-slate-900">
          Event Analytics
        </h1>

        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="hidden text-xs tabular-nums text-slate-400 sm:inline">
              Updated {toAbsoluteTime(lastUpdated.toISOString())}
            </span>
          )}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset ${
              paused
                ? 'bg-amber-50 text-amber-700 ring-amber-600/20'
                : 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                paused ? 'bg-amber-500' : 'animate-pulse bg-emerald-500'
              }`}
            />
            {paused ? 'Paused' : 'Live'}
          </span>
        </div>
      </div>
    </header>
  )
}
