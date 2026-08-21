import { useEffect, useRef, useState } from "react"
import { api } from "../lib/api.js"
import type { TFunction } from "../lib/i18n.js"
import type { AgentSettings, AutoChatDefinition, AutoChatSchedule, ProfilesData } from "../lib/types.js"

type ScheduleType = AutoChatSchedule["type"]

type Form = {
  editorId: string
  name: string
  workspaceProfileId: string
  modelProfileId: string
  templateId: string
  mcpServerIds: string[]
  runPrompt: string
  tags: string[]
  scheduleType: ScheduleType
  onceRunAt: string
  dailyTime: string
  weeklyDays: number[]
  weeklyTime: string
  enabled: boolean
}

const emptyForm: Form = {
  editorId: "", name: "", workspaceProfileId: "", modelProfileId: "", templateId: "", mcpServerIds: [],
  runPrompt: "", tags: [], scheduleType: "manual", onceRunAt: "", dailyTime: "07:00", weeklyDays: [], weeklyTime: "07:00", enabled: false,
}

function formFromDefinition(item: AutoChatDefinition | undefined): Form {
  if (!item) return emptyForm
  const schedule = item.schedule
  return {
    editorId: item.id, name: item.name, workspaceProfileId: item.workspaceProfileId, modelProfileId: item.modelProfileId, templateId: item.templateId,
    mcpServerIds: [...item.mcpServerIds], runPrompt: item.runPrompt, tags: [...item.tags], enabled: item.enabled,
    scheduleType: schedule.type,
    onceRunAt: schedule.type === "once" ? toDatetimeLocal(schedule.runAt) : "",
    dailyTime: schedule.type === "daily" ? schedule.time : "07:00",
    weeklyDays: schedule.type === "weekly" ? schedule.days : [],
    weeklyTime: schedule.type === "weekly" ? schedule.time : "07:00",
  }
}

function toDatetimeLocal(iso: string): string {
  const date = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const weekdayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]

type Props = { t: TFunction; open: boolean; onClose: () => void; profilesData: ProfilesData; agentSettings: AgentSettings | null; onRanSession: () => void }

