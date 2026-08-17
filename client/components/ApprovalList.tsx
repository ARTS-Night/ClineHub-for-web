import type { ApprovalItem } from "../types.js"

export function ApprovalList({ approvals, onResolve }: { approvals: ApprovalItem[]; onResolve: (id: string, approved: boolean) => void }) {
  return (
    <div id="approval">
      {approvals.map((item) => (
        <div className="approval" key={item.id}>
          <strong>Tool approval required: {item.toolName}</strong>
          <pre>{JSON.stringify(item.input, null, 2)}</pre>
          <button type="button" onClick={() => onResolve(item.id, true)}>Approve</button>
          <button type="button" onClick={() => onResolve(item.id, false)}>Reject</button>
        </div>
      ))}
    </div>
  )
}
