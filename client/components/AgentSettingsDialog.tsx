import { useEffect, useRef, useState } from "react"
import { api } from "../api.js"
import type { TFunction } from "../i18n.js"
import type { AgentSettings, ManagedTool, McpServerSettings, McpTransport, PermissionPreset, PreviewResult, PromptTemplate, ToolPermission } from "../types.js"

type Tab = "templates" | "mcp" | "automation"

const tools: ManagedTool[] = ["read_files", "search_codebase", "fetch_web_content", "skills", "run_commands", "editor", "apply_patch"]
const presets: Record<"readonly" | "balanced" | "full", Record<ManagedTool, ToolPermission>> = {
  readonly: { read_files: "allow", search_codebase: "allow", fetch_web_content: "ask", skills: "allow", run_commands: "disabled", editor: "disabled", apply_patch: "disabled" },
  balanced: { read_files: "allow", search_codebase: "allow", fetch_web_content: "allow", skills: "allow", run_commands: "ask", editor: "ask", apply_patch: "ask" },
  full: { read_files: "allow", search_codebase: "allow", fetch_web_content: "allow", skills: "allow", run_commands: "allow", editor: "allow", apply_patch: "allow" },
}
const newTemplateDraft = (): Pick<PromptTemplate, "name" | "prompt" | "permissionPreset" | "permissions"> =>
  ({ name: "", prompt: "", permissionPreset: "balanced", permissions: { ...presets.balanced } })

type Props = { t: TFunction; open: boolean; onClose: () => void; onSaved: (settings: AgentSettings) => void }

