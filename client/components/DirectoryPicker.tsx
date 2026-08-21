import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { api } from "../lib/api.js"
import { Icon } from "./Icon.js"
import type { TFunction } from "../lib/i18n.js"

type BrowseResult = { path: string; parent: string | null; directories: string[] }

type Props = { t: TFunction; open: boolean; initialPath: string; onSelect: (path: string) => void; onClose: () => void }

export function DirectoryPicker({ t, open, initialPath, onSelect, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [result, setResult] = useState<BrowseResult | null>(null)
  const [error, setError] = useState("")
  const [pathInput, setPathInput] = useState("")
  const [drives, setDrives] = useState<string[]>([])

  const load = (path: string) => {
    api<BrowseResult>(`/api/browse-directory?path=${encodeURIComponent(path)}`)
      .then((next) => { setResult(next); setPathInput(next.path); setError("") })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
  }

  useEffect(() => {
    if (!open) { dialog.current?.close(); return }
    setResult(null)
    setError("")
    load(initialPath)
    // Windows-only (see /api/drives) — an empty list on other platforms just
    // means the drive-switch row below never renders.
    api<{ drives: string[] }>("/api/drives").then((res) => setDrives(res.drives)).catch(() => setDrives([]))
    dialog.current?.showModal()
  }, [open, initialPath])

  // This dialog is opened from inside another already-open <dialog> (the
  // Profiles / Agent Settings forms). Rendering it as a DOM descendant of
  // that outer <dialog> — even though both use showModal() — hits a real
  // nested-<dialog> quirk: closing this inner dialog also force-closes the
  // ancestor dialog, discarding whatever the user just picked before they
  // ever got to Save. A portal to document.body makes this a sibling in the
  // DOM instead, which doesn't trigger that behavior.
  if (!open) return null
  return createPortal(
    <dialog ref={dialog} className="wide-dialog" onClose={onClose}>
      <div className="settings-form">
        <div className="setup-heading">
          <div><h1>{t("browseDirectory")}</h1></div>
          <button className="secondary icon-button" type="button" aria-label={t("close")} onClick={() => dialog.current?.close()}>×</button>
        </div>
        <form className="input-with-button" onSubmit={(event) => { event.preventDefault(); if (pathInput.trim()) load(pathInput.trim()) }}>
          <input type="text" spellCheck={false} value={pathInput} onChange={(event) => setPathInput(event.target.value)} placeholder={t("directoryPathPlaceholder")} />
          <button type="submit" className="secondary">{t("go")}</button>
        </form>
        {drives.length > 1 && (
          <div className="drive-row">
            {drives.map((drive) => (
              <button type="button" key={drive} className={`secondary drive-button${result?.path.toUpperCase().startsWith(drive.toUpperCase()) ? " active" : ""}`} onClick={() => load(drive)}>
                <Icon name="hardDrive" className="inline-icon" /> {drive}
              </button>
            ))}
          </div>
        )}
        {error && <p className="error" role="status">{error}</p>}
        {result && (
          <ul className="directory-picker-list">
            {result.parent && (
              <li><button type="button" onClick={() => load(result.parent!)}>.. ({t("directoryUp")})</button></li>
            )}
            {result.directories.length === 0 && !result.parent && <li className="directory-picker-empty">—</li>}
            {result.directories.map((name) => (
              <li key={name}><button type="button" onClick={() => load(`${result.path}/${name}`)}><Icon name="folder" className="inline-icon" /> {name}</button></li>
            ))}
          </ul>
        )}
        <div className="setup-actions split-actions">
          <button type="button" className="secondary" onClick={() => dialog.current?.close()}>{t("cancel")}</button>
          <button type="button" disabled={!result} onClick={() => result && onSelect(result.path)}>{t("selectThisDirectory")}</button>
        </div>
      </div>
    </dialog>,
    document.body,
  )
}
