import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FilterBar, type FilterValues } from './FilterBar'

const TEST_TYPES = ['user.login', 'page.view']

const EMPTY: FilterValues = { eventType: '', search: '', dateFrom: '', dateTo: '' }

function renderFilterBar(onChange = vi.fn(), value: FilterValues = EMPTY) {
  const utils = render(
    <FilterBar value={value} eventTypes={TEST_TYPES} onChange={onChange} />,
  )
  return { onChange, ...utils }
}

describe('FilterBar', () => {
  it('debounces search input changes by 350ms', async () => {
    const { onChange } = renderFilterBar()

    const input = screen.getByLabelText(/^search$/i)
    fireEvent.change(input, { target: { value: 'abc' } })

    // debounce hasn't fired yet
    expect(onChange).not.toHaveBeenCalled()

    await waitFor(
      () => {
        expect(onChange).toHaveBeenCalledWith({ ...EMPTY, search: 'abc' })
      },
      { timeout: 1500 },
    )
  })

  it('emits filter change immediately when event type is selected', async () => {
    const { onChange } = renderFilterBar()

    await userEvent.selectOptions(screen.getByLabelText(/event type/i), 'user.login')
    expect(onChange).toHaveBeenCalledWith({ ...EMPTY, eventType: 'user.login' })
  })

  it('emits date range changes', async () => {
    const { onChange } = renderFilterBar()

    fireEvent.change(screen.getByLabelText(/from/i), {
      target: { value: '2025-06-15T10:00' },
    })
    expect(onChange).toHaveBeenCalledWith({ ...EMPTY, dateFrom: '2025-06-15T10:00' })
  })

  it('clears all filters when Clear is clicked', async () => {
    const { onChange } = renderFilterBar(vi.fn(), {
      eventType: 'user.login',
      search: 'hello',
      dateFrom: '2025-06-15T10:00',
      dateTo: '2025-06-15T12:00',
    })

    await userEvent.click(screen.getByRole('button', { name: /clear/i }))
    expect(onChange).toHaveBeenCalledWith(EMPTY)
  })
})
