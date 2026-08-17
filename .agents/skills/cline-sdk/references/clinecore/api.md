# ClineCore API Reference

## Creating ClineCore

```typescript
import { ClineCore } from "@cline/sdk"

const cline = await ClineCore.create(options: ClineCoreOptions)
```

### ClineCoreOptions

```typescript
interface ClineCoreOptions {
  clientName?: string                    // identifies your app
  distinctId?: string                    // user/instance identifier
  backendMode?: "auto" | "local" | "hub" | "remote"
  hub?: HubOptions
  remote?: RemoteOptions
  capabilities?: RuntimeCapabilities
  telemetry?: ITelemetryService
  logger?: BasicLogger
  toolPolicies?: Record<string, ToolPolicy>
  messagesArtifactUploader?: SessionMessagesArtifactUploader
  automation?: boolean | ClineCoreAutomationOptions
  fetch?: typeof fetch
  sessionService?: SessionBackend
  prepare?: (input: ClineCoreStartInput) => {
    applyToStartSessionInput(input: ClineCoreStartInput): ClineCoreStartInput | Promise<ClineCoreStartInput>
    dispose?(): void | Promise<void>
  } | undefined | Promise<{
    applyToStartSessionInput(input: ClineCoreStartInput): ClineCoreStartInput | Promise<ClineCoreStartInput>
    dispose?(): void | Promise<void>
  } | undefined>
}
```

### RuntimeCapabilities

```typescript
interface RuntimeCapabilities {
  toolExecutors?: Partial<ToolExecutors>
  requestToolApproval?: (request: ToolApprovalRequest) => ToolApprovalResult | Promise<ToolApprovalResult>
}
```

## Starting Sessions

### start(input)

```typescript
const session = await cline.start(input: ClineCoreStartInput)
```

Returns a `StartSessionResult`:

```typescript
interface StartSessionResult {
  sessionId: string
  manifest: SessionManifest
  manifestPath: string
  messagesPath: string
  result?: AgentResult
}
```

### ClineCoreStartInput

```typescript
interface ClineCoreStartInput {
  prompt?: string
  config: CoreSessionConfig
  source?: string
  interactive?: boolean
  sessionMetadata?: Record<string, unknown>
  initialMessages?: Message[]
  userImages?: string[]
  userFiles?: string[]
  toolPolicies?: Record<string, ToolPolicy>
  capabilities?: RuntimeCapabilities
  localRuntime?: object
}
```

### CoreSessionConfig

```typescript
interface CoreSessionConfig {
  cwd: string                           // working directory
  workspaceRoot?: string                // workspace root when different from cwd
  providerId: string                    // LLM provider
  modelId: string                       // model identifier
  apiKey?: string                       // provider API key
  baseUrl?: string
  headers?: Record<string, string>
  knownModels?: Record<string, ModelInfo>
  providerConfig?: ProviderConfig
  thinking?: boolean
  reasoningEffort?: ProviderConfig["reasoningEffort"]
  systemPrompt: string                  // custom system prompt
  mode?: "act" | "plan" | "yolo" | "zen"
  rules?: string
  maxIterations?: number
  toolPolicies?: Record<string, ToolPolicy>
  extraTools?: readonly AgentTool[]     // additional custom tools
  enableTools: boolean                  // enable built-in tools
  disableMcpSettingsTools?: boolean
  yolo?: boolean
  hooks?: AgentHooks                    // runtime hooks
  hookErrorMode?: HookErrorMode
  extensions?: AgentPlugin[]            // plugins loaded inline
  pluginPaths?: string[]                // paths to plugin packages
  extensionContext?: ExtensionContext   // from @cline/shared
  checkpoint?: CoreCheckpointConfig
  compaction?: CoreCompactionConfig
  execution?: AgentConfig["execution"]
  telemetry?: ITelemetryService
  logger?: BasicLogger
  enableSpawnAgent: boolean             // enable sub-agent spawning
  enableAgentTeams: boolean             // enable team coordination
  teamName?: string                     // team identifier
  missionLogIntervalSteps?: number
  missionLogIntervalMs?: number
  onTeamEvent?: (event: TeamEvent) => void
  onConsecutiveMistakeLimitReached?: (context: ConsecutiveMistakeLimitContext) =>
    ConsecutiveMistakeLimitDecision | Promise<ConsecutiveMistakeLimitDecision>
  toolRoutingRules?: ToolRoutingRule[]
  skills?: string[]
  workspaceMetadata?: string
}
```

`extensions` passes plugin objects directly. `pluginPaths` can point at plugin files or directories. Directory plugins can declare entries in `package.json` under `cline.plugins`; otherwise `index.ts` or `index.js` is used when present. ClineCore builds `ctx.workspaceInfo` from `cwd` or `workspaceRoot`, so pass those fields for predictable workspace-aware plugins.

## Follow-Up Messages

### send({ sessionId, prompt })

Send a follow-up message to an existing session:

```typescript
const result = await cline.send({
  sessionId: session.sessionId,
  prompt: "Now add authentication",
})
```

Returns `AgentResult | undefined`.

## Event Subscription

### subscribe(listener, options?)

```typescript
const unsubscribe = cline.subscribe(
  (event: CoreSessionEvent) => {
    // handle events
  },
  { sessionId: "optional-filter" }
)
```

### CoreSessionEvent

