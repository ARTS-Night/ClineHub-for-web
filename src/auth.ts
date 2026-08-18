import { createHash, randomBytes, timingSafeEqual } from "node:crypto"

// Login is entirely opt-in: set both env vars to require it, leave either
// unset (the default — nothing in .env) to keep the app open like before.
export function authRequired(): boolean {
  return Boolean(process.env.CLINEHUB_USER) && Boolean(process.env.CLINEHUB_PASSWORD)
}

// Hash both sides to a fixed-length digest first so timingSafeEqual (which
// requires equal-length buffers) never has to be skipped for a length
// mismatch — that skip is itself a timing side-channel.
function safeEqual(a: string, b: string): boolean {
  const digest = (value: string) => createHash("sha256").update(value).digest()
  return timingSafeEqual(digest(a), digest(b))
}

export function verifyCredentials(username: string, password: string): boolean {
  const expectedUser = process.env.CLINEHUB_USER ?? ""
  const expectedPassword = process.env.CLINEHUB_PASSWORD ?? ""
  return safeEqual(username, expectedUser) && safeEqual(password, expectedPassword)
}

// ponytail: in-memory session set, no persistence — a restart requires
// logging in again, which is fine for a single local server.
const sessions = new Set<string>()

export function createSession(): string {
  const token = randomBytes(32).toString("hex")
  sessions.add(token)
  return token
}

export function isValidSession(token: string | undefined): boolean {
  return Boolean(token && sessions.has(token))
}

export function destroySession(token: string | undefined): void {
  if (token) sessions.delete(token)
}
