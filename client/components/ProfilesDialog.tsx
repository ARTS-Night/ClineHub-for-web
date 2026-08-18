import { useEffect, useRef, useState } from "react"
import { api } from "../lib/api.js"
import type { TFunction } from "../lib/i18n.js"
import type { ModelProfile, ProfilesData, RemoteOperatingSystem, SudoPermission, WorkspaceProfile } from "../lib/types.js"

type WorkspaceForm = {
  editorId: string
  name: string
  type: "local" | "ssh"
  localPath: string
  sshHost: string
  sshPort: string
  sshUsername: string
  sshRemoteDirectory: string
  sshOperatingSystem: RemoteOperatingSystem
  sshAuthType: "password" | "key"
  sshKeyPath: string
  sshHostFingerprint: string
  sudoPermission: SudoPermission
  sshPassword: string
  sshPassphrase: string
  sudoPassword: string
}

const emptyForm: WorkspaceForm = { editorId: "", name: "", type: "local", localPath: "", sshHost: "", sshPort: "22", sshUsername: "", sshRemoteDirectory: "", sshOperatingSystem: "linux", sshAuthType: "password", sshKeyPath: "", sshHostFingerprint: "", sudoPermission: "ask", sshPassword: "", sshPassphrase: "", sudoPassword: "" }

function formFromProfile(profile: WorkspaceProfile | undefined): WorkspaceForm {
  if (!profile) return emptyForm
  if (profile.type === "local") return { ...emptyForm, editorId: profile.id, name: profile.name, type: "local", localPath: profile.path }
  return {
    ...emptyForm, editorId: profile.id, name: profile.name, type: "ssh", sshHost: profile.host, sshPort: String(profile.port), sshUsername: profile.username,
    sshRemoteDirectory: profile.remoteDirectory, sshOperatingSystem: profile.operatingSystem ?? "linux", sshAuthType: profile.authType,
    sshKeyPath: profile.keyPath ?? "", sshHostFingerprint: profile.hostFingerprint ?? "", sudoPermission: profile.sudoPermission ?? "ask",
  }
}

type Props = { t: TFunction; open: boolean; onClose: () => void; profilesData: ProfilesData; onProfilesChanged: (profiles: ProfilesData) => void; onAddModelProfile: () => void }

