import { useCallback, useState } from 'react'
import { ApiError } from '../api/client'

export interface RateLimitState {
  isLimited: boolean
  retryAtMs: number | null
}

/** Tracks 429s so polling can pause until the Retry-After window passes. */
export function useRateLimit() {
  const [state, setState] = useState<RateLimitState>({
    isLimited: false,
    retryAtMs: null,
  })

  const reportError = useCallback((error: unknown) => {
    if (error instanceof ApiError && error.status === 429) {
      const waitSeconds = error.retryAfter ?? 60
      setState({ isLimited: true, retryAtMs: Date.now() + waitSeconds * 1000 })
    }
  }, [])

  const clearIfExpired = useCallback(() => {
    setState((prev) => {
      if (prev.isLimited && prev.retryAtMs !== null && Date.now() >= prev.retryAtMs) {
        return { isLimited: false, retryAtMs: null }
      }
      return prev
    })
  }, [])

  return { ...state, reportError, clearIfExpired }
}