export function AutoChatsDialog({ t, open, onClose, profilesData, agentSettings, onRanSession }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [items, setItems] = useState<AutoChatDefinition[]>([])
  const [timezone, setTimezone] = useState("")
  const [form, setForm] = useState<Form>(emptyForm)
  const [editing, setEditing] = useState(false)
  const [status, setStatus] = useState("")
  const [statusError, setStatusError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [runningId, setRunningId] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState("")

  const refresh = async () => {
    const result = await api<{ timezone: string; autoChats: AutoChatDefinition[] }>("/api/auto-chats")
    setItems(result.autoChats)
    setTimezone(result.timezone)
  }

  useEffect(() => {
    if (!open) { dialog.current?.close(); return }
    setEditing(false)
    setForm(emptyForm)
    setStatus("")
    setStatusError(false)
    refresh().catch((error) => { setStatus(error instanceof Error ? error.message : String(error)); setStatusError(true) })
    if (!dialog.current?.open) dialog.current?.showModal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const update = <K extends keyof Form>(key: K, value: Form[K]) => setForm((current) => ({ ...current, [key]: value }))

  const startCreate = () => { setForm(emptyForm); setEditing(true); setStatus(""); setStatusError(false); setTagInput("") }
  const startEdit = (item: AutoChatDefinition) => { setForm(formFromDefinition(item)); setEditing(true); setStatus(""); setStatusError(false); setTagInput("") }
  const allExistingTags = [...new Set(items.flatMap((item) => item.tags))].sort((a, b) => a.localeCompare(b))
  const addTag = () => {
    const value = tagInput.trim()
    setTagInput("")
    if (!value || form.tags.includes(value)) return
    update("tags", [...form.tags, value])
  }
  const removeTag = (tag: string) => update("tags", form.tags.filter((item) => item !== tag))

  const schedulePayload = (): AutoChatSchedule => {
    if (form.scheduleType === "manual") return { type: "manual" }
    if (form.scheduleType === "once") return { type: "once", runAt: new Date(form.onceRunAt).toISOString() }
    if (form.scheduleType === "daily") return { type: "daily", time: form.dailyTime }
    return { type: "weekly", days: form.weeklyDays, time: form.weeklyTime }
  }

  const submit = async () => {
    setSaving(true)
    setStatusError(false)
    setStatus("")
    try {
      const body = {
        name: form.name,
        workspaceProfileId: form.workspaceProfileId,
        modelProfileId: form.modelProfileId,
        templateId: form.templateId,
        mcpServerIds: form.mcpServerIds,
        runPrompt: form.runPrompt,
        tags: form.tags,
        schedule: schedulePayload(),
        enabled: form.enabled,
      }
      if (form.editorId) await api(`/api/auto-chats/${encodeURIComponent(form.editorId)}`, { method: "PATCH", body: JSON.stringify(body) })
      else await api("/api/auto-chats", { method: "POST", body: JSON.stringify(body) })
      await refresh()
      setEditing(false)
    } catch (error) { setStatus(error instanceof Error ? error.message : String(error)); setStatusError(true) }
    finally { setSaving(false) }
  }

  const toggleEnabled = async (item: AutoChatDefinition) => {
    try {
      await api(`/api/auto-chats/${encodeURIComponent(item.id)}`, { method: "PATCH", body: JSON.stringify({ enabled: !item.enabled }) })
      await refresh()
    } catch (error) { setStatus(error instanceof Error ? error.message : String(error)); setStatusError(true) }
  }

  const remove = async (item: AutoChatDefinition) => {
    if (!confirm(t("deleteAutoChatConfirm", { name: item.name }))) return
    try { await api(`/api/auto-chats/${encodeURIComponent(item.id)}`, { method: "DELETE" }); await refresh() }
    catch (error) { setStatus(error instanceof Error ? error.message : String(error)); setStatusError(true) }
  }

  const runNow = async (item: AutoChatDefinition) => {
    setRunningId(item.id)
    try {
      const result = await api<{ result: string; message?: string }>(`/api/auto-chats/${encodeURIComponent(item.id)}/run`, { method: "POST", body: "{}" })
      await refresh()
      onRanSession()
      if (result.result !== "success") { setStatus(result.message ?? result.result); setStatusError(true) }
    } catch (error) { setStatus(error instanceof Error ? error.message : String(error)); setStatusError(true) }
    finally { setRunningId(null) }
  }

  const toggleWeeklyDay = (day: number) => update("weeklyDays", form.weeklyDays.includes(day) ? form.weeklyDays.filter((d) => d !== day) : [...form.weeklyDays, day])
  const toggleMcpServer = (id: string) => update("mcpServerIds", form.mcpServerIds.includes(id) ? form.mcpServerIds.filter((item) => item !== id) : [...form.mcpServerIds, id])

  const runStatus = (item: AutoChatDefinition): { variant: "success" | "failed" | "skipped" | "idle"; label: string; detail: string } => {
    if (!item.lastRunAt) return { variant: "idle", label: t("autoChatNeverRun"), detail: "" }
    const when = new Date(item.lastRunAt).toLocaleString()
    if (item.lastRunResult === "success") return { variant: "success", label: t("autoChatSuccess"), detail: when }
    if (item.lastRunResult === "skipped") return { variant: "skipped", label: t("autoChatSkipped"), detail: `${item.lastRunMessage ?? ""} · ${when}` }
    return { variant: "failed", label: t("autoChatFailed"), detail: `${item.lastRunMessage ?? ""} · ${when}` }
  }

  const scheduleLabel = (schedule: AutoChatSchedule): string => {
    if (schedule.type === "manual") return t("scheduleManual")
    if (schedule.type === "once") return `${t("scheduleOnce")}: ${new Date(schedule.runAt).toLocaleString()}`
    if (schedule.type === "daily") return `${t("scheduleDaily")} ${schedule.time}`
    return `${t("scheduleWeekly")} ${schedule.days.map((day) => t(`weekday_${weekdayKeys[day]}`)).join("/")} ${schedule.time}`
  }

  return (
    <dialog ref={dialog} id="auto-chats-dialog" className="wide-dialog" onClose={onClose}>
      <div className="settings-form">
        <div className="setup-heading">
          <div><h1>{t("autoChats")}</h1><p>{t("autoChatsDescription")}</p></div>
          <button className="secondary icon-button" type="button" aria-label={t("close")} onClick={() => dialog.current?.close()}>×</button>
        </div>

        {!editing && (
          <>
            <div className="profile-list auto-chat-list">
              {items.length === 0 && <p className="empty-hint">{t("noAutoChats")}</p>}
              {items.map((item) => {
                const status = runStatus(item)
                return (
                  <div className={`profile-list-row auto-chat-row${item.enabled ? "" : " is-disabled"}`} key={item.id}>
                    <span className="profile-description">
                      <span className="auto-chat-title-row">
                        <strong>{item.name}</strong>
                        <span className={`enabled-pill${item.enabled ? " on" : ""}`}>{item.enabled ? t("enabled") : t("disabled")}</span>
                      </span>
                      <small>{scheduleLabel(item.schedule)}</small>
                      <span className="run-status-row">
                        <span className={`status-badge status-${status.variant}`}>{status.label}</span>
                        {status.detail && <small>{status.detail}</small>}
                      </span>
                      {item.tags.length > 0 && (
                        <span className="tag-chip-list">
                          {item.tags.map((tag) => <span className="tag-chip" key={tag}>#{tag}</span>)}
                        </span>
                      )}
                    </span>
                    <div className="profile-actions">
                      <button type="button" disabled={runningId === item.id} onClick={() => void runNow(item)}>{runningId === item.id ? t("savingShort") : t("runNow")}</button>
                      <button type="button" className="secondary" onClick={() => startEdit(item)}>{t("edit")}</button>
                      <button type="button" className="secondary" onClick={() => void toggleEnabled(item)}>{item.enabled ? t("disable") : t("enable")}</button>
                      <button type="button" className="danger" onClick={() => void remove(item)}>{t("deleteProfile")}</button>
                    </div>
                  </div>
                )
              })}
            </div>
            <p className={statusError ? "error" : ""} aria-live="polite">{status}</p>
            <div className="profile-actions"><button type="button" onClick={startCreate}>{t("newAutoChat")}</button></div>
          </>
        )}

        {editing && (
          <form className="settings-form" onSubmit={(event) => { event.preventDefault(); void submit() }}>
            <label><span>{t("name")}</span><input type="text" maxLength={100} required value={form.name} onChange={(event) => update("name", event.target.value)} /></label>
            <div className="two-columns">
              <label><span>{t("workspaceProfile")}</span>
                <select required value={form.workspaceProfileId} onChange={(event) => update("workspaceProfileId", event.target.value)}>
                  <option value="">—</option>
                  {profilesData.workspaces.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
                </select>
              </label>
              <label><span>{t("modelProfile")}</span>
                <select required value={form.modelProfileId} onChange={(event) => update("modelProfileId", event.target.value)}>
                  <option value="">—</option>
                  {profilesData.models.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
                </select>
              </label>
            </div>
            <label><span>{t("template")}</span>
              <select required value={form.templateId} onChange={(event) => update("templateId", event.target.value)}>
                <option value="">—</option>
                {agentSettings?.templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
              </select>
            </label>
            {agentSettings && agentSettings.mcpServers.length > 0 && (
              <fieldset>
                <legend>{t("mcpServers")}</legend>
                {agentSettings.mcpServers.map((server) => (
                  <label className="check-row" key={server.id}>
                    <input type="checkbox" checked={form.mcpServerIds.includes(server.id)} onChange={() => toggleMcpServer(server.id)} />
                    <span>{server.name}</span>
                  </label>
                ))}
              </fieldset>
            )}
            <label><span>{t("runPrompt")}</span>
              <textarea rows={4} required value={form.runPrompt} onChange={(event) => update("runPrompt", event.target.value)} placeholder={t("runPromptHelp")} />
            </label>
            <div className="tag-editor">
              <span>{t("tags")}</span>
              <div className="tag-chip-list">
                {form.tags.map((tag) => (
                  <span className="tag-chip" key={tag}>
                    #{tag}
                    <button type="button" className="tag-chip-remove" aria-label={t("removeTag")} onClick={() => removeTag(tag)}>×</button>
                  </span>
                ))}
                {form.tags.length === 0 && <span className="tag-empty">{t("noTags")}</span>}
              </div>
              <div className="input-with-button">
                <input type="text" list="auto-chat-tag-suggestions" maxLength={40} placeholder={t("addTagPlaceholder")} value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addTag() } }} />
                <datalist id="auto-chat-tag-suggestions">{allExistingTags.map((tag) => <option key={tag} value={tag} />)}</datalist>
                <button type="button" className="secondary" disabled={!tagInput.trim()} onClick={addTag}>{t("addTag")}</button>
              </div>
            </div>

            <fieldset>
              <legend>{t("schedule")}</legend>
              <select value={form.scheduleType} onChange={(event) => update("scheduleType", event.target.value as ScheduleType)}>
                <option value="manual">{t("scheduleManual")}</option>
                <option value="once">{t("scheduleOnce")}</option>
                <option value="daily">{t("scheduleDaily")}</option>
                <option value="weekly">{t("scheduleWeekly")}</option>
              </select>
              {form.scheduleType === "once" && (
                <label><span>{t("runAt")}</span><input type="datetime-local" required value={form.onceRunAt} onChange={(event) => update("onceRunAt", event.target.value)} /></label>
              )}
              {form.scheduleType === "daily" && (
                <label><span>{t("time")}</span><input type="time" required value={form.dailyTime} onChange={(event) => update("dailyTime", event.target.value)} /></label>
              )}
              {form.scheduleType === "weekly" && (
                <>
                  <div className="weekday-row" role="group" aria-label={t("weekday_sun")}>
                    {weekdayKeys.map((key, day) => (
                      <button type="button" key={key} className={`weekday-toggle${form.weeklyDays.includes(day) ? " active" : ""}`} onClick={() => toggleWeeklyDay(day)}>
                        {t(`weekday_${key}`)}
                      </button>
                    ))}
                  </div>
                  <label><span>{t("time")}</span><input type="time" required value={form.weeklyTime} onChange={(event) => update("weeklyTime", event.target.value)} /></label>
                </>
              )}
              {form.scheduleType !== "manual" && <p className="hint">{t("serverTimezoneLabel", { timezone })}</p>}
            </fieldset>

            <label className="check-row"><input type="checkbox" checked={form.enabled} onChange={(event) => update("enabled", event.target.checked)} /><span>{t("enabled")}</span></label>

            {status && <p className={statusError ? "error" : ""} aria-live="polite">{status}</p>}
            <div className="setup-actions split-actions">
              <button type="button" className="secondary" onClick={() => setEditing(false)}>{t("cancel")}</button>
              <button type="submit" disabled={saving}>{saving ? t("savingShort") : t("saveSettings")}</button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  )
}
