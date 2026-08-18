import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname } from "node:path"
import { parseOptionalTimeout, type ConnectionSettings, type ModelInfo, type ProviderKind } from "../providers.js"

export type ModelProfile = {
  id: string
  name: string
  provider: ProviderKind
  baseUrl: string
  modelId: string
  modelInfo?: Pick<ModelInfo, "id" | "name" | "contextWindow" | "maxInputTokens" | "capabilities" | "imageSupport">
  timeoutMs?: number
  imagesEnabled: boolean
  createdAt: string
  updatedAt: string
}

export type LocalWorkspaceProfile = {
  id: string
  name: string
  type: "local"
  path: string
  createdAt: string
  updatedAt: string
}

export type RemoteOperatingSystem = "linux" | "macos" | "unix"
export type SudoPermission = "disabled" | "ask" | "allow"

export type SshWorkspaceProfile = {
  id: string
  name: string
  type: "ssh"
  host: string
  port: number
  username: string
  remoteDirectory: string
  operatingSystem: RemoteOperatingSystem
  authType: "password" | "key"
  keyPath?: string
  hostFingerprint?: string
  hasPassword: boolean
  hasPassphrase: boolean
  sudoPermission: SudoPermission
  hasSudoPassword: boolean
  createdAt: string
  updatedAt: string
}

export type WorkspaceProfile = LocalWorkspaceProfile | SshWorkspaceProfile
export type ResolvedSshWorkspaceProfile = SshWorkspaceProfile & { password?: string; passphrase?: string; sudoPassword?: string }

type StoredSshWorkspaceProfile = Omit<SshWorkspaceProfile, "hasPassword" | "hasPassphrase" | "hasSudoPassword"> & {
  encryptedPassword?: string
  encryptedPassphrase?: string
  encryptedSudoPassword?: string
}

type StoredWorkspaceProfile = LocalWorkspaceProfile | StoredSshWorkspaceProfile
type ProfileDocument = {
  version: 1
  activeModelProfileId?: string
  activeWorkspaceProfileId?: string
  models: ModelProfile[]
  workspaces: StoredWorkspaceProfile[]
}

export type SshWorkspaceInput = {
  id?: unknown
  name?: unknown
  host?: unknown
  port?: unknown
  username?: unknown
  remoteDirectory?: unknown
  operatingSystem?: unknown
  authType?: unknown
  password?: unknown
  keyPath?: unknown
  passphrase?: unknown
  hostFingerprint?: unknown
  sudoPermission?: unknown
  sudoPassword?: unknown
}

export class ProfileStore {
  private document: ProfileDocument = { version: 1, models: [], workspaces: [] }
  private key: Buffer | undefined

  constructor(private readonly filePath: string, private readonly keyPath: string) {}

  async load(): Promise<void> {
    try {
      const value: unknown = JSON.parse(await readFile(this.filePath, "utf8"))
      if (!isRecord(value) || value.version !== 1 || !Array.isArray(value.models) || !Array.isArray(value.workspaces)) {
        throw new Error("Unsupported profile storage format")
      }
      this.document = value as ProfileDocument
    } catch (error: unknown) {
      if (!isNodeError(error) || error.code !== "ENOENT") throw error
    }
  }

  list() {
    return {
      activeModelProfileId: this.document.activeModelProfileId,
      activeWorkspaceProfileId: this.document.activeWorkspaceProfileId,
      models: this.document.models.map((profile) => ({ ...profile })),
      workspaces: this.document.workspaces.map((profile) => this.publicWorkspace(profile)),
    }
  }

  model(id: string): ModelProfile | undefined {
    const profile = this.document.models.find((item) => item.id === id)
    return profile ? { ...profile } : undefined
  }

  activeWorkspace(): WorkspaceProfile | undefined {
    const id = this.document.activeWorkspaceProfileId
    if (!id) return undefined
    const profile = this.document.workspaces.find((item) => item.id === id)
    return profile ? this.publicWorkspace(profile) : undefined
  }

  async resolvedActiveSshWorkspace(): Promise<ResolvedSshWorkspaceProfile | undefined> {
    const id = this.document.activeWorkspaceProfileId
    if (!id) return undefined
    const profile = this.document.workspaces.find((item) => item.id === id)
    if (!profile || profile.type !== "ssh") return undefined
    return await this.resolveSsh(profile)
  }

