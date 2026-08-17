import type { TFunction, Locale } from "../i18n.js"
import type { CompactionRecord, ContextUsage, SessionSummary } from "../types.js"
import { formatTokens } from "../format.js"
import { localDateTime } from "../messageLog.js"
import { SessionEnvironment } from "./SessionEnvironment.js"

type Props = {
  t: TFunction
  locale: Locale
  context: ContextUsage | null
  compactions: CompactionRecord[]
  showToolDetails: boolean
  onToggleShowToolDetails: (value: boolean) => void
  session: SessionSummary | null
}

export function ContextPanel({ t, locale, context, compactions, showToolDetails, onToggleShowToolDetails, session }: Props) {
  const percent = context?.utilizationPercent ?? 0
  const trigger = context?.compactionTriggerPercent ?? 90
  const summary = !context
    ? "—"
    : context.inputTokens === null
      ? `— / ${formatTokens(context.maxInputTokens, locale)}`
      : `${formatTokens(context.inputTokens, locale)} / ${formatTokens(context.maxInputTokens, locale)} (${context.utilizationPercent}%)`
  const source = context?.source === "override" ? t("sourceOverride") : context?.source === "provider" ? t("sourceProvider") : t("sourceDefault")
  const detail = !context
    ? t("contextWaiting")
    : context.inputTokens === null
      ? `${t("contextUnknown", { max: formatTokens(context.maxInputTokens, locale) })} · ${source}`
      : `${t("contextDetail", { window: formatTokens(context.contextWindow, locale), max: formatTokens(context.maxInputTokens, locale), trigger: context.compactionTriggerPercent, tokens: formatTokens(context.compactionTriggerTokens, locale), strategy: context.compactionStrategy })} · ${source}`
  const last = compactions.at(-1)

  return (
    <div id="context-panel" className="context-panel">
      <div className="context-title-row">
        <span>{t("context")}</span>
        <div className="context-title-actions">
          <SessionEnvironment key={session?.sessionId ?? "none"} t={t} session={session} />
          <strong id="context-summary">{summary}</strong>
        </div>
      </div>
      <div className="context-meter">
        <span id="context-fill" className={context ? (percent >= trigger ? "critical" : percent >= 75 ? "warning" : "") : ""} style={{ width: `${context ? Math.min(100, Math.max(0, percent)) : 0}%` }} />
        <span id="context-trigger" style={{ left: `${context ? trigger : 90}%` }} />
      </div>
      <div className="context-footer">
        <small id="context-detail">{detail}</small>
        <label><input id="show-tool-details" type="checkbox" checked={showToolDetails} onChange={(event) => onToggleShowToolDetails(event.target.checked)} /><span>{t("showToolDetails")}</span></label>
      </div>
      <div id="compaction-summary" className="compaction-summary" data-state={last ? "recorded" : "none"} title={last?.message ?? ""}>
        <span className="compaction-icon">↻</span>
        <span>{last ? t("lastCompaction", { time: localDateTime(last.at, locale), count: compactions.length }) : t("noCompactions")}</span>
      </div>
    </div>
  )
}
