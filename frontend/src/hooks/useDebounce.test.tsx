import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDebounce } from './useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 350))
    expect(result.current).toBe('initial')
  })

  it('only updates after the delay has elapsed', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 350),
      { initialProps: { value: 'first' } },
    )

    rerender({ value: 'second' })
    expect(result.current).toBe('first')

    act(() => {
      vi.advanceTimersByTime(351)
    })
    expect(result.current).toBe('second')
  })

  it('collapses rapid changes into a single update', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 350),
      { initialProps: { value: 'a' } },
    )

    rerender({ value: 'b' })
    act(() => {
      vi.advanceTimersByTime(200)
    })
    rerender({ value: 'c' })
    act(() => {
      vi.advanceTimersByTime(200)
    })
    // neither window fully elapsed yet, still 'a'
    expect(result.current).toBe('a')

    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(result.current).toBe('c')
  })
})
