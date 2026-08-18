import { ClineCore, getValidOpenAICodexCredentials, loginOpenAICodex, updateMcpSettingsFile, type CoreSessionEvent, type ToolApprovalRequest, type ToolApprovalResult } from "@cline/sdk"
import { execFile } from "node:child_process"
import { truncate } from "node:fs/promises"
import { resolve } from "node:path"
import { createConnection, discoverModels, publicConnection, type CodexCredentials, type ConnectionRequest, type ConnectionSettings } from "./providers.js"
import { AgentSettingsStore, parseMcpServerConnectionFields, type AgentSettingsUpdate, type McpServerSettings, type TemplateInput, type ToolPolicy } from "./stores/agent-settings.js"
import { ConnectionStore } from "./stores/connection-store.js"
import { ProfileStore, type ModelProfile, type SshWorkspaceInput } from "./stores/profile-store.js"
import { createSshTools, testSshWorkspace } from "./workspace/ssh-workspace.js"
import { CompactionStore } from "./stores/compaction-store.js"
import { buildWorkspaceSystemPrompt, createWorkspaceGuardHooks, localPromptVariables, type WorkspacePromptVariables } from "./workspace/workspace-security.js"
import { buildMcpSettingsServers, mcpServerNameForTool, testMcpConnection, type McpTestInput, type McpTestResult } from "./mcp-extension.js"

export type Approval = { id: string; sessionId: string; toolName: string; input: unknown }
export type RuntimeEvent = { type: "text" | "reasoning" | "tool" | "tool_result" | "iteration" | "status" | "usage" | "turn_finished" | "ended" | "approval" | "queue" | "prompt_started" | "session_replaced" | "cline_error"; sessionId: string; data: unknown }
export class SessionNotFoundError extends Error {
  constructor(sessionId: string) {
    super(`Session not found: ${sessionId}`)
    this.name = "SessionNotFoundError"
  }
}
export type ContextUsage = {
  inputTokens: number | null
  contextWindow: number | null
  maxInputTokens: number
  utilizationPercent: number | null
  compactionEnabled: boolean
  compactionTriggerPercent: number
  compactionTriggerTokens: number
  compactionStrategy: "basic" | "agentic"
  preserveRecentTokens: number
  source: "provider" | "override" | "sdk-default"
}
type ApprovalWaiter = { approval: Approval; resolve: (result: ToolApprovalResult) => void }
type QueuedPrompt = { id: string; prompt: string; images: string[]; createdAt: number }
type Listener = (event: RuntimeEvent) => void
type CodexAuthState = {
  status: "idle" | "starting" | "waiting" | "authenticated" | "error"
  url?: string
  message?: string
  email?: string
}
type ClaudeCodeAuthState = {
  status: "authenticated" | "not_authenticated" | "unavailable" | "error"
  message: string
  authMethod?: string
}

export class ClineRuntime {
  private readonly listeners = new Set<Listener>()
  private readonly approvals = new Map<string, ApprovalWaiter>()
  private readonly cline: ClineCore
  private connection: ConnectionSettings | undefined
  private codexCredentials: CodexCredentials | undefined
  private codexLogin: Promise<void> | undefined
  private codexAuth: CodexAuthState = { status: "idle" }
  private readonly agentSettings: AgentSettingsStore
  private readonly latestInputTokens = new Map<string, number>()
  private readonly connectionStore: ConnectionStore
  private readonly profileStore: ProfileStore
  private readonly compactionStore: CompactionStore
  private readonly dataDirectory: string
  private readonly mcpSettingsPath: string
  private readonly mcpToolCache = new Map<string, { signature: string; toolNames: string[] }>()
  private readonly promptQueues = new Map<string, QueuedPrompt[]>()
  private readonly runningSessions = new Set<string>()
  private readonly queueWorkers = new Set<string>()
  private settingsGeneration = 0
  private readonly sessionSettingsGeneration = new Map<string, number>()

  private constructor(cline: ClineCore, initialWorkspace: string, allowedRoot: string) {
    this.cline = cline
    const dataDirectory = process.env.CLINE_DATA_DIR ?? resolve(process.cwd(), ".cline-data")
    this.dataDirectory = dataDirectory
    this.agentSettings = new AgentSettingsStore(initialWorkspace, allowedRoot, resolve(dataDirectory, "agent-settings.json"))
    this.connectionStore = new ConnectionStore(resolve(dataDirectory, "connection.json"))
    this.profileStore = new ProfileStore(resolve(dataDirectory, "profiles.json"), resolve(dataDirectory, "profiles.key"))
    this.compactionStore = new CompactionStore(resolve(dataDirectory, "compactions.json"))
    // ClineCore only ever loads MCP tools from this settings file (see the
    // note atop mcp-extension.ts) — kept inside our own data dir instead of
    // ClineCore's global default (~/.cline/data/settings/) so it travels with
    // the rest of this app's state and doesn't leak into other CLI usage.
    this.mcpSettingsPath = resolve(dataDirectory, "mcp-settings.json")
    process.env.CLINE_MCP_SETTINGS_PATH = this.mcpSettingsPath
    this.cline.subscribe((event: CoreSessionEvent) => this.handleEvent(event))
  }

