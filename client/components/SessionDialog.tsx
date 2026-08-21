import { useEffect, useRef, useState } from "react"
import { api } from "../lib/api.js"
import type { Locale, TFunction } from "../lib/i18n.js"
import type { SessionDetails } from "../lib/types.js"
import { localDateTime } from "../lib/messageLog.js"
import { formatTokens, providerDisplayName } from "../lib/format.js"
import { ARCHIVED_TAG, userTags } from "../lib/tags.js"

function permissionSummary(t: TFunction, permissions: Record<string, string> | undefined): string {
  if (!permissions) return "—"
  return Object.entries(permissions).map(([tool, state]) => `${t(tool)}: ${t(state)}`).join(" · ")
}

type Props = { t: TFunction; locale: Locale; sessionId: string | null; allTags: string[]; onClose: () => void; onRenamed: () => void; onDeleted: (id: string) => void; onSessionUpdated: () => void }

export function SessionDialog({ t, locale, sessionId, allTags, onClose, onRenamed, onDeleted, onSessionUpdated }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [details, setDetails] = useState<SessionDetails | null>(null)
  const [title, setTitle] = useState("")
  const [error, setError] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [tagsBusy, setTagsBusy] = useState(false)

  const load = () => sessionId && api<SessionDetails>(`/api/sessions/${encodeURIComponent(sessionId)}`).then(setDetails)

  useEffect(() => {
    if (!sessionId) { dialog.current?.close(); return }
    setError("")
    setTagInput("")
    api<SessionDetails>(`/api/sessions/${encodeURIComponent(sessionId)}`)
      .then((result) => { setDetails(result); setTitle((result.session.metadata?.title as string | undefined) ?? result.session.prompt ?? sessionId); dialog.current?.showModal() })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
  }, [sessionId])

  if (!sessionId) return <dialog ref={dialog} id="session-dialog" onClose={onClose} />
  const item = details?.session
  const snapshot = item?.metadata?.environmentSnapshot as { model?: { profileName?: string }; workspace?: { name?: string; display?: string } } | undefined
  const agent = (item?.metadata?.environmentSnapshot as { agent?: Record<string, unknown> } | undefined)?.agent
  const rawTags = Array.isArray(item?.metadata?.tags) ? (item!.metadata!.tags as unknown[]).filter((tag): tag is string => typeof tag === "string") : []
  const tags = userTags(rawTags)
  const archived = rawTags.includes(ARCHIVED_TAG)

  const rename = async () => {
    try {
      await api(`/api/sessions/${encodeURIComponent(sessionId)}`, { method: "PATCH", body: JSON.stringify({ title }) })
      dialog.current?.close()
      onRenamed()
    } catch (err) { setError(err instanceof Error ? err.message : String(err)) }
  }
  const remove = async () => {
    if (!confirm("Delete this session? This cannot be undone.")) return
    try {
      await api(`/api/sessions/${encodeURIComponent(sessionId)}`, { method: "DELETE" })
      dialog.current?.close()
      onDeleted(sessionId)
    } catch (err) { setError(err instanceof Error ? err.message : String(err)) }
  }

  const saveTags = async (next: string[]) => {
    setTagsBusy(true)
    try {
      await api(`/api/sessions/${encodeURIComponent(sessionId)}/tags`, { method: "PATCH", body: JSON.stringify({ tags: next }) })
      await load()
      // The Sidebar's own session list (tag chips, filter options) is a
      // separate fetch in App.tsx — without this it stays stale until
      // something else happens to reload it.
      onSessionUpdated()
    } catch (err) { setError(err instanceof Error ? err.message : String(err)) }
    finally { setTagsBusy(false) }
  }
  const addTag = () => {
    const value = tagInput.trim()
    if (!value || tags.includes(value)) { setTagInput(""); return }
    setTagInput("")
    void saveTags([...tags, value])
  }
  const removeTag = (tag: string) => void saveTags(tags.filter((item) => item !== tag))
  const toggleArchived = async () => {
    setTagsBusy(true)
    try {
      await api(`/api/sessions/${encodeURIComponent(sessionId)}/archive`, { method: "POST", body: JSON.stringify({ archived: !archived }) })
      await load()
      // Same reason as saveTags(): the Sidebar list (which decides whether
      // this session shows up at all, under the current Active/Archived
      // view) needs its own refresh — this dialog only ever refreshes its
      // own `details` state above.
      onSessionUpdated()
    } catch (err) { setError(err instanceof Error ? err.message : String(err)) }
    finally { setTagsBusy(false) }
  }

  return (
    <dialog ref={dialog} id="session-dialog" onClose={onClose}>
      <form className="settings-form" onSubmit={(event) => { event.preventDefault(); void rename() }}>
        <div className="setup-heading">
          <div><h1>{t("sessionDetails")}</h1><p>{sessionId}</p></div>
          <button className="secondary icon-button" type="button" aria-label={t("close")} onClick={() => dialog.current?.close()}>×</button>
        </div>
        <label><span>{t("title")}</span><input type="text" maxLength={120} required value={title} onChange={(event) => setTitle(event.target.value)} /></label>
        {item && details && (
          <div className="tag-editor">
            <span>{t("tags")}</span>
            <div className="tag-chip-list">
              {tags.map((tag) => (
                <span className="tag-chip" key={tag}>
                  #{tag}
                  <button type="button" className="tag-chip-remove" aria-label={t("removeTag")} disabled={tagsBusy} onClick={() => removeTag(tag)}>×</button>
                </span>
              ))}
              {tags.length === 0 && <span className="tag-empty">{t("noTags")}</span>}
            </div>
            <div className="input-with-button">
              <input type="text" list="session-tag-suggestions" maxLength={40} placeholder={t("addTagPlaceholder")} value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addTag() } }} />
              <datalist id="session-tag-suggestions">{allTags.map((tag) => <option key={tag} value={tag} />)}</datalist>
              <button type="button" className="secondary" disabled={tagsBusy || !tagInput.trim()} onClick={addTag}>{t("addTag")}</button>
            </div>
            <label className="check-row"><input type="checkbox" checked={archived} disabled={tagsBusy} onChange={() => void toggleArchived()} /><span>{t("archived")}</span></label>
          </div>
        )}
        {item && details && (
          <dl className="metadata-list">
            <dt>{t("status")}</dt><dd>{item.status ?? "—"}</dd>
            <dt>{t("provider")}</dt><dd>{providerDisplayName((item.metadata?.appProvider as string | undefined) ?? item.provider)}</dd>
            <dt>{t("model")}</dt><dd>{(item.metadata?.appModelId as string | undefined) ?? item.model ?? "—"}</dd>
            <dt>{t("modelProfile")}</dt><dd>{snapshot?.model?.profileName ?? (item.metadata?.modelProfileId as string | undefined) ?? "—"}</dd>
            <dt>{t("workspaceProfile")}</dt><dd>{snapshot?.workspace?.name ?? (item.metadata?.workspaceProfileId as string | undefined) ?? "—"}</dd>
            <dt>{t("workingDir")}</dt><dd>{snapshot?.workspace?.display ?? (item.metadata?.workspace as string | undefined) ?? (item.cwd as string | undefined) ?? (item.workspaceRoot as string | undefined) ?? "—"}</dd>
            <dt>{t("permissionPreset")}</dt><dd>{agent?.permissionPreset ? t(String(agent.permissionPreset)) : t("settingsNotRecorded")}</dd>
            <dt>{t("effectivePermissions")}</dt><dd>{permissionSummary(t, (agent?.effectivePermissions ?? agent?.permissions) as Record<string, string> | undefined)}</dd>
            <dt>{t("maxIterations")}</dt><dd>{agent?.maxIterations != null ? String(agent.maxIterations) : "—"}</dd>
            <dt>{t("autoCompaction")}</dt><dd>{agent ? `${agent.compactionEnabled ? t("allow") : t("disabled")} · ${agent.compactionStrategy}` : "—"}</dd>
            <dt>{t("systemPrompt")}</dt><dd>{(agent?.systemPrompt as string | undefined) ?? "—"}</dd>
            <dt>{t("started")}</dt><dd>{item.startedAt ? new Date(item.startedAt as string).toLocaleString() : "—"}</dd>
            <dt>{t("updated")}</dt><dd>{item.updatedAt ? new Date(item.updatedAt as string).toLocaleString() : "—"}</dd>
            <dt>{t("currentContext")}</dt><dd>{details.context?.inputTokens == null ? "—" : `${formatTokens(details.context.inputTokens, locale)} / ${formatTokens(details.context.maxInputTokens, locale)} (${details.context.utilizationPercent}%)`}</dd>
            <dt>{t("compactionHistory")}</dt><dd>{details.lastCompaction ? `${localDateTime(details.lastCompaction.at, locale)} · ${details.compactions.length}` : t("noCompactions")}</dd>
            <dt>{t("inputTokens")}</dt><dd>{formatTokens(Number((item.metadata?.aggregateUsage as { inputTokens?: number } | undefined)?.inputTokens ?? 0), locale)}</dd>
            <dt>{t("outputTokens")}</dt><dd>{formatTokens(Number((item.metadata?.aggregateUsage as { outputTokens?: number } | undefined)?.outputTokens ?? 0), locale)}</dd>
            <dt>{t("messagesFile")}</dt><dd>{details.messagesPath ?? "—"}</dd>
          </dl>
        )}
        {error && <p className="error" role="status">{error}</p>}
        <div className="setup-actions split-actions">
          <button type="button" className="danger" onClick={() => void remove()}>{t("deleteSession")}</button>
          <button type="submit">{t("rename")}</button>
        </div>
      </form>
    </dialog>
  )
}
