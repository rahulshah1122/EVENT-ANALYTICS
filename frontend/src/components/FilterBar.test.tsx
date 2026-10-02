import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FilterBar, type FilterValues } from './FilterBar'

function renderFilterBar(onChange = vi.fn(), value: FilterValues = { eventType: '', search: '' }) {
  const utils = render(<FilterBar value={value} onChange={onChange} />)
  return { onChange, ...utils }
}

describe('FilterBar', () => {
  it('debounces search input changes by 350ms', async () => {
    const { onChange } = renderFilterBar()

    const input = screen.getByLabelText(/search payload \/ user/i)
    fireEvent.change(input, { target: { value: 'abc' } })

    // debounce hasn't fired yet
    expect(onChange).not.toHaveBeenCalled()

    await waitFor(
      () => {
        expect(onChange).toHaveBeenCalledWith({ eventType: '', search: 'abc' })
      },
      { timeout: 1500 },
    )
  })

  it('emits filter change immediately when event type is selected', async () => {
    const { onChange } = renderFilterBar()

    await userEvent.selectOptions(screen.getByLabelText(/event type/i), 'user.login')
    expect(onChange).toHaveBeenCalledWith({ eventType: 'user.login', search: '' })
  })

  it('clears all filters when Clear is clicked', async () => {
    const { onChange } = renderFilterBar(vi.fn(), {
      eventType: 'user.login',
      search: 'hello',
    })

    await userEvent.click(screen.getByRole('button', { name: /clear/i }))
    expect(onChange).toHaveBeenCalledWith({ eventType: '', search: '' })
  })
})
