# Agent API Reference

## Constructor

```typescript
import { Agent } from "@cline/sdk"

const agent = new Agent(config)
```

Also available through the lower-level factory re-export:

```typescript
import { createAgentRuntime } from "@cline/sdk"

const agent = createAgentRuntime(config)
```

`AgentRuntime` and `createAgent` are exported by `@cline/agents` directly, not by `@cline/sdk`. Runtime event and snapshot types are exported by `@cline/agents`; some plugin helper types live in `@cline/shared`.

## AgentRuntimeConfig

Two config forms exist as a discriminated union:

### With Provider ID (recommended)

```typescript
interface AgentRuntimeConfigWithProvider {
  providerId: string          // e.g. "anthropic", "openai-native", "gemini"
  modelId: string             // provider model id
  apiKey?: string             // provider API key
  baseUrl?: string            // custom endpoint
  headers?: Record<string, string>

  systemPrompt?: string
  modelOptions?: Record<string, unknown>
  tools?: readonly AgentTool[]
  initialMessages?: readonly AgentMessage[]
  toolPolicies?: Record<string, ToolPolicy>
  hooks?: Partial<AgentRuntimeHooks>
  plugins?: readonly AgentRuntimePlugin[]  // use structural typing; not re-exported by @cline/sdk
  logger?: BasicLogger
  telemetry?: ITelemetryService
  maxIterations?: number
  toolExecution?: "sequential" | "parallel"
  requestToolApproval?: (request: ToolApprovalRequest) => Promise<ToolApprovalResult> | ToolApprovalResult
}
```

### With Pre-built Model

```typescript
interface AgentRuntimeConfigWithModel {
  model: AgentModel            // pre-built model from gateway

  systemPrompt?: string
  modelOptions?: Record<string, unknown>
  tools?: readonly AgentTool[]
  initialMessages?: readonly AgentMessage[]
  toolPolicies?: Record<string, ToolPolicy>
  hooks?: Partial<AgentRuntimeHooks>
  plugins?: readonly AgentRuntimePlugin[]  // use structural typing; not re-exported by @cline/sdk
  logger?: BasicLogger
  telemetry?: ITelemetryService
  maxIterations?: number
  toolExecution?: "sequential" | "parallel"
  requestToolApproval?: (request: ToolApprovalRequest) => Promise<ToolApprovalResult> | ToolApprovalResult
}
```

Note: there is no top-level `onEvent` field on `AgentRuntimeConfig`. For event streaming, use `agent.subscribe()` or `hooks.onEvent` (see AgentRuntimeHooks below).

Direct Agent runtime plugins are not the same as ClineCore `AgentPlugin` extensions. A runtime plugin has `name` and optional `setup(context)` returning `{ tools, hooks }`. Use ClineCore `AgentPlugin` objects only with `config.extensions`.

### Advanced AgentRuntimeConfig Fields

```typescript
interface AgentRuntimeConfig {
  sessionId?: string
  agentId?: string
  conversationId?: string
  parentAgentId?: string | null
  agentRole?: string
  messageModelInfo?: AgentMessage["modelInfo"]
  completionPolicy?: {
    requireCompletionTool?: boolean
    completionGuard?: () => string | undefined
  }
  toolContextMetadata?: Record<string, unknown>
  prepareTurn?: (context: AgentRuntimePrepareTurnContext) =>
    AgentRuntimePrepareTurnResult | undefined | Promise<AgentRuntimePrepareTurnResult | undefined>
  consumePendingUserMessage?: () => string | undefined | Promise<string | undefined>
}
```

Use the identity fields when embedding `Agent` inside a larger host that needs stable session, conversation, or parent-agent routing. Use `requestToolApproval` with `toolPolicies` entries that set `autoApprove: false`; without that callback, approval-required tools are blocked and return an error tool result.

## Methods

### run(input)

Start the agent with user input. Returns when the agent loop completes.

```typescript
const result: AgentRunResult = await agent.run("Build a REST API")
```

