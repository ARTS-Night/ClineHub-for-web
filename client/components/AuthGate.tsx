import { useEffect, useMemo, useState } from "react"
import { App } from "../App.js"
import { detectInitialLocale, loadDictionary, translate, type Dictionary } from "../lib/i18n.js"
import { LoginScreen } from "./LoginScreen.js"

type AuthStatus = { required: boolean; authenticated: boolean }

// Kept separate from App so App's own effects (loading sessions, profiles,
// agent settings, opening the SSE stream, ...) never fire before login
// actually succeeds — those all assume an authenticated session.
export function AuthGate() {
  const [status, setStatus] = useState<AuthStatus | null>(null)
  const [dictionary, setDictionary] = useState<Dictionary>({})
  const [fallbackDictionary, setFallbackDictionary] = useState<Dictionary>({})
  const t = useMemo(() => (key: string, vars?: Record<string, unknown>) => translate(dictionary, fallbackDictionary, key, vars), [dictionary, fallbackDictionary])

  useEffect(() => {
    fetch("/api/auth/status").then((response) => response.json()).then(setStatus).catch(() => setStatus({ required: false, authenticated: true }))
  }, [])
  useEffect(() => {
    if (!status?.required || status.authenticated) return
    loadDictionary("en").then(setFallbackDictionary).catch(() => {})
    loadDictionary(detectInitialLocale()).then(setDictionary).catch(() => {})
  }, [status])

  if (!status) return null
  if (status.required && !status.authenticated) return <LoginScreen t={t} onSuccess={() => setStatus({ required: true, authenticated: true })} />
  const logout = status.required
    ? () => { fetch("/api/auth/logout", { method: "POST" }).finally(() => setStatus({ required: true, authenticated: false })) }
    : undefined
  return <App onLogout={logout} />
}
