export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...options?.headers } })
  // The session cookie can go stale (server restart clears in-memory
  // sessions) while AuthGate still thinks we're logged in. A full reload
  // sends everyone back through AuthGate's status check, which re-shows the
  // login screen instead of every subsequent call quietly failing with 401.
  if (response.status === 401 && url.startsWith("/api/") && !url.startsWith("/api/auth/")) {
    location.reload()
    return new Promise<T>(() => {})
  }
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new ApiError(body.error ?? `Request failed: ${response.status}`, response.status)
  return body as T
}