  async ensureModel(settings: ConnectionSettings, name?: string): Promise<ModelProfile> {
    const existing = this.document.models.find((item) => item.provider === settings.provider && item.baseUrl === settings.baseUrl && item.modelId === settings.modelId)
    if (existing) {
      this.document.activeModelProfileId = existing.id
      await this.persist()
      return { ...existing }
    }
    return await this.saveModel({ name: name ?? defaultModelName(settings), settings })
  }

  async saveModel(input: { id?: unknown; name?: unknown; settings: ConnectionSettings }): Promise<ModelProfile> {
    const id = optionalId(input.id) ?? makeId("model")
    const now = new Date().toISOString()
    const current = this.document.models.find((item) => item.id === id)
    const name = requiredString(input.name, "Model profile name", 100)
    const modelInfo = input.settings.modelInfo ? {
      id: input.settings.modelInfo.id,
      name: input.settings.modelInfo.name,
      contextWindow: input.settings.modelInfo.contextWindow,
      maxInputTokens: input.settings.modelInfo.maxInputTokens,
      capabilities: input.settings.modelInfo.capabilities,
      imageSupport: input.settings.modelInfo.imageSupport,
    } : undefined
    const profile: ModelProfile = {
      id,
      name,
      provider: input.settings.provider,
      baseUrl: input.settings.baseUrl,
      modelId: input.settings.modelId,
      modelInfo,
      timeoutMs: input.settings.timeoutMs,
      imagesEnabled: input.settings.imagesEnabled === true,
      createdAt: current?.createdAt ?? now,
      updatedAt: now,
    }
    this.document.models = [...this.document.models.filter((item) => item.id !== id), profile]
    this.document.activeModelProfileId = id
    await this.persist()
    return { ...profile }
  }

  /** Edits an existing model profile's own fields (name, timeout, image input, and —
   * once the caller has re-resolved them via createConnection() — URL/model/modelInfo)
   * without touching which profile is active — unlike saveModel(), which is also the
   * connect flow's upsert-and-activate path. This method trusts baseUrl/modelId/modelInfo
   * as already-validated; callers must resolve them through createConnection() first. */
  async updateModel(id: string, patch: { name?: unknown; timeoutMs?: unknown; imagesEnabled?: unknown; baseUrl?: unknown; modelId?: unknown; modelInfo?: ModelProfile["modelInfo"] }): Promise<ModelProfile> {
    const index = this.document.models.findIndex((item) => item.id === id)
    const current = this.document.models[index]
    if (index === -1 || !current) throw new Error("Model profile not found")
    const profile: ModelProfile = {
      ...current,
      name: patch.name !== undefined ? requiredString(patch.name, "Model profile name", 100) : current.name,
      baseUrl: patch.baseUrl !== undefined ? requiredString(patch.baseUrl, "Server URL", 2_000) : current.baseUrl,
      modelId: patch.modelId !== undefined ? requiredString(patch.modelId, "Model", 300) : current.modelId,
      modelInfo: patch.modelInfo !== undefined ? patch.modelInfo : current.modelInfo,
      timeoutMs: patch.timeoutMs !== undefined ? parseOptionalTimeout(patch.timeoutMs) : current.timeoutMs,
      imagesEnabled: patch.imagesEnabled !== undefined ? Boolean(patch.imagesEnabled) : current.imagesEnabled,
      updatedAt: new Date().toISOString(),
    }
    const models = [...this.document.models]
    models[index] = profile
    this.document.models = models
    await this.persist()
    return { ...profile }
  }

  async activateModel(id: string): Promise<ModelProfile> {
    const profile = this.document.models.find((item) => item.id === id)
    if (!profile) throw new Error("Model profile not found")
    this.document.activeModelProfileId = id
    await this.persist()
    return { ...profile }
  }

  async deleteModel(id: string): Promise<void> {
    this.document.models = this.document.models.filter((item) => item.id !== id)
    if (this.document.activeModelProfileId === id) this.document.activeModelProfileId = undefined
    await this.persist()
  }

  async ensureLocalWorkspace(name: string, path: string): Promise<LocalWorkspaceProfile> {
    const existing = this.document.workspaces.find((item) => item.type === "local" && item.path === path)
    if (existing?.type === "local") {
      this.document.activeWorkspaceProfileId ??= existing.id
      await this.persist()
      return { ...existing }
    }
    const profile = await this.saveLocalWorkspace({ name, path })
    if (!this.document.activeWorkspaceProfileId) {
      this.document.activeWorkspaceProfileId = profile.id
      await this.persist()
    }
    return profile
  }

