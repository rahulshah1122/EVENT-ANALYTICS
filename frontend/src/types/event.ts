export interface EventPayload {
  [key: string]: unknown
}

export interface Event {
  id: string
  user_id: string
  event_type: string
  payload: EventPayload
  timestamp: string
  created_at: string
}

export interface PaginatedResponse<T> {
  count: number
  page: number
  limit: number
  total_pages: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface EventTypeCount {
  event_type: string
  count: number
}

export interface TimelineBucket {
  hour: string
  count: number
}

export interface AnalyticsResponse {
  window_hours: number
  generated_at: string
  total_events: number
  counts_by_type: EventTypeCount[]
  timeline: TimelineBucket[]
}

export interface EventFilters {
  page: number
  limit: number
  event_type: string
  search: string
}

export interface ApiErrorBody {
  error: {
    code: string
    message: string
    details: Record<string, unknown>
  }
}