export function ProfilesDialog({ t, open, onClose, profilesData, onProfilesChanged, onAddModelProfile }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [tab, setTab] = useState<"model" | "workspace">("model")
  const [form, setForm] = useState<WorkspaceForm>(emptyForm)
  const [status, setStatus] = useState("")
  const [statusError, setStatusError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [modelEditId, setModelEditId] = useState<string | null>(null)
  const [modelEditName, setModelEditName] = useState("")
  const [modelEditTimeout, setModelEditTimeout] = useState("")
  const [modelEditImages, setModelEditImages] = useState(false)
  const [modelEditBaseUrl, setModelEditBaseUrl] = useState("")
  const [modelEditModelId, setModelEditModelId] = useState("")
  const [modelSaving, setModelSaving] = useState(false)

  useEffect(() => {
    if (!open) { dialog.current?.close(); return }
    setTab("model")
    setForm(formFromProfile(profilesData.workspaces.find((item) => item.id === profilesData.activeWorkspaceProfileId)))
    setStatus("")
    setStatusError(false)
    if (!dialog.current?.open) dialog.current?.showModal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const update = <K extends keyof WorkspaceForm>(key: K, value: WorkspaceForm[K]) => setForm((current) => ({ ...current, [key]: value }))
  const selectEditing = (id: string) => setForm(formFromProfile(profilesData.workspaces.find((item) => item.id === id)))

  const deleteModelProfile = async (id: string, name: string) => {
    if (!confirm(`Delete model profile "${name}"?`)) return
    await api(`/api/profiles/models/${encodeURIComponent(id)}`, { method: "DELETE" })
    onProfilesChanged(await api<ProfilesData>("/api/profiles"))
  }

  const startEditModel = (profile: ModelProfile) => {
    setModelEditId(profile.id)
    setModelEditName(profile.name)
    setModelEditTimeout(profile.timeoutMs ? String(profile.timeoutMs / 1000) : "")
    setModelEditImages(profile.imagesEnabled)
    setModelEditBaseUrl(profile.baseUrl)
    setModelEditModelId(profile.modelId)
    setStatus("")
    setStatusError(false)
  }
  const editingModel = profilesData.models.find((profile) => profile.id === modelEditId)
  const editingModelHasUrl = editingModel ? editingModel.provider !== "codex" && editingModel.provider !== "claude-code" : true
  const saveModelEdit = async () => {
    if (!modelEditId || !editingModel) return
    setModelSaving(true)
    setStatus("")
    setStatusError(false)
    try {
      // Only send baseUrl/modelId when they actually changed — the server
      // re-verifies the connection whenever either is present, so leaving
      // them out for an unchanged edit (e.g. just the name) skips that.
      const body: Record<string, unknown> = { name: modelEditName, timeoutMs: modelEditTimeout.trim() ? Number(modelEditTimeout) * 1000 : null, imagesEnabled: modelEditImages }
      if (editingModelHasUrl && modelEditBaseUrl !== editingModel.baseUrl) body.baseUrl = modelEditBaseUrl
      if (modelEditModelId !== editingModel.modelId) body.modelId = modelEditModelId
      const result = await api<{ profile: ModelProfile; profiles: ProfilesData }>(`/api/profiles/models/${encodeURIComponent(modelEditId)}`, { method: "PATCH", body: JSON.stringify(body) })
      onProfilesChanged(result.profiles)
      setModelEditId(null)
    } catch (error) { setStatus(error instanceof Error ? error.message : String(error)); setStatusError(true) }
    finally { setModelSaving(false) }
  }

  const workspacePayload = () => {
    const id = form.editorId || undefined
    if (form.type === "local") return { id, name: form.name, type: "local", path: form.localPath }
    return {
      id, name: form.name, type: "ssh", host: form.sshHost, port: Number(form.sshPort), username: form.sshUsername,
      remoteDirectory: form.sshRemoteDirectory, authType: form.sshAuthType, password: form.sshPassword || undefined,
      keyPath: form.sshKeyPath || undefined, passphrase: form.sshPassphrase || undefined, hostFingerprint: form.sshHostFingerprint || undefined,
      operatingSystem: form.sshOperatingSystem, sudoPermission: form.sudoPermission, sudoPassword: form.sudoPassword || undefined,
    }
  }

  const submitWorkspace = async () => {
    if (form.type === "ssh" && form.sshOperatingSystem === "linux" && form.sudoPermission === "allow" && !confirm(t("sudoWarning"))) return
    setSaving(true)
    setStatusError(false)
    setStatus(form.type === "ssh" ? t("sshTesting") : t("saving"))
    try {
      const result = await api<{ profile: WorkspaceProfile; profiles: ProfilesData; test?: { directory: string; system: string } }>("/api/profiles/workspaces", { method: "POST", body: JSON.stringify(workspacePayload()) })
      onProfilesChanged(result.profiles)
      setForm(formFromProfile(result.profiles.workspaces.find((item) => item.id === result.profile.id)))
      setStatus(result.test ? `${t("profileSaved")} ${t("sshSuccess", result.test)}` : t("profileSaved"))
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error))
      setStatusError(true)
    } finally {
      setSaving(false)
    }
  }

  const testWorkspace = async () => {
    if (!form.editorId) { setStatus(t("saveActivate")); return }
    setTesting(true)
    setStatusError(false)
    setStatus(t("sshTesting"))
    try {
      const result = await api<{ directory: string; system: string }>(`/api/profiles/workspaces/${encodeURIComponent(form.editorId)}/test`, { method: "POST", body: "{}" })
      setStatus(t("sshSuccess", result))
    } catch (error) {
      setStatusError(true)
      setStatus(error instanceof Error ? error.message : String(error))
    } finally {
      setTesting(false)
    }
  }

  const deleteWorkspace = async () => {
    if (!form.editorId || !confirm("Delete this workspace profile?")) return
    try {
      await api(`/api/profiles/workspaces/${encodeURIComponent(form.editorId)}`, { method: "DELETE" })
      onProfilesChanged(await api<ProfilesData>("/api/profiles"))
      setForm(emptyForm)
    } catch (error) { setStatus(error instanceof Error ? error.message : String(error)); setStatusError(true) }
  }

  const isSsh = form.type === "ssh"
  const isKeyAuth = form.sshAuthType === "key"
  const showSudo = isSsh && form.sshOperatingSystem === "linux"
  const isEditingActive = form.editorId === profilesData.activeWorkspaceProfileId

  return (
    <dialog ref={dialog} id="profiles-dialog" className="wide-dialog" onClose={onClose}>
      <form className="settings-form" onSubmit={(event) => { event.preventDefault(); void submitWorkspace() }}>
        <div className="setup-heading">
          <div><h1>{t("profiles")}</h1><p>{t("profilesDescription")}</p></div>
          <button className="secondary icon-button" type="button" aria-label={t("close")} onClick={() => dialog.current?.close()}>×</button>
        </div>
        <div className="profile-tabs" role="tablist" aria-label={t("profileType")}>
          <button className={`profile-tab${tab === "model" ? " active" : ""}`} type="button" role="tab" aria-selected={tab === "model"} onClick={() => setTab("model")}><span className="tab-icon">◆</span><span>{t("modelProfiles")}</span></button>
          <button className={`profile-tab${tab === "workspace" ? " active" : ""}`} type="button" role="tab" aria-selected={tab === "workspace"} onClick={() => setTab("workspace")}><span className="tab-icon">▣</span><span>{t("workspaceProfiles")}</span></button>
        </div>

        {tab === "model" && (
          <section className="profile-tab-panel" role="tabpanel">
            <fieldset>
              <legend>{t("modelProfiles")}</legend>
              <div className="profile-list">
                {profilesData.models.map((profile) => modelEditId === profile.id ? (
                  <div className="profile-list-row model-edit-row" key={profile.id}>
                    <div className="two-columns">
                      <label><span>{t("name")}</span><input type="text" maxLength={100} value={modelEditName} onChange={(event) => setModelEditName(event.target.value)} /></label>
                      <label><span>{t("requestTimeout")}</span><input type="number" min="1" max="3600" placeholder={t("requestTimeoutHelp")} value={modelEditTimeout} onChange={(event) => setModelEditTimeout(event.target.value)} /></label>
                    </div>
                    <div className="two-columns">
                      {editingModelHasUrl
                        ? <label><span>{t("serverUrl")}</span><input type="url" spellCheck={false} value={modelEditBaseUrl} onChange={(event) => setModelEditBaseUrl(event.target.value)} /></label>
                        : <label><span>{t("serverUrl")}</span><input type="text" disabled value="" placeholder={t(profile.provider === "claude-code" ? "urlManagedClaude" : "urlManagedCodex")} /></label>}
                      <label><span>{t("model")}</span><input type="text" spellCheck={false} value={modelEditModelId} onChange={(event) => setModelEditModelId(event.target.value)} /></label>
                    </div>
                    <label className="check-row"><input type="checkbox" checked={modelEditImages} onChange={(event) => setModelEditImages(event.target.checked)} /><span>{t("enableImages")}</span></label>
                    <div className="profile-actions">
                      <button type="button" className="secondary" disabled={modelSaving} onClick={() => setModelEditId(null)}>{t("cancel")}</button>
                      <button type="button" disabled={modelSaving} onClick={() => void saveModelEdit()}>{modelSaving ? t("savingShort") : t("saveSettings")}</button>
                    </div>
                  </div>
                ) : (
                  <div className="profile-list-row" key={profile.id}>
                    <span className="profile-description">
                      <strong>{profile.name}</strong>
                      <small>{profile.provider} · {profile.modelId}{profile.imagesEnabled ? " · 🖼" : ""}{profile.timeoutMs ? ` · ⏱${profile.timeoutMs / 1000}s` : ""}</small>
                    </span>
                    <div className="profile-actions">
                      <button type="button" className="secondary" onClick={() => startEditModel(profile)}>{t("edit")}</button>
                      <button type="button" className="danger" disabled={profile.id === profilesData.activeModelProfileId} onClick={() => void deleteModelProfile(profile.id, profile.name)}>{t("deleteProfile")}</button>
                    </div>
                  </div>
                ))}
              </div>
              <p className={statusError ? "error" : ""} aria-live="polite">{status}</p>
              <div className="profile-actions"><button className="secondary" type="button" onClick={onAddModelProfile}>{t("addModelProfile")}</button></div>
            </fieldset>
          </section>
        )}

        {tab === "workspace" && (
          <section className="profile-tab-panel" role="tabpanel">
            <fieldset>
              <legend>{t("workspaceProfiles")}</legend>
              <label><span>{t("editProfile")}</span>
                <select value={form.editorId} onChange={(event) => selectEditing(event.target.value)}>
                  <option value="">{t("newProfile")}</option>
                  {profilesData.workspaces.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
                </select>
              </label>
              <div className="two-columns">
                <label><span>{t("profileName")}</span><input type="text" maxLength={100} required value={form.name} onChange={(event) => update("name", event.target.value)} /></label>
                <label><span>{t("workspaceType")}</span>
                  <select value={form.type} onChange={(event) => update("type", event.target.value as WorkspaceForm["type"])}>
                    <option value="local">Local</option>
                    <option value="ssh">SSH</option>
                  </select>
                </label>
              </div>
              {!isSsh && <label id="local-path-row"><span>{t("workingDirectory")}</span><input type="text" spellCheck={false} value={form.localPath} onChange={(event) => update("localPath", event.target.value)} /></label>}
              {isSsh && (
                <div id="ssh-fields" className="ssh-fields">
                  <div className="two-columns ssh-host-row">
                    <label><span>{t("sshHost")}</span><input type="text" spellCheck={false} value={form.sshHost} onChange={(event) => update("sshHost", event.target.value)} /></label>
                    <label><span>{t("sshPort")}</span><input type="number" min="1" max="65535" value={form.sshPort} onChange={(event) => update("sshPort", event.target.value)} /></label>
                  </div>
                  <div className="two-columns">
                    <label><span>{t("sshUser")}</span><input type="text" autoComplete="username" value={form.sshUsername} onChange={(event) => update("sshUsername", event.target.value)} /></label>
                    <label><span>{t("sshAuth")}</span>
                      <select value={form.sshAuthType} onChange={(event) => update("sshAuthType", event.target.value as WorkspaceForm["sshAuthType"])}>
                        <option value="password">{t("password")}</option>
                        <option value="key">{t("privateKey")}</option>
                      </select>
                    </label>
                  </div>
                  <div className="two-columns">
                    <label><span>{t("remoteDirectory")}</span><input type="text" placeholder="/home/user/project" spellCheck={false} value={form.sshRemoteDirectory} onChange={(event) => update("sshRemoteDirectory", event.target.value)} /></label>
                    <label><span>{t("remoteOs")}</span>
                      <select value={form.sshOperatingSystem} onChange={(event) => update("sshOperatingSystem", event.target.value as RemoteOperatingSystem)}>
                        <option value="linux">Linux</option>
                        <option value="macos">macOS</option>
                        <option value="unix">Other Unix</option>
                      </select>
                    </label>
                  </div>
                  {!isKeyAuth && <label id="ssh-password-row"><span>{t("password")}</span><input type="password" autoComplete="new-password" value={form.sshPassword} onChange={(event) => update("sshPassword", event.target.value)} /><small>{t("secretKeepHelp")}</small></label>}
                  {isKeyAuth && (
                    <div id="ssh-key-fields">
                      <label><span>{t("privateKeyPath")}</span><input type="text" placeholder="C:\Users\me\.ssh\id_ed25519" spellCheck={false} value={form.sshKeyPath} onChange={(event) => update("sshKeyPath", event.target.value)} /></label>
                      <label><span>{t("passphrase")}</span><input type="password" autoComplete="new-password" value={form.sshPassphrase} onChange={(event) => update("sshPassphrase", event.target.value)} /><small>{t("secretKeepHelp")}</small></label>
                    </div>
                  )}
                  <label><span>{t("hostFingerprint")}</span><input type="text" placeholder="SHA256:..." value={form.sshHostFingerprint} onChange={(event) => update("sshHostFingerprint", event.target.value)} /><small>{t("fingerprintHelp")}</small></label>
                  {showSudo && (
                    <fieldset id="sudo-settings" className={form.sudoPermission === "allow" ? "danger-zone" : ""}>
                      <legend>{t("sudoSettings")}</legend>
                      <label><span>{t("sudoPermission")}</span>
                        <select value={form.sudoPermission} onChange={(event) => update("sudoPermission", event.target.value as SudoPermission)}>
                          <option value="disabled">{t("sudoDisabled")}</option>
                          <option value="ask">{t("sudoAsk")}</option>
                          <option value="allow">{t("sudoAllow")}</option>
                        </select>
                      </label>
                      <label><span>{t("sudoPassword")}</span><input type="password" autoComplete="new-password" value={form.sudoPassword} onChange={(event) => update("sudoPassword", event.target.value)} /><small>{t("secretKeepHelp")}</small></label>
                      <p className="sudo-warning">{t("sudoWarning")}</p>
                    </fieldset>
                  )}
                </div>
              )}
              <p id="profile-status" role="status" className={statusError ? "error" : ""}>{status}</p>
              <div className="setup-actions split-actions">
                <button type="button" className="danger" disabled={!form.editorId || isEditingActive} onClick={() => void deleteWorkspace()}>{t("deleteProfile")}</button>
                <div>
                  {isSsh && <button type="button" className="secondary" disabled={testing} onClick={() => void testWorkspace()}>{t("testSsh")}</button>}
                  <button type="submit" disabled={saving}>{t("saveActivate")}</button>
                </div>
              </div>
            </fieldset>
          </section>
        )}
      </form>
    </dialog>
  )
}
