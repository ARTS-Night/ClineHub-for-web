import { mkdir, readFile, realpath, stat, writeFile } from "node:fs/promises"
import { dirname, isAbsolute, relative, resolve } from "node:path"

export const managedTools = ["read_files", "search_codebase", "fetch_web_content", "skills", "run_commands", "editor", "apply_patch"] as const
export type ManagedTool = typeof managedTools[number]
export type ToolPermission = "disabled" | "ask" | "allow"
export type PermissionPreset = "readonly" | "balanced" | "full" | "custom"
export type ToolPolicy = { enabled?: boolean; autoApprove?: boolean }
export type McpTransport = "stdio" | "sse" | "streamableHttp"
export type McpServerSettings = {
  id: string
  name: string
  enabled: boolean
  transport: McpTransport
  command: string
  args: string[]
  url: string
  /** When true, calls to this server's tools skip the approval prompt — the
   * same "allow" concept as the built-in tool permissions, scoped per server
   * since individual MCP tool names aren't known ahead of time. */
  autoApprove: boolean
  /** Tool names (as reported by the server itself, not the "server__tool"
   * form the model sees) that are hidden from the model entirely — the
   * per-tool counterpart to the server-level `enabled` flag. Populated by
   * ticking tools off in the discovered list after a connection test. */
  disabledTools: string[]
}
export type ShellIdleAction = "ask" | "enter" | "wait" | "close" | "auto"

// A template IS the mode: picking one sets the system prompt and the tool
// permissions together, instead of two separately-configured concepts.
export type PromptTemplate = {
  id: string
  name: string
  prompt: string
  permissionPreset: PermissionPreset
  permissions: Record<ManagedTool, ToolPermission>
  builtin: boolean
}

export type AgentSettings = {
  workspacePath: string
  allowedRoot: string
  templates: PromptTemplate[]
  activeTemplateId: string
  maxIterations: number
  compactionEnabled: boolean
  compactionStrategy: "basic" | "agentic"
  preserveRecentTokens: number
  contextWindowOverride: number | null
  mcpServers: McpServerSettings[]
  /** Quick on/off switch for whether MCP tools are exposed to the AI at all —
   * independent of each server's own `enabled` flag, so the user can shut off
   * MCP entirely for one message without touching the server list. */
  mcpEnabled: boolean
  shellIdleTimeoutSeconds: number
  shellIdleAction: ShellIdleAction
  /** Only meaningful when shellIdleAction is "auto": whether the shell log and
   * the AI's own investigation of it stay in context afterward, or the AI is
   * told to report just the action taken and drop the rest. */
  shellIdleCarryContext: boolean
}

export type AgentSettingsUpdate = {
  workspacePath?: unknown
  activeTemplateId?: unknown
  maxIterations?: unknown
  compactionEnabled?: unknown
  compactionStrategy?: unknown
  preserveRecentTokens?: unknown
  contextWindowOverride?: unknown
  mcpServers?: unknown
  mcpEnabled?: unknown
  shellIdleTimeoutSeconds?: unknown
  shellIdleAction?: unknown
  shellIdleCarryContext?: unknown
}

export type TemplateInput = { name?: unknown; prompt?: unknown; permissionPreset?: unknown; permissions?: unknown }

const presetPermissions: Record<Exclude<PermissionPreset, "custom">, Record<ManagedTool, ToolPermission>> = {
  readonly: {
    read_files: "allow", search_codebase: "allow", fetch_web_content: "ask", skills: "allow",
    run_commands: "disabled", editor: "disabled", apply_patch: "disabled",
  },
  balanced: {
    read_files: "allow", search_codebase: "allow", fetch_web_content: "allow", skills: "allow",
    run_commands: "ask", editor: "ask", apply_patch: "ask",
  },
  full: {
    read_files: "allow", search_codebase: "allow", fetch_web_content: "allow", skills: "allow",
    run_commands: "allow", editor: "allow", apply_patch: "allow",
  },
}

