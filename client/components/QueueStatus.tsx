import { useState } from "react"
import type { TFunction } from "../lib/i18n.js"
import type { QueuedPrompt } from "../lib/types.js"

export type QueueEntry = QueuedPrompt & { source: "startup" | "server" }

type Props = {
  t: TFunction
  entries: QueueEntry[]
  onUpdate: (entry: QueueEntry, prompt: string) => Promise<void>
  onCancel: (entry: QueueEntry) => Promise<void>
}

export function QueueStatus({ t, entries, onUpdate, onCancel }: Props) {
  if (entries.length === 0) return <section id="queue-status" className="queue-status" aria-live="polite" hidden />
  return (
    <section id="queue-status" className="queue-status" aria-live="polite">
      <strong className="queue-heading">{t("queueCount", { count: entries.length })}</strong>
      <div className="queue-list">
        {entries.map((entry, index) => <QueueItemRow key={entry.id} t={t} entry={entry} index={index} total={entries.length} onUpdate={onUpdate} onCancel={onCancel} />)}
      </div>
    </section>
  )
}

function QueueItemRow({ t, entry, index, total, onUpdate, onCancel }: { t: TFunction; entry: QueueEntry; index: number; total: number; onUpdate: Props["onUpdate"]; onCancel: Props["onCancel"] }) {
  const [value, setValue] = useState(entry.prompt)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [invalid, setInvalid] = useState(false)
  const imageCount = entry.imageCount ?? entry.images?.length ?? 0

  const runUpdate = async () => {
    if (!value.trim()) { setInvalid(true); return }
    setInvalid(false)
    setBusy(true)
    try { await onUpdate(entry, value.trim()); setError("") }
    catch (err) { setError(err instanceof Error ? err.message : String(err)); setBusy(false) }
  }
  const runCancel = async () => {
    setBusy(true)
    try { await onCancel(entry) }
    catch (err) { setError(err instanceof Error ? err.message : String(err)); setBusy(false) }
  }

  return (
    <div className={`queue-item${invalid ? " invalid" : ""}`}>
      <span className="queue-order">{index + 1}</span>
      <textarea className="queue-message-input" rows={2} value={value} aria-label={`${t("queueCount", { count: total })} ${index + 1}`} onChange={(event) => setValue(event.target.value)} />
      <div className="queue-item-actions">
        {imageCount > 0 && <small className="queue-image-count">{t("queuedImages", { count: imageCount })}</small>}
        <button type="button" className="secondary queue-force-send" disabled={busy} onClick={runUpdate}>{t("forceSend")}</button>
        <button type="button" className="danger queue-close" disabled={busy} onClick={runCancel} aria-label={t("queueCancel")} title={t("queueCancel")}>×</button>
      </div>
      {error && <small className="queue-item-error">{error}</small>}
    </div>
  )
}
