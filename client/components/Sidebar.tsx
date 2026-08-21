import { useMemo, useState } from "react"
import type { TFunction } from "../lib/i18n.js"
import type { SessionSummary } from "../lib/types.js"
import { providerDisplayName, shortModelName } from "../lib/format.js"
import { ARCHIVED_TAG, AUTO_TAG, isReservedTag, userTags } from "../lib/tags.js"

type Props = {
  t: TFunction
  sessions: SessionSummary[]
  activeSession: string | null
  onSelect: (id: string) => void
  onOpenDetails: (id: string) => void
  onNewSession: () => void
  onClearSessions: () => void
  showArchived: boolean
  onToggleArchived: (value: boolean) => void
}

function sessionTags(item: SessionSummary): string[] {
  const tags = (item.metadata as Record<string, unknown> | undefined)?.tags
  return Array.isArray(tags) ? tags.filter((tag): tag is string => typeof tag === "string") : []
}

export function Sidebar({ t, sessions, activeSession, onSelect, onOpenDetails, onNewSession, onClearSessions, showArchived, onToggleArchived }: Props) {
  const [tagFilter, setTagFilter] = useState<string | null>(null)

  const allTags = useMemo(() => {
    const set = new Set<string>()
    for (const item of sessions) for (const tag of userTags(sessionTags(item))) set.add(tag)
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [sessions])

  const visibleSessions = sessions.filter((item) => {
    const tags = sessionTags(item)
    if (!showArchived && tags.includes(ARCHIVED_TAG)) return false
    if (showArchived && !tags.includes(ARCHIVED_TAG)) return false
    if (tagFilter && !tags.includes(tagFilter)) return false
    return true
  })

  return (
    <aside>
      <div className="section-title">
        <span>{showArchived ? t("archivedSessions") : t("sessions")}</span>
        <div>
          <button id="clear-sessions" type="button" onClick={onClearSessions}>{t("clear")}</button>
          <button id="new-session" type="button" title={t("newSession")} onClick={onNewSession}>＋</button>
        </div>
      </div>
      {allTags.length > 0 && (
        <div className="tag-filter-row">
          <select value={tagFilter ?? ""} onChange={(event) => setTagFilter(event.target.value || null)} aria-label={t("filterByTag")}>
            <option value="">{t("allTags")}</option>
            {allTags.map((tag) => <option key={tag} value={tag}>#{tag}</option>)}
          </select>
          <button type="button" className={`secondary${showArchived ? " active" : ""}`} onClick={() => onToggleArchived(!showArchived)}>
            {showArchived ? t("showActive") : t("showArchived")}
          </button>
        </div>
      )}
      {allTags.length === 0 && (
        <div className="tag-filter-row">
          <button type="button" className={`secondary${showArchived ? " active" : ""}`} onClick={() => onToggleArchived(!showArchived)}>
            {showArchived ? t("showActive") : t("showArchived")}
          </button>
        </div>
      )}
      <div id="sessions">
        {visibleSessions.map((item) => {
          const provider = (item.metadata?.appProvider as string | undefined) ?? item.provider
          const model = (item.metadata?.appModelId as string | undefined) ?? item.model
          const snapshot = item.metadata?.environmentSnapshot as { workspace?: { name?: string } } | undefined
          const workspaceName = snapshot?.workspace?.name ?? (item.metadata?.workspace as string | undefined)
          const title = (item.metadata?.title as string | undefined) ?? item.prompt ?? item.sessionId
          const tags = sessionTags(item)
          const isAuto = tags.includes(AUTO_TAG)
          const displayTags = userTags(tags)
          return (
            <div className={`session-row ${item.sessionId === activeSession ? "active" : ""}`} key={item.sessionId}>
              <button type="button" className="session" title={`${providerDisplayName(provider)} · ${model ?? "—"}${workspaceName ? ` · ${workspaceName}` : ""}`} onClick={() => onSelect(item.sessionId)}>
                <span className="session-title">{title}</span>
                <span className="session-agent">{providerDisplayName(provider)} · {shortModelName(model)}{workspaceName ? ` · ${workspaceName}` : ""}</span>
                {(isAuto || displayTags.length > 0) && (
                  <span className="session-tags">
                    {isAuto && <span className="tag-chip tag-chip-auto">{t("autoTag")}</span>}
                    {displayTags.map((tag) => !isReservedTag(tag) && <span className="tag-chip" key={tag}>#{tag}</span>)}
                  </span>
                )}
              </button>
              <button type="button" className="session-more" title={t("sessionDetails")} onClick={() => onOpenDetails(item.sessionId)}>⋯</button>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
