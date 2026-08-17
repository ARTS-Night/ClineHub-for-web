# Tools

Tools are how agents interact with the world. The Cline SDK supports both built-in tools (via ClineCore) and custom tools you define yourself.

## Creating Custom Tools

Use `createTool()` from `@cline/sdk` (or `@cline/shared`):

```typescript
import { createTool } from "@cline/sdk"

interface SearchIssuesInput {
  query: string
  state?: "open" | "closed" | "all"
}

const myTool = createTool({
  name: "search_issues",
  description: "Search GitHub issues by query. Returns up to 10 results.",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Search query" },
      state: { type: "string", enum: ["open", "closed", "all"] },
    },
    required: ["query"],
  },
  execute: async (input: SearchIssuesInput) => {
    const issues = await github.searchIssues(input.query, input.state)
    return { issues, count: issues.length }
  },
})
```

### With Zod Schema

```typescript
import { createTool } from "@cline/sdk"
import { z } from "zod"

const deployTool = createTool({
  name: "deploy",
  description: "Deploy the app to the specified environment.",
  inputSchema: z.object({
    environment: z.enum(["staging", "production"]).describe("Target environment"),
    version: z.string().optional().describe("Version tag, defaults to latest"),
  }),
  execute: async (input) => {
    const result = await deploy(input.environment, input.version)
    return { url: result.url, status: "deployed" }
  },
})
```

### Tool Config Options

```typescript
createTool({
  name: string,                         // snake_case, unique per agent
  description: string,                  // what the tool does (model reads this)
  inputSchema: JSONSchema | ZodSchema,  // input validation
  execute: async (input, context) => output,
  timeoutMs?: number,                   // default: 30000
  retryable?: boolean,                  // default: true, metadata only
  maxRetries?: number,                  // default: 3, metadata only
  lifecycle?: {
    completesRun?: boolean              // true = ends agent loop on success
  },
})
```

`createTool()` records `timeoutMs`, `retryable`, and `maxRetries` on the returned tool. The direct `Agent` runtime does not currently apply a generic timeout or automatic retry wrapper around custom `execute` functions. Built-in ClineCore tools implement their own timeouts inside their executors. For custom tools, enforce deadlines inside `execute` and respect `context.signal`.

### AgentToolContext

The second argument to `execute` provides runtime context:

```typescript
interface AgentToolContext {
  sessionId?: string
  agentId: string
  conversationId?: string
  runId?: string
  iteration: number
  toolCallId?: string
  signal?: AbortSignal
  metadata?: Record<string, unknown>
  snapshot?: AgentRuntimeStateSnapshot
  emitUpdate?: (update: unknown) => void
}
```

## Tool Naming Rules

- Names must be `snake_case` (e.g., `search_issues`, `deploy_app`)
- Names must be unique within a single agent's tool set
- Choose descriptive names since the model uses them to decide which tool to call

## Tool Descriptions Matter

The model reads the tool description to decide when and how to use it. Write clear, specific descriptions:

```typescript
// Bad: vague
description: "Does deployment stuff"

// Good: specific with constraints
description: "Deploy the application to staging or production. " +
  "Staging deployments are immediate. Production requires a passing CI build. " +
  "Returns the deployment URL and status."
```

Include constraints, rate limits, and expected behavior in the description.

## Error Handling in Tools

Return errors as structured data instead of throwing:

```typescript
// Good: return error data
execute: async (input) => {
  const file = await readFile(input.path).catch(() => null)
  if (!file) {
    return { error: "File not found", path: input.path }
  }
  return { content: file }
}
```

Direct `Agent` catches thrown tool errors and turns them into error tool results. ClineCore can also treat repeated failed tool turns as recoverable mistakes. Returned error data is still preferred when the model can adjust its approach.

## Completion Tools

Tools with `lifecycle: { completesRun: true }` end the agent loop when they execute successfully:

```typescript
const submitAnswer = createTool({
  name: "submit_answer",
  description: "Submit the final answer and end the task.",
  inputSchema: z.object({
    answer: z.string(),
    confidence: z.number().min(0).max(1),
  }),
  lifecycle: { completesRun: true },
  execute: async (input) => input,
})
```

The model sees the tool result and the run ends. For direct `Agent`, inspect `result.outputText` or the `tool-result` parts in `result.messages`. For ClineCore, `AgentResult.toolCalls` contains structured tool call records.

## Built-in Tools (ClineCore Only)

When using `ClineCore` with `enableTools: true`, the built-in suite can include these tools. The exact set depends on mode, tool routing rules, available configured skills, `enableSpawnAgent`, `enableAgentTeams`, MCP settings, and policies.

| Tool | Name | What It Does |
|------|------|-------------|
| Shell | `run_commands` | Execute shell commands in the session workspace |
| Editor | `editor` | Create and edit files |
| Read | `read_files` | Read file contents |
| Patch | `apply_patch` | Apply unified diffs to files when the patch tool is selected instead of `editor` |
| Search | `search_codebase` | Search file contents and directory structure |
| Web | `fetch_web_content` | Fetch web content via HTTP |
| Skills | `skills` | Invoke configured skills |
| Ask | `ask_question` | Ask the user a follow-up question |
| Submit | `submit_and_exit` | Submit a final answer and end the session |

