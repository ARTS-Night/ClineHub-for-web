# ClineCore Patterns

## Basic Session with Built-in Tools

```typescript
import { ClineCore } from "@cline/sdk"

const cline = await ClineCore.create({ clientName: "my-app" })

const session = await cline.start({
  prompt: "Read package.json and summarize the dependencies",
  config: {
    providerId: "anthropic",
    modelId: "claude-sonnet-4-6",
    apiKey: process.env.ANTHROPIC_API_KEY,
    cwd: process.cwd(),
    systemPrompt: "You are a helpful coding agent.",
    enableTools: true,
    enableSpawnAgent: false,
    enableAgentTeams: false,
  },
})

console.log(session.result?.text)
await cline.dispose()
```

## Streaming Session with UI Updates

```typescript
const cline = await ClineCore.create({ clientName: "my-app" })

cline.subscribe((event) => {
  switch (event.type) {
    case "agent_event":
      if (
        event.payload.event.type === "content_start" &&
        event.payload.event.contentType === "text" &&
        event.payload.event.text
      ) {
        ui.appendText(event.payload.event.text)
      }
      break
    case "ended":
      ui.showComplete(event.payload.reason)
      break
  }
})

await cline.start({
  prompt: "Refactor the auth module",
  config: {
    providerId: "anthropic",
    modelId: "claude-sonnet-4-6",
    cwd: "/path/to/project",
    systemPrompt: "You are a helpful coding agent.",
    enableTools: true,
    enableSpawnAgent: false,
    enableAgentTeams: false,
  },
})
```

## Multi-Turn Session

```typescript
const cline = await ClineCore.create({ clientName: "my-app" })

const session = await cline.start({
  prompt: "Create a new Express server",
  config: {
    providerId: "anthropic",
    modelId: "claude-sonnet-4-6",
    cwd: "/path/to/project",
    systemPrompt: "You are a helpful coding agent.",
    enableTools: true,
    enableSpawnAgent: false,
    enableAgentTeams: false,
  },
})

// Follow-up
const result = await cline.send({
  sessionId: session.sessionId,
  prompt: "Now add a health check endpoint",
})

console.log(result?.text)
await cline.dispose()
```

## Tiered Permission Model

Auto-approve reads, require approval for writes:

```typescript
const cline = await ClineCore.create({
  clientName: "my-app",
  toolPolicies: {
    read_files: { autoApprove: true },
    search_codebase: { autoApprove: true },
    fetch_web_content: { autoApprove: true },
    run_commands: { autoApprove: false },
    editor: { autoApprove: false },
    apply_patch: { autoApprove: false },
  },
  capabilities: {
    requestToolApproval: async (request) => {
      const approved = await promptUser(
        `Allow ${request.toolName}?\n${JSON.stringify(request.input, null, 2)}`
      )
      return { approved }
    },
  },
})
```

## Custom Tools Alongside Built-ins

```typescript
import { ClineCore, createTool } from "@cline/sdk"
import { z } from "zod"

const deployTool = createTool({
  name: "deploy",
  description: "Deploy the application to the specified environment.",
  inputSchema: z.object({
    environment: z.enum(["staging", "production"]),
  }),
  execute: async (input) => {
    const result = await runDeployment(input.environment)
    return { url: result.url, status: "deployed" }
  },
})

const cline = await ClineCore.create({ clientName: "my-app" })

await cline.start({
  prompt: "Deploy the app to staging",
  config: {
    providerId: "anthropic",
    modelId: "claude-sonnet-4-6",
    cwd: process.cwd(),
    systemPrompt: "You are a deployment assistant.",
    enableTools: true,
    enableSpawnAgent: false,
    enableAgentTeams: false,
    extraTools: [deployTool],
  },
})
```

## Session with Plugins

Load plugins inline with `extensions`. Pass `cwd` or `workspaceRoot` so plugins receive accurate `ctx.workspaceInfo`:

```typescript
import { ClineCore } from "@cline/sdk"
import myPlugin from "./my-plugin"

const cline = await ClineCore.create({
  clientName: "my-app",
  backendMode: "local",
})

await cline.start({
  prompt: "Do the thing my plugin enables",
  config: {
    providerId: "anthropic",
    modelId: "claude-sonnet-4-6",
    cwd: process.cwd(),
    systemPrompt: "You are a helpful assistant.",
    enableTools: true,
    enableSpawnAgent: false,
    enableAgentTeams: false,
    extensions: [myPlugin],
  },
})

await cline.dispose()
```

For directory-based plugin packages, use `pluginPaths` instead:

```typescript
config: {
  pluginPaths: ["./my-cline-plugin"],
  cwd: process.cwd(),
}
```

See `../plugins/REFERENCE.md` for the full plugin authoring guide.

## Session Listing and Replay

```typescript
const cline = await ClineCore.create({ clientName: "my-app" })

// List recent sessions
const sessions = await cline.list(10)
for (const session of sessions) {
  console.log(`${session.sessionId}: ${session.metadata?.title ?? ""}`)
}

// Read messages from a past session
const messages = await cline.readMessages(sessions[0].sessionId)
for (const msg of messages) {
  console.log(`[${msg.role}] ${msg.content}`)
}

// Check usage
const usage = await cline.getAccumulatedUsage(sessions[0].sessionId)
const aggregate = usage?.aggregateUsage
console.log(`Total tokens: ${(aggregate?.inputTokens ?? 0) + (aggregate?.outputTokens ?? 0)}`)
```

## Graceful Shutdown

```typescript
const cline = await ClineCore.create({ clientName: "my-app" })

process.on("SIGTERM", async () => {
  await cline.dispose("SIGTERM received")
  process.exit(0)
})

// Run sessions...
```

## Stateless Worker Pattern

For request/response workloads (API endpoints, queue consumers):

```typescript
import { ClineCore } from "@cline/sdk"

const cline = await ClineCore.create({
  clientName: "worker",
  backendMode: "local",
})

async function handleRequest(prompt: string, workspace: string) {
  const session = await cline.start({
    prompt,
    config: {
      providerId: "anthropic",
      modelId: "claude-sonnet-4-6",
      cwd: workspace,
      systemPrompt: "You are a focused worker agent.",
      enableTools: true,
      enableSpawnAgent: false,
      enableAgentTeams: false,
    },
  })

  return {
    text: session.result?.text,
    usage: session.result?.usage,
    sessionId: session.sessionId,
  }
}
```

## Hub-Backed Multi-Client

Multiple clients can attach to the same session:

```typescript
// Process 1: start session
const cline = await ClineCore.create({
  clientName: "backend",
  backendMode: "hub",
})

const session = await cline.start({
  prompt: "Long running refactor task",
  config: { ... },
})

// Process 2: attach and stream events
const viewer = await ClineCore.create({
  clientName: "dashboard",
  backendMode: "hub",
})

viewer.subscribe((event) => {
  dashboard.render(event)
}, { sessionId: session.sessionId })
```

## See Also

- `api.md` - Full API reference
- `gotchas.md` - Common pitfalls
- `../tools/REFERENCE.md` - Tool creation
- `../plugins/REFERENCE.md` - Plugin system
- `../scheduling/REFERENCE.md` - Scheduled agents