const dailyTemplatePrompt = [
  "You are a friendly, helpful assistant operating through ClineHub-for-web for {user}.",
  "The active workspace is {workspace} on {os}, but most requests here are everyday questions, writing, or research rather than software changes.",
  "Answer directly and concisely. Only use file or command tools when the task actually requires touching the workspace, and say what you're about to do first.",
].join("\n")

const codingTemplatePrompt = [
  "You are a meticulous coding agent operating through ClineHub-for-web for {user}.",
  "The active workspace is {workspace} ({workspaceType}) on {os}.",
  "Inspect the workspace carefully, explain important actions, and use tools only as permitted by the user.",
  "Prefer workspace-relative paths so tool calls remain portable and easy to audit.",
  "For large files, never put the entire document into one editor call. Create the file first, then append or patch it in small coherent sections (normally 6,000 characters or fewer per tool call), verifying the result after the final section. When continuing an existing file, read it first and use the editor's supported insertion or targeted-diff operation; do not overwrite the whole file or attempt an unsupported append.",
  "Keep code modular and split logical components or layers into separate files to improve maintainability and reliability.",
].join("\n")

const planTemplatePrompt = [
  "You are a careful planning assistant operating through ClineHub-for-web for {user}.",
  "The active workspace is {workspace} ({workspaceType}) on {os}.",
  "Investigate the request first (read files, search the codebase, fetch web content) and present a clear, concrete plan for {user} to review before anything changes.",
  "Do not run commands, edit files, or apply patches in this mode, even if a tool for that is made available.",
].join("\n")

const linuxTemplatePrompt = [
  "You are a Linux systems agent operating through ClineHub-for-web for {user}, working directly on a Linux host (local shell or the SSH workspace tools, whichever is active).",
  "The active workspace is {workspace} ({workspaceType}) on {os}.",
  "Prefer POSIX-compliant shell and standard coreutils/systemd tooling; note distro-specific package managers (apt/dnf/pacman/apk) before assuming one.",
  "Before a change with real system impact (package installs, service/systemd unit changes, permissions, firewall, cron, disk/partition operations), explain what you're about to run and why.",
  "Never run destructive or irreversible commands (rm -rf, disk formatting, dd to a device, mkfs, iptables flush, force-push) without explicit confirmation from the user first.",
  "Quote paths and variables defensively, check exit codes, and prefer non-interactive flags (-y/--yes) only once the user has approved the action.",
].join("\n")

// The four standard templates. Users can edit any field of these (they're
// stored like any other template) and reset them back to this shape.
export const builtinTemplateDefaults: readonly PromptTemplate[] = [
  { id: "daily", name: "日常 / Daily", prompt: dailyTemplatePrompt, permissionPreset: "balanced", permissions: { ...presetPermissions.balanced }, builtin: true },
  { id: "coding", name: "コーディング / Coding", prompt: codingTemplatePrompt, permissionPreset: "balanced", permissions: { ...presetPermissions.balanced }, builtin: true },
  { id: "plan", name: "プラン / Plan", prompt: planTemplatePrompt, permissionPreset: "readonly", permissions: { ...presetPermissions.readonly }, builtin: true },
  { id: "linux", name: "Linux", prompt: linuxTemplatePrompt, permissionPreset: "balanced", permissions: { ...presetPermissions.balanced }, builtin: true },
]

function cloneTemplate(template: PromptTemplate): PromptTemplate {
  return { ...template, permissions: { ...template.permissions } }
}

function defaultTemplates(): PromptTemplate[] {
  return builtinTemplateDefaults.map(cloneTemplate)
}

export class AgentSettingsStore {
  private settings: AgentSettings

