import type { TFunction } from "../lib/i18n.js"
import type { ProfilesData } from "../lib/types.js"
import logoUrl from "../assets/clinehub-for-web.svg"
import { Icon } from "./Icon.js"

type Props = {
  t: TFunction
  connectionText: string
  connectionColor: string
  workspaceDisplay: string
  profilesData: ProfilesData
  onModelProfileChange: (id: string) => void
  onWorkspaceProfileChange: (id: string) => void
  modelProfileBusy: boolean
  workspaceProfileBusy: boolean
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
  onOpenGeneralSettings: () => void
  onOpenAiSettings: () => void
  /** Present only when login is actually required — Header stays login-agnostic otherwise. */
  onLogout?: () => void
}

export function Header(props: Props) {
  const { t, connectionText, connectionColor, workspaceDisplay, profilesData, onModelProfileChange, onWorkspaceProfileChange, modelProfileBusy, workspaceProfileBusy, sidebarCollapsed, onToggleSidebar, onOpenGeneralSettings, onOpenAiSettings, onLogout } = props
  const activeModel = profilesData.models.find((profile) => profile.id === profilesData.activeModelProfileId)
  const activeWorkspace = profilesData.workspaces.find((profile) => profile.id === profilesData.activeWorkspaceProfileId)
  return (
    <header>
      <button id="sidebar-toggle" className="sidebar-toggle" type="button" aria-expanded={!sidebarCollapsed} title={t(sidebarCollapsed ? "openSessions" : "closeSessions")} onClick={onToggleSidebar}><Icon name="menu" className="header-btn-icon" /></button>
      <img src={logoUrl} alt="" className="app-logo" width={34} height={34} />
      <strong>ClineHub-for-web</strong>
      <span id="connection" style={{ color: connectionColor }}>{connectionText}</span>
      <span id="workspace-display" title={workspaceDisplay}>{workspaceDisplay}</span>
      <div className="header-profile-switchers">
        <label className="quick-switch model-switch"><span>{t("modelProfileShort")}</span>
          <select aria-label="Model profile" value={profilesData.activeModelProfileId ?? ""} title={activeModel?.name ?? ""} disabled={profilesData.models.length === 0 || modelProfileBusy} onChange={(event) => onModelProfileChange(event.target.value)}>
            {profilesData.models.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
          </select>
        </label>
        <label className="quick-switch workspace-switch"><span>{t("workspaceProfileShort")}</span>
          <select aria-label="Workspace profile" value={profilesData.activeWorkspaceProfileId ?? ""} title={activeWorkspace?.name ?? ""} disabled={profilesData.workspaces.length === 0 || workspaceProfileBusy} onChange={(event) => onWorkspaceProfileChange(event.target.value)}>
            {profilesData.workspaces.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
          </select>
        </label>
      </div>
      <div className="header-actions">
        <button id="general-settings-button" type="button" title={t("generalSettings")} aria-label={t("generalSettings")} onClick={onOpenGeneralSettings}><Icon name="settings" className="header-btn-icon" /></button>
        <button id="ai-settings-button" type="button" title={t("aiSettings")} aria-label={t("aiSettings")} onClick={onOpenAiSettings}><Icon name="smartToy" className="header-btn-icon" /></button>
        {onLogout && <button type="button" className="secondary" title={t("logout")} aria-label={t("logout")} onClick={onLogout}><Icon name="logout" className="header-btn-icon" /></button>}
      </div>
    </header>
  )
}