  static async create(initialWorkspace: string, allowedRoot: string): Promise<ClineRuntime> {
    let runtime: ClineRuntime | undefined
    const cline = await ClineCore.create({
      clientName: "cline-for-web",
      backendMode: "local",
      capabilities: {
        requestToolApproval: async (request: ToolApprovalRequest): Promise<ToolApprovalResult> => {
          if (!runtime) throw new Error("Runtime is not initialized")
          const currentDecision = runtime.currentApprovalDecision(request.toolName)
          if (currentDecision !== undefined) return { approved: currentDecision }
          const approval: Approval = {
            id: `approval-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            sessionId: request.sessionId,
            toolName: request.toolName,
            input: request.input,
          }
          return await new Promise<{ approved: boolean }>((resolve) => {
            runtime?.addApproval({ approval, resolve })
          })
        },
      },
    })
    runtime = new ClineRuntime(cline, initialWorkspace, allowedRoot)
    await runtime.agentSettings.load().catch((error: unknown) => console.warn(`Saved agent settings could not be restored: ${errorMessage(error)}`))
    await runtime.profileStore.load()
    await runtime.compactionStore.load()
    await runtime.restoreConnection()
    if (runtime.connection) await runtime.profileStore.ensureModel(runtime.connection)
    await runtime.profileStore.ensureLocalWorkspace("Local workspace", initialWorkspace)
    const activeWorkspace = runtime.profileStore.activeWorkspace()
    if (activeWorkspace?.type === "local") await runtime.agentSettings.update({ workspacePath: activeWorkspace.path })
    return runtime
  }

  subscribe(listener: Listener): () => void { this.listeners.add(listener); return () => this.listeners.delete(listener) }
  async list() {
    const sessions = await this.cline.list(200) as Array<{ sessionId: string; metadata?: unknown } & Record<string, unknown>>
    const superseded = new Set<string>()
    for (const session of sessions) {
      const continuedFrom = isRecord(session.metadata) ? session.metadata.continuedFrom : undefined
      if (typeof continuedFrom === "string") superseded.add(continuedFrom)
    }
    return sessions.filter((session) => !superseded.has(session.sessionId)).slice(0, 50)
  }
  async session(sessionId: string) {
    const session = await this.cline.get(sessionId)
    if (!session) throw new SessionNotFoundError(sessionId)
    const usage = await this.cline.getAccumulatedUsage(sessionId).catch(() => null)
    const messages = await this.cline.readMessages(sessionId).catch(() => [])
    const persistedInput = findLatestRequestInputTokens(messages)
    const compactions = this.compactionStore.list(sessionId)
    return { session, usage, context: this.contextUsage(this.latestInputTokens.get(sessionId) ?? persistedInput), compactions, lastCompaction: compactions.at(-1) ?? null }
  }
  async messages(sessionId: string) {
    const messages = await this.cline.readMessages(sessionId).catch(() => [])
    if (messages.length > 0) return messages
    const session = await this.cline.get(sessionId)
    const continuedFrom = isRecord(session?.metadata) ? session.metadata.continuedFrom : undefined
    return typeof continuedFrom === "string" ? await this.cline.readMessages(continuedFrom).catch(() => []) : messages
  }
  pendingPrompts(sessionId: string) {
    return (this.promptQueues.get(sessionId) ?? []).map(({ images, ...item }) => ({ ...item, imageCount: images.length }))
  }
  updatePendingPrompt(sessionId: string, promptId: string, prompt: unknown): QueuedPrompt | undefined {
    if (typeof prompt !== "string" || !prompt.trim()) throw new Error("Prompt is required")
    const queue = this.promptQueues.get(sessionId)
    const index = queue?.findIndex((item) => item.id === promptId) ?? -1
    if (!queue || index < 0) return undefined
    const current = queue[index]
    if (!current) return undefined
    const updated = { ...current, prompt: prompt.trim() }
    queue[index] = updated
    this.emitQueue(sessionId)
    return { ...updated }
  }
  deletePendingPrompt(sessionId: string, promptId: string): boolean {
    const queue = this.promptQueues.get(sessionId)
    const index = queue?.findIndex((item) => item.id === promptId) ?? -1
    if (!queue || index < 0) return false
    queue.splice(index, 1)
    if (queue.length === 0) this.promptQueues.delete(sessionId)
    this.emitQueue(sessionId)
    return true
  }
  async rename(sessionId: string, title: unknown): Promise<void> {
    if (typeof title !== "string" || !title.trim()) throw new Error("Session title is required")
    if (title.trim().length > 120) throw new Error("Session title must be 120 characters or fewer")
    await this.cline.update(sessionId, { title: title.trim() })
  }
  async delete(sessionId: string): Promise<void> {
    this.clearPromptQueue(sessionId)
    await this.cline.delete(sessionId)
    await this.compactionStore.delete(sessionId)
  }
  async deleteAll(): Promise<{ deleted: number; failed: string[] }> {
    const sessions = await this.cline.list(1_000)
    const failed: string[] = []
    let deleted = 0
    for (const session of sessions) {
      try { await this.delete(session.sessionId); deleted++ }
      catch { failed.push(session.sessionId) }
    }
    // The SDK's own hook/audit log (logs/hooks.jsonl) is append-only and
    // never pruned when a session is deleted, so it keeps referencing
    // long-gone sessions and grows without bound. "Delete all" is the one
    // point where clearing it is unambiguously safe.
    await truncate(resolve(this.dataDirectory, "logs", "hooks.jsonl"), 0).catch(() => {})
    return { deleted, failed }
  }
  agentSettingsInfo() { return this.agentSettings.get() }
  async createPromptTemplate(input: TemplateInput) {
    const template = await this.agentSettings.createTemplate(input)
    this.settingsGeneration++
    return template
  }
  async updatePromptTemplate(id: string, input: TemplateInput) {
    const template = await this.agentSettings.updateTemplate(id, input)
    this.settingsGeneration++
    return template
  }
  async deletePromptTemplate(id: string) {
    await this.agentSettings.deleteTemplate(id)
    this.settingsGeneration++
  }
  async resetPromptTemplate(id: string) {
    const template = await this.agentSettings.resetTemplate(id)
    this.settingsGeneration++
    return template
  }
  /** Actually connects (spawns the stdio process, or hits the SSE/HTTP URL) using
   * whatever is currently in the form, before it's ever saved — the same
   * "test before you trust it" pattern as the SSH workspace test button. */
  async testMcpServer(input: unknown, signal?: AbortSignal): Promise<McpTestResult> {
    if (!isRecord(input)) throw new Error("MCP server config must be an object")
    const fields: McpTestInput = parseMcpServerConnectionFields(input, "This MCP server")
    return await testMcpConnection(fields, 10_000, signal)
  }
  async previewSystemPrompt(template: unknown) {
    const settings = this.agentSettings.get()
    const source = typeof template === "string" && template.trim() ? template : this.agentSettings.effectiveSystemPrompt()
    const activeWorkspace = this.profileStore.activeWorkspace()
    const sshWorkspace = activeWorkspace?.type === "ssh" ? await this.profileStore.resolvedActiveSshWorkspace() : undefined
    const variables: WorkspacePromptVariables = sshWorkspace ? {
      user: sshWorkspace.username,
      workspace: sshWorkspace.remoteDirectory,
      workspaceName: sshWorkspace.name,
      workspaceType: "ssh",
      os: sshWorkspace.operatingSystem,
      host: sshWorkspace.host,
    } : localPromptVariables(settings.workspacePath, activeWorkspace?.name)
    return {
      variables,
      model: this.connection ? { provider: this.connection.provider, modelId: this.connection.modelId } : null,
      workspace: this.workspaceDisplay(),
      preview: buildWorkspaceSystemPrompt(`${source}${shellIdlePrompt(settings)}`, variables),
    }
  }
  async updateAgentSettings(input: AgentSettingsUpdate) {
    const settings = await this.agentSettings.update(input)
    this.settingsGeneration++
    const activeWorkspace = this.profileStore.activeWorkspace()
    if (input.workspacePath !== undefined && activeWorkspace?.type === "local") {
      await this.profileStore.saveLocalWorkspace({ id: activeWorkspace.id, name: activeWorkspace.name, path: settings.workspacePath })
      await this.profileStore.activateWorkspace(activeWorkspace.id)
    }
    return settings
  }
  connectionInfo() { return publicConnection(this.connection) }
  contextInfo() { return this.contextUsage() }
  codexAuthInfo(): CodexAuthState { return { ...this.codexAuth, url: this.codexAuth.status === "waiting" ? this.codexAuth.url : undefined } }
  async claudeCodeAuthInfo(): Promise<ClaudeCodeAuthState> {
    return await new Promise((resolve) => {
      execFile("claude", ["auth", "status"], { timeout: 10_000, windowsHide: true }, (error, stdout, stderr) => {
        const output = stdout.trim()
        if (output) {
          try {
            const status = JSON.parse(output) as { loggedIn?: unknown; authMethod?: unknown }
            if (status.loggedIn === true) {
              resolve({ status: "authenticated", message: "Claude Code is signed in.", authMethod: typeof status.authMethod === "string" ? status.authMethod : undefined })
              return
            }
            resolve({ status: "not_authenticated", message: "Claude Code is not signed in. Run: claude auth login" })
            return
          } catch { /* Report the CLI output below. */ }
        }
        const code = isRecord(error) ? error.code : undefined
        if (code === "ENOENT") resolve({ status: "unavailable", message: "Claude Code CLI was not found. Install it, then run: claude auth login" })
        else resolve({ status: "error", message: stderr.trim() || output || (error instanceof Error ? error.message : "Claude Code status check failed") })
      })
    })
  }
  async discover(input: ConnectionRequest) { return await discoverModels(input) }
  profilesInfo() { return this.profileStore.list() }
  activeWorkspaceInfo() { return this.profileStore.activeWorkspace() }

  async configure(input: ConnectionRequest & { profileName?: unknown; profileId?: unknown }) {
    const connection = await createConnection(input, this.codexCredentials)
    await this.connectionStore.save(connection)
    this.connection = connection
    if (input.profileName !== undefined || input.profileId !== undefined) {
      await this.profileStore.saveModel({ id: input.profileId, name: input.profileName, settings: connection })
    } else {
      await this.profileStore.ensureModel(connection)
    }
    this.settingsGeneration++
    return this.connectionInfo()
  }

  async activateModelProfile(id: string) {
    const profile = this.profileStore.model(id)
    if (!profile) throw new Error("Model profile not found")
    if (profile.provider === "claude-code") {
      const auth = await this.claudeCodeAuthInfo()
      if (auth.status !== "authenticated") throw new Error(auth.message)
    }
    const connection = this.connectionFromProfile(profile)
    await this.connectionStore.save(connection)
    this.connection = connection
    await this.profileStore.activateModel(id)
    this.settingsGeneration++
    return { connection: this.connectionInfo(), profiles: this.profilesInfo() }
  }

  async updateModelProfile(id: string, patch: { name?: unknown; timeoutMs?: unknown; imagesEnabled?: unknown; baseUrl?: unknown; modelId?: unknown }) {
    const current = this.profileStore.model(id)
    if (!current) throw new Error("Model profile not found")
    const changingConnection = patch.baseUrl !== undefined || patch.modelId !== undefined
    let profile: ModelProfile
    if (changingConnection) {
      // The URL/model are the profile's whole reason for existing, so an edit
      // to either one is re-verified the same way the initial connect is —
      // via createConnection() — instead of trusting arbitrary saved text.
      if (current.provider === "claude-code") {
        const auth = await this.claudeCodeAuthInfo()
        if (auth.status !== "authenticated") throw new Error(auth.message)
      }
      const timeoutMs = patch.timeoutMs !== undefined ? patch.timeoutMs : current.timeoutMs
      const imagesEnabled = patch.imagesEnabled !== undefined ? patch.imagesEnabled : current.imagesEnabled
      const request: ConnectionRequest = {
        provider: current.provider,
        baseUrl: typeof patch.baseUrl === "string" && patch.baseUrl.trim() ? patch.baseUrl : current.baseUrl,
        modelId: typeof patch.modelId === "string" && patch.modelId.trim() ? patch.modelId : current.modelId,
        timeoutMs,
        imagesEnabled,
      }
      const connection = await createConnection(request, this.codexCredentials)
      profile = await this.profileStore.updateModel(id, {
        name: patch.name,
        timeoutMs: connection.timeoutMs,
        imagesEnabled: connection.imagesEnabled,
        baseUrl: connection.baseUrl,
        modelId: connection.modelId,
        modelInfo: connection.modelInfo,
      })
    } else {
      profile = await this.profileStore.updateModel(id, patch)
    }
    if (this.profileStore.list().activeModelProfileId === id) {
      const connection = this.connectionFromProfile(profile)
      await this.connectionStore.save(connection)
      this.connection = connection
      this.settingsGeneration++
    }
    return { profile, profiles: this.profilesInfo() }
  }

  private connectionFromProfile(profile: ModelProfile): ConnectionSettings {
    if (profile.provider === "codex") {
      if (!this.codexCredentials) throw new Error("Sign in with ChatGPT before activating this profile")
      return {
        provider: "codex", providerId: "openai-codex", baseUrl: profile.baseUrl, modelId: profile.modelId,
        apiKey: this.codexCredentials.access, codexCredentials: this.codexCredentials, modelInfo: profile.modelInfo,
        timeoutMs: profile.timeoutMs, imagesEnabled: profile.imagesEnabled === true,
      }
    }
    if (profile.provider === "claude-code") {
      return { provider: "claude-code", providerId: "claude-code", baseUrl: "", modelId: profile.modelId, modelInfo: profile.modelInfo, timeoutMs: profile.timeoutMs, imagesEnabled: profile.imagesEnabled === true }
    }
    const providerId = profile.provider === "lmstudio" ? "lmstudio" : profile.provider === "ollama" ? "ollama" : "openai-compatible"
    return {
      provider: profile.provider, providerId, baseUrl: profile.baseUrl, modelId: profile.modelId,
      apiKey: "local-model", modelInfo: profile.modelInfo, timeoutMs: profile.timeoutMs, imagesEnabled: profile.imagesEnabled === true,
    }
  }

  async deleteModelProfile(id: string): Promise<void> {
    const wasActive = this.profileStore.list().activeModelProfileId === id
    await this.profileStore.deleteModel(id)
    if (wasActive) {
      this.connection = undefined
      await this.connectionStore.clear()
    }
  }

  async saveWorkspaceProfile(input: Record<string, unknown>) {
    if (input.type === "local") {
      const updated = await this.agentSettings.update({ workspacePath: input.path })
      const profile = await this.profileStore.saveLocalWorkspace({ id: input.id, name: input.name, path: updated.workspacePath })
      await this.profileStore.activateWorkspace(profile.id)
      this.settingsGeneration++
      return { profile, profiles: this.profilesInfo() }
    }
    if (input.type === "ssh") {
      const profile = await this.profileStore.saveSshWorkspace(input as SshWorkspaceInput)
      const test = await testSshWorkspace(await this.profileStore.resolveSshById(profile.id))
      await this.profileStore.activateWorkspace(profile.id)
      this.settingsGeneration++
      return { profile, test, profiles: this.profilesInfo() }
    }
    throw new Error("Workspace type must be local or ssh")
  }

  async activateWorkspaceProfile(id: string) {
    const profile = this.profileStore.list().workspaces.find((item) => item.id === id)
    if (!profile) throw new Error("Workspace profile not found")
    let test: Awaited<ReturnType<typeof testSshWorkspace>> | undefined
    if (profile.type === "local") await this.agentSettings.update({ workspacePath: profile.path })
    else test = await testSshWorkspace(await this.profileStore.resolveSshById(id))
    const active = await this.profileStore.activateWorkspace(id)
    this.settingsGeneration++
    return { profile: active, test, profiles: this.profilesInfo() }
  }

  async testWorkspaceProfile(id: string) {
    return await testSshWorkspace(await this.profileStore.resolveSshById(id))
  }

  async deleteWorkspaceProfile(id: string): Promise<void> {
    if (this.profileStore.list().activeWorkspaceProfileId === id) throw new Error("Switch to another workspace before deleting the active profile")
    await this.profileStore.deleteWorkspace(id)
  }

  private async restoreConnection(): Promise<void> {
    try {
      const saved = await this.connectionStore.load()
      if (!saved) return
      if (saved.provider === "claude-code") {
        const auth = await this.claudeCodeAuthInfo()
        if (auth.status !== "authenticated") return
      }
      this.connection = saved
    } catch (error: unknown) {
      console.warn(`Saved AI connection could not be restored: ${errorMessage(error)}`)
    }
  }

  async beginCodexLogin(): Promise<CodexAuthState> {
    if (this.codexCredentials) return this.codexAuthInfo()
    if (this.codexLogin) return this.codexAuthInfo()

    this.codexAuth = { status: "starting", message: "Starting ChatGPT sign-in..." }
    let markReady = () => {}
    const ready = new Promise<void>((resolve) => { markReady = resolve })
    this.codexLogin = loginOpenAICodex({
      originator: "cline-for-web",
      onAuth: ({ url, instructions }: { url: string; instructions?: string }) => {
        this.codexAuth = { status: "waiting", url, message: instructions ?? "Complete sign-in in the opened browser window." }
        markReady()
      },
      onProgress: (message: string) => { this.codexAuth = { ...this.codexAuth, message } },
      onPrompt: async (prompt: { message: string; defaultValue?: string }) => { throw new Error(`Manual OAuth input is not supported: ${prompt.message}`) },
    }).then((credentials: CodexCredentials) => {
      this.codexCredentials = credentials
      this.codexAuth = { status: "authenticated", message: "Signed in with ChatGPT.", email: credentials.email }
    }).catch((error: unknown) => {
      this.codexAuth = { status: "error", message: errorMessage(error) }
    }).finally(() => { this.codexLogin = undefined })

    await Promise.race([ready, this.codexLogin])
    return this.codexAuthInfo()
  }

  async start(prompt: string | undefined, userImages?: unknown): Promise<string> {
    try {
      const config = await this.config()
      if (!this.connection) throw new Error("AI provider is not configured")
      const images = validateUserImages(userImages, this.connection.imagesEnabled === true)
      const result = await this.cline.start({
        prompt,
        userImages: images.length ? images : undefined,
        interactive: true,
        config,
        toolPolicies: config.toolPolicies,
        sessionMetadata: this.sessionMetadata(undefined, config.systemPrompt),
      })
      this.sessionSettingsGeneration.set(result.sessionId, this.settingsGeneration)
      return result.sessionId
    } catch (error: unknown) {
      this.emit({ type: "cline_error", sessionId: "unknown", data: errorMessage(error) })
      throw error
    }
  }

  async send(sessionId: string, prompt: string, userImages?: unknown): Promise<string> {
    if (!this.runningSessions.has(sessionId)) sessionId = await this.refreshSessionSettings(sessionId)
    if (!this.connection) throw new Error("AI provider is not configured")
    const images = validateUserImages(userImages, this.connection.imagesEnabled === true)
    const queue = this.promptQueues.get(sessionId) ?? []
    queue.push({ id: `queue-${Date.now()}-${Math.random().toString(36).slice(2)}`, prompt, images, createdAt: Date.now() })
    this.promptQueues.set(sessionId, queue)
    this.emitQueue(sessionId)
    void this.drainPromptQueue(sessionId)
    return sessionId
  }
  async abort(sessionId: string): Promise<void> {
    // Only stop the turn in flight — queued prompts (including a force-sent
    // message someone just queued to escape a stall) must survive and still
    // get drained once the running turn actually finishes aborting.
    await this.cline.abort(sessionId, "Stopped from web UI")
  }
  async dispose(): Promise<void> { await this.cline.dispose("Server shutting down") }
  pendingApprovals(): Approval[] { return [...this.approvals.values()].map(({ approval }) => approval) }

  approve(id: string, approved: boolean): boolean {
    const waiter = this.approvals.get(id)
    if (!waiter) return false
    this.approvals.delete(id)
    waiter.resolve({ approved })
    return true
  }

  private currentApprovalDecision(toolName: string): boolean | undefined {
    const permissionKey = ({
      ssh_read_files: "read_files",
      ssh_search_files: "search_codebase",
      ssh_run_commands: "run_commands",
      ssh_write_file: "editor",
    } as const)[toolName as "ssh_read_files" | "ssh_search_files" | "ssh_run_commands" | "ssh_write_file"] ?? toolName
    const permissions = this.agentSettings.effectivePermissions() as Record<string, "disabled" | "ask" | "allow">
    const permission = permissions[permissionKey]
    if (permission === "allow") return true
    if (permission === "disabled") return false
    if (toolName === "ssh_run_sudo_commands") {
      const workspace = this.profileStore.activeWorkspace()
      if (workspace?.type !== "ssh" || workspace.sudoPermission === "disabled") return false
      if (workspace.sudoPermission === "allow") return true
    }
    const mcpServerName = mcpServerNameForTool(toolName)
    if (mcpServerName) {
      const server = this.agentSettings.get().mcpServers.find((item) => item.name === mcpServerName && item.enabled)
      if (server?.autoApprove) return true
    }
    return undefined
  }

  private addApproval(waiter: ApprovalWaiter): void {
    this.approvals.set(waiter.approval.id, waiter)
    this.emit({ type: "approval", sessionId: waiter.approval.sessionId, data: waiter.approval })
  }

  private emitQueue(sessionId: string): void {
    this.emit({ type: "queue", sessionId, data: { prompts: this.pendingPrompts(sessionId) } })
  }

  private clearPromptQueue(sessionId: string): void {
    this.promptQueues.delete(sessionId)
    this.emitQueue(sessionId)
  }

  private async drainPromptQueue(sessionId: string): Promise<void> {
    if (this.runningSessions.has(sessionId) || this.queueWorkers.has(sessionId)) return
    this.queueWorkers.add(sessionId)
    try {
      while (!this.runningSessions.has(sessionId)) {
        const queue = this.promptQueues.get(sessionId)
        if (!queue?.length) {
          this.promptQueues.delete(sessionId)
          this.emitQueue(sessionId)
          break
        }

        // Settings may change while another queued prompt is running. Check
        // immediately before every prompt so all waiting prompts use the
        // latest agent configuration.
        const replacement = await this.refreshSessionSettings(sessionId)
        if (replacement !== sessionId) {
          this.promptQueues.delete(sessionId)
          this.promptQueues.set(replacement, [...(this.promptQueues.get(replacement) ?? []), ...queue])
          this.emitQueue(sessionId)
          this.emitQueue(replacement)
          void this.drainPromptQueue(replacement)
          return
        }

        const next = queue.shift()
        if (!next) continue
        this.emitQueue(sessionId)
        this.runningSessions.add(sessionId)
        this.emit({ type: "prompt_started", sessionId, data: { ...next, imageCount: next.images.length } })
        try {
          await this.cline.send({ sessionId, prompt: next.prompt, userImages: next.images.length ? next.images : undefined })
        } catch (error: unknown) {
          this.emit({ type: "cline_error", sessionId, data: errorMessage(error) })
        } finally {
          this.runningSessions.delete(sessionId)
        }
      }
    } finally {
      this.queueWorkers.delete(sessionId)
      if (!this.runningSessions.has(sessionId) && (this.promptQueues.get(sessionId)?.length ?? 0) > 0) void this.drainPromptQueue(sessionId)
    }
  }

  private async refreshSessionSettings(sessionId: string): Promise<string> {
    const knownToCurrentRuntime = this.sessionSettingsGeneration.has(sessionId)
    const applied = this.sessionSettingsGeneration.get(sessionId) ?? 0
    const previous = await this.cline.get(sessionId)
    if (!previous) throw new Error(`Session not found: ${sessionId}`)
    const active = previous.status === "running" || previous.status === "idle" || previous.status === "pending"
    if (knownToCurrentRuntime && applied === this.settingsGeneration && active) return sessionId
    const messages = await this.cline.readMessages(sessionId)
    const config = await this.config()
    if (!this.connection) throw new Error("AI provider is not configured")
    const result = await this.cline.start({
      interactive: true,
      config,
      toolPolicies: config.toolPolicies,
      initialMessages: messages,
      sessionMetadata: this.sessionMetadata(sessionId, config.systemPrompt),
    })
    this.sessionSettingsGeneration.set(result.sessionId, this.settingsGeneration)
    // cline.start() fires its own transient "running" status event for the
    // freshly (re)started session even though it's just idly holding replayed
    // history and hasn't been given a prompt yet — our status handler adds
    // any "running" id to runningSessions, which would otherwise make the
    // queue-drainer's very next re-entry guard think a real turn is already
    // in flight and skip draining forever. Nothing is actually running here.
    this.runningSessions.delete(result.sessionId)
    const title = previous.metadata?.title ?? previous.title
    if (typeof title === "string" && title) await this.cline.update(result.sessionId, { title }).catch(() => {})
    await this.compactionStore.copy(sessionId, result.sessionId)
    this.emit({ type: "session_replaced", sessionId, data: { sessionId: result.sessionId } })
    return result.sessionId
  }

  /** Keeps cline_mcp_settings.json in step with the saved MCP server list right
   * before every session start/send — see the note atop mcp-extension.ts for
   * why this file, not AgentPlugin.registerMcpServer(), is what actually wires
   * MCP tools into the model. Failure here degrades to "no MCP tools this
   * turn" rather than blocking the turn outright. */
  private async syncMcpSettingsFile(servers: McpServerSettings[]): Promise<void> {
    try {
      await updateMcpSettingsFile(this.mcpSettingsPath, (raw: Record<string, unknown>) => {
        const current = isRecord(raw.mcpServers) ? raw.mcpServers as Record<string, unknown> : {}
        raw.mcpServers = buildMcpSettingsServers(servers, current)
        return raw
      })
    } catch (error: unknown) {
      console.error(`Failed to sync MCP settings file: ${errorMessage(error)}`)
    }
  }

  /** MCP tool names not present in `toolPolicies` bypass approval entirely by
   * default (verified: a real tool call went through with no approval event,
   * even with autoApprove off) — ClineCore's approval gate only ever engages
   * for tools it has an explicit policy for. Since the exact `<server>__<tool>`
   * names aren't known until a server is actually connected, this discovers
   * them the same way the "test connection" button does and caches the result
   * per server config, so a normal turn only pays the connect cost once. */
  private async resolveMcpToolPolicies(servers: McpServerSettings[]): Promise<Record<string, ToolPolicy>> {
    const policies: Record<string, ToolPolicy> = {}
    const seen = new Set<string>()
    for (const server of servers) {
      if (!server.enabled) continue
      seen.add(server.id)
      const signature = JSON.stringify({ transport: server.transport, command: server.command, args: server.args, url: server.url })
      let cached = this.mcpToolCache.get(server.id)
      if (!cached || cached.signature !== signature) {
        const result = await testMcpConnection({ transport: server.transport, command: server.command, args: server.args, url: server.url }, 8_000)
        cached = { signature, toolNames: result.ok ? result.tools.map((tool) => tool.name) : [] }
        this.mcpToolCache.set(server.id, cached)
      }
      for (const toolName of cached.toolNames) policies[`${server.name}__${toolName}`] = { enabled: !server.disabledTools.includes(toolName), autoApprove: server.autoApprove }
    }
    for (const id of [...this.mcpToolCache.keys()]) if (!seen.has(id)) this.mcpToolCache.delete(id)
    return policies
  }

  private async config() {
    if (!this.connection) throw new Error("AI provider is not configured")
    if (this.connection.provider === "codex") {
      const credentials = await getValidOpenAICodexCredentials(this.codexCredentials ?? null)
      if (!credentials) {
        this.codexCredentials = undefined
        this.connection = undefined
        this.codexAuth = { status: "idle", message: "ChatGPT sign-in expired. Sign in again." }
        throw new Error("ChatGPT sign-in expired. Sign in again.")
      }
      this.codexCredentials = credentials
      this.connection = { ...this.connection, apiKey: credentials.access, codexCredentials: credentials }
    }

    const codexCredentials = this.connection.codexCredentials
    const settings = this.agentSettings.get()
    const effectivePermissions = this.agentSettings.effectivePermissions()
    const activeWorkspace = this.profileStore.activeWorkspace()
    const sshWorkspace = activeWorkspace?.type === "ssh" ? await this.profileStore.resolvedActiveSshWorkspace() : undefined
    const toolPolicies: Record<string, { enabled?: boolean; autoApprove?: boolean }> = this.agentSettings.policies()
    if (sshWorkspace) {
      for (const tool of ["read_files", "search_codebase", "run_commands", "editor", "apply_patch"]) {
        toolPolicies[tool] = { enabled: false, autoApprove: false }
      }
      toolPolicies.ssh_read_files = permissionPolicy(effectivePermissions.read_files)
      toolPolicies.ssh_search_files = permissionPolicy(effectivePermissions.search_codebase)
      toolPolicies.ssh_run_commands = permissionPolicy(effectivePermissions.run_commands)
      toolPolicies.ssh_write_file = permissionPolicy(effectivePermissions.editor)
      toolPolicies.ssh_run_sudo_commands = permissionPolicy(sshWorkspace.sudoPermission)
    }
    if (settings.mcpEnabled) Object.assign(toolPolicies, await this.resolveMcpToolPolicies(settings.mcpServers))
    const modelInfo = this.effectiveModelInfo()
    const sshPrompt = sshWorkspace ? [
      "",
      "The active workspace is a remote Linux workspace over SSH.",
      `Target: ${sshWorkspace.username}@${sshWorkspace.host}:${sshWorkspace.port}`,
      `Configured remote OS: ${sshWorkspace.operatingSystem}`,
      `Remote workspace root: ${sshWorkspace.remoteDirectory}`,
      "Use the available ssh_* tools instead of local file or command tools for workspace operations.",
      sshWorkspace.operatingSystem === "linux" && sshWorkspace.sudoPermission !== "disabled"
        ? "For commands requiring sudo, use ssh_run_sudo_commands without adding a sudo prefix. Never try sudo through ssh_run_commands."
        : "Do not use sudo or other privilege escalation commands.",
      "Never use local file or command tools for this task. Keep all paths inside the remote workspace root.",
    ].join("\n") : ""
    const promptVariables: WorkspacePromptVariables = sshWorkspace ? {
      user: sshWorkspace.username,
      workspace: sshWorkspace.remoteDirectory,
      workspaceName: sshWorkspace.name,
      workspaceType: "ssh",
      os: sshWorkspace.operatingSystem,
      host: sshWorkspace.host,
    } : localPromptVariables(settings.workspacePath, activeWorkspace?.name)
    const guardedWorkspace = sshWorkspace?.remoteDirectory ?? settings.workspacePath
    const systemPrompt = buildWorkspaceSystemPrompt(`${this.agentSettings.effectiveSystemPrompt()}${shellIdlePrompt(settings)}${sshPrompt}`, promptVariables)
    await this.syncMcpSettingsFile(settings.mcpServers)
    return {
      providerId: this.connection.providerId,
      modelId: this.connection.modelId,
      apiKey: this.connection.apiKey,
      baseUrl: this.connection.baseUrl,
      providerConfig: codexCredentials || this.connection.timeoutMs ? {
        providerId: this.connection.providerId,
        modelId: this.connection.modelId,
        baseUrl: this.connection.baseUrl,
        apiKey: this.connection.apiKey,
        timeoutMs: this.connection.timeoutMs,
        ...(codexCredentials ? {
          accessToken: codexCredentials.access,
          refreshToken: codexCredentials.refresh,
          accountId: codexCredentials.accountId,
        } : {}),
      } : undefined,
      knownModels: { [this.connection.modelId]: modelInfo },
      cwd: settings.workspacePath, workspaceRoot: settings.workspacePath,
      systemPrompt,
      maxIterations: settings.maxIterations,
      thinking: true,
      enableTools: true, enableSpawnAgent: false, enableAgentTeams: false,
      toolPolicies,
      extraTools: sshWorkspace ? createSshTools(sshWorkspace) : undefined,
      hooks: createWorkspaceGuardHooks(guardedWorkspace, sshWorkspace ? "posix" : undefined),
      disableMcpSettingsTools: !settings.mcpEnabled,
      compaction: {
        enabled: settings.compactionEnabled,
        strategy: settings.compactionStrategy,
        preserveRecentTokens: this.effectivePreserveRecentTokens(),
      },
    }
  }

  private workspaceDisplay(): string {
    const workspace = this.profileStore.activeWorkspace()
    if (!workspace) return this.agentSettings.get().workspacePath
    return workspace.type === "local" ? workspace.path : `${workspace.username}@${workspace.host}:${workspace.remoteDirectory}`
  }

  private sessionMetadata(continuedFrom?: string, effectiveSystemPrompt?: string): Record<string, unknown> {
    if (!this.connection) throw new Error("AI provider is not configured")
    const settings = this.agentSettings.get()
    const profiles = this.profileStore.list()
    const modelProfile = profiles.models.find((profile) => profile.id === profiles.activeModelProfileId)
    const workspaceProfile = this.profileStore.activeWorkspace()
    const activeTemplate = this.agentSettings.effectiveTemplate()
    const modePermissions = activeTemplate.permissions
    const modePermissionPreset = activeTemplate.permissionPreset
    const effectivePermissions: Record<string, string> = { ...modePermissions }
    if (workspaceProfile?.type === "ssh") {
      effectivePermissions.read_files = "disabled"
      effectivePermissions.search_codebase = "disabled"
      effectivePermissions.run_commands = "disabled"
      effectivePermissions.editor = "disabled"
      effectivePermissions.apply_patch = "disabled"
      effectivePermissions.ssh_read_files = modePermissions.read_files
      effectivePermissions.ssh_search_files = modePermissions.search_codebase
      effectivePermissions.ssh_run_commands = modePermissions.run_commands
      effectivePermissions.ssh_write_file = modePermissions.editor
      effectivePermissions.ssh_run_sudo_commands = workspaceProfile.sudoPermission
    }
    return {
      appProvider: this.connection.provider,
      appModelId: this.connection.modelId,
      modelProfileId: profiles.activeModelProfileId ?? "",
      workspaceProfileId: profiles.activeWorkspaceProfileId ?? "",
      workspace: this.workspaceDisplay(),
      ...(continuedFrom ? { continuedFrom } : {}),
      environmentSnapshot: {
        version: 1,
        capturedAt: new Date().toISOString(),
        model: {
          profileId: profiles.activeModelProfileId ?? null,
          profileName: modelProfile?.name ?? this.connection.modelId,
          provider: this.connection.provider,
          modelId: this.connection.modelId,
        },
        workspace: workspaceProfile ? { ...workspaceProfile, display: this.workspaceDisplay() } : {
          profileId: null,
          name: "Workspace",
          type: "local",
          path: settings.workspacePath,
          display: settings.workspacePath,
        },
        agent: {
          systemPrompt: effectiveSystemPrompt ?? activeTemplate.prompt,
          systemPromptTemplate: activeTemplate.prompt,
          templateId: activeTemplate.id,
          templateName: activeTemplate.name,
          permissionPreset: modePermissionPreset,
          permissions: { ...modePermissions },
          effectivePermissions,
          maxIterations: settings.maxIterations,
          compactionEnabled: settings.compactionEnabled,
          compactionStrategy: settings.compactionStrategy,
          preserveRecentTokens: settings.preserveRecentTokens,
          contextWindowOverride: settings.contextWindowOverride,
          requestTimeoutMs: this.connection.timeoutMs ?? null,
          imagesEnabled: this.connection.imagesEnabled === true,
          imageSupport: this.connection.modelInfo?.imageSupport ?? "unknown",
          shellIdleTimeoutSeconds: settings.shellIdleTimeoutSeconds,
          shellIdleAction: settings.shellIdleAction,
          shellIdleCarryContext: settings.shellIdleCarryContext,
          mcpEnabled: settings.mcpEnabled,
          mcpServers: settings.mcpServers.map(({ name, enabled, transport }) => ({ name, enabled, transport })),
        },
      },
    }
  }

  private effectiveModelInfo() {
    if (!this.connection) throw new Error("AI provider is not configured")
    const detected = this.connection.modelInfo ?? { id: this.connection.modelId, name: this.connection.modelId }
    const capabilities = new Set(Array.isArray(detected.capabilities) ? detected.capabilities : [])
    if (this.connection.imagesEnabled) capabilities.add("images")
    else capabilities.delete("images")
    const effective = { ...detected, capabilities: [...capabilities] }
    const override = this.agentSettings.get().contextWindowOverride
    return override ? { ...effective, contextWindow: override, maxInputTokens: Math.floor(override * 0.9) } : effective
  }

  private contextUsage(inputTokens?: number): ContextUsage {
    const settings = this.agentSettings.get()
    const detected = this.connection?.modelInfo
    const override = settings.contextWindowOverride
    const contextWindow = override ?? detected?.contextWindow ?? null
    const maxInputTokens = override
      ? Math.floor(override * 0.9)
      : detected?.maxInputTokens ?? (contextWindow ? Math.floor(contextWindow * 0.9) : 128_000)
    return {
      inputTokens: inputTokens ?? null,
      contextWindow,
      maxInputTokens,
      utilizationPercent: inputTokens === undefined ? null : Math.round((inputTokens / maxInputTokens) * 10_000) / 100,
      compactionEnabled: settings.compactionEnabled,
      compactionTriggerPercent: 90,
      compactionTriggerTokens: Math.floor(maxInputTokens * 0.9),
      compactionStrategy: settings.compactionStrategy,
      preserveRecentTokens: this.effectivePreserveRecentTokens(maxInputTokens),
      source: override ? "override" : detected?.contextWindow || detected?.maxInputTokens ? "provider" : "sdk-default",
    }
  }

  private effectivePreserveRecentTokens(maxInputTokens?: number): number {
    const configured = this.agentSettings.get().preserveRecentTokens
    if (maxInputTokens === undefined) {
      const model = this.effectiveModelInfo()
      maxInputTokens = model.maxInputTokens ?? (model.contextWindow ? Math.floor(model.contextWindow * 0.9) : 128_000)
    }
    return Math.min(configured, Math.max(1_000, Math.floor(maxInputTokens * 0.5)))
  }

  private handleEvent(event: CoreSessionEvent): void {
    if (event.type === "agent_event") {
      const { sessionId, event: agentEvent } = event.payload
      if (agentEvent.type === "content_start" && agentEvent.contentType === "text") this.emit({ type: "text", sessionId, data: agentEvent.text ?? "" })
      if (agentEvent.type === "content_start" && agentEvent.contentType === "reasoning") this.emit({ type: "reasoning", sessionId, data: { text: agentEvent.reasoning ?? "", redacted: Boolean(agentEvent.redacted) } })
      if (agentEvent.type === "content_start" && agentEvent.contentType === "tool") this.emit({ type: "tool", sessionId, data: { toolCallId: agentEvent.toolCallId, toolName: agentEvent.toolName, input: agentEvent.input } })
      if (agentEvent.type === "content_end" && agentEvent.contentType === "tool") this.emit({ type: "tool_result", sessionId, data: { toolCallId: agentEvent.toolCallId, toolName: agentEvent.toolName, output: agentEvent.output, error: agentEvent.error, durationMs: agentEvent.durationMs } })
      if (agentEvent.type === "iteration_start") this.emit({ type: "iteration", sessionId, data: agentEvent.iteration })
      if (agentEvent.type === "usage") {
        this.latestInputTokens.set(sessionId, agentEvent.inputTokens)
        this.emit({ type: "usage", sessionId, data: { ...this.contextUsage(agentEvent.inputTokens), outputTokens: agentEvent.outputTokens, totalInputTokens: agentEvent.totalInputTokens, totalOutputTokens: agentEvent.totalOutputTokens } })
      }
      if (agentEvent.type === "done") {
        this.markSessionIdle(sessionId)
        this.emit({ type: "turn_finished", sessionId, data: agentEvent })
      }
      if (agentEvent.type === "notice") {
        if (agentEvent.reason === "auto_compaction") {
          void this.compactionStore.record(sessionId, agentEvent.message).then((record) => {
            this.emit({ type: "status", sessionId, data: { reason: agentEvent.reason, ...record, count: this.compactionStore.list(sessionId).length } })
          }).catch((error: unknown) => {
            console.warn(`Compaction event could not be saved: ${errorMessage(error)}`)
            this.emit({ type: "status", sessionId, data: { message: agentEvent.message, reason: agentEvent.reason, at: new Date().toISOString() } })
          })
        } else this.emit({ type: "status", sessionId, data: { message: agentEvent.message, reason: agentEvent.reason } })
      }
      if (agentEvent.type === "error") this.emit({ type: "cline_error", sessionId, data: errorMessage(agentEvent.error) })
    } else if (event.type === "status") {
      const { sessionId, status } = event.payload
      if (status === "running") this.runningSessions.add(sessionId)
      if (status === "idle") this.markSessionIdle(sessionId)
      this.emit({ type: "status", sessionId, data: status })
    }
    else if (event.type === "ended") {
      this.markSessionIdle(event.payload.sessionId)
      this.emit({ type: "ended", sessionId: event.payload.sessionId, data: event.payload.reason })
    }
  }

  private markSessionIdle(sessionId: string): void {
    this.runningSessions.delete(sessionId)
    void this.drainPromptQueue(sessionId)
  }

  private emit(event: RuntimeEvent): void { for (const listener of this.listeners) listener(event) }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function permissionPolicy(permission: "disabled" | "ask" | "allow") {
  return permission === "disabled"
    ? { enabled: false, autoApprove: false }
    : { enabled: true, autoApprove: permission === "allow" }
}

function shellIdlePrompt(settings: ReturnType<AgentSettingsStore["get"]>): string {
  const action = {
    ask: "stop and ask the user which action is safe",
    enter: "send a single Enter key only when the prompt is clearly safe and non-destructive; otherwise ask the user",
    wait: "wait once for more output, then ask the user instead of waiting indefinitely",
    close: "stop/cancel the command and explain why",
    auto: "decide for yourself without asking the user: read the recent shell output, judge whether it is safe, and choose to wait longer, send a single safe key (e.g. Enter), or cancel the command",
  }[settings.shellIdleAction]
  const autoCarryNote = settings.shellIdleAction !== "auto" ? "" : settings.shellIdleCarryContext
    ? " After deciding, you may keep referring to that shell output normally in your reasoning and response."
    : " After deciding, do not quote or restate the shell output in your response or later reasoning — report only the action you took in one short line, and treat the incident as resolved."
  return [
    "",
    `Shell inactivity policy: if a command appears to wait for input or produces no progress for about ${settings.shellIdleTimeoutSeconds} seconds, do not leave it unattended. ${action}.${autoCarryNote}`,
    "Before using any interactive response, inspect the command and never confirm a destructive, credential, license, or privilege-escalation prompt automatically.",
  ].join("\n")
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function findLatestRequestInputTokens(messages: unknown[]): number | undefined {
  for (let index = messages.length - 1; index >= 0; index--) {
    const message = messages[index]
    if (!message || typeof message !== "object") continue
    const metrics = "metrics" in message && message.metrics && typeof message.metrics === "object" ? message.metrics : undefined
    if (metrics && "inputTokens" in metrics && typeof metrics.inputTokens === "number") return metrics.inputTokens
  }
  return undefined
}

const allowedImageTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"])
const maxImageBytes = 5 * 1024 * 1024
const maxImagesPerMessage = 4

export function validateUserImages(value: unknown, enabled: boolean): string[] {
  if (value === undefined || value === null) return []
  if (!Array.isArray(value)) throw new Error("Images must be an array")
  if (value.length === 0) return []
  if (!enabled) throw new Error("Image input is disabled for the active model profile")
  if (value.length > maxImagesPerMessage) throw new Error(`Attach no more than ${maxImagesPerMessage} images per message`)
  return value.map((item) => {
    if (typeof item !== "string") throw new Error("Invalid image attachment")
    const match = item.match(/^data:(image\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/i)
    if (!match?.[1] || !match[2] || !allowedImageTypes.has(match[1].toLowerCase())) throw new Error("Images must be PNG, JPEG, WebP, or GIF data")
    if (Buffer.byteLength(match[2], "base64") > maxImageBytes) throw new Error("Each image must be 5 MB or smaller")
    return item
  })
}