  constructor(initialWorkspace: string, allowedRoot: string, private readonly storagePath?: string) {
    const workspacePath = resolve(initialWorkspace)
    const root = allowedRoot === "" ? "" : resolve(allowedRoot)
    if (!isWithin(root, workspacePath)) throw new Error("Initial workspace must be inside CLINE_ALLOWED_ROOT")
    this.settings = {
      workspacePath,
      allowedRoot: root,
      templates: defaultTemplates(),
      activeTemplateId: "daily",
      maxIterations: 50,
      compactionEnabled: true,
      compactionStrategy: "agentic",
      preserveRecentTokens: 20_000,
      contextWindowOverride: null,
      mcpServers: [],
      mcpEnabled: true,
      shellIdleTimeoutSeconds: 60,
      shellIdleAction: "ask",
      shellIdleCarryContext: true,
    }
  }

  async load(): Promise<void> {
    if (!this.storagePath) return
    try {
      const value: unknown = JSON.parse(await readFile(this.storagePath, "utf8"))
      if (!isRecord(value)) throw new Error("Saved agent settings are invalid")
      // update() only knows the fixed settings fields, not the templates
      // array (templates are mutated through their own CRUD methods), so
      // restore it directly here. Files saved before the template/mode merge
      // have no `templates` array; those just start fresh on the template
      // side (everything else still carries over via update() below). Any
      // builtin template added after a file was last saved (e.g. a new
      // standard template shipped in an update) is appended rather than
      // silently missing, without disturbing the user's saved edits to the
      // ones that were already there.
      if (Array.isArray(value.templates) && value.templates.length > 0) {
        const saved = value.templates.map(parseStoredTemplate)
        const newBuiltins = builtinTemplateDefaults.filter((def) => !saved.some((template) => template.id === def.id)).map(cloneTemplate)
        this.settings = { ...this.settings, templates: [...saved, ...newBuiltins] }
      }
      await this.update(value as AgentSettingsUpdate)
    } catch (error: unknown) {
      if (!isNodeError(error) || error.code !== "ENOENT") throw error
    }
  }

  get(): AgentSettings {
    return {
      ...this.settings,
      templates: this.settings.templates.map(cloneTemplate),
      mcpServers: this.settings.mcpServers.map((server) => ({ ...server, args: [...server.args] })),
    }
  }

  /** The template actually in force right now. */
  effectiveTemplate(): PromptTemplate {
    const found = this.settings.templates.find((template) => template.id === this.settings.activeTemplateId)
    return cloneTemplate(found ?? builtinTemplateDefaults[0]!)
  }
  effectivePermissionPreset(): PermissionPreset { return this.effectiveTemplate().permissionPreset }
  effectivePermissions(): Record<ManagedTool, ToolPermission> { return this.effectiveTemplate().permissions }
  /** Raw (unsubstituted) system prompt text of the active template. */
  effectiveSystemPrompt(): string { return this.effectiveTemplate().prompt }

  policies(): Record<ManagedTool, ToolPolicy> {
    const permissions = this.effectivePermissions()
    return Object.fromEntries(managedTools.map((tool) => {
      const permission = permissions[tool]
      if (permission === "disabled") return [tool, { enabled: false, autoApprove: false }]
      return [tool, { enabled: true, autoApprove: permission === "allow" }]
    })) as Record<ManagedTool, ToolPolicy>
  }

