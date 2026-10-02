import type {
  AnalyticsResponse,
  ApiErrorBody,
  EventFilters,
  PaginatedResponse,
  Event,
} from '../types/event'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export class ApiError extends Error {
  code: string
  details: Record<string, unknown>
  status: number
  retryAfter: number | null

  constructor(
    status: number,
    body: ApiErrorBody,
    retryAfter: number | null = null,
  ) {
    super(body.error.message)
    this.name = 'ApiError'
    this.status = status
    this.code = body.error.code
    this.details = body.error.details
    this.retryAfter = retryAfter
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })

  if (!response.ok) {
    const retryAfterHeader = response.headers.get('Retry-After')
    const retryAfter = retryAfterHeader ? Number(retryAfterHeader) : null
    let body: ApiErrorBody
    try {
      body = (await response.json()) as ApiErrorBody
    } catch {
      body = {
        error: { code: 'server_error', message: response.statusText, details: {} },
      }
    }
    throw new ApiError(response.status, body, retryAfter)
  }

  return (await response.json()) as T
}

export function buildEventsQueryString(
  filters: Partial<EventFilters>,
): string {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.event_type) params.set('event_type', filters.event_type)
  if (filters.search) params.set('search', filters.search)
  return params.toString()
}

export function fetchEvents(
  filters: Partial<EventFilters>,
): Promise<PaginatedResponse<Event>> {
  const qs = buildEventsQueryString(filters)
  return request<PaginatedResponse<Event>>(`/events${qs ? `?${qs}` : ''}`)
}

export function fetchAnalytics(hours = 24): Promise<AnalyticsResponse> {
  return request<AnalyticsResponse>(`/events/analytics?hours=${hours}`)
}
