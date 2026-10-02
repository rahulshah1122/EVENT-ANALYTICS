import { createEvent } from '../api/client'

// one id per browser session so dashboard activity looks like a real user
function getSessionUserId(): string {
  const key = 'ea_session_user'
  let id = sessionStorage.getItem(key)
  if (!id) {
    id = `user_${Math.floor(Math.random() * 1000)}`
    sessionStorage.setItem(key, id)
  }
  return id
}

/** Fire-and-forget event tracking — never blocks or breaks the UI. */
export function trackEvent(
  eventType: string,
  payload: Record<string, unknown> = {},
): void {
  void createEvent({
    id: crypto.randomUUID(),
    user_id: getSessionUserId(),
    event_type: eventType,
    payload,
    timestamp: new Date().toISOString(),
  }).catch(() => {
    // swallow errors (e.g. 429s) — tracking must stay invisible
  })
}