  async update(input: AgentSettingsUpdate): Promise<AgentSettings> {
    const next = this.get()

    if (input.workspacePath !== undefined) {
      if (typeof input.workspacePath !== "string" || !input.workspacePath.trim()) throw new Error("Workspace path is required")
      const requestedPath = resolve(input.workspacePath.trim())
      if (!isWithin(next.allowedRoot, requestedPath)) throw new Error(`Workspace must be inside: ${next.allowedRoot}`)
      const workspacePath = await realpath(requestedPath).catch(() => null)
      if (!workspacePath || !isWithin(next.allowedRoot, workspacePath)) throw new Error(`Workspace must be inside: ${next.allowedRoot}`)
      const info = await stat(workspacePath).catch(() => null)
      if (!info?.isDirectory()) throw new Error("Workspace path must be an existing directory")
      next.workspacePath = workspacePath
    }

    if (input.activeTemplateId !== undefined) {
      if (typeof input.activeTemplateId !== "string" || !next.templates.some((template) => template.id === input.activeTemplateId)) {
        throw new Error("Template not found")
      }
      next.activeTemplateId = input.activeTemplateId
    }

    if (input.maxIterations !== undefined) {
      if (!Number.isInteger(input.maxIterations) || Number(input.maxIterations) < 1 || Number(input.maxIterations) > 500) {
        throw new Error("Max iterations must be an integer from 1 to 500")
      }
      next.maxIterations = Number(input.maxIterations)
    }

    if (input.compactionEnabled !== undefined) {
      if (typeof input.compactionEnabled !== "boolean") throw new Error("Compaction enabled must be a boolean")
      next.compactionEnabled = input.compactionEnabled
    }

    if (input.compactionStrategy !== undefined) {
      if (input.compactionStrategy !== "basic" && input.compactionStrategy !== "agentic") throw new Error("Invalid compaction strategy")
      next.compactionStrategy = input.compactionStrategy
    }

    if (input.preserveRecentTokens !== undefined) {
      if (!Number.isInteger(input.preserveRecentTokens) || Number(input.preserveRecentTokens) < 1_000 || Number(input.preserveRecentTokens) > 500_000) {
        throw new Error("Preserved recent tokens must be an integer from 1,000 to 500,000")
      }
      next.preserveRecentTokens = Number(input.preserveRecentTokens)
    }

    if (input.contextWindowOverride !== undefined) {
      if (input.contextWindowOverride === null || input.contextWindowOverride === "") next.contextWindowOverride = null
      else if (!Number.isInteger(input.contextWindowOverride) || Number(input.contextWindowOverride) < 4_096 || Number(input.contextWindowOverride) > 10_000_000) {
        throw new Error("Context window override must be an integer from 4,096 to 10,000,000")
      } else next.contextWindowOverride = Number(input.contextWindowOverride)
    }

    if (input.shellIdleTimeoutSeconds !== undefined) {
      if (!Number.isInteger(input.shellIdleTimeoutSeconds) || Number(input.shellIdleTimeoutSeconds) < 5 || Number(input.shellIdleTimeoutSeconds) > 3_600) {
        throw new Error("Shell idle timeout must be an integer from 5 to 3,600 seconds")
      }
      next.shellIdleTimeoutSeconds = Number(input.shellIdleTimeoutSeconds)
    }

    if (input.shellIdleAction !== undefined) next.shellIdleAction = parseShellIdleAction(input.shellIdleAction)

    if (input.shellIdleCarryContext !== undefined) {
      if (typeof input.shellIdleCarryContext !== "boolean") throw new Error("Shell idle context setting must be a boolean")
      next.shellIdleCarryContext = input.shellIdleCarryContext
    }

    if (input.mcpServers !== undefined) next.mcpServers = parseMcpServers(input.mcpServers)
    if (input.mcpEnabled !== undefined) {
      if (typeof input.mcpEnabled !== "boolean") throw new Error("MCP enabled must be a boolean")
      next.mcpEnabled = input.mcpEnabled
    }

    this.settings = next
    await this.persist()
    return this.get()
  }

  async createTemplate(input: TemplateInput): Promise<PromptTemplate> {
    const name = validateTemplateName(input.name)
    const prompt = validateTemplatePrompt(input.prompt)
    let permissionPreset: PermissionPreset = input.permissionPreset !== undefined ? parsePreset(input.permissionPreset) : "balanced"
    let permissions = permissionPreset !== "custom" ? { ...presetPermissions[permissionPreset] } : { ...presetPermissions.balanced }
    if (input.permissions !== undefined) {
      if (!isRecord(input.permissions)) throw new Error("Template permissions must be an object")
      for (const tool of managedTools) if (input.permissions[tool] !== undefined) permissions[tool] = parsePermission(input.permissions[tool])
      permissionPreset = inferPreset(permissions)
    }
    const template: PromptTemplate = { id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name, prompt, permissionPreset, permissions, builtin: false }
    this.settings = { ...this.settings, templates: [...this.settings.templates, template] }
    await this.persist()
    return template
  }