Input can be a string, an `AgentMessage`, or an array of `AgentMessage[]`.

### continue(input?)

Continue an existing conversation with optional new input.

```typescript
const result = await agent.continue("Now add authentication")
```

### abort(reason?)

Cancel the currently active run.

```typescript
agent.abort("User cancelled")
```

### subscribe(listener)

Register a listener for streaming events.

```typescript
import type { AgentRuntimeEvent } from "@cline/agents"

const unsubscribe = agent.subscribe((event: AgentRuntimeEvent) => {
  // handle event
})

// Later: stop listening
unsubscribe()
```

### snapshot()

Get the current runtime state including message history.

```typescript
import type { AgentRuntimeStateSnapshot } from "@cline/agents"

const state: AgentRuntimeStateSnapshot = agent.snapshot()
```

### restore(messages)

Replace the agent's message history.

```typescript
agent.restore(previousMessages)
```

There is no `hasRun` property. `run()` and `continue()` both execute against the current in-memory message history. Track first-run state in your app when that distinction matters.

## AgentRunResult

Returned by `run()` and `continue()`.

```typescript
interface AgentRunResult {
  agentId: string
  agentRole?: string
  runId: string
  status: "completed" | "aborted" | "failed"
  iterations: number
  outputText: string
  messages: readonly AgentMessage[]
  usage: AgentUsage
  error?: Error
}
```

### Status Values

- `"completed"` - Agent finished normally
- `"aborted"` - Cancelled via `abort()`
- `"failed"` - Unrecoverable error

## AgentMessage

```typescript
interface AgentMessage {
  id: string
  role: "user" | "assistant" | "tool"
  content: AgentMessagePart[]
  createdAt: number
  metadata?: Record<string, unknown>
  modelInfo?: { id: string; provider: string; family?: string }
  metrics?: {
    inputTokens: number
    outputTokens: number
    cacheReadTokens: number
    cacheWriteTokens: number
    cost?: number
  }
}
```

## AgentUsage

```typescript
interface AgentUsage {
  inputTokens: number
  outputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
  totalCost?: number
}
```

## AgentRuntimeHooks

```typescript
interface AgentRuntimeHooks {
  beforeRun?(context): AgentStopControl | undefined
  afterRun?(context): void
  beforeModel?(context): AgentBeforeModelResult | undefined
  afterModel?(context): AgentStopControl | undefined
  beforeTool?(context): AgentBeforeToolResult | undefined
  afterTool?(context): AgentAfterToolResult | undefined
  onEvent?(event: AgentRuntimeEvent): void | Promise<void>
}
```

Hooks can intercept and modify behavior at each stage. Return a stop control from `beforeRun`, `afterModel`, or `beforeTool` to halt the agent loop.

`hooks.onEvent` receives the same `AgentRuntimeEvent` types as `agent.subscribe()`, but hook callbacks are awaited (can be async), while `subscribe()` listeners are called synchronously. Use `subscribe()` for UI streaming and `hooks.onEvent` for async side effects like logging to an external service.

## AgentRuntimeStateSnapshot

```typescript
interface AgentRuntimeStateSnapshot {
  agentId: string
  agentRole?: string
  parentAgentId?: string | null
  conversationId?: string
  runId?: string
  status: "idle" | "running" | "completed" | "aborted" | "failed"
  iteration: number
  messages: readonly AgentMessage[]
  pendingToolCalls: readonly string[]
  usage: AgentUsage
  lastError?: string
}
```

## Factory: createAgentRuntime

Lower-level factory that returns the same `Agent` class:

```typescript
import { createAgentRuntime } from "@cline/sdk"

const runtime = createAgentRuntime(config)
```

## See Also

- `REFERENCE.md` - Overview and quick start
- `patterns.md` - Common patterns
- `../tools/REFERENCE.md` - Tool creation
- `../events/REFERENCE.md` - Event types
- `../providers/REFERENCE.md` - Provider setup