```typescript
type CoreSessionEvent =
  | { type: "chunk"; payload: SessionChunkEvent }
  | { type: "agent_event"; payload: { sessionId: string, event: AgentEvent, teamAgentId?: string, teamRole?: "lead" | "teammate" } }
  | { type: "ended"; payload: SessionEndedEvent }
  | { type: "team_progress"; payload: SessionTeamProgressEvent }
  | { type: "pending_prompts"; payload: SessionPendingPromptsEvent }
  | { type: "pending_prompt_submitted"; payload: SessionPendingPromptSubmittedEvent }
  | { type: "session_snapshot"; payload: SessionSnapshotEvent }
  | { type: "status"; payload: { sessionId: string, status: string } }
  | { type: "hook"; payload: SessionToolEvent }
```

For direct `ClineCore` subscribers, render text, reasoning, and tool activity from the `agent_event` branch. `chunk` payloads are raw transport chunks:

```typescript
interface SessionChunkEvent {
  sessionId: string
  stream: "stdout" | "stderr" | "agent"
  chunk: string
  ts: number
}

interface SessionEndedEvent {
  sessionId: string
  reason: string
  ts: number
}
```

## Session Management

### list(limit?, options?)

```typescript
const sessions: SessionHistoryRecord[] = await cline.list(50)
```

### listHistory(options?)

```typescript
const sessions: SessionHistoryRecord[] = await cline.listHistory({ limit: 50 })
```

### get(sessionId)

```typescript
const session: SessionRecord | undefined = await cline.get(sessionId)
```

### readMessages(sessionId)

```typescript
const messages: Message[] = await cline.readMessages(sessionId)
```

### getAccumulatedUsage(sessionId)

```typescript
const usage = await cline.getAccumulatedUsage(sessionId)
// usage.usage - root agent only
// usage.aggregateUsage - root + subagents/teammates
```

### update(sessionId, updates)

```typescript
await cline.update(sessionId, { title: "New title" })
```

### abort(sessionId, reason?)

```typescript
await cline.abort(sessionId, "User cancelled")
```

### stop(sessionId)

```typescript
await cline.stop(sessionId)
```

### updateSessionModel(sessionId, modelId)

Switch the model for an active session:

```typescript
await cline.updateSessionModel(sessionId, "claude-opus-4-7")
```

### delete(sessionId)

```typescript
await cline.delete(sessionId)
```

### restore(input)

Restore a session from a checkpoint:

```typescript
await cline.restore({ sessionId, checkpointRunCount: 3 })
```

### dispose(reason?)

Clean up all resources. Always call this when done:

```typescript
await cline.dispose("Shutting down")
```

## Pending Prompts

Interactive sessions can queue or steer follow-up prompts while a run is active:

```typescript
const prompts = await cline.pendingPrompts.list({ sessionId })
await cline.pendingPrompts.update({
  sessionId,
  promptId: prompts[0].id,
  prompt: "Prioritize the test failures first.",
  delivery: "steer",
})
await cline.pendingPrompts.delete({ sessionId, promptId: prompts[0].id })
```

## AgentResult

Returned by session operations:

```typescript
interface AgentResult {
  text: string
  usage: LegacyAgentUsage
  messages: MessageWithMetadata[]
  toolCalls: ToolCallRecord[]
  iterations: number
  finishReason: "completed" | "max_iterations" | "aborted" | "mistake_limit" | "error"
  model: { id: string; provider: string; info?: ModelInfo }
  startedAt: Date
  endedAt: Date
  durationMs: number
}
```

## Tool Policies

Control tool access at the session level:

```typescript
const session = await cline.start({
  prompt: "Review the code",
  config: {
    ...config,
    toolPolicies: {
      editor: { enabled: false },
    },
  },
  toolPolicies: {
    read_files: { autoApprove: true },
    run_commands: { autoApprove: false },
  },
})
```

Use `config.toolPolicies` when disabled tools should be removed before the model sees them. Use top-level `toolPolicies` for per-session execution approval and blocking.

### ToolPolicy

```typescript
interface ToolPolicy {
  enabled?: boolean       // false = blocked; in ClineCore config, also removed before model requests
  autoApprove?: boolean   // false = requires approval callback
}
```

## Interactive Approval

```typescript
const cline = await ClineCore.create({
  clientName: "my-app",
  capabilities: {
    requestToolApproval: async (request) => {
      console.log(`Tool: ${request.toolName}, Input: ${JSON.stringify(request.input)}`)
      const approved = await askUser(`Allow ${request.toolName}?`)
      return { approved }
    },
  },
})
```

## Automation API

When `automation` is enabled in `ClineCore.create()`:

```typescript
const cline = await ClineCore.create({
  clientName: "my-app",
  automation: true,
})

// Access automation methods
await cline.automation.start()
await cline.automation.reconcileNow()
cline.automation.ingestEvent(event)
cline.automation.listEvents()
cline.automation.listSpecs()
cline.automation.listRuns()
await cline.automation.stop()
```

## Settings API

```typescript
// Read settings
const settings = await cline.settings.list()

// Toggle tools, plugins, MCP servers
await cline.settings.toggle({ type: "tools", name: "run_commands", enabled: true })
```

## See Also

- `REFERENCE.md` - Overview and quick start
- `patterns.md` - Common patterns
- `gotchas.md` - Pitfalls
- `../tools/REFERENCE.md` - Tool creation
- `../plugins/REFERENCE.md` - Plugin system
