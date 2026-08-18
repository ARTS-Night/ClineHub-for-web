import type { TFunction } from "../lib/i18n.js"
import type { ProfilesData } from "../lib/types.js"
import logoUrl from "../assets/clinehub-for-web.svg"

// Material Symbols (Google, Apache-2.0) paths, inlined so the header icons don't need
// a font/network fetch. https://fonts.google.com/icons
const ICON_PATHS = {
  settings:
    "m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z",
  smartToy:
    "M160-360q-50 0-85-35t-35-85q0-50 35-85t85-35v-80q0-33 23.5-56.5T240-760h120q0-50 35-85t85-35q50 0 85 35t35 85h120q33 0 56.5 23.5T800-680v80q50 0 85 35t35 85q0 50-35 85t-85 35v160q0 33-23.5 56.5T720-120H240q-33 0-56.5-23.5T160-200v-160Zm200-80q25 0 42.5-17.5T420-500q0-25-17.5-42.5T360-560q-25 0-42.5 17.5T300-500q0 25 17.5 42.5T360-440Zm240 0q25 0 42.5-17.5T660-500q0-25-17.5-42.5T600-560q-25 0-42.5 17.5T540-500q0 25 17.5 42.5T600-440ZM320-280h320v-80H320v80Zm-80 80h480v-480H240v480Zm240-240Z",
  logout:
    "M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z",
} as const

function HeaderIcon({ name }: { name: keyof typeof ICON_PATHS }) {
  return (
    <svg className="header-btn-icon" viewBox="0 -960 960 960" width="18" height="18" aria-hidden="true" focusable="false">
      <path fill="currentColor" d={ICON_PATHS[name]} />
    </svg>
  )
}

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
      <button id="sidebar-toggle" className="sidebar-toggle" type="button" aria-expanded={!sidebarCollapsed} title={t(sidebarCollapsed ? "openSessions" : "closeSessions")} onClick={onToggleSidebar}>☰</button>
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
        <button id="general-settings-button" type="button" onClick={onOpenGeneralSettings}><HeaderIcon name="settings" /><span className="btn-label">{t("generalSettings")}</span></button>
        <button id="ai-settings-button" type="button" onClick={onOpenAiSettings}><HeaderIcon name="smartToy" /><span className="btn-label">{t("aiSettings")}</span></button>
        {onLogout && <button type="button" className="secondary" onClick={onLogout}><HeaderIcon name="logout" /><span className="btn-label">{t("logout")}</span></button>}
      </div>
    </header>
  )
}