Built-in tools respect the `cwd` setting in `CoreSessionConfig`.

### Built-in Tool Output Limits & Behavior

Recent SDK versions cap built-in tool output so a single observation can't dominate the context window, and nudge the model toward batched calls. These are runtime behaviors -- you don't configure them, but it helps to know them when reading tool results or writing prompts.

- **`read_files` windowing.** Unranged reads are capped to ~2,000 lines and ~48KB, and each line is truncated at ~2,000 chars (defangs minified files). A notice reports the true line count and how to page. Pass a line range (`start_line`/`end_line`) for exact, unwindowed reads -- ranged reads also work on files larger than the ~10MB whole-file guard.
- **`run_commands` output cap.** Combined stdout/stderr is capped at ~48KB using head+tail sampling (first and last sections kept, middle elided with a notice). Failing commands still return whatever output was captured rather than discarding it.
- **`search_codebase` output cap.** Search results are capped at ~48KB; narrow the query or filter instead of retrying when truncated.
- **`apply_patch` is all-or-nothing.** It now fails the call if any hunk would be skipped, instead of silently applying a partial patch. Fix the failing hunk (usually stale context) and reapply.
- **Parallel tool calls are encouraged.** Built-in tool descriptions now tell the model to issue independent tool calls together in one response (read several files at once, run independent commands together, fetch independent URLs together). Expect, and design for, batched tool calls.

## Tool Policies

Control which tools are available and whether they require approval:

```typescript
// In direct Agent config, policies are checked at execution time
const agent = new Agent({
  tools: [toolA, toolB, toolC],
  toolPolicies: {
    tool_a: { autoApprove: true },    // runs without asking
    tool_b: { autoApprove: false },   // requires approval
    tool_c: { enabled: false },       // blocks execution if requested
  },
})

// In ClineCore config, disabled tools are removed before model requests
await cline.start({
  prompt: "...",
  config: {
    ...config,
    toolPolicies: {
      editor: { enabled: false },
    },
  },
})

// At the top level, policies affect execution approval/blocking for the session
await cline.start({
  prompt: "...",
  config: { ...config },
  toolPolicies: {
    run_commands: { autoApprove: true },
    editor: { autoApprove: false },
  },
})
```

For `ClineCore`, prefer `config.toolPolicies` when you want disabled built-in or extension tools removed before the model sees the tool list. Top-level `cline.start({ toolPolicies })` still affects execution approval and blocking, but it is applied later. Direct `Agent` policies are also checked at execution time after the model has already seen the tool definitions.

### Policy Options

| Policy | Effect |
|--------|--------|
| `{ autoApprove: true }` | Tool runs without approval |
| `{ autoApprove: false }` | Triggers approval callback before running |
| `{ enabled: false }` | Blocks execution in direct `Agent` and top-level ClineCore policies. In ClineCore `config.toolPolicies`, also removes the tool before model requests |
| No policy set | Defaults to enabled and auto-approved |

## Abort Signal in Long-Running Tools

Respect the abort signal for tools that take a long time. If you need a hard timeout for a custom tool, implement it inside the tool body:

```typescript
execute: async (input, context) => {
  const timeout = AbortSignal.timeout(30_000)
  const signal = AbortSignal.any(context.signal ? [context.signal, timeout] : [timeout])
  const results = []
  for (const item of input.items) {
    if (signal.aborted) {
      return { results, aborted: true, processed: results.length }
    }
    results.push(await processItem(item))
  }
  return { results, processed: results.length }
}
```

## Streaming Tool Output

Use `context.emitUpdate` to stream partial tool progress. Subscribers receive `tool-updated` events:

```typescript
execute: async (input, context) => {
  let progress = 0
  for (const step of steps) {
    progress++
    context.emitUpdate?.(`Processing step ${progress}/${steps.length}...`)
    await processStep(step)
  }
  return { completed: true }
}
```

## Testing Tools

Tools are plain async functions, so they're straightforward to test:

```typescript
import { describe, it, expect } from "vitest"

describe("deploy tool", () => {
  it("deploys to staging", async () => {
    const context = { agentId: "test", conversationId: "test", iteration: 1 }
    const result = await deployTool.execute({ environment: "staging" }, context)
    expect(result.status).toBe("deployed")
  })
})
```

## MCP Tool Integration

ClineCore can connect to MCP (Model Context Protocol) servers for additional tools. Configure the MCP settings file at `~/.cline/data/settings/cline_mcp_settings.json`, or set `CLINE_MCP_SETTINGS_PATH` to use a custom file:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["./mcp-server.js"]
    }
  }
}
```

MCP tools appear alongside built-in and custom tools automatically.

## See Also

- `../agent/REFERENCE.md` - Using tools with Agent
- `../clinecore/REFERENCE.md` - Using tools with ClineCore
- `../plugins/REFERENCE.md` - Packaging tools as plugins
