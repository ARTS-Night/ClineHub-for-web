import type { TFunction } from "../lib/i18n.js"
import type { ApprovalItem } from "../lib/types.js"
import { mcpToolParts } from "../lib/messageLog.js"

export function ApprovalList({ t, approvals, onResolve }: { t: TFunction; approvals: ApprovalItem[]; onResolve: (id: string, approved: boolean) => void }) {
  return (
    <div id="approval">
      {approvals.map((item) => {
        const mcp = mcpToolParts(item.toolName)
        return (
          <div className="approval" key={item.id}>
            <strong>{mcp ? `⛁ ${t("mcpApprovalRequested", mcp)}` : t("toolApprovalRequested", { tool: item.toolName })}</strong>
            <pre>{JSON.stringify(item.input, null, 2)}</pre>
            <button type="button" onClick={() => onResolve(item.id, true)}>{t("approve")}</button>
            <button type="button" onClick={() => onResolve(item.id, false)}>{t("reject")}</button>
          </div>
        )
      })}
    </div>
  )
}
