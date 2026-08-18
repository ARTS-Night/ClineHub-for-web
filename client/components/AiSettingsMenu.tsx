import { useEffect, useRef } from "react"
import type { TFunction } from "../lib/i18n.js"

type Props = {
  t: TFunction
  open: boolean
  onClose: () => void
  onOpenConnection: () => void
  onOpenProfiles: () => void
  onOpenAgentSettings: () => void
}

export function AiSettingsMenu({ t, open, onClose, onOpenConnection, onOpenProfiles, onOpenAgentSettings }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => { if (open) dialog.current?.showModal(); else dialog.current?.close() }, [open])

  const go = (action: () => void) => { dialog.current?.close(); action() }

  return <dialog ref={dialog} className="react-agent-dialog" onClose={onClose}><div className="settings-form">
    <div className="setup-heading"><div><h1>{t("aiSettings")}</h1><p>{t("aiSettingsMenuDescription")}</p></div><button className="secondary icon-button" type="button" onClick={() => dialog.current?.close()} aria-label={t("close")}>×</button></div>
    <div className="profile-list">
      <div className="profile-list-row"><span className="profile-description"><strong>{t("aiConnection")}</strong><br />{t("aiConnectionDescription")}</span><button type="button" onClick={() => go(onOpenConnection)}>{t("aiConnection")}</button></div>
      <div className="profile-list-row"><span className="profile-description"><strong>{t("profiles")}</strong><br />{t("profilesMenuDescription")}</span><button type="button" onClick={() => go(onOpenProfiles)}>{t("profiles")}</button></div>
      <div className="profile-list-row"><span className="profile-description"><strong>{t("agentSettings")}</strong><br />{t("agentSettingsMenuDescription")}</span><button type="button" onClick={() => go(onOpenAgentSettings)}>{t("agentSettings")}</button></div>
    </div>
  </div></dialog>
}