export function AgentSettingsDialog({ t, open, onClose, onSaved }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [settings, setSettings] = useState<AgentSettings | null>(null)
  const [tab, setTab] = useState<Tab>("templates")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<PromptTemplate | ReturnType<typeof newTemplateDraft> | null>(null)
  const [preview, setPreview] = useState<PreviewResult | null>(null)
  const [status, setStatus] = useState("")
  const [saving, setSaving] = useState(false)
  const update = <K extends keyof AgentSettings>(key: K, value: AgentSettings[K]) => setSettings((current) => current ? { ...current, [key]: value } : current)

  useEffect(() => {
    if (!open) { dialog.current?.close(); return }
    setStatus("")
    api<AgentSettings>("/api/agent-settings")
      .then((next) => {
        setSettings(next)
        setPreview(null)
        const active = next.templates.find((template) => template.id === next.activeTemplateId) ?? next.templates[0] ?? null
        setEditingId(active?.id ?? null)
        setDraft(active)
        dialog.current?.showModal()
      })
      .catch((error) => setStatus(error instanceof Error ? error.message : String(error)))
  }, [open])

  const selectForEdit = (template: PromptTemplate) => { setEditingId(template.id); setDraft(template); setPreview(null) }
  const startNewTemplate = () => { setEditingId(null); setDraft(newTemplateDraft()); setPreview(null) }
  const setDraftField = <K extends keyof PromptTemplate>(key: K, value: PromptTemplate[K]) => setDraft((current) => current ? { ...current, [key]: value } : current)
  const selectDraftPreset = (preset: PermissionPreset) => setDraft((current) => current ? { ...current, permissionPreset: preset, permissions: preset === "custom" ? current.permissions : { ...presets[preset] } } : current)
  const setDraftPermission = (tool: ManagedTool, value: ToolPermission) => setDraft((current) => current ? { ...current, permissionPreset: "custom", permissions: { ...current.permissions, [tool]: value } } : current)

  const saveTemplate = async () => {
    if (!draft || !draft.name.trim() || !draft.prompt.trim()) return
    try {
      const body = JSON.stringify({ name: draft.name, prompt: draft.prompt, permissionPreset: draft.permissionPreset, permissions: draft.permissions })
      const saved = editingId
        ? await api<PromptTemplate>(`/api/agent-settings/templates/${encodeURIComponent(editingId)}`, { method: "PATCH", body })
        : await api<PromptTemplate>("/api/agent-settings/templates", { method: "POST", body })
      setSettings((current) => current ? { ...current, templates: editingId ? current.templates.map((tpl) => tpl.id === saved.id ? saved : tpl) : [...current.templates, saved] } : current)
      setEditingId(saved.id)
      setDraft(saved)
      setStatus(t("templateSaved"))
    } catch (error) { setStatus(error instanceof Error ? error.message : String(error)) }
  }
  const deleteTemplate = async (id: string) => {
    try {
      await api(`/api/agent-settings/templates/${encodeURIComponent(id)}`, { method: "DELETE" })
      setSettings((current) => {
        if (!current) return current
        const templates = current.templates.filter((tpl) => tpl.id !== id)
        const activeTemplateId = current.activeTemplateId === id ? (templates[0]?.id ?? current.activeTemplateId) : current.activeTemplateId
        if (editingId === id && templates[0]) selectForEdit(templates[0])
        return { ...current, templates, activeTemplateId }
      })
    } catch (error) { setStatus(error instanceof Error ? error.message : String(error)) }
  }
  const resetTemplate = async (id: string) => {
    try {
      const reset = await api<PromptTemplate>(`/api/agent-settings/templates/${encodeURIComponent(id)}/reset`, { method: "POST" })
      setSettings((current) => current ? { ...current, templates: current.templates.map((tpl) => tpl.id === reset.id ? reset : tpl) } : current)
      if (editingId === id) setDraft(reset)
      setStatus(t("templateReset"))
    } catch (error) { setStatus(error instanceof Error ? error.message : String(error)) }
  }
  const activateTemplate = async (id: string) => {
    try {
      const result = await api<AgentSettings>("/api/agent-settings", { method: "PATCH", body: JSON.stringify({ activeTemplateId: id }) })
      setSettings(result)
      onSaved(result)
    } catch (error) { setStatus(error instanceof Error ? error.message : String(error)) }
  }
  const showPreview = async () => { if (!draft?.prompt.trim()) return; try { setPreview(await api<PreviewResult>("/api/agent-settings/preview", { method: "POST", body: JSON.stringify({ template: draft.prompt }) })) } catch (error) { setStatus(error instanceof Error ? error.message : String(error)) } }
  const updateMcp = (id: string, patch: Partial<McpServerSettings>) => update("mcpServers", (settings?.mcpServers ?? []).map((server) => server.id === id ? { ...server, ...patch } : server))
  const addMcp = () => update("mcpServers", [...(settings?.mcpServers ?? []), { id: `mcp-${Date.now()}`, name: "", enabled: true, transport: "stdio" as McpTransport, command: "npx", args: [], url: "" }])
  const save = async () => {
    if (!settings) return
    setSaving(true)
    setStatus(t("savingShort"))
    try {
      const result = await api<AgentSettings>("/api/agent-settings", { method: "PATCH", body: JSON.stringify(settings) })
      setSettings(result)
      setStatus(t("saved"))
      onSaved(result)
    } catch (error) { setStatus(error instanceof Error ? error.message : String(error)) }
    finally { setSaving(false) }
  }
  const tabs: Array<[Tab, string]> = [["templates", "template"], ["mcp", "MCP"], ["automation", "shellIdleTab"]]

  return <dialog ref={dialog} className="wide-dialog react-agent-dialog" onClose={onClose}><div className="settings-form">
    <div className="setup-heading"><div><h1>{t("agentSettings")}</h1><p>{t("agentSettingsIntro")}</p></div><button className="secondary icon-button" type="button" onClick={() => dialog.current?.close()} aria-label="Close">×</button></div>
    <div className="agent-settings-tabs" role="tablist">{tabs.map(([id, key]) => <button key={id} className={tab === id ? "active" : ""} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>{key === "MCP" ? "MCP" : t(key)}</button>)}</div>
    {!settings ? <p>{t("loading")}</p> : <>
      {tab === "templates" && <>
        <label><span>{t("workingFolder")}</span><input value={settings.workspacePath} spellCheck={false} onChange={(event) => update("workspacePath", event.target.value)} /><small>Allowed root: <code>{settings.allowedRoot}</code></small></label>
        <fieldset><legend>{t("templatesList")}</legend>
          <p className="settings-note">{t("templatesNote")}</p>
          <div className="profile-list">
            {settings.templates.map((template) => <div className="profile-list-row" key={template.id}>
              <span className="profile-description">
                <strong>{template.name}</strong>{template.id === settings.activeTemplateId && <> · {t("templateActive")}</>}
              </span>
              <div className="profile-actions" style={{ justifyContent: "flex-end", flexWrap: "wrap" }}>
                <button className="secondary" type="button" onClick={() => selectForEdit(template)}>{t("edit")}</button>
                <button className="secondary" type="button" disabled={template.id === settings.activeTemplateId} onClick={() => void activateTemplate(template.id)}>{t("useTemplate")}</button>
                {template.builtin
                  ? <button className="secondary" type="button" onClick={() => void resetTemplate(template.id)}>{t("resetTemplate")}</button>
                  : <button className="danger" type="button" onClick={() => void deleteTemplate(template.id)}>{t("delete")}</button>}
              </div>
            </div>)}
          </div>
          <div className="setup-actions"><button className="secondary" type="button" onClick={startNewTemplate}>+ {t("newTemplate")}</button></div>
        </fieldset>
        {draft && <fieldset>
          <legend>{editingId ? t("editTemplateTitle") : t("newTemplate")}</legend>
          <label><span>{t("name")}</span><input value={draft.name} onChange={(event) => setDraftField("name", event.target.value)} /></label>
          <label><span>{t("systemPrompt")}</span><textarea rows={10} value={draft.prompt} onChange={(event) => { setDraftField("prompt", event.target.value); setPreview(null) }} /><small>{t("templatePromptVariables")}</small></label>
          <div className="prompt-preview-actions"><button className="secondary" type="button" onClick={showPreview}>{t("previewForEnvironment")}</button></div>
          {preview && <section className="prompt-preview"><strong>{t("resolvedSystemPrompt")}</strong><small>{t("model")}: {preview.model ? `${preview.model.provider} / ${preview.model.modelId}` : t("notConnected")} · {t("workspaceLabel")}: {preview.workspace}</small><small>{Object.entries(preview.variables).map(([key, value]) => `${key}=${value}`).join(" · ")}</small><pre>{preview.preview}</pre></section>}
          <label><span>{t("permissionPreset")}</span>
            <select value={draft.permissionPreset} onChange={(event) => selectDraftPreset(event.target.value as PermissionPreset)}>
              <option value="readonly">{t("presetReadonly")}</option>
              <option value="balanced">{t("presetBalanced")}</option>
              <option value="full">{t("presetFull")}</option>
              <option value="custom">{t("presetCustom")}</option>
            </select>
          </label>
          <div className="tool-permissions">
            {tools.map((tool) => <label className="tool-row" key={tool}>
              <span>{t(tool)}</span>
              <select value={draft.permissions[tool] ?? "ask"} onChange={(event) => setDraftPermission(tool, event.target.value as ToolPermission)}>
                <option value="disabled">{t("disabled")}</option>
                <option value="ask">{t("ask")}</option>
                <option value="allow">{t("allow")}</option>
              </select>
            </label>)}
          </div>
          <div className="setup-actions"><button type="button" disabled={!draft.name.trim() || !draft.prompt.trim()} onClick={() => void saveTemplate()}>{editingId ? t("updateTemplate") : t("createTemplate")}</button></div>
        </fieldset>}
        <fieldset><legend>{t("iterationsAndContext")}</legend>
          <div className="two-columns">
            <label><span>{t("maxIterations")}</span><input type="number" min="1" max="500" value={settings.maxIterations} onChange={(event) => update("maxIterations", Number(event.target.value))} /></label>
            <label><span>{t("preserveTokens")}</span><input type="number" min="1000" max="500000" step="1000" value={settings.preserveRecentTokens} onChange={(event) => update("preserveRecentTokens", Number(event.target.value))} /></label>
          </div>
          <label className="check-row"><input type="checkbox" checked={settings.compactionEnabled} onChange={(event) => update("compactionEnabled", event.target.checked)} /><span>{t("autoCompaction")}</span></label>
          <label><span>{t("compactionStrategy")}</span><select value={settings.compactionStrategy} onChange={(event) => update("compactionStrategy", event.target.value as AgentSettings["compactionStrategy"])}><option value="agentic">{t("agenticSummary")}</option><option value="basic">{t("basicCompaction")}</option></select></label>
        </fieldset>
      </>}
      {tab === "mcp" && <><p className="settings-note">{t("mcpNote")}</p><div className="mcp-list">{settings.mcpServers.map((server, index) => <fieldset className="mcp-card" key={server.id}><legend>{t("mcpServerLabel")} {index + 1}</legend><div className="mcp-card-actions"><label className="check-row"><input type="checkbox" checked={server.enabled} onChange={(event) => updateMcp(server.id, { enabled: event.target.checked })} /><span>{t("enabled")}</span></label><button className="secondary" type="button" onClick={() => update("mcpServers", settings.mcpServers.filter((item) => item.id !== server.id))}>{t("remove")}</button></div><div className="two-columns"><label><span>{t("name")}</span><input value={server.name} placeholder="filesystem" onChange={(event) => updateMcp(server.id, { name: event.target.value })} /></label><label><span>{t("transport")}</span><select value={server.transport} onChange={(event) => updateMcp(server.id, { transport: event.target.value as McpTransport })}><option value="stdio">stdio</option><option value="sse">SSE</option><option value="streamableHttp">Streamable HTTP</option></select></label></div>{server.transport === "stdio" ? <><label><span>{t("command")}</span><input value={server.command} placeholder="npx" onChange={(event) => updateMcp(server.id, { command: event.target.value })} /></label><label><span>{t("argsSpaceSeparated")}</span><input value={server.args.join(" ")} placeholder="-y @modelcontextprotocol/server-filesystem" onChange={(event) => updateMcp(server.id, { args: event.target.value.trim() ? event.target.value.trim().split(/\s+/) : [] })} /></label></> : <label><span>URL</span><input type="url" value={server.url} placeholder="https://example.com/mcp" onChange={(event) => updateMcp(server.id, { url: event.target.value })} /></label>}</fieldset>)}</div><button className="secondary" type="button" onClick={addMcp}>+ {t("addMcpServer")}</button></>}
      {tab === "automation" && <fieldset><legend>{t("shellIdleTitle")}</legend><p className="settings-note">{t("shellIdleNote")}</p><div className="two-columns"><label><span>{t("idleTimeoutSeconds")}</span><input type="number" min="5" max="3600" value={settings.shellIdleTimeoutSeconds} onChange={(event) => update("shellIdleTimeoutSeconds", Number(event.target.value))} /></label><label><span>{t("defaultResponse")}</span><select value={settings.shellIdleAction} onChange={(event) => update("shellIdleAction", event.target.value as AgentSettings["shellIdleAction"])}><option value="ask">{t("idleAsk")}</option><option value="enter">{t("idleEnterSafe")}</option><option value="wait">{t("idleWaitOnce")}</option><option value="close">{t("idleCancel")}</option><option value="auto">{t("idleAuto")}</option></select></label></div>
        {settings.shellIdleAction === "auto" && <div className="settings-note">
          <label className="check-row"><input type="checkbox" checked={settings.shellIdleCarryContext} onChange={(event) => update("shellIdleCarryContext", event.target.checked)} /><span>{t("shellIdleCarryContext")}</span></label>
          <small>{t("shellIdleCarryContextHelp")}</small>
        </div>}
      </fieldset>}
    </>}
    <p className={/required|failed|Invalid/.test(status) ? "error" : ""} aria-live="polite">{status}</p><div className="setup-actions"><button type="button" disabled={saving} onClick={save}>{saving ? t("savingShort") : t("saveSettings")}</button></div>
  </div></dialog>
}
