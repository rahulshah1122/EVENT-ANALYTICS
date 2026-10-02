import { useEffect, useState } from 'react'

interface Props {
  retryAtMs: number | null
}

export function RateLimitBanner({ retryAtMs }: Props) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)

  useEffect(() => {
    if (retryAtMs === null) return

    const update = () =>
      setSecondsLeft(Math.max(0, Math.ceil((retryAtMs - Date.now()) / 1000)))

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [retryAtMs])

  if (retryAtMs === null || secondsLeft === null) return null

  return (
    <div
      role="status"
      className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-800"
    >
      Rate limit reached — polling paused, resuming in {secondsLeft}s.
    </div>
  )
}
