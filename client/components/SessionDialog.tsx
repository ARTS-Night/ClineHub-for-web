import { useEffect, useRef, useState } from "react"
import { api } from "../lib/api.js"
import type { Locale, TFunction } from "../lib/i18n.js"
import type { SessionDetails } from "../lib/types.js"
import { localDateTime } from "../lib/messageLog.js"
import { formatTokens, providerDisplayName } from "../lib/format.js"

function permissionSummary(t: TFunction, permissions: Record<string, string> | undefined): string {
  if (!permissions) return "—"
  return Object.entries(permissions).map(([tool, state]) => `${t(tool)}: ${t(state)}`).join(" · ")
}

type Props = { t: TFunction; locale: Locale; sessionId: string | null; onClose: () => void; onRenamed: () => void; onDeleted: (id: string) => void }

export function SessionDialog({ t, locale, sessionId, onClose, onRenamed, onDeleted }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [details, setDetails] = useState<SessionDetails | null>(null)
  const [title, setTitle] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!sessionId) { dialog.current?.close(); return }
    setError("")
    api<SessionDetails>(`/api/sessions/${encodeURIComponent(sessionId)}`)
      .then((result) => { setDetails(result); setTitle((result.session.metadata?.title as string | undefined) ?? result.session.prompt ?? sessionId); dialog.current?.showModal() })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
  }, [sessionId])

  if (!sessionId) return <dialog ref={dialog} id="session-dialog" onClose={onClose} />
  const item = details?.session
  const snapshot = item?.metadata?.environmentSnapshot as { model?: { profileName?: string }; workspace?: { name?: string; display?: string } } | undefined
  const agent = (item?.metadata?.environmentSnapshot as { agent?: Record<string, unknown> } | undefined)?.agent

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

  return (
    <dialog ref={dialog} id="session-dialog" onClose={onClose}>
      <form className="settings-form" onSubmit={(event) => { event.preventDefault(); void rename() }}>
        <div className="setup-heading">
          <div><h1>{t("sessionDetails")}</h1><p>{sessionId}</p></div>
          <button className="secondary icon-button" type="button" aria-label="Close" onClick={() => dialog.current?.close()}>×</button>
        </div>
        <label><span>{t("title")}</span><input type="text" maxLength={120} required value={title} onChange={(event) => setTitle(event.target.value)} /></label>
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
