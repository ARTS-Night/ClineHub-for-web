import { useEffect, useMemo, useRef, useState } from "react"
import { api, ApiError } from "./api.js"
import { detectInitialLocale, listLocales, loadDictionary, translate, type Dictionary, type Locale, type LocaleOption } from "./i18n.js"
import { MessageLog } from "./messageLog.js"
import { useSyncedState } from "./useSyncedState.js"
import type { AgentSettings, ApprovalItem, CompactionRecord, ConnectionInfo, ContextUsage, ManagedTool, PendingImage, ProfilesData, QueuedPrompt, SessionDetails, SessionSummary } from "./types.js"
import { Header } from "./components/Header.js"
import { Sidebar } from "./components/Sidebar.js"
import { ContextPanel } from "./components/ContextPanel.js"
import { ApprovalList } from "./components/ApprovalList.js"
import { QueueStatus, type QueueEntry } from "./components/QueueStatus.js"
import { Composer } from "./components/Composer.js"
import { SetupDialog, type SetupRequest } from "./components/SetupDialog.js"
import { ProfilesDialog } from "./components/ProfilesDialog.js"
import { SessionDialog } from "./components/SessionDialog.js"
import { AgentSettingsDialog } from "./components/AgentSettingsDialog.js"
import { GeneralSettingsDialog } from "./components/GeneralSettingsDialog.js"
import { AiSettingsMenu } from "./components/AiSettingsMenu.js"

const emptyProfiles: ProfilesData = { models: [], workspaces: [] }

