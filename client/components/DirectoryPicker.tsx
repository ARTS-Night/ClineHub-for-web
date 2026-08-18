import { useEffect, useRef, useState } from "react"
import { api } from "../lib/api.js"
import type { TFunction } from "../lib/i18n.js"

type BrowseResult = { path: string; parent: string | null; directories: string[] }

type Props = { t: TFunction; open: boolean; initialPath: string; onSelect: (path: string) => void; onClose: () => void }

export function DirectoryPicker({ t, open, initialPath, onSelect, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [result, setResult] = useState<BrowseResult | null>(null)
  const [error, setError] = useState("")

  const load = (path: string) => {
    api<BrowseResult>(`/api/browse-directory?path=${encodeURIComponent(path)}`)
      .then((next) => { setResult(next); setError("") })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
  }

  useEffect(() => {
    if (!open) { dialog.current?.close(); return }
    setResult(null)
    setError("")
    load(initialPath)
    dialog.current?.showModal()
  }, [open, initialPath])

  return (
    <dialog ref={dialog} className="wide-dialog" onClose={onClose}>
      <div className="settings-form">
        <div className="setup-heading">
          <div><h1>{t("browseDirectory")}</h1></div>
          <button className="secondary icon-button" type="button" aria-label={t("close")} onClick={() => dialog.current?.close()}>×</button>
        </div>
        {result && <code className="directory-picker-path">{result.path}</code>}
        {error && <p className="error" role="status">{error}</p>}
        {result && (
          <ul className="directory-picker-list">
            {result.parent && (
              <li><button type="button" onClick={() => load(result.parent!)}>.. ({t("directoryUp")})</button></li>
            )}
            {result.directories.length === 0 && !result.parent && <li className="directory-picker-empty">—</li>}
            {result.directories.map((name) => (
              <li key={name}><button type="button" onClick={() => load(`${result.path}/${name}`)}>📁 {name}</button></li>
            ))}
          </ul>
        )}
        <div className="setup-actions split-actions">
          <button type="button" className="secondary" onClick={() => dialog.current?.close()}>{t("cancel")}</button>
          <button type="button" disabled={!result} onClick={() => result && onSelect(result.path)}>{t("selectThisDirectory")}</button>
        </div>
      </div>
    </dialog>
  )
}