  async updateTemplate(id: string, patch: TemplateInput): Promise<PromptTemplate> {
    const index = this.settings.templates.findIndex((template) => template.id === id)
    const current = this.settings.templates[index]
    if (index === -1 || !current) throw new Error("Template not found")
    const name = patch.name !== undefined ? validateTemplateName(patch.name) : current.name
    const prompt = patch.prompt !== undefined ? validateTemplatePrompt(patch.prompt) : current.prompt
    let permissionPreset = current.permissionPreset
    let permissions = { ...current.permissions }
    if (patch.permissionPreset !== undefined) {
      permissionPreset = parsePreset(patch.permissionPreset)
      if (permissionPreset !== "custom") permissions = { ...presetPermissions[permissionPreset] }
    }
    if (patch.permissions !== undefined) {
      if (!isRecord(patch.permissions)) throw new Error("Template permissions must be an object")
      for (const tool of managedTools) if (patch.permissions[tool] !== undefined) permissions[tool] = parsePermission(patch.permissions[tool])
      permissionPreset = inferPreset(permissions)
    }
    const updated: PromptTemplate = { ...current, name, prompt, permissionPreset, permissions }
    const templates = [...this.settings.templates]
    templates[index] = updated
    this.settings = { ...this.settings, templates }
    await this.persist()
    return updated
  }

  async deleteTemplate(id: string): Promise<void> {
    const template = this.settings.templates.find((item) => item.id === id)
    if (!template) throw new Error("Template not found")
    if (template.builtin) throw new Error("Built-in templates cannot be deleted; reset them instead")
    const templates = this.settings.templates.filter((item) => item.id !== id)
    const activeTemplateId = this.settings.activeTemplateId === id ? (templates[0]?.id ?? "daily") : this.settings.activeTemplateId
    this.settings = { ...this.settings, templates, activeTemplateId }
    await this.persist()
  }

  async resetTemplate(id: string): Promise<PromptTemplate> {
    const original = builtinTemplateDefaults.find((template) => template.id === id)
    if (!original) throw new Error("Only built-in templates can be reset")
    const reset = cloneTemplate(original)
    this.settings = { ...this.settings, templates: this.settings.templates.map((template) => template.id === id ? reset : template) }
    await this.persist()
    return reset
  }

  private async persist(): Promise<void> {
    if (!this.storagePath) return
    await mkdir(dirname(this.storagePath), { recursive: true })
    const { allowedRoot: _allowedRoot, ...stored } = this.settings
    await writeFile(this.storagePath, `${JSON.stringify({ version: 2, ...stored }, null, 2)}\n`, { encoding: "utf8", mode: 0o600 })
  }
}

function validateTemplateName(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) throw new Error("Template name is required")
  if (value.length > 100) throw new Error("Template name must be 100 characters or fewer")
  return value.trim()
}

function validateTemplatePrompt(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) throw new Error("Template prompt is required")
  if (value.length > 20_000) throw new Error("Template prompt must be 20,000 characters or fewer")
  return value.trim()
}

