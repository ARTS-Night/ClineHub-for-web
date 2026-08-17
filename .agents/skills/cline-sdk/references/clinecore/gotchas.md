# ClineCore Gotchas

## Always Call dispose()

`ClineCore` holds resources (file watchers, database connections, hub connections). Failing to call `dispose()` can leave orphan processes and file locks.

```typescript
const cline = await ClineCore.create({ clientName: "my-app" })
try {
  // ... use cline
} finally {
  await cline.dispose()
}
```

## Node.js 22 Required

ClineCore and `@cline/core` require Node.js 22 or later. If you're on an older version, you'll get runtime errors. Check with `node --version`.

## Session Config vs Global Config

Tool policies can be set at two levels:
- Global execution policy: in `ClineCore.create({ toolPolicies })` applies to all sessions
- Per-session execution policy: in `cline.start({ toolPolicies })` overrides global approval and blocking for that session
- Session tool-list policy: in `cline.start({ config: { toolPolicies } })` filters disabled built-in and extension tools before the model sees them

For hiding a tool from model requests, use `config.toolPolicies`. For approval or blocking at execution time, use global or top-level start policies.

## enableTools Must Be Explicit

Built-in tools (`run_commands`, `editor`, `read_files`, etc.) are not available unless you set `enableTools: true` in the session config:

```typescript
await cline.start({
  prompt: "Read package.json",
  config: {
    providerId: "anthropic",
    modelId: "claude-sonnet-4-6",
    cwd: process.cwd(),
    systemPrompt: "You are a helpful coding agent.",
    enableTools: true,  // required for built-in tools
    enableSpawnAgent: false,
    enableAgentTeams: false,
  },
})
```

Without this, the agent only has access to custom tools you provide via `config.extraTools` and tools contributed by enabled plugins.

## cwd Matters for Built-in Tools

Built-in tools like `run_commands`, `editor`, and `read_files` operate relative to `config.cwd`. If not set, they use the process working directory. Always set it explicitly for predictable behavior:

```typescript
config: {
  cwd: "/absolute/path/to/project",
  // ...
}
```

## Hub Startup Latency

With `backendMode: "auto"`, the first session may be slow if a hub daemon needs to be spawned. For immediate responsiveness:
- Use `backendMode: "local"` for in-process execution (fastest startup)
- Pre-warm the hub with `cline hub ensure` CLI command
- Accept the one-time startup cost and let subsequent sessions reuse the hub

## Session Storage Location

Sessions are stored at `~/.cline/data/sessions/`. This includes:
- `sessions.db` - SQLite database with session metadata
- per-session manifest and message artifacts. Use `manifestPath` and `messagesPath` returned from `cline.start()` instead of assuming file names.

If you're running in a container or ephemeral environment, these paths may not persist across restarts.

## requestToolApproval Blocks Execution

When a tool policy has `autoApprove: false` and you provide a `requestToolApproval` callback, the agent loop blocks until your callback resolves. If your callback never resolves (e.g., waiting for user input that never comes), the session hangs.

For automated pipelines, either:
- Set all tools to `autoApprove: true`
- Implement a timeout in your approval callback

## Plugin Discovery Paths

ClineCore discovers plugins from:
- Global: `~/.cline/plugins/`
- Workspace: `.cline/plugins/`

For SDK consumers, pass plugins via `extensions: [plugin]` or `pluginPaths: ["./path"]` in the session config.

If a plugin isn't loading, verify:
- The file is in one of the discovery directories, or passed via `extensions`/`pluginPaths`
- The file exports a default plugin object with a non-empty `manifest.capabilities` array
- Every `api.register*` call in `setup()` has a matching capability declared
- If `hooks` is present on the plugin, `"hooks"` is in `capabilities`

## Workspace Context for Plugins

If your plugins use `ctx.workspaceInfo`, pass `cwd` or `workspaceRoot` in the session config. ClineCore derives structured workspace metadata from those fields and forwards it to plugin setup:

```typescript
await cline.start({
  config: {
    ...baseConfig,
    cwd: process.cwd(),
    extensions: [myPlugin],
  },
})
```

The CLI sets workspace fields automatically, but SDK consumers should pass them explicitly.

## send() Requires an Active Session

`cline.send()` only works on sessions that are still active. If a session has already completed, `send()` may return `undefined` or fail. Check session status with `cline.get(sessionId)` first.

## Result May Be Undefined

`session.result` can be `undefined` if the session was started but hasn't completed yet (e.g., in a non-blocking hub mode). Check for this:

```typescript
const session = await cline.start({ ... })
if (session.result) {
  console.log(session.result.text)
} else {
  console.log("Session started but not yet complete")
}
```

## Compaction and Long Sessions

For long-running sessions, message history grows and eventually exceeds the model's context window. ClineCore handles this via compaction, which summarizes older messages. Configure it via `compaction`:

```typescript
config: {
  compaction: {
    strategy: "basic",
    // ...
  },
}
```

The default strategy works for most cases, but extremely long sessions may benefit from tuning.

## See Also

- `api.md` - Full API reference
- `patterns.md` - Common patterns
- `../agent/gotchas.md` - Agent-level gotchas
- `../tools/REFERENCE.md` - Tool troubleshooting
- `../providers/REFERENCE.md` - Provider troubleshooting
