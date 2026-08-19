import { useEffect, useRef, useState } from "react"
import { api } from "../lib/api.js"
import type { TFunction } from "../lib/i18n.js"
import type { ConnectionInfo, ModelInfo, ProfilesData, ProviderKind } from "../lib/types.js"

const providerDefaults: Record<ProviderKind, string> = {
  lmstudio: "http://127.0.0.1:1234",
  llamacpp: "http://127.0.0.1:8080",
  ollama: "http://127.0.0.1:11434",
  codex: "https://chatgpt.com/backend-api/codex",
  "claude-code": "",
}
const helpKeys: Record<ProviderKind, string> = { lmstudio: "helpLmstudio", llamacpp: "helpLlamacpp", ollama: "helpOllama", codex: "helpCodex", "claude-code": "helpClaude" }

export type SetupRequest = { info: ConnectionInfo | null; newProfile: boolean; token: number }

type ConnectResult = { provider: ProviderKind; modelId: string; baseUrl: string; imagesEnabled: boolean; imageSupport?: ModelInfo["imageSupport"] } & Record<string, unknown>

type Props = {
  t: TFunction
  request: SetupRequest | null
  onClose: () => void
  profilesData: ProfilesData
  onConnected: (result: ConnectResult) => void
}

export function SetupDialog({ t, request, onClose, profilesData, onConnected }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [provider, setProvider] = useState<ProviderKind>("lmstudio")
  const [baseUrl, setBaseUrl] = useState("")
  const [modelId, setModelId] = useState("")
  const [models, setModels] = useState<string[]>([])
  const [modelInfo, setModelInfo] = useState<Record<string, ModelInfo>>({})
  const [requestTimeout, setRequestTimeout] = useState("")
  const [imagesEnabled, setImagesEnabled] = useState(false)
  const [profileName, setProfileName] = useState("")
  const [profileId, setProfileId] = useState("")
  const [configured, setConfigured] = useState(false)
  const [status, setStatus] = useState("")
  const [statusError, setStatusError] = useState(false)
  const [authLink, setAuthLink] = useState<string | null>(null)
  const [discovering, setDiscovering] = useState(false)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    if (!request) return
    const info = request.info
    const isConfigured = Boolean(info && "configured" in info && info.configured)
    setConfigured(isConfigured)
    const activeProfile = profilesData.models.find((profile) => profile.id === profilesData.activeModelProfileId)
    setProfileId(request.newProfile ? "" : (activeProfile?.id ?? ""))
    setProfileName(request.newProfile ? "" : (activeProfile?.name ?? (isConfigured && info && "provider" in info ? `${info.provider} · ${info.modelId}` : "")))
    const nextProvider: ProviderKind = isConfigured && info && "provider" in info ? info.provider : "lmstudio"
    setProvider(nextProvider)
    setBaseUrl(isConfigured && info && "baseUrl" in info ? info.baseUrl : providerDefaults[nextProvider])
    setRequestTimeout(isConfigured && info && "timeoutMs" in info && info.timeoutMs ? String(info.timeoutMs / 1000) : "")
    setImagesEnabled(isConfigured && info && "imagesEnabled" in info ? info.imagesEnabled === true : false)
    if (isConfigured && info && "modelId" in info) {
      setModels([info.modelId])
      setModelInfo({ [info.modelId]: { id: info.modelId, imageSupport: info.imageSupport ?? "unknown" } })
      setModelId(info.modelId)
    } else {
      setModels([])
      setModelInfo({})
      setModelId("")
    }
    setAuthLink(null)
    setStatus(isConfigured && nextProvider === "codex" ? "Signed in with ChatGPT. Fetch models to refresh the list." : "")
    setStatusError(false)
    if (!dialog.current?.open) dialog.current?.showModal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request?.token])

  const providerHelp = t(helpKeys[provider])
  const isCodex = provider === "codex"
  const isClaudeCode = provider === "claude-code"
  const isManagedUrl = isCodex || isClaudeCode

  const onProviderChange = (next: ProviderKind) => {
    setProvider(next)
    setBaseUrl(providerDefaults[next])
    setModels([])
    setModelInfo({})
    setModelId("")
    setImagesEnabled(false)
    setAuthLink(null)
    setStatus("")
    setStatusError(false)
  }

  const applyImageCapability = (nextModelId: string, info: Record<string, ModelInfo>, autoSelect: boolean) => {
    const support = info[nextModelId]?.imageSupport ?? "unknown"
    if (support === "unsupported") setImagesEnabled(false)
    else if (support === "supported" && autoSelect) setImagesEnabled(true)
    return support
  }
  const currentSupport = modelInfo[modelId]?.imageSupport ?? "unknown"

  const connectionPayload = () => ({
    provider,
    baseUrl: baseUrl.trim(),
    modelId: modelId.trim() || undefined,
    timeoutMs: requestTimeout.trim() ? Number(requestTimeout.trim()) * 1000 : undefined,
    imagesEnabled,
    profileName: profileName.trim(),
    profileId: profileId || undefined,
  })

  const discover = async () => {
    const authWindow = isCodex ? window.open("about:blank", "cline-codex-auth") : null
    setDiscovering(true)
    setStatus(isCodex ? "Starting ChatGPT sign-in..." : "Connecting to the model server...")
    setStatusError(false)
    try {
      if (isCodex) {
        let auth = await api<{ status: string; url?: string; message?: string; email?: string }>("/api/codex/login", { method: "POST", body: "{}" })
        if (auth.url) { setAuthLink(auth.url); if (authWindow) authWindow.location.href = auth.url } else authWindow?.close()
        while (auth.status === "starting" || auth.status === "waiting") {
          setStatus(auth.message ?? "Waiting for ChatGPT sign-in...")
          await new Promise((resolve) => setTimeout(resolve, 1_000))
          auth = await api("/api/codex/status")
        }
        if (auth.status !== "authenticated") throw new Error(auth.message ?? "ChatGPT sign-in failed")
        setAuthLink(null)
        setStatus(auth.email ? `Signed in as ${auth.email}. Loading models...` : "Signed in. Loading models...")
      }
      let claudeAuth: { status: string } | null = null
      if (isClaudeCode) claudeAuth = await api("/api/claude-code/status")
      const result = await api<{ models: string[]; modelInfo: Record<string, ModelInfo>; baseUrl: string }>("/api/models/discover", { method: "POST", body: JSON.stringify(connectionPayload()) })
      const selected = result.models.includes(modelId) ? modelId : (result.models[0] ?? "")
      setModels(result.models)
      setModelInfo(result.modelInfo ?? {})
      setModelId(selected)
      applyImageCapability(selected, result.modelInfo ?? {}, true)
      setBaseUrl(result.baseUrl)
      if (isClaudeCode) { setStatus(claudeAuth?.status === "authenticated" ? t("claudeSignedIn") : t("claudeLoginRequired")); setStatusError(claudeAuth?.status !== "authenticated") }
      else setStatus(`${result.models.length} model(s) found.`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error))
      setStatusError(true)
    } finally {
      setDiscovering(false)
    }
  }

  const connect = async () => {
    setConnecting(true)
    setStatus("Validating connection and model...")
    setStatusError(false)
    try {
      const result = await api<ConnectResult>("/api/config", { method: "POST", body: JSON.stringify(connectionPayload()) })
      dialog.current?.close()
      onConnected(result)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error))
      setStatusError(true)
    } finally {
      setConnecting(false)
    }
  }

  return (
    <dialog ref={dialog} id="setup" onClose={onClose}>
      <form id="setup-form" onSubmit={(event) => { event.preventDefault(); void connect() }}>
        <div className="setup-heading">
          <div><h1>{t("connectAi")}</h1><p>{t("connectAiDescription")}</p></div>
          <button className="secondary icon-button" type="button" aria-label={t("close")} onClick={() => dialog.current?.close()}>×</button>
        </div>
        <label><span>{t("provider")}</span>
          <select value={provider} onChange={(event) => onProviderChange(event.target.value as ProviderKind)}>
            <option value="lmstudio">LM Studio</option>
            <option value="llamacpp">llama.cpp</option>
            <option value="ollama">Ollama</option>
            <option value="codex">ChatGPT Pro / Codex</option>
            <option value="claude-code">Claude Code Pro / Max</option>
          </select>
        </label>
        <label><span>{t("modelProfileName")}</span><input type="text" maxLength={100} required placeholder="My model" value={profileName} onChange={(event) => setProfileName(event.target.value)} /></label>
        <label id="base-url-row"><span>{t("serverUrl")}</span>
          <input type="url" required={!isManagedUrl} disabled={isManagedUrl} spellCheck={false} value={baseUrl} placeholder={isManagedUrl ? t(isClaudeCode ? "urlManagedClaude" : "urlManagedCodex") : providerDefaults[provider]} onChange={(event) => setBaseUrl(event.target.value)} />
          <small>{t(isClaudeCode ? "urlManagedClaude" : isCodex ? "urlManagedCodex" : "urlRequired")}</small>
        </label>
        <section className="provider-help" aria-live="polite">
          <strong>{t("connectionGuide")}</strong>
          <p style={{ whiteSpace: "pre-line" }}>{providerHelp}</p>
        </section>
        <div className="model-row">
          <label><span>{t("model")}</span>
            <select required value={modelId} onChange={(event) => { setModelId(event.target.value); applyImageCapability(event.target.value, modelInfo, true) }}>
              {models.length === 0
                ? <option value="">{t("fetchModelsFirst")}</option>
                : models.map((id) => <option key={id} value={id}>{modelInfo[id]?.name && modelInfo[id].name !== id ? `${modelInfo[id].name} (${id})` : id}</option>)}
            </select>
          </label>
          <button className="secondary" type="button" disabled={discovering} onClick={() => void discover()}>{discovering ? "…" : t(isCodex ? "signInChatgpt" : "fetchModels")}</button>
        </div>
        <details className="connection-advanced">
          <summary>{t("advancedSettings")}</summary>
          <div className="advanced-settings-body">
            <label><span>{t("requestTimeout")}</span>
              <input type="number" min="1" max="3600" step="1" inputMode="numeric" placeholder="Default" value={requestTimeout} onChange={(event) => setRequestTimeout(event.target.value)} />
              <small>{t("requestTimeoutHelp")}</small>
            </label>
            <label className="check-row"><input type="checkbox" checked={imagesEnabled} disabled={currentSupport === "unsupported"} onChange={(event) => setImagesEnabled(event.target.checked)} /><span>{t("enableImages")}</span></label>
            <small id="image-capability-status" data-state={currentSupport}>{t(currentSupport === "supported" ? "imageCapabilitySupported" : currentSupport === "unsupported" ? "imageCapabilityUnsupported" : "imageCapabilityUnknown")}</small>
          </div>
        </details>
        <p id="setup-status" role="status" className={statusError ? "error" : ""}>{status}</p>
        {authLink && <a id="auth-link" href={authLink} target="_blank" rel="noopener">Open ChatGPT sign-in</a>}
        <div className="setup-actions">
          {configured && <button className="secondary" type="button" onClick={() => dialog.current?.close()}>{t("cancel")}</button>}
          <button type="submit" disabled={connecting}>{connecting ? "Connecting..." : t("connect")}</button>
        </div>
      </form>
    </dialog>
  )
}