  async saveLocalWorkspace(input: { id?: unknown; name?: unknown; path: string }): Promise<LocalWorkspaceProfile> {
    const id = optionalId(input.id) ?? makeId("workspace")
    const now = new Date().toISOString()
    const current = this.document.workspaces.find((item) => item.id === id)
    const profile: LocalWorkspaceProfile = {
      id,
      name: requiredString(input.name, "Workspace profile name", 100),
      type: "local",
      path: input.path,
      createdAt: current?.createdAt ?? now,
      updatedAt: now,
    }
    this.document.workspaces = [...this.document.workspaces.filter((item) => item.id !== id), profile]
    await this.persist()
    return { ...profile }
  }

  async saveSshWorkspace(input: SshWorkspaceInput): Promise<SshWorkspaceProfile> {
    const id = optionalId(input.id) ?? makeId("workspace")
    const current = this.document.workspaces.find((item) => item.id === id)
    const currentSsh = current?.type === "ssh" ? current : undefined
    const now = new Date().toISOString()
    const authType = input.authType === "password" || input.authType === "key" ? input.authType : null
    if (!authType) throw new Error("SSH authentication must be password or key")
    const password = optionalSecret(input.password)
    const passphrase = optionalSecret(input.passphrase)
    const sudoPassword = optionalSecret(input.sudoPassword)
    const encryptedPassword = authType === "password"
      ? password ? await this.encrypt(password) : currentSsh?.encryptedPassword
      : undefined
    const encryptedPassphrase = authType === "key"
      ? passphrase ? await this.encrypt(passphrase) : currentSsh?.encryptedPassphrase
      : undefined
    const encryptedSudoPassword = sudoPassword ? await this.encrypt(sudoPassword) : currentSsh?.encryptedSudoPassword
    const keyPath = authType === "key" ? requiredString(input.keyPath, "Private key path", 2_000) : undefined
    if (authType === "password" && !encryptedPassword) throw new Error("SSH password is required")
    const profile: StoredSshWorkspaceProfile = {
      id,
      name: requiredString(input.name, "Workspace profile name", 100),
      type: "ssh",
      host: requiredString(input.host, "SSH host", 255),
      port: integer(input.port, "SSH port", 1, 65_535, 22),
      username: requiredString(input.username, "SSH username", 255),
      remoteDirectory: normalizeRemoteDirectory(requiredString(input.remoteDirectory, "Remote directory", 4_096)),
      operatingSystem: parseOperatingSystem(input.operatingSystem),
      authType,
      keyPath,
      hostFingerprint: optionalString(input.hostFingerprint, 512),
      encryptedPassword,
      encryptedPassphrase,
      sudoPermission: parseSudoPermission(input.sudoPermission),
      encryptedSudoPassword,
      createdAt: current?.createdAt ?? now,
      updatedAt: now,
    }
    this.document.workspaces = [...this.document.workspaces.filter((item) => item.id !== id), profile]
    await this.persist()
    return this.publicWorkspace(profile) as SshWorkspaceProfile
  }

  async activateWorkspace(id: string): Promise<WorkspaceProfile> {
    const profile = this.document.workspaces.find((item) => item.id === id)
    if (!profile) throw new Error("Workspace profile not found")
    this.document.activeWorkspaceProfileId = id
    await this.persist()
    return this.publicWorkspace(profile)
  }

  async deleteWorkspace(id: string): Promise<void> {
    this.document.workspaces = this.document.workspaces.filter((item) => item.id !== id)
    if (this.document.activeWorkspaceProfileId === id) this.document.activeWorkspaceProfileId = undefined
    await this.persist()
  }

  async resolveSshById(id: string): Promise<ResolvedSshWorkspaceProfile> {
    const profile = this.document.workspaces.find((item) => item.id === id)
    if (!profile || profile.type !== "ssh") throw new Error("SSH workspace profile not found")
    return await this.resolveSsh(profile)
  }

  private publicWorkspace(profile: StoredWorkspaceProfile): WorkspaceProfile {
    if (profile.type === "local") return { ...profile }
    const { encryptedPassword, encryptedPassphrase, encryptedSudoPassword, ...publicFields } = profile
    return {
      ...publicFields,
      operatingSystem: profile.operatingSystem ?? "linux",
      sudoPermission: profile.sudoPermission ?? "ask",
      hasPassword: Boolean(encryptedPassword),
      hasPassphrase: Boolean(encryptedPassphrase),
      hasSudoPassword: Boolean(encryptedSudoPassword),
    }
  }

