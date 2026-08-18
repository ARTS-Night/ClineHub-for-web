import { useState, type FormEvent } from "react"
import type { TFunction } from "../lib/i18n.js"
import { ApiError, api } from "../lib/api.js"

export function LoginScreen({ t, onSuccess }: { t: TFunction; onSuccess: () => void }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError("")
    try {
      await api("/api/auth/login", { method: "POST", body: JSON.stringify({ username, password }) })
      onSuccess()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={(event) => void submit(event)}>
        <h1>{t("loginTitle")}</h1>
        <p className="settings-note">{t("loginDescription")}</p>
        <label><span>{t("loginUsername")}</span><input value={username} autoFocus spellCheck={false} onChange={(event) => setUsername(event.target.value)} /></label>
        <label><span>{t("loginPassword")}</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        {error && <p className="error" role="status">{error}</p>}
        <div className="setup-actions"><button type="submit" disabled={busy || !username || !password}>{busy ? t("connecting") : t("loginSubmit")}</button></div>
      </form>
    </div>
  )
}
