// Shared client-side types. Reuses the server's own types where they exist;
// session/message payloads are treated as loosely as the server itself
// treats them (ClineCore sessions are `Record<string, unknown>`).
import type { AgentSettings, ManagedTool, McpServerSettings, McpTransport, PermissionPreset, PromptTemplate, ShellIdleAction, ToolPermission } from "../../src/stores/agent-settings.js"
import type { CompactionRecord } from "../../src/stores/compaction-store.js"
import type { ModelInfo, ProviderKind } from "../../src/providers.js"
import type { ModelProfile, RemoteOperatingSystem, SudoPermission, WorkspaceProfile } from "../../src/stores/profile-store.js"
import type { ContextUsage } from "../../src/runtime.js"
import type { McpTestResult, McpTestTool } from "../../src/mcp-extension.js"

export type { AgentSettings, ManagedTool, McpServerSettings, McpTransport, PermissionPreset, PromptTemplate, ShellIdleAction, ToolPermission, CompactionRecord, ModelInfo, ProviderKind, ModelProfile, WorkspaceProfile, RemoteOperatingSystem, SudoPermission, ContextUsage, McpTestResult, McpTestTool }

export type ConnectionInfo =
  | { configured: false }
  | {
      configured: true
      provider: ProviderKind
      baseUrl: string
      modelId: string
      authenticated: boolean
      contextWindow?: number
      maxInputTokens?: number
      timeoutMs?: number
      imagesEnabled: boolean
      imageSupport: "supported" | "unsupported" | "unknown"
    }

export type ProfilesData = {
  activeModelProfileId?: string
  activeWorkspaceProfileId?: string
  models: ModelProfile[]
  workspaces: WorkspaceProfile[]
}

export type SessionSummary = {
  sessionId: string
  status?: string
  provider?: string
  model?: string
  prompt?: string
  metadata?: Record<string, unknown>
} & Record<string, unknown>

export type SessionDetails = {
  session: SessionSummary
  usage: unknown
  context: ContextUsage
  compactions: CompactionRecord[]
  lastCompaction: CompactionRecord | null
  messagesPath?: string
}

export type QueuedPrompt = { id: string; prompt: string; images?: string[]; imageCount?: number; createdAt: number }

export type PendingImage = { name: string; dataUrl: string }

export type ApprovalItem = { id: string; sessionId: string; toolName: string; input: unknown }

export type PreviewResult = { variables: Record<string, string>; preview: string; model: { provider: string; modelId: string } | null; workspace: string }