  private async resolveSsh(profile: StoredSshWorkspaceProfile): Promise<ResolvedSshWorkspaceProfile> {
    const publicProfile = this.publicWorkspace(profile) as SshWorkspaceProfile
    return {
      ...publicProfile,
      password: profile.encryptedPassword ? await this.decrypt(profile.encryptedPassword) : undefined,
      passphrase: profile.encryptedPassphrase ? await this.decrypt(profile.encryptedPassphrase) : undefined,
      sudoPassword: profile.encryptedSudoPassword ? await this.decrypt(profile.encryptedSudoPassword) : undefined,
    }
  }

  private async encryptionKey(): Promise<Buffer> {
    if (this.key) return this.key
    try { this.key = Buffer.from(await readFile(this.keyPath, "utf8"), "base64") }
    catch (error: unknown) {
      if (!isNodeError(error) || error.code !== "ENOENT") throw error
      this.key = randomBytes(32)
      await mkdir(dirname(this.keyPath), { recursive: true })
      await writeFile(this.keyPath, this.key.toString("base64"), { encoding: "utf8", mode: 0o600 })
    }
    if (this.key.length !== 32) throw new Error("Profile encryption key is invalid")
    return this.key
  }

  private async encrypt(value: string): Promise<string> {
    const iv = randomBytes(12)
    const cipher = createCipheriv("aes-256-gcm", await this.encryptionKey(), iv)
    const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()])
    return `v1:${iv.toString("base64")}:${cipher.getAuthTag().toString("base64")}:${encrypted.toString("base64")}`
  }

  private async decrypt(value: string): Promise<string> {
    const [version, iv, tag, encrypted] = value.split(":")
    if (version !== "v1" || !iv || !tag || !encrypted) throw new Error("Encrypted profile secret is invalid")
    const decipher = createDecipheriv("aes-256-gcm", await this.encryptionKey(), Buffer.from(iv, "base64"))
    decipher.setAuthTag(Buffer.from(tag, "base64"))
    return Buffer.concat([decipher.update(Buffer.from(encrypted, "base64")), decipher.final()]).toString("utf8")
  }

  private async persist(): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true })
    await writeFile(this.filePath, `${JSON.stringify(this.document, null, 2)}\n`, { encoding: "utf8", mode: 0o600 })
  }
}

function defaultModelName(settings: ConnectionSettings): string {
  const provider = settings.provider === "claude-code" ? "Claude Code" : settings.provider === "codex" ? "Codex" : settings.provider
  return `${provider} · ${settings.modelId}`
}

function requiredString(value: unknown, label: string, max: number): string {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} is required`)
  if (value.trim().length > max) throw new Error(`${label} is too long`)
  return value.trim()
}

function optionalString(value: unknown, max: number): string | undefined {
  if (value === undefined || value === null || value === "") return undefined
  if (typeof value !== "string" || value.trim().length > max) throw new Error("Invalid optional text value")
  return value.trim()
}

function optionalSecret(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") return undefined
  if (typeof value !== "string" || value.length > 20_000) throw new Error("Invalid SSH secret")
  return value
}

function optionalId(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") return undefined
  if (typeof value !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(value)) throw new Error("Invalid profile id")
  return value
}

function integer(value: unknown, label: string, min: number, max: number, fallback: number): number {
  if (value === undefined || value === null || value === "") return fallback
  const number = typeof value === "string" ? Number(value) : value
  if (!Number.isInteger(number) || Number(number) < min || Number(number) > max) throw new Error(`${label} must be from ${min} to ${max}`)
  return Number(number)
}

function normalizeRemoteDirectory(value: string): string {
  if (!value.startsWith("/")) throw new Error("Remote directory must be an absolute Linux path")
  return value.replace(/\/$/, "") || "/"
}

function parseOperatingSystem(value: unknown): RemoteOperatingSystem {
  if (value === undefined || value === null || value === "") return "linux"
  if (value === "linux" || value === "macos" || value === "unix") return value
  throw new Error("Remote operating system must be linux, macos, or unix")
}

function parseSudoPermission(value: unknown): SudoPermission {
  if (value === undefined || value === null || value === "") return "ask"
  if (value === "disabled" || value === "ask" || value === "allow") return value
  throw new Error("Sudo permission must be disabled, ask, or allow")
}

function makeId(prefix: string): string { return `${prefix}-${Date.now()}-${randomBytes(5).toString("hex")}` }
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null }
function isNodeError(value: unknown): value is NodeJS.ErrnoException { return value instanceof Error && "code" in value }
