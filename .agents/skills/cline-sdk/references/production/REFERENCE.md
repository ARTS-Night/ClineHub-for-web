# Going to Production

Guidelines for deploying Cline SDK agents in production environments.

## Error Handling

Always check the result status:

```typescript
const result = await agent.run(input)

switch (result.status) {
  case "completed":
    console.log("Success:", result.outputText)
    break
  case "aborted":
    console.log("Cancelled:", result.error?.message)
    break
  case "failed":
    console.error("Failed:", result.error)
    break
}
```

For ClineCore, check `finishReason`:

```typescript
const session = await cline.start({ ... })

switch (session.result?.finishReason) {
  case "completed":
    // normal completion
    break
  case "max_iterations":
    // agent hit iteration limit
    break
  case "aborted":
    // manually cancelled
    break
  case "mistake_limit":
    // too many tool errors
    break
  case "error":
    // unrecoverable error
    break
}
```

## Cost Control

### Token Limits

Set maximum tokens per turn and iteration limits:

```typescript
const agent = new Agent({
  providerId: "anthropic",
  modelId: "claude-sonnet-4-6",
  modelOptions: { maxTokens: 4096 },
  maxIterations: 10,
  tools: [...],
})
```

### Model Selection

Use cheaper models for simple tasks:

```typescript
// Simple classification or formatting
{ providerId: "anthropic", modelId: "claude-haiku-4-5" }

// Complex reasoning and code generation
{ providerId: "anthropic", modelId: "claude-sonnet-4-6" }

// Hardest tasks requiring deep reasoning
{ providerId: "anthropic", modelId: "claude-opus-4-7" }
```

### Usage Tracking

Monitor spending in real time:

```typescript
agent.subscribe((event) => {
  if (event.type === "usage-updated" && event.usage.totalCost) {
    if (event.usage.totalCost > MAX_BUDGET) {
      agent.abort("Budget exceeded")
    }
  }
})
```

## Observability

### OpenTelemetry Integration

The SDK can emit telemetry through an injected `ITelemetryService`. `ClineCore.create()` does not create OpenTelemetry telemetry by itself; construct a telemetry service and pass it in:

```typescript
import {
  ClineCore,
  createClineTelemetryServiceConfig,
  createConfiguredTelemetryHandle,
} from "@cline/sdk"

const telemetryConfig = createClineTelemetryServiceConfig({
  enabled: true,
  serviceName: "my-agent-service",
  otlpEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
  logsExporter: "otlp",
  metricsExporter: "otlp",
  tracesExporter: "otlp",
  metadata: {
    extension_version: "1.0.0",
    cline_type: "sdk-app",
    platform: process.platform,
    platform_version: process.version,
    os_type: process.platform,
    os_version: process.version,
  },
})
const telemetryHandle = createConfiguredTelemetryHandle(telemetryConfig)

const cline = await ClineCore.create({
  clientName: "my-app",
  telemetry: telemetryHandle.telemetry,
})

process.on("SIGTERM", async () => {
  await cline.dispose("SIGTERM")
  await telemetryHandle.dispose()
  process.exit(0)
})
```

### Structured Logging

Use the `BasicLogger` interface for injectable logging:

```typescript
import type { BasicLogger } from "@cline/sdk"

const logger: BasicLogger = {
  debug: (msg, meta) => console.debug(msg, meta),
  log: (msg, meta) => console.log(msg, meta),
  error: (msg, meta) => console.error(msg, meta),
}

await cline.start({
  config: {
    logger,
    // ...
  },
})
```

### Custom Metrics via Plugins

```typescript
const metricsPlugin: AgentPlugin = {
  name: "metrics",
  manifest: { capabilities: ["hooks"] },
  setup() {},
  hooks: {
    beforeRun() {
      metrics.increment("agent.runs.started")
    },
    afterRun({ result }) {
      metrics.increment("agent.runs.completed")
      metrics.histogram("agent.iterations", result.iterations)
      metrics.histogram("agent.tokens.output", result.usage.outputTokens)
    },
    beforeTool({ toolCall }) {
      metrics.increment(`agent.tools.${toolCall.toolName}`)
    },
  },
}
```

## Security

### Sandbox Tool Execution

Validate tool inputs to prevent path traversal and injection:

```typescript
execute: async (input) => {
  const safePath = path.resolve(WORKSPACE_ROOT, input.path)
  if (!safePath.startsWith(WORKSPACE_ROOT)) {
    return { error: "Path traversal attempt blocked" }
  }
  return await readFile(safePath, "utf-8")
}
```

### API Key Management

- Use environment variables, never hardcode keys
- Rotate keys regularly
- Use different keys for development and production

```typescript
{
  providerId: "anthropic",
  modelId: "claude-sonnet-4-6",
  apiKey: process.env.ANTHROPIC_API_KEY, // never a literal string
}
```

### Tool Policy Hardening

Disable tools you don't need before model requests and require approval for dangerous ones:

```typescript
await cline.start({
  prompt: "...",
  config: {
    ...config,
    toolPolicies: {
      fetch_web_content: { enabled: false },    // removed before model requests
    },
  },
  toolPolicies: {
    read_files: { autoApprove: true },
    search_codebase: { autoApprove: true },
    run_commands: { autoApprove: false },       // require approval
    editor: { autoApprove: false },
    apply_patch: { autoApprove: false },
  },
})
```

## Deployment Patterns

### Stateless Worker

For request/response workloads (API endpoints, queue consumers):

```typescript
const cline = await ClineCore.create({
  clientName: "worker",
  backendMode: "local",
})

app.post("/agent", async (req, res) => {
  const session = await cline.start({
    prompt: req.body.prompt,
    config: { ... },
  })
  res.json({ text: session.result?.text, usage: session.result?.usage })
})
```

### Persistent Service

For long-running services with session management:

```typescript
const cline = await ClineCore.create({
  clientName: "service",
  backendMode: "hub",
})

process.on("SIGTERM", async () => {
  await cline.dispose("SIGTERM")
  process.exit(0)
})
```

### Scheduled Automation

See `../scheduling/REFERENCE.md` for recurring agent tasks.

## Retry and Resilience

- `createTool()` stores `retryable` and `maxRetries` metadata, but the direct Agent runtime does not automatically retry failed custom tool executions today
- Built-in ClineCore tools and provider handlers have their own timeout and retry behavior where implemented
- Implement retries inside custom tool `execute` functions when the operation is idempotent
- Implement provider-level retries or fallback model selection in your host when your reliability target requires it
- Use `context.signal` and an in-tool timeout for long-running custom tools
- Monitor `mistake_limit` finish reason to detect systematic tool failures

## See Also

- `../agent/REFERENCE.md` - Agent overview
- `../clinecore/REFERENCE.md` - ClineCore overview
- `../tools/REFERENCE.md` - Tool configuration
- `../plugins/REFERENCE.md` - Metrics plugins
- `../scheduling/REFERENCE.md` - Scheduled agents