function parseStoredTemplate(raw: unknown): PromptTemplate {
  if (!isRecord(raw)) throw new Error("Saved template is invalid")
  const id = typeof raw.id === "string" && raw.id ? raw.id : `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const permissionPreset = parsePreset(raw.permissionPreset)
  const permissions = { ...presetPermissions.balanced }
  if (isRecord(raw.permissions)) for (const tool of managedTools) if (raw.permissions[tool] !== undefined) permissions[tool] = parsePermission(raw.permissions[tool])
  return { id, name: validateTemplateName(raw.name), prompt: validateTemplatePrompt(raw.prompt), permissionPreset, permissions, builtin: raw.builtin === true }
}

function inferPreset(permissions: Record<ManagedTool, ToolPermission>): PermissionPreset {
  for (const preset of ["readonly", "balanced", "full"] as const) {
    if (managedTools.every((tool) => permissions[tool] === presetPermissions[preset][tool])) return preset
  }
  return "custom"
}

function parsePreset(value: unknown): PermissionPreset {
  if (value === "readonly" || value === "balanced" || value === "full" || value === "custom") return value
  throw new Error("Invalid permission preset")
}

function parsePermission(value: unknown): ToolPermission {
  if (value === "disabled" || value === "ask" || value === "allow") return value
  throw new Error("Invalid tool permission")
}

function parseShellIdleAction(value: unknown): ShellIdleAction {
  if (value === "ask" || value === "enter" || value === "wait" || value === "close" || value === "auto") return value
  throw new Error("Invalid shell idle action")
}

/** Validates the transport/command/args/url quartet shared by every MCP server —
 * factored out so the "test connection" endpoint validates unsaved form input the
 * exact same way a saved server's fields are validated, instead of duplicating it. */
export function parseMcpServerConnectionFields(raw: Record<string, unknown>, label: string): Pick<McpServerSettings, "transport" | "command" | "args" | "url"> {
  const transport = raw.transport
  if (transport !== "stdio" && transport !== "sse" && transport !== "streamableHttp") throw new Error(`${label} has an invalid transport`)
  const command = typeof raw.command === "string" ? raw.command.trim() : ""
  const url = typeof raw.url === "string" ? raw.url.trim() : ""
  if (transport === "stdio" && !command) throw new Error(`${label} needs a command`)
  if (transport !== "stdio") {
    try {
      const parsed = new URL(url)
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error()
    } catch { throw new Error(`${label} needs an http(s) URL`) }
  }
  if (!Array.isArray(raw.args) || raw.args.some((arg) => typeof arg !== "string" || arg.length > 2_000)) throw new Error(`${label} has invalid arguments`)
  return { transport, command, args: raw.args.map((arg) => arg.trim()).filter(Boolean), url }
}

function parseMcpServers(value: unknown): McpServerSettings[] {
  if (!Array.isArray(value)) throw new Error("MCP servers must be an array")
  if (value.length > 20) throw new Error("Configure no more than 20 MCP servers")
  const names = new Set<string>()
  return value.map((raw, index) => {
    if (!isRecord(raw)) throw new Error(`MCP server ${index + 1} must be an object`)
    const name = typeof raw.name === "string" ? raw.name.trim() : ""
    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(name)) throw new Error(`MCP server ${index + 1} needs a name using letters, numbers, _ or -`)
    if (names.has(name.toLowerCase())) throw new Error(`MCP server name '${name}' is duplicated`)
    names.add(name.toLowerCase())
    const fields = parseMcpServerConnectionFields(raw, `MCP server '${name}'`)
    const disabledTools = Array.isArray(raw.disabledTools) ? raw.disabledTools.filter((tool): tool is string => typeof tool === "string") : []
    return {
      id: typeof raw.id === "string" && raw.id ? raw.id.slice(0, 80) : `mcp-${Date.now()}-${index}`,
      name,
      enabled: raw.enabled !== false,
      autoApprove: raw.autoApprove === true,
      disabledTools,
      ...fields,
    }
  })
}

// An empty root means "no restriction" — CLINE_ALLOWED_ROOT wasn't set at
// startup, so any existing absolute path is a valid workspace (the AI's
// actual file/command tools are still boxed in per-session to whichever
// workspace is active, via workspace-security.ts's own guard; this check is
// only an extra opt-in gate for shared/LAN deployments).
export function isWithin(root: string, target: string): boolean {
  if (root === "") return true
  const path = relative(root, target)
  return path === "" || (!path.startsWith("..") && !isAbsolute(path))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isNodeError(value: unknown): value is NodeJS.ErrnoException {
  return value instanceof Error && "code" in value
}
