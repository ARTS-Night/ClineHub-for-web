import { useEffect, useRef, useState } from "react"
import { api } from "../lib/api.js"
import type { TFunction } from "../lib/i18n.js"
import type { AgentSettings, ManagedTool, McpServerSettings, McpTestResult, McpTestTool, McpTransport, PermissionPreset, PreviewResult, PromptTemplate, ToolPermission } from "../lib/types.js"
import { DirectoryPicker } from "./DirectoryPicker.js"

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
  const [browsing, setBrowsing] = useState(false)
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
  const addMcp = () => update("mcpServers", [...(settings?.mcpServers ?? []), { id: `mcp-${Date.now()}`, name: "", enabled: true, transport: "stdio" as McpTransport, command: "npx", args: [], url: "", autoApprove: false, disabledTools: [] }])
  const toggleMcpTool = (server: McpServerSettings, toolName: string, toolEnabled: boolean) => {
    const disabledTools = toolEnabled ? server.disabledTools.filter((name) => name !== toolName) : [...server.disabledTools, toolName]
    updateMcp(server.id, { disabledTools })
  }
  // The arguments field is free text while focused — re-deriving it from the
  // parsed args array on every keystroke (the old behavior) snapped a typed
  // trailing comma straight back out, since an empty trailing segment gets
  // filtered from the array immediately, making "," effectively untypable.
  // Parsing into mcpServers only happens on blur.
  const [mcpArgsText, setMcpArgsText] = useState<Record<string, string>>({})
  const argsTextFor = (server: McpServerSettings) => mcpArgsText[server.id] ?? server.args.join(", ")
  const commitArgsText = (server: McpServerSettings) => {
    const text = mcpArgsText[server.id]
    if (text === undefined) return
    updateMcp(server.id, { args: text.split(",").map((arg) => arg.trim()).filter(Boolean) })
  }
  const [mcpTestStatus, setMcpTestStatus] = useState<Record<string, { busy: boolean; message: string; error: boolean; tools?: McpTestTool[] }>>({})
  // Holds the in-flight test's AbortController per server id — a ref, not
  // state, since aborting shouldn't itself trigger a re-render.
  const mcpAbortControllers = useRef<Record<string, AbortController>>({})
  const testMcp = async (server: McpServerSettings) => {
    const controller = new AbortController()
    mcpAbortControllers.current[server.id] = controller
    setMcpTestStatus((current) => ({ ...current, [server.id]: { busy: true, message: t("mcpTesting"), error: false } }))
    try {
      const result = await api<McpTestResult>("/api/agent-settings/mcp/test", { method: "POST", body: JSON.stringify({ transport: server.transport, command: server.command, args: server.args, url: server.url }), signal: controller.signal })
      const message = result.ok ? t("mcpTestSuccess", { count: result.toolCount }) : result.error
      setMcpTestStatus((current) => ({ ...current, [server.id]: { busy: false, message, error: !result.ok, tools: result.ok ? result.tools : undefined } }))
    } catch (error) {
      if (controller.signal.aborted) { setMcpTestStatus((current) => ({ ...current, [server.id]: { busy: false, message: t("mcpStopped"), error: false } })); return }
      setMcpTestStatus((current) => ({ ...current, [server.id]: { busy: false, message: error instanceof Error ? error.message : String(error), error: true } }))
    } finally {
      delete mcpAbortControllers.current[server.id]
    }
  }
  // Removing a server (especially a stdio one) while its test is still
  // running must not leave the spawned process orphaned in the background —
  // cancel the in-flight request first, which tears the process down server-side.
  const removeMcp = (id: string) => {
    mcpAbortControllers.current[id]?.abort()
    delete mcpAbortControllers.current[id]
    setMcpTestStatus((current) => { const { [id]: _removed, ...rest } = current; return rest })
    setMcpArgsText((current) => { const { [id]: _removed, ...rest } = current; return rest })
    update("mcpServers", (settings?.mcpServers ?? []).filter((item) => item.id !== id))
  }
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
    <div className="setup-heading"><div><h1>{t("agentSettings")}</h1><p>{t("agentSettingsIntro")}</p></div><button className="secondary icon-button" type="button" onClick={() => dialog.current?.close()} aria-label={t("close")}>×</button></div>
    <div className="agent-settings-tabs" role="tablist">{tabs.map(([id, key]) => <button key={id} className={tab === id ? "active" : ""} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>{key === "MCP" ? "MCP" : t(key)}</button>)}</div>
    {!settings ? <p>{t("loading")}</p> : <>
      {tab === "templates" && <>
        <label><span>{t("workingFolder")}</span>
          <span className="input-with-button">
            <input value={settings.workspacePath} spellCheck={false} onChange={(event) => update("workspacePath", event.target.value)} />
            <button type="button" className="secondary" onClick={() => setBrowsing(true)}>{t("browse")}</button>
          </span>
          <small>{settings.allowedRoot ? <>{t("allowedRoot")}: <code>{settings.allowedRoot}</code></> : t("allowedRootUnrestricted")}</small>
        </label>
        <DirectoryPicker t={t} open={browsing} initialPath={settings.workspacePath} onClose={() => setBrowsing(false)} onSelect={(path) => { update("workspacePath", path); setBrowsing(false) }} />
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
      {tab === "mcp" && (
        <>
          <p className="settings-note">{t("mcpNote")}</p>
          <label className="check-row"><input type="checkbox" checked={settings.mcpEnabled} onChange={(event) => update("mcpEnabled", event.target.checked)} /><span>{t("mcpEnabled")}</span></label>
          <div className="mcp-list">
            {settings.mcpServers.map((server, index) => {
              const testStatus = mcpTestStatus[server.id]
              return (
                <fieldset className="mcp-card" key={server.id}>
                  <legend>{t("mcpServerLabel")} {index + 1}</legend>
                  <div className="mcp-card-actions">
                    <div className="mcp-card-status">
                      <label className="check-row"><input type="checkbox" checked={server.enabled} onChange={(event) => updateMcp(server.id, { enabled: event.target.checked })} /><span>{t("enabled")}</span></label>
                      <span className="mcp-status" data-state={testStatus?.busy ? "running" : "idle"}>{testStatus?.busy ? t("mcpRunning") : t("mcpIdle")}</span>
                    </div>
                    <div className="mcp-card-buttons">
                      <button className="secondary" type="button" disabled={testStatus?.busy} onClick={() => void testMcp(server)}>{testStatus?.busy ? t("mcpTesting") : t("testMcp")}</button>
                      <button className="secondary" type="button" onClick={() => removeMcp(server.id)}>{t("remove")}</button>
                    </div>
                  </div>
                  {testStatus && !testStatus.busy && <p className={testStatus.error ? "error" : "mcp-test-success"} role="status">{testStatus.message}</p>}
                  {testStatus?.tools && testStatus.tools.length > 0 && (
                    <ul className="mcp-tool-list">
                      {testStatus.tools.map((tool) => (
                        <li key={tool.name}>
                          <label className="check-row">
                            <input type="checkbox" checked={!server.disabledTools.includes(tool.name)} onChange={(event) => toggleMcpTool(server, tool.name, event.target.checked)} />
                            <span><code>{tool.name}</code>{tool.description ? ` — ${tool.description}` : ""}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                  <label className="check-row"><input type="checkbox" checked={server.autoApprove} onChange={(event) => updateMcp(server.id, { autoApprove: event.target.checked })} /><span>{t("mcpAutoApprove")}</span></label>
                  <div className="two-columns">
                    <label><span>{t("name")}</span><input value={server.name} placeholder="filesystem" onChange={(event) => updateMcp(server.id, { name: event.target.value })} /></label>
                    <label><span>{t("transport")}</span>
                      <select value={server.transport} onChange={(event) => updateMcp(server.id, { transport: event.target.value as McpTransport })}>
                        <option value="stdio">stdio</option>
                        <option value="sse">SSE</option>
                        <option value="streamableHttp">Streamable HTTP</option>
                      </select>
                    </label>
                  </div>
                  {server.transport === "stdio"
                    ? <>
                        <label><span>{t("command")}</span><input value={server.command} placeholder="npx" onChange={(event) => updateMcp(server.id, { command: event.target.value })} /></label>
                        <label><span>{t("argsCommaSeparated")}</span><input value={argsTextFor(server)} placeholder="-y, @modelcontextprotocol/server-filesystem" onChange={(event) => setMcpArgsText((current) => ({ ...current, [server.id]: event.target.value }))} onBlur={() => commitArgsText(server)} /></label>
                      </>
                    : <label><span>URL</span><input type="url" value={server.url} placeholder="https://example.com/mcp" onChange={(event) => updateMcp(server.id, { url: event.target.value })} /></label>}
                </fieldset>
              )
            })}
          </div>
          <button className="secondary" type="button" onClick={addMcp}>+ {t("addMcpServer")}</button>
        </>
      )}
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
