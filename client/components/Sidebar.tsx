import type { TFunction } from "../lib/i18n.js"
import type { SessionSummary } from "../lib/types.js"
import { providerDisplayName, shortModelName } from "../lib/format.js"

type Props = {
  t: TFunction
  sessions: SessionSummary[]
  activeSession: string | null
  onSelect: (id: string) => void
  onOpenDetails: (id: string) => void
  onNewSession: () => void
  onClearSessions: () => void
}

export function Sidebar({ t, sessions, activeSession, onSelect, onOpenDetails, onNewSession, onClearSessions }: Props) {
  return (
    <aside>
      <div className="section-title">
        <span>{t("sessions")}</span>
        <div>
          <button id="clear-sessions" type="button" onClick={onClearSessions}>{t("clear")}</button>
          <button id="new-session" type="button" title="New session" onClick={onNewSession}>＋</button>
        </div>
      </div>
      <div id="sessions">
        {sessions.map((item) => {
          const provider = (item.metadata?.appProvider as string | undefined) ?? item.provider
          const model = (item.metadata?.appModelId as string | undefined) ?? item.model
          const snapshot = item.metadata?.environmentSnapshot as { workspace?: { name?: string } } | undefined
          const workspaceName = snapshot?.workspace?.name ?? (item.metadata?.workspace as string | undefined)
          const title = (item.metadata?.title as string | undefined) ?? item.prompt ?? item.sessionId
          return (
            <div className={`session-row ${item.sessionId === activeSession ? "active" : ""}`} key={item.sessionId}>
              <button type="button" className="session" title={`${providerDisplayName(provider)} · ${model ?? "—"}${workspaceName ? ` · ${workspaceName}` : ""}`} onClick={() => onSelect(item.sessionId)}>
                <span className="session-title">{title}</span>
                <span className="session-agent">{providerDisplayName(provider)} · {shortModelName(model)}{workspaceName ? ` · ${workspaceName}` : ""}</span>
              </button>
              <button type="button" className="session-more" title={t("sessionDetails")} onClick={() => onOpenDetails(item.sessionId)}>⋯</button>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
