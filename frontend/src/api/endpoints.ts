const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

/** Backend route paths, single source of truth for the API client. */
export const ENDPOINTS = {
  events: `${API_BASE_URL}/events`,
  analytics: `${API_BASE_URL}/events/analytics`,
  health: `${API_BASE_URL}/health`,
} as const
