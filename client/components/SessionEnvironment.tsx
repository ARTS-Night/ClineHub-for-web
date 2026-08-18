import { Fragment, useState } from "react"
import type { TFunction } from "../lib/i18n.js"
import type { SessionSummary } from "../lib/types.js"
import { useDismissiblePopover } from "../hooks/useDismissiblePopover.js"

type Snapshot = {
  model?: { profileName?: string }
  workspace?: { name?: string; display?: string; path?: string }
  agent?: {
    templateId?: string
    templateName?: string
    permissionPreset?: string
    maxIterations?: number
    compactionEnabled?: boolean
    compactionStrategy?: string
    requestTimeoutMs?: number
    imagesEnabled?: boolean
    effectivePermissions?: Record<string, string>
    permissions?: Record<string, string>
    systemPrompt?: string
  }
}

export function SessionEnvironment({ t, session }: { t: TFunction; session: SessionSummary | null }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const { panelRef, toggleRef } = useDismissiblePopover(open, close)
  const snapshot = session?.metadata?.environmentSnapshot as Snapshot | undefined
  const modelName = snapshot?.model?.profileName ?? (session?.metadata?.appModelId as string | undefined) ?? session?.model ?? "—"
  const workspaceName = snapshot?.workspace?.name ?? (session?.metadata?.workspace as string | undefined) ?? (session?.cwd as string | undefined) ?? "—"
  const workspaceLocation = snapshot?.workspace?.display ?? snapshot?.workspace?.path ?? (session?.metadata?.workspace as string | undefined) ?? (session?.cwd as string | undefined)
  const available = Boolean(session)

  return (
    <div className="session-environment-wrap">
      <button ref={toggleRef} id="session-environment-toggle" className="session-environment-toggle" type="button" aria-expanded={open && available} aria-controls="session-environment" disabled={!available}
        onClick={(event) => { event.stopPropagation(); setOpen((current) => !current) }}>
        <span aria-hidden="true">◆</span><span>{t("sessionInfo")}</span>
      </button>
      {open && available && (
        <section ref={panelRef} id="session-environment" className="session-environment" onClick={(event) => event.stopPropagation()}>
          <div className="session-environment-summary">
            <span className="session-environment-icon">◆</span>
            <strong>{t("sessionUsedEnvironment", { model: modelName, workspace: workspaceName })}</strong>
            {workspaceLocation && workspaceLocation !== workspaceName && <code>{workspaceLocation}</code>}
          </div>
          <details className="session-agent-snapshot">
            <summary>{snapshot ? t("recordedAgentSettings") : t("settingsNotRecorded")}</summary>
            {snapshot?.agent && (
              <>
                <div className="session-settings-grid">
                  {([
                    [t("template"), snapshot.agent.templateName ?? snapshot.agent.templateId],
                    [t("modelProfile"), snapshot.model?.profileName],
                    [t("workspaceProfile"), snapshot.workspace?.name],
                    [t("permissionPreset"), snapshot.agent.permissionPreset ? t(snapshot.agent.permissionPreset) : undefined],
                    [t("maxIterations"), snapshot.agent.maxIterations],
                    [t("autoCompaction"), snapshot.agent.compactionEnabled ? `${t("allow")} · ${snapshot.agent.compactionStrategy}` : t("disabled")],
                    [t("requestTimeout"), snapshot.agent.requestTimeoutMs ? `${snapshot.agent.requestTimeoutMs / 1000}s` : "Default"],
                    [t("enableImages"), snapshot.agent.imagesEnabled ? t("allow") : t("disabled")],
                  ] as Array<[string, unknown]>).map(([label, value]) => (
                    <Fragment key={label}>
                      <span>{label}</span>
                      <strong>{value === undefined || value === null || value === "" ? "—" : String(value)}</strong>
                    </Fragment>
                  ))}
                </div>
                <strong className="session-permissions-title">{t("effectivePermissions")}</strong>
                <div className="session-permission-badges">
                  {Object.entries(snapshot.agent.effectivePermissions ?? snapshot.agent.permissions ?? {}).map(([tool, state]) => (
                    <span className={`session-permission state-${state}`} key={tool}>{t(tool)} · {t(state)}</span>
                  ))}
                </div>
                <details className="session-system-prompt">
                  <summary>{t("systemPrompt")}</summary>
                  <pre>{snapshot.agent.systemPrompt ?? "—"}</pre>
                </details>
              </>
            )}
          </details>
        </section>
      )}
    </div>
  )
}
