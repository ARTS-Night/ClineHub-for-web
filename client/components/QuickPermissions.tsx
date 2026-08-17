import { useState } from "react"
import type { TFunction } from "../i18n.js"
import type { ManagedTool, ToolPermission } from "../types.js"
import { useDismissiblePopover } from "../useDismissiblePopover.js"

// Kept as a local literal (not imported from src/agent-settings.ts) so the
// client bundle never pulls in the server's fs-backed settings store.
const managedTools: ManagedTool[] = ["read_files", "search_codebase", "fetch_web_content", "skills", "run_commands", "editor", "apply_patch"]
const permissionOrder = ["disabled", "ask", "allow"] as const
const toolIcons: Record<ManagedTool, string> = {
  read_files: "▤", search_codebase: "⌕", fetch_web_content: "◎", skills: "✦",
  run_commands: ">_", editor: "✎", apply_patch: "±",
}

export function QuickPermissions({ t, permissions, onCycle }: { t: TFunction; permissions: Record<ManagedTool, ToolPermission> | null; onCycle: (tool: ManagedTool) => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const { panelRef, toggleRef } = useDismissiblePopover(open, close)

  const counts = permissionOrder.map((state) => [state, Object.values(permissions ?? {}).filter((value) => value === state).length] as const)
  const toggleTitle = permissions
    ? `${t("quickPermissions")} · ${t("allow")} ${counts.find(([s]) => s === "allow")?.[1]} / ${t("ask")} ${counts.find(([s]) => s === "ask")?.[1]} / ${t("disabled")} ${counts.find(([s]) => s === "disabled")?.[1]}`
    : t("quickPermissions")

  return (
    <div className="quick-permissions-wrap">
      <button ref={toggleRef} id="quick-permissions-toggle" className="quick-permissions-toggle" type="button" aria-expanded={open} aria-controls="quick-permissions-panel" disabled={!permissions} title={toggleTitle}
        onClick={(event) => { event.stopPropagation(); setOpen((current) => !current) }}>
        <span id="quick-permissions-indicator" className="quick-permissions-indicator" aria-hidden="true">
          {managedTools.map((tool) => {
            const state = permissions?.[tool] ?? "ask"
            return <span key={tool} className={`permission-tool-icon state-${state}`} title={`${t(tool)}: ${t(state)}`}>{toolIcons[tool]}</span>
          })}
        </span>
      </button>
      {open && permissions && (
        <section ref={panelRef} id="quick-permissions-panel" className="quick-permissions-panel" onClick={(event) => event.stopPropagation()}>
          <div className="quick-permissions-heading"><strong>{t("quickPermissions")}</strong><small>{t("quickPermissionsHelp")}</small></div>
          <div id="quick-permissions-list" className="quick-permissions-list">
            {managedTools.map((tool) => {
              const state = permissions[tool] ?? "ask"
              return (
                <button type="button" key={tool} className={`quick-permission-row state-${state}`} title={`${t(tool)}: ${t(state)}`} onClick={() => onCycle(tool)}>
                  <span className="quick-tool-icon">{toolIcons[tool]}</span>
                  <span className="quick-tool-name">{t(tool)}</span>
                  <span className="quick-tool-state">{t(state)}</span>
                </button>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