export function App() {
  // Translations live in ./setting/language/<code>.json (see src/server.ts),
  // not in the bundle, so they're fetched once per locale and cached.
  const [locale, setLocaleState] = useState<Locale>(detectInitialLocale)
  const [dictionary, setDictionary] = useState<Dictionary>({})
  const [fallbackDictionary, setFallbackDictionary] = useState<Dictionary>({})
  const [availableLocales, setAvailableLocales] = useState<LocaleOption[]>([])
  const setLocale = (value: Locale) => { localStorage.setItem("cline-language", value); setLocaleState(value) }
  useEffect(() => { loadDictionary("en").then(setFallbackDictionary).catch(() => {}) }, [])
  useEffect(() => { loadDictionary(locale).then(setDictionary).catch(() => {}) }, [locale])
  useEffect(() => { listLocales().then(setAvailableLocales).catch(() => {}) }, [])
  const t = useMemo(() => (key: string, vars?: Record<string, unknown>) => translate(dictionary, fallbackDictionary, key, vars), [dictionary, fallbackDictionary])
  const [theme, setTheme] = useState<"dark" | "light">(() => (localStorage.getItem("cline-theme") as "dark" | "light" | null) ?? (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"))
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem("cline-sidebar-collapsed")
    return stored === null ? matchMedia("(max-width: 760px)").matches : stored === "true"
  })
  const [showToolDetails, setShowToolDetails] = useState(() => localStorage.getItem("cline-show-tool-details") === "true")
  const [hidePlanBanner, setHidePlanBanner] = useState(() => localStorage.getItem("cline-hide-plan-banner") === "true")
  const [planBannerDismissed, setPlanBannerDismissed] = useState(false)

  const [sessions, setSessions] = useState<SessionSummary[]>([])
  const [activeSession, setActiveSession, activeSessionRef] = useSyncedState<string | null>(null)
  const [activeSessionDetails, setActiveSessionDetails] = useState<SessionDetails | null>(null)
  const [activeSessionRunning, setActiveSessionRunning] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [activeConnectionInfo, setActiveConnectionInfo] = useState<ConnectionInfo | null>(null)
  const [profilesData, setProfilesData] = useState<ProfilesData>(emptyProfiles)
  const [agentSettings, setAgentSettings] = useState<AgentSettings | null>(null)
  const [activeContext, setActiveContext] = useState<ContextUsage | null>(null)
  const [activeCompactions, setActiveCompactions] = useState<CompactionRecord[]>([])
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([])
  const [prompt, setPrompt] = useState("")
  const [approvals, setApprovals] = useState<ApprovalItem[]>([])
  const [startupQueue, setStartupQueue, startupQueueRef] = useSyncedState<QueuedPrompt[]>([])
  const [serverQueuePrompts, setServerQueuePrompts] = useState<QueuedPrompt[]>([])
  const [sessionStarting, setSessionStarting] = useState(false)
  const [sseState, setSseState] = useState<"connecting" | "open" | "retry">("connecting")

  const [modelProfileBusy, setModelProfileBusy] = useState(false)
  const [workspaceProfileBusy, setWorkspaceProfileBusy] = useState(false)
  const [sessionDialogId, setSessionDialogId] = useState<string | null>(null)
  const [profilesDialogOpen, setProfilesDialogOpen] = useState(false)
  const [agentSettingsOpen, setAgentSettingsOpen] = useState(false)
  const [generalSettingsOpen, setGeneralSettingsOpen] = useState(false)
  const [aiSettingsMenuOpen, setAiSettingsMenuOpen] = useState(false)
  const [setupRequest, setSetupRequest] = useState<SetupRequest | null>(null)
  const setupTokenRef = useRef(0)

  const messagesRef = useRef<HTMLDivElement>(null)
  const logRef = useRef<MessageLog | null>(null)
  const getLog = () => logRef.current!

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem("cline-theme", theme)
  }, [theme])
  useEffect(() => { document.documentElement.lang = locale }, [locale])
  useEffect(() => { document.body.classList.toggle("sidebar-collapsed", sidebarCollapsed) }, [sidebarCollapsed])

  // Create the imperative message-log once the container mounts, and keep
  // its localization/filter options current without recreating it.
  useEffect(() => {
    if (messagesRef.current && !logRef.current) logRef.current = new MessageLog(messagesRef.current, t, showToolDetails, locale, agentSettings?.activeTemplateId === "plan")
  }, [])
  useEffect(() => {
    if (!logRef.current) return
    logRef.current.t = t
    logRef.current.showToolDetails = showToolDetails
    logRef.current.locale = locale
    logRef.current.planStyle = agentSettings?.activeTemplateId === "plan"
  }, [t, showToolDetails, locale, agentSettings?.activeTemplateId])
  // The × on the banner only hides it until Plan mode is re-entered.
  useEffect(() => { if (agentSettings?.activeTemplateId === "plan") setPlanBannerDismissed(false) }, [agentSettings?.activeTemplateId])

  const openSetup = (info: ConnectionInfo | null = null, newProfile = false) => {
    setupTokenRef.current += 1
    setSetupRequest({ info, newProfile, token: setupTokenRef.current })
  }

  const loadProfiles = async (): Promise<ProfilesData> => {
    const result = await api<ProfilesData>("/api/profiles")
    setProfilesData(result)
    return result
  }
  const loadSessions = async () => {
    const items = await api<SessionSummary[]>("/api/sessions")
    setSessions(items)
  }
  const loadAgentSettings = async () => {
    const settings = await api<AgentSettings>("/api/agent-settings")
    setAgentSettings(settings)
    return settings
  }
  const refreshQueue = async () => {
    const id = activeSessionRef.current
    if (!id) { setServerQueuePrompts([]); return }
    const prompts = await api<QueuedPrompt[]>(`/api/sessions/${encodeURIComponent(id)}/queue`)
    setServerQueuePrompts(Array.isArray(prompts) ? prompts : [])
  }
  const refreshActiveSessionDetails = async () => {
    const id = activeSessionRef.current
    if (!id) return
    try {
      const details = await api<SessionDetails>(`/api/sessions/${encodeURIComponent(id)}`)
      setActiveSessionDetails(details)
    } catch { /* not persisted yet */ }
  }
  const flushStartupQueue = async () => {
    const id = activeSessionRef.current
    if (!id || startupQueueRef.current.length === 0) return
    const prompts = startupQueueRef.current
    setStartupQueue([])
    for (const item of prompts) {
      try { await api(`/api/sessions/${encodeURIComponent(id)}/messages`, { method: "POST", body: JSON.stringify({ prompt: item.prompt, images: item.images ?? [] }) }) }
      catch (error) { getLog().showError(error, "Queued send failed") }
    }
    refreshQueue().catch(() => {})
  }

  // --- Session selection / lifecycle ---

  const resetConversation = () => {
    getLog().clear()
    setActiveCompactions([])
    setApprovals([])
  }

  const selectSession = async (id: string) => {
    setActiveSession(id)
    setSessionStarting(false)
    setStartupQueue([])
    setServerQueuePrompts([])
    resetConversation()
    try {
      const [history, details] = await Promise.all([
        api<Array<{ role?: string; content?: unknown }>>(`/api/sessions/${encodeURIComponent(id)}/messages`),
        api<SessionDetails>(`/api/sessions/${encodeURIComponent(id)}`),
      ])
      setActiveSessionDetails(details)
      for (const message of history) getLog().renderHistoryMessage(message)
      setActiveCompactions(details.compactions ?? [])
      for (const record of details.compactions ?? []) getLog().addCompactionEvent(record)
      setActiveSessionRunning(details.session?.status === "running")
      setActiveContext(details.context)
      await refreshQueue()
      await loadSessions()
      if (matchMedia("(max-width: 760px)").matches) setSidebarCollapsed(true)
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setActiveSession(null)
        setActiveSessionDetails(null)
        setActiveSessionRunning(false)
        setActiveContext(null)
        await loadSessions()
        getLog().addMessage("tool", "This session is no longer available. Select another session or start a new one.")
        return
      }
      getLog().showError(error, "Session load failed")
    }
  }

  const newSession = () => {
    if (!selectedModel) { openSetup(); return }
    setActiveSession(null)
    setActiveSessionDetails(null)
    setSessionStarting(false)
    setActiveSessionRunning(false)
    setStartupQueue([])
    setServerQueuePrompts([])
    resetConversation()
    setActiveContext(null)
    getLog().addMessage("tool", "New session ready. Enter a message and press Send.")
    loadSessions().catch((error) => getLog().showError(error, "Session list failed"))
  }

  const clearSessions = async () => {
    if (!confirm("Delete all Cline sessions? This cannot be undone.")) return
    try {
      const result = await api<{ deleted: number; failed: string[] }>("/api/sessions", { method: "DELETE" })
      setActiveSession(null)
      setActiveSessionDetails(null)
      setSessionStarting(false)
      setActiveSessionRunning(false)
      setStartupQueue([])
      setServerQueuePrompts([])
      resetConversation()
      await loadSessions()
      getLog().addMessage("tool", `Deleted ${result.deleted} session(s).${result.failed.length ? ` Failed: ${result.failed.join(", ")}` : ""}`)
    } catch (error) { getLog().showError(error, "Clear sessions failed") }
  }

  // --- Composer ---

  const addImageFiles = async (files: FileList) => {
    const allowed = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"])
    const selected = [...files]
    if (pendingImages.length + selected.length > 4) throw new Error("Attach no more than 4 images per message")
    const added: PendingImage[] = []
    for (const file of selected) {
      if (!allowed.has(file.type)) throw new Error(`Unsupported image type: ${file.name}`)
      if (file.size > 5 * 1024 * 1024) throw new Error(`Image is larger than 5 MB: ${file.name}`)
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.addEventListener("load", () => resolve(String(reader.result)))
        reader.addEventListener("error", () => reject(reader.error ?? new Error(`Could not read ${file.name}`)))
        reader.readAsDataURL(file)
      })
      added.push({ name: file.name, dataUrl })
    }
    setPendingImages((current) => [...current, ...added])
  }

  const submitPrompt = async () => {
    if (!selectedModel) { openSetup(); return }
    const images = pendingImages.map((item) => item.dataUrl)
    const imageItems = [...pendingImages]
    const text = prompt.trim() || (images.length ? t("imageOnlyPrompt") : "")
    if (!text && images.length === 0) return

    setPrompt("")
    setPendingImages([])
    if (!activeSession && !sessionStarting) getLog().addMessage("user", text, images)

    if (!activeSession && sessionStarting) {
      setStartupQueue((current) => [...current, { id: `startup-${Date.now()}-${Math.random().toString(36).slice(2)}`, prompt: text, images, imageCount: images.length, createdAt: Date.now() }])
      return
    }

    if (!activeSessionRunning) getLog().resetStreamNodes()
    try {
      if (!activeSession) {
        setSessionStarting(true)
        await api("/api/sessions", { method: "POST", body: JSON.stringify({ prompt: text, images }) })
      } else {
        const result = await api<{ sessionId?: string }>(`/api/sessions/${encodeURIComponent(activeSession)}/messages`, { method: "POST", body: JSON.stringify({ prompt: text, images }) })
        if (result.sessionId && result.sessionId !== activeSession) {
          setActiveSession(result.sessionId)
          loadSessions().catch(() => {})
          refreshActiveSessionDetails()
        }
      }
    } catch (error) {
      if (!activeSession) setSessionStarting(false)
      if (pendingImages.length === 0) setPendingImages(imageItems)
      getLog().showError(error, "Send failed")
    }
  }

  const abortSession = async () => {
    if (!activeSession) return
    try { await api(`/api/sessions/${encodeURIComponent(activeSession)}/abort`, { method: "POST" }); getLog().addMessage("tool", "Stop requested") }
    catch (error) { getLog().showError(error, "Stop failed") }
  }

  // --- Queue ---

  const queueEntries: QueueEntry[] = [
    ...startupQueue.map((item) => ({ ...item, source: "startup" as const })),
    ...serverQueuePrompts.map((item) => ({ ...item, source: "server" as const })),
  ]
  const onQueueUpdate = async (entry: QueueEntry, value: string) => {
    if (entry.source === "startup") { setStartupQueue((current) => current.map((item) => item.id === entry.id ? { ...item, prompt: value } : item)); return }
    await api(`/api/sessions/${encodeURIComponent(activeSession ?? "")}/queue/${encodeURIComponent(entry.id)}`, { method: "PATCH", body: JSON.stringify({ prompt: value }) })
    await refreshQueue()
  }
  const onQueueCancel = async (entry: QueueEntry) => {
    if (entry.source === "startup") { setStartupQueue((current) => current.filter((item) => item.id !== entry.id)); return }
    await api(`/api/sessions/${encodeURIComponent(activeSession ?? "")}/queue/${encodeURIComponent(entry.id)}`, { method: "DELETE" })
    await refreshQueue()
  }

  // --- Templates (a template bundles the system prompt + tool permissions;
  // switching the active template *is* switching mode) ---
  const activeTemplate = agentSettings?.templates.find((template) => template.id === agentSettings.activeTemplateId) ?? null
  const effectivePermissions = activeTemplate?.permissions ?? null

  const cyclePermission = async (tool: ManagedTool) => {
    if (!agentSettings || !activeTemplate || !(tool in activeTemplate.permissions)) return
    const order = ["disabled", "ask", "allow"] as const
    const current = activeTemplate.permissions[tool]
    const next = order[(order.indexOf(current) + 1) % order.length]
    const previous = agentSettings
    const nextPermissions = { ...activeTemplate.permissions, [tool]: next }
    setAgentSettings({ ...previous, templates: previous.templates.map((template) => template.id === activeTemplate.id ? { ...template, permissions: nextPermissions, permissionPreset: "custom" } : template) })
    try {
      const updated = await api<AgentSettings["templates"][number]>(`/api/agent-settings/templates/${encodeURIComponent(activeTemplate.id)}`, { method: "PATCH", body: JSON.stringify({ permissions: nextPermissions }) })
      setAgentSettings((current) => current ? { ...current, templates: current.templates.map((template) => template.id === updated.id ? updated : template) } : current)
    } catch (error) {
      setAgentSettings(previous)
      getLog().showError(error, "Permission update failed")
    }
  }

  // Switching the active template is just a PATCH of `activeTemplateId` —
  // the server holds each template's prompt + permissions persistently.
  const [templateBusy, setTemplateBusy] = useState(false)
  const selectTemplate = async (id: string) => {
    if (!agentSettings || agentSettings.activeTemplateId === id) return
    const previous = agentSettings
    setAgentSettings({ ...previous, activeTemplateId: id })
    setTemplateBusy(true)
    try {
      setAgentSettings(await api<AgentSettings>("/api/agent-settings", { method: "PATCH", body: JSON.stringify({ activeTemplateId: id }) }))
    } catch (error) {
      setAgentSettings(previous)
      getLog().showError(error, "Template switch failed")
    } finally {
      setTemplateBusy(false)
    }
  }

  // --- Approvals ---

  const resolveApproval = async (id: string, approved: boolean) => {
    try {
      await api(`/api/approvals/${encodeURIComponent(id)}`, { method: "POST", body: JSON.stringify({ approved }) })
      setApprovals((current) => current.filter((item) => item.id !== id))
    } catch (error) { getLog().showError(error, "Approval failed") }
  }

  // --- Profiles / setup / agent settings side effects ---

  const onModelProfileChange = async (id: string) => {
    const previous = profilesData.activeModelProfileId
    setModelProfileBusy(true)
    try {
      const result = await api<{ profiles: ProfilesData; connection: ConnectionInfo & { modelId?: string } }>(`/api/profiles/models/${encodeURIComponent(id)}/activate`, { method: "POST", body: "{}" })
      setProfilesData(result.profiles)
      const connection = result.connection
      setSelectedModel("modelId" in connection ? (connection.modelId as string) : null)
      setActiveConnectionInfo(connection)
      setActiveContext(await api<ContextUsage>("/api/context"))
    } catch (error) {
      setProfilesData((current) => ({ ...current, activeModelProfileId: previous }))
      getLog().showError(error, "Model profile switch failed")
    } finally {
      setModelProfileBusy(false)
    }
  }
  const onWorkspaceProfileChange = async (id: string) => {
    const previous = profilesData.activeWorkspaceProfileId
    setWorkspaceProfileBusy(true)
    try {
      const result = await api<{ profiles: ProfilesData }>(`/api/profiles/workspaces/${encodeURIComponent(id)}/activate`, { method: "POST", body: "{}" })
      setProfilesData(result.profiles)
    } catch (error) {
      setProfilesData((current) => ({ ...current, activeWorkspaceProfileId: previous }))
      getLog().showError(error, "Workspace profile switch failed")
    } finally {
      setWorkspaceProfileBusy(false)
    }
  }

  const onSetupConnected = (result: { provider: string; modelId: string } & Record<string, unknown>) => {
    setSelectedModel(result.modelId)
    setActiveConnectionInfo(result as ConnectionInfo)
    setActiveSession(null)
    setActiveSessionDetails(null)
    resetConversation()
    getLog().resetStreamNodes()
    setActiveContext(null)
    api<ContextUsage>("/api/context").then(setActiveContext).catch(() => {})
    loadProfiles().catch(() => {})
    getLog().addMessage("tool", `AI connected: ${result.provider} / ${result.modelId}`)
  }

  const onAgentSettingsSaved = (settings: AgentSettings) => {
    setAgentSettings(settings)
    loadProfiles().catch(() => {})
    api<ContextUsage>("/api/context").then(setActiveContext).catch(() => {})
  }

  // --- Bootstrap + SSE (set up once) ---

  useEffect(() => {
    loadSessions().catch((error) => getLog().showError(error, "Session list failed"))
    loadProfiles().catch((error) => getLog().showError(error, "Profile load failed"))
    loadAgentSettings().catch((error) => getLog().showError(error, "Agent settings failed"))
    api<ConnectionInfo>("/api/config").then((info) => {
      if (info.configured) {
        setSelectedModel(info.modelId)
        setActiveConnectionInfo(info)
        api<ContextUsage>("/api/context").then(setActiveContext).catch(() => {})
      } else {
        openSetup(info)
      }
    }).catch((error) => getLog().showError(error, "Configuration failed"))

    const events = new EventSource("/api/events")
    events.onopen = () => setSseState("open")
    events.onerror = () => setSseState("retry")

    const names = ["text", "reasoning", "tool", "tool_result", "iteration", "status", "usage", "turn_finished", "ended", "approval", "queue", "prompt_started", "session_replaced", "cline_error"]
    for (const name of names) {
      events.addEventListener(name, (event) => {
        const item = JSON.parse((event as MessageEvent).data)
        const log = getLog()
        if (name === "session_replaced") {
          if (item.sessionId === activeSessionRef.current && item.data?.sessionId) {
            setActiveSession(item.data.sessionId)
            setActiveSessionRunning(false)
            loadSessions().catch(() => {})
            refreshActiveSessionDetails()
          }
          return
        }
        if (name === "cline_error") {
          if (item.sessionId === activeSessionRef.current || item.sessionId === "unknown") log.resetStreamNodes()
          log.addMessage("tool", `Cline error: ${item.data}`)
          return
        }
        if (!activeSessionRef.current && item.sessionId) {
          setActiveSession(item.sessionId)
          setSessionStarting(false)
          loadSessions().catch((error) => log.showError(error, "Session list failed"))
          refreshActiveSessionDetails()
          flushStartupQueue().catch((error) => log.showError(error, "Queue flush failed"))
        }
        if (item.sessionId !== activeSessionRef.current) return
        if (name === "queue") setServerQueuePrompts(Array.isArray(item.data?.prompts) ? item.data.prompts : [])
        if (name === "prompt_started") {
          log.finishStreamNodes()
          log.resetStreamNodes()
          if (typeof item.data?.prompt === "string") log.addMessage("user", item.data.prompt, Array.isArray(item.data?.images) ? item.data.images : [])
          loadSessions().catch(() => {})
          refreshActiveSessionDetails()
        }
        if (name === "text") log.appendStream("text", item.data)
        if (name === "reasoning") log.appendStream("reasoning", typeof item.data === "string" ? item.data : item.data?.text, Boolean(item.data?.redacted))
        if (name === "iteration") { log.finishStreamNodes(); log.resetStreamNodes() }
        if (name === "tool") { log.finishStreamNodes(); log.addToolActivity(item.data) }
        if (name === "tool_result") log.finishToolActivity(item.data)
        if (name === "approval") setApprovals((current) => [...current, item.data as ApprovalItem])
        if (name === "usage") setActiveContext(item.data)
        if (name === "status" && item.data?.reason === "auto_compaction") {
          const record: CompactionRecord = { at: item.data.at ?? new Date().toISOString(), message: item.data.message ?? "" }
          setActiveCompactions((current) => [...current, record])
          log.addCompactionEvent(record)
        }
        if (name === "status" && typeof item.data === "string") {
          setActiveSessionRunning(item.data === "running")
          if (item.data === "idle") refreshQueue().catch(() => {})
        }
        if (name === "turn_finished" || name === "ended") {
          setActiveSessionRunning(false)
          if (name === "turn_finished") refreshQueue().catch(() => {})
          if (name === "ended") { log.finishStreamNodes(); log.resetStreamNodes() }
          else log.resetStreamNodes()
          const id = activeSessionRef.current
          if (id) api<SessionDetails>(`/api/sessions/${encodeURIComponent(id)}`).then((details) => { setActiveSessionDetails(details); setActiveContext(details.context) }).catch(() => {})
        }
      })
    }
    return () => events.close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const connectionText = sseState === "retry" ? t("sseRetry") : selectedModel ? `${t("connected")} · ${selectedModel}` : sseState === "open" ? t("serverConnected") : t("connecting")
  const connectionColor = sseState === "retry" ? "#f5c979" : selectedModel ? "#79d69a" : "#f5c979"
  const workspaceProfile = profilesData.workspaces.find((item) => item.id === profilesData.activeWorkspaceProfileId)
  const workspaceDisplay = workspaceProfile
    ? `${workspaceProfile.type === "ssh" ? "SSH" : "workspace"}: ${workspaceProfile.type === "ssh" ? `${workspaceProfile.username}@${workspaceProfile.host}:${workspaceProfile.remoteDirectory}` : workspaceProfile.path}`
    : "workspace: loading..."

  return (
    <>
      <Header t={t}
        connectionText={connectionText} connectionColor={connectionColor} workspaceDisplay={workspaceDisplay} profilesData={profilesData}
        onModelProfileChange={onModelProfileChange} onWorkspaceProfileChange={onWorkspaceProfileChange} modelProfileBusy={modelProfileBusy} workspaceProfileBusy={workspaceProfileBusy}
        sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed((current) => { const next = !current; localStorage.setItem("cline-sidebar-collapsed", String(next)); return next })}
        onOpenGeneralSettings={() => setGeneralSettingsOpen(true)} onOpenAiSettings={() => setAiSettingsMenuOpen(true)} />
      <main>
        <Sidebar t={t} sessions={sessions} activeSession={activeSession} onSelect={selectSession} onOpenDetails={setSessionDialogId} onNewSession={newSession} onClearSessions={clearSessions} />
        <section className="conversation">
          <ContextPanel t={t} locale={locale} context={activeContext} compactions={activeCompactions} showToolDetails={showToolDetails}
            onToggleShowToolDetails={(value) => { setShowToolDetails(value); localStorage.setItem("cline-show-tool-details", String(value)); if (activeSession) selectSession(activeSession) }}
            session={activeSessionDetails?.session ?? null} />
          <div id="messages" className="messages" ref={messagesRef} />
          <ApprovalList approvals={approvals} onResolve={resolveApproval} />
          <QueueStatus t={t} entries={queueEntries} onUpdate={onQueueUpdate} onCancel={onQueueCancel} />
          {agentSettings?.activeTemplateId === "plan" && !hidePlanBanner && !planBannerDismissed && (
            <div className="mode-banner">
              <span>◐ {t("modeBanner")}</span>
              <div className="mode-banner-actions">
                <button type="button" className="secondary" disabled={templateBusy} onClick={() => void selectTemplate("coding")}>{t("switchToCode")}</button>
                <button type="button" className="secondary icon-button" aria-label={t("dismiss")} title={t("dismiss")} onClick={() => setPlanBannerDismissed(true)}>×</button>
              </div>
            </div>
          )}
          <Composer t={t} prompt={prompt} onPromptChange={setPrompt} onSubmit={() => void submitPrompt()} onAbort={() => void abortSession()} running={activeSessionRunning}
            pendingImages={pendingImages} onAddImages={(files) => void addImageFiles(files).catch((error) => getLog().showError(error, "Image attachment failed"))}
            onRemoveImage={(index) => setPendingImages((current) => current.filter((_, i) => i !== index))}
            imagesEnabled={Boolean(activeConnectionInfo && "imagesEnabled" in activeConnectionInfo && activeConnectionInfo.imagesEnabled)}
            agentSettings={agentSettings} effectivePermissions={effectivePermissions} onCyclePermission={cyclePermission} onSelectTemplate={(id) => void selectTemplate(id)} templateBusy={templateBusy} />
        </section>
      </main>
      <GeneralSettingsDialog t={t} open={generalSettingsOpen} onClose={() => setGeneralSettingsOpen(false)}
        locale={locale} onChangeLocale={setLocale} availableLocales={availableLocales}
        theme={theme} onToggleTheme={() => setTheme((current) => current === "dark" ? "light" : "dark")}
        hidePlanBanner={hidePlanBanner} onChangeHidePlanBanner={(value) => { setHidePlanBanner(value); localStorage.setItem("cline-hide-plan-banner", String(value)) }} />
      <AiSettingsMenu t={t} open={aiSettingsMenuOpen} onClose={() => setAiSettingsMenuOpen(false)}
        onOpenConnection={async () => openSetup(await api<ConnectionInfo>("/api/config"))}
        onOpenProfiles={async () => { await loadProfiles(); setProfilesDialogOpen(true) }}
        onOpenAgentSettings={() => setAgentSettingsOpen(true)} />
      <SetupDialog t={t} request={setupRequest} onClose={() => {}} profilesData={profilesData} onConnected={onSetupConnected} />
      <ProfilesDialog t={t} open={profilesDialogOpen} onClose={() => setProfilesDialogOpen(false)} profilesData={profilesData} onProfilesChanged={setProfilesData}
        onAddModelProfile={async () => { setProfilesDialogOpen(false); openSetup(await api<ConnectionInfo>("/api/config"), true) }} />
      <SessionDialog t={t} locale={locale} sessionId={sessionDialogId} onClose={() => setSessionDialogId(null)}
        onRenamed={() => { setSessionDialogId(null); loadSessions().catch(() => {}) }}
        onDeleted={(id) => {
          setSessionDialogId(null)
          if (activeSession === id) { setActiveSession(null); setActiveSessionDetails(null); resetConversation(); setActiveContext(null) }
          loadSessions().catch(() => {})
        }} />
      <AgentSettingsDialog t={t} open={agentSettingsOpen} onClose={() => setAgentSettingsOpen(false)} onSaved={onAgentSettingsSaved} />
    </>
  )
}
