# Plugins

A ClineCore plugin is a TypeScript module that extends hosts built on `@cline/core` or `@cline/sdk`. The same plugin shape is used by the Cline CLI, editor extensions, and custom apps that load plugins through `ClineCore`.

A plugin can:

- Register tools the model can call.
- Register MCP servers whose tools the model can call.
- Bundle skills -- reusable `SKILL.md` instructions the host discovers from the package and surfaces as slash commands.
- Hook into the agent loop before/after runs, model calls, and tool calls.
- Rewrite provider messages before they hit the model (custom compaction, redaction, context shaping).
- Register slash commands, prompt rules, providers, and automation event types.

A plugin ships in one of two shapes:

1. Single-file plugin -- one `.ts` file that exports a default plugin object. Drop it in a discovery folder and it loads. Can only import Node builtins (`node:fs`, etc.) and host-provided `@cline/*` packages. No npm dependencies.
2. Plugin package -- a directory with `package.json`, npm dependencies, and optionally bundled assets. Installable via `cline plugin install`.

Both shapes use the same ClineCore plugin API.

### Which Shape Do I Need?

The dividing line is npm dependencies. If your plugin only uses Node builtins and `@cline/*`, ship a single file. The moment you reach for `zod`, `yaml`, `axios`, an internal SDK client, or any other third-party package, you need the package shape. There is no middle ground -- a single `.ts` file with `import { z } from "zod"` fails at load with `Cannot find module 'zod'` because the plugin loader walks up from the plugin file looking for `node_modules/<package>` and there is nowhere for those deps to live next to a bare file.

Direct `Agent` has a different, smaller runtime plugin shape: `plugins` entries can return `{ tools, hooks }` from `setup(context)`, but they do not use `manifest` or `setup(api, ctx)`. Use the `AgentPlugin` examples in this file with ClineCore `extensions` or `pluginPaths`, not with direct `Agent.plugins`.

## The Mental Model

When the host starts a session, it builds a registry of plugins and runs four phases:

1. resolve -- collect the plugin objects.
2. validate -- check each plugin's `manifest`. Capabilities must be non-empty, unsupported capability names fail, and if `hooks` is present, `"hooks"` must be in `capabilities`.
3. setup -- call each plugin's `setup(api, ctx)` once. This is where you `registerTool`, `registerCommand`, etc.
4. activate -- registry is frozen, the agent loop starts, and your hooks/tools are live.

Two invariants the registry enforces:

- Declare the matching capability for every contribution. The registry throws for missing `"rules"`, `"automationEvents"`, and `"mcp"` during those registrations, and it throws when a plugin defines `hooks` without the `"hooks"` capability. Other contribution capability checks may be enforced by host discovery and plugin metadata, so keep the manifest accurate. Bundled skills are the exception -- they are file-based and never go through `api` (see "Bundled Skills" below).
- If a plugin defines runtime hooks, `"hooks"` must be in `manifest.capabilities`. Declaring `"hooks"` without a `hooks` object is allowed but unnecessary.

After validation, registration is one-shot -- no dynamic register/unregister during the session.

## The Smallest Working Plugin

```typescript
import type { AgentPlugin } from "@cline/sdk"
import { createTool } from "@cline/sdk"

const plugin: AgentPlugin = {
  name: "hello-plugin",
  manifest: {
    capabilities: ["tools"],
  },
  setup(api, ctx) {
    api.registerTool(
      createTool({
        name: "say_hello",
        description: "Greet a person by name.",
        inputSchema: {
          type: "object",
          properties: { name: { type: "string" } },
          required: ["name"],
        },
        async execute({ name }: { name: string }) {
          return { greeting: `Hello, ${name}!` }
        },
      }),
    )
  },
}

export default plugin
```

The agent will see `say_hello` as a callable tool.

## The Manifest

```typescript
manifest: {
  capabilities: ["tools", "hooks"],   // required, non-empty array
  paths?: string[],                   // optional, multi-entry packages
  providerIds?: string[],             // optional, provider plugins
  modelIds?: string[],                // optional, model plugins
}
```

### The Complete Capability List

| Capability | What It Unlocks in `api` |
|-----------|--------------------------|
| `"tools"` | `api.registerTool()` |
| `"commands"` | `api.registerCommand()` (slash commands in chat surfaces) |
| `"rules"` | `api.registerRule()` (string injected into the system prompt) |
| `"mcp"` | `api.registerMcpServer()` (exposes an MCP server's tools to the agent) |
| `"messageBuilders"` | `api.registerMessageBuilder()` (rewrites provider-bound messages) |
| `"providers"` | `api.registerProvider()` (provider contribution metadata) |
| `"automationEvents"` | `api.registerAutomationEventType()` and `ctx.automation?.ingestEvent()` |
| `"hooks"` | The runtime `hooks` object on the plugin (lifecycle callbacks) |
| `"skills"` | No `api` method. Optional declaration that the plugin ships skills; the host discovers them from the package `skills/` directory (see "Bundled Skills"). There is no `api.registerSkill()`. |

You declare any combination -- most real plugins need 1-3 capabilities.

## setup(api, ctx) -- The Registration Phase

`setup()` runs once per session before the agent loop starts. Everything you register here is frozen for the lifetime of the session.

### The api Object

Each `register*` method should have the matching capability in your manifest:

```typescript
api.registerTool(tool)                              // declare "tools"
api.registerCommand({ name, description, handler }) // declare "commands"
api.registerRule({ id, content, source })            // requires "rules"
api.registerMcpServer({ name, transport })           // requires "mcp"
api.registerMessageBuilder({ name, build })          // declare "messageBuilders"
api.registerProvider({ name, description, metadata }) // declare "providers"
api.registerAutomationEventType({ eventType, source }) // requires "automationEvents"
```

There is no `api.registerSkill()`. Skills are file-based -- you ship them as `SKILL.md` files in the package and the host discovers them (see "Bundled Skills").

### The ctx Object -- Host-Provided Session Context

The second argument carries everything the host knows about the current session. All fields are optional, so feature-detect before using them -- the same plugin must work in hosts that supply less context (unit tests, sandboxed plugin processes).

```typescript
ctx.session?.sessionId       // string, stable core session id
ctx.client?.name             // host: "cline-cli", "cline-vscode", etc.
ctx.user                     // authenticated user/org info, when available
ctx.workspaceInfo            // { rootPath, hint, latestGitBranchName,
                             //   latestGitCommitHash, associatedRemoteUrls }
ctx.automation?.ingestEvent  // emit normalized automation events
ctx.logger?.log              // structured logger scoped to this plugin
ctx.telemetry                // ITelemetryService, only present in-process
```

Two rules about `ctx.workspaceInfo`:

1. Always prefer `ctx.workspaceInfo?.rootPath` over `process.cwd()`. The CLI may have been launched with `--cwd` without calling `chdir`, and VS Code workspaces don't share a single CWD. `workspaceInfo` is sourced from the session config and is always correct.
2. Don't use `import.meta.url` tricks to find "the workspace". That gives you the plugin's own location, not the user's project.

### Persisting State Across Hooks

`setup()` runs first; hooks fire later. The simplest way to share state is module-level variables:

```typescript
let sessionWorkspaceRoot: string | undefined
let sessionBranch: string | undefined

const plugin: AgentPlugin = {
  name: "metrics",
  manifest: { capabilities: ["hooks"] },
  setup(api, ctx) {
    sessionWorkspaceRoot = ctx.workspaceInfo?.rootPath
    sessionBranch = ctx.workspaceInfo?.latestGitBranchName
  },
  hooks: {
    beforeTool({ toolCall, input }) {
      if (sessionBranch === "main" && toolCall.toolName === "run_commands") {
        // inspect input, optionally block
      }
      return undefined
    },
  },
}
```

A single Node process may host multiple sessions concurrently. If your plugin will run in a multi-session host, key your state by `ctx.session?.sessionId`:

```typescript
const stateBySession = new Map<string, MyState>()
setup(api, ctx) {
  const id = ctx.session?.sessionId
  if (id) stateBySession.set(id, /* ... */)
}
```

## Runtime Hooks

Runtime hooks are typed in-process callbacks on the same hook layer the runtime uses internally. They run inside the agent loop with full type information -- no IPC, no JSON marshaling.

Declare `"hooks"` in `manifest.capabilities`, then add a `hooks` property:

```typescript
const plugin: AgentPlugin = {
  name: "metrics",
  manifest: { capabilities: ["hooks"] },
  hooks: {
    beforeRun(ctx) { /* ... */ },
    beforeTool({ toolCall, input }) { /* ... */ },
    afterTool({ toolCall, result }) { /* ... */ },
    afterRun({ result }) { /* ... */ },
    onEvent(event) { /* ... */ },
  },
}
```

### The Seven Hooks

| Hook | Fires | Can Stop the Loop? | Common Uses |
|------|-------|--------------------|-------------|
| `beforeRun` | Before the runtime loop starts | Yes | Greet, log, attach session metadata |
| `afterRun` | After the runtime loop finishes (success, abort, or fail) | No | Notifications, metrics, persistent logs |
| `beforeModel` | Before each model request | Yes (mutate req) | Inject context, last-mile prompt edits |
| `afterModel` | After each model response, before tool execution | Yes | Block based on model output |
| `beforeTool` | Before each tool execution | Yes (`{ stop }`) | Audit, redact, block dangerous tools |
| `afterTool` | After each tool execution | Can replace result | Post-process, redact secrets in tool output |
| `onEvent` | On every `AgentRuntimeEvent` emitted by the runtime | No | Streaming UIs, telemetry pipes |

### Stopping the Loop from a Hook

Several hooks return an optional control object. The most common pattern is `beforeTool` blocking a destructive tool call:

```typescript
beforeTool({ toolCall, input }) {
  if (toolCall.toolName === "run_commands") {
    const { commands } = input as { commands?: string[] }
    if (sessionBranch === "main" && commands?.some(c => c.startsWith("git push"))) {
      return { stop: true, reason: "Blocked git push on protected branch" }
    }
  }
  return undefined  // explicit "continue"
}
```

Returning `undefined` (or omitting `return`) lets execution continue normally.

### afterRun Semantics

`afterRun` fires for every terminal status -- `completed`, `aborted`, `failed`. If you only want to act on success:

```typescript
afterRun({ result }) {
  if (result.status !== "completed") return
  // notify, log success metrics, etc.
}
```

### Plugin Hooks vs File Hooks

The runtime supports two hook systems:

- File hooks -- external scripts in `.cline/hooks/` invoked with serialized JSON. Right for user/workspace-specific scripts that don't ship with code.
- Plugin runtime hooks -- typed in-process callbacks. Right when the behavior belongs to a reusable extension and needs typed access to the runtime.

Core adapts file hooks onto the runtime hook layer, so you don't need both. If you're shipping a plugin, write it as runtime hooks.

## Message Builders

Message builders rewrite the provider-bound message list before the model call. They run after runtime messages are converted into SDK message blocks but before core's built-in safety builder.

Use them for:

- Custom compaction policies (replace middle history with a summary).
- Redacting PII or secrets before they reach the provider.
- Reshaping context for a specific model's strengths.

```typescript
api.registerMessageBuilder({
  name: "summarize-middle-history",
  build(messages) {
    if (estimateTokens(messages) < THRESHOLD) return messages
    return [...prefix, summary, ...recent]
  },
})
```

Multiple builders run in registration order; the output of one is the input of the next.

When to use `beforeModel` instead: reach for the `beforeModel` hook only if you need the runtime snapshot or want to mutate the request object itself. Pure message rewrites belong in a builder.

## Automation Events

Plugins can declare normalized event types and emit them into Cline automation. Hosts that don't have automation enabled simply ignore both -- feature-detect `ctx.automation`.

```typescript
manifest: { capabilities: ["automationEvents"] },

setup(api, ctx) {
  api.registerAutomationEventType({
    eventType: "github.pull_request.opened",
    source: "github",
    description: "A new GitHub PR was opened",
    attributesSchema: { /* JSON Schema for envelope.attributes */ },
  })

  if (!ctx.automation) return  // host has no automation
  ctx.automation.ingestEvent({
    eventId: "pr-1234",
    eventType: "github.pull_request.opened",
    source: "github",
    subject: "owner/repo#1234",
    occurredAt: new Date().toISOString(),
    attributes: { /* ... */ },
  })
}
```

## Slash Commands

Register a slash command with `api.registerCommand()` (declare `"commands"`). The handler receives the raw argument string typed after the command and returns a result:

```typescript
api.registerCommand({
  name: "summarize",
  description: "Summarize the current diff.",
  handler(input) {
    // input is the text typed after "/summarize"
    return { submitPrompt: `Summarize this diff with focus on: ${input}` }
  },
})
```

A command result is either a string or an object:

```typescript
type AgentExtensionCommandResult =
  | string
  | {
      reply?: string        // text shown back to the user
      submitPrompt?: string // queue a new prompt for the agent to run
    }
```

- Return a string (or `{ reply }`) to print a message without invoking the model.
- Return `{ submitPrompt }` to submit a new prompt to the agent, as if the user had typed it. This is how a command kicks off an actual agent run rather than just replying.

Bundled skills also appear as slash commands automatically -- you do **not** call `registerCommand` for them (see "Bundled Skills").

## MCP Servers

Declare `"mcp"` and call `api.registerMcpServer()` to expose an MCP (Model Context Protocol) server's tools to the agent. The host launches/connects the server and merges its tools into the runtime tool list alongside built-in, custom, and other plugin tools.

```typescript
const plugin: AgentPlugin = {
  name: "github-mcp",
  manifest: { capabilities: ["mcp"] },
  setup(api) {
    api.registerMcpServer({
      name: "github",
      transport: {
        type: "stdio",
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-github"],
      },
      env: {
        // Resolve from the host process env; skip the server if unset.
        GITHUB_TOKEN: { fromEnv: "GITHUB_TOKEN", required: true },
      },
    })
  },
}
```

### Transports

```typescript
// stdio: spawn a local process
{ type: "stdio", command: string, args?: string[], cwd?: string, env?: Record<string, string> }

// sse: connect to a Server-Sent Events endpoint
{ type: "sse", url: string, headers?: Record<string, string> }

// streamableHttp: connect to a streamable HTTP endpoint
{ type: "streamableHttp", url: string, headers?: Record<string, string> }
```

### Env Resolution

Top-level `env` entries are resolved by the host and merged into the **stdio** process environment (they are ignored for `sse`/`streamableHttp`, which use `headers`). Each value is either a literal string or a resolver object:

```typescript
interface AgentExtensionMcpEnvValue {
  fromEnv?: string    // read this var from the host process env
  value?: string      // literal fallback when fromEnv is omitted or unset
  required?: boolean   // skip the whole MCP server if no value resolves
}
```

This keeps secrets out of the plugin source -- ship `{ fromEnv: "GITHUB_TOKEN", required: true }`, not the token itself.

### Install-Time OAuth

When a plugin registers an MCP server that supports OAuth, `cline plugin install` runs an authorization flow during install and stores the resulting tokens in the host MCP settings alongside the registered server (tagged with `metadata.source = "plugin"`). The end user authorizes once at install time; the plugin source never holds credentials. If authorization fails or is declined, the server is left unauthorized and its tools are unavailable until the user re-authorizes.

## Bundled Skills

A plugin package can ship **skills** -- reusable `SKILL.md` instruction files that the host discovers from the package and makes available as slash commands. There is **no `api.registerSkill()`**: skills are purely file-based. You don't register them, and you don't register slash commands for them either -- the runtime discovers them and exposes them automatically.

To bundle skills:

1. Use the **package shape** (a directory with `package.json` whose `cline.plugins` declares the entry). Skill discovery walks from the plugin entry to its owning package root, so a bare single-file plugin dropped in `.cline/plugins/` cannot bundle skills this way.
2. Add a `skills/` directory at the package root.
3. Put each skill in its own subdirectory containing a `SKILL.md`:

```
my-cline-plugin/
+-- package.json
+-- index.ts
+-- skills/
    +-- code-review/
    |   +-- SKILL.md
    +-- migrate-db/
        +-- SKILL.md
```

Each `SKILL.md` is a standard skill file: YAML frontmatter (`name`, `description`) plus a markdown body of instructions.

```markdown
---
name: code-review
description: Review a code change with this project's checklist.
---

# Code Review

Inspect the current diff. Check for missing tests, behavior changes, and
migration risk. Report findings first, then any open questions.
```

Rules and behavior:

- Discovery is file-based and does **not** require the `"skills"` capability -- placing the files is what matters. Declaring `"skills"` in `manifest.capabilities` is an optional, recommended signal that the package contributes skills; a plugin can declare `"skills"` and contribute nothing but skills (no `setup`).
- Plugin-bundled skills share the same skills executor and slash-command listing as local `.cline/skills/` and `~/.cline/skills/` skills. A skill named `code-review` is invokable as `/code-review`.
- A single `SKILL.md` placed directly in `skills/` is also discovered; subdirectories are the convention when a package ships more than one skill.
- The skill name comes from the `SKILL.md` frontmatter, not the directory name.

> Note: a `skills/` directory holding flat, non-`SKILL.md` files (as in the `agents-squad` example) is **plugin-private data** the plugin reads itself -- it is not the host skill-discovery mechanism described here. Host-discovered skills must be `SKILL.md` files.

## Loading a Plugin

There are three ways a plugin gets into a session:

### Auto-Discovery (CLI)

The CLI scans these directories on startup:

- `<workspace>/.cline/plugins/` -- project-scoped plugins.
- `~/.cline/plugins/` -- user-scoped plugins.
- `~/Documents/Cline/Plugins/` -- user-scoped plugins in the documents location.

Drop a `.ts` or `.js` file in, run `cline`, done:

```bash
mkdir -p .cline/plugins
cp my-plugin.ts .cline/plugins/
cline -i "do the thing my plugin enables"
```

### Explicit extensions in SDK Config

When you build your own host with `ClineCore`, pass the plugin object directly:

```typescript
import plugin from "./my-plugin"
import { ClineCore } from "@cline/sdk"

const host = await ClineCore.create({ backendMode: "local" })
await host.start({
  config: {
    providerId: "anthropic",
    modelId: "claude-sonnet-4-6",
    apiKey: process.env.ANTHROPIC_API_KEY ?? "",
    cwd: process.cwd(),
    enableTools: true,
    enableSpawnAgent: false,
    enableAgentTeams: false,
    systemPrompt: "You are a helpful assistant.",
    extensions: [plugin],
  },
  prompt: "...",
  interactive: false,
})
```

### pluginPaths for Directory-Based Plugins

When the plugin is a directory with `package.json`, point `pluginPaths` at the directory:

```typescript
config: {
  pluginPaths: ["./path/to/my-plugin-package"],
}
```

Or install with the CLI:

```bash
cline plugin install ./path/to/my-plugin-package
cline plugin install @scope/my-cline-plugin       # from npm
cline plugin install --git github.com/owner/repo  # from git
```

## Single-File Plugin Template

Save as `my-plugin.ts`, drop in `.cline/plugins/`:

```typescript
import { type AgentPlugin, ClineCore, createTool } from "@cline/sdk"

let sessionRoot: string | undefined

interface DoThingInput {
  target: string
}

const plugin: AgentPlugin = {
  name: "my-plugin",
  manifest: {
    capabilities: ["tools", "hooks"],
  },

  setup(api, ctx) {
    sessionRoot = ctx.workspaceInfo?.rootPath

    api.registerTool(
      createTool({
        name: "do_thing",
        description: "Do the thing this plugin exists for.",
        inputSchema: {
          type: "object",
          properties: { target: { type: "string" } },
          required: ["target"],
        },
        async execute(input: DoThingInput) {
          const { target } = input
          return { ok: true, target, root: sessionRoot }
        },
      }),
    )
  },

  hooks: {
    beforeRun() {
      console.log("[my-plugin] run started")
    },
    afterRun({ result }) {
      if (result.status !== "completed") return
      console.log(`[my-plugin] done in ${result.iterations} iteration(s)`)
    },
  },
}

async function runDemo(): Promise<void> {
  const host = await ClineCore.create({ backendMode: "local" })
  try {
    const result = await host.start({
      config: {
        providerId: "anthropic",
        modelId: "claude-sonnet-4-6",
        apiKey: process.env.ANTHROPIC_API_KEY ?? "",
        cwd: process.cwd(),
        enableTools: true,
        enableSpawnAgent: false,
        enableAgentTeams: false,
        systemPrompt: "You are a helpful assistant. Use tools when needed.",
        extensions: [plugin],
      },
      prompt: "Use do_thing on the target 'world'.",
      interactive: false,
    })
    console.log(result.result?.text ?? "")
  } finally {
    await host.dispose()
  }
}

if (import.meta.main) {
  await runDemo()
}

export { plugin, runDemo }
export default plugin
```

Copy it, rename the tool, swap in your logic. The `runDemo()` function lets you test with `ANTHROPIC_API_KEY=sk-... bun run my-plugin.ts`.

## Plugin Package

Use a plugin package when you need npm dependencies, multiple entry points, bundled assets, or npm/git distribution.

### Layout

```
my-cline-plugin/
+-- package.json
+-- tsconfig.json          (optional, for local typechecking)
+-- index.ts               (the plugin entry point)
+-- README.md
+-- assets/                (optional, bundled content)
    +-- templates/
    +-- schemas/
```

### package.json -- The Discovery Contract

Dependencies under the `@cline/` scope are provided by the host runtime. The installer automatically strips these from the plugin's dependency list before running `npm install`, so declare any `@cline/*` package your plugin imports as an optional peer dependency.

```json
{
  "name": "my-cline-plugin",
  "version": "0.1.0",
  "private": true,
  "description": "What this plugin does, in one sentence.",
  "type": "module",
  "exports": {
    ".": "./index.ts"
  },
  "cline": {
    "plugins": [
      {
        "paths": ["./index.ts"],
        "capabilities": ["tools", "hooks"]
      }
    ]
  },
  "peerDependencies": {
    "@cline/sdk": "*"
  },
  "peerDependenciesMeta": {
    "@cline/sdk": { "optional": true }
  },
  "dependencies": {
    "zod": "^4.1.5"
  }
}
```

Key fields:

- `type: "module"` -- required. Cline plugins are ES modules.
- `cline.plugins` -- the discovery contract. Array of entries with `paths` pointing at entry files. The exported plugin object's own `manifest.capabilities` is still the runtime source of truth.
- Bundled skills (optional) -- add a `skills/<name>/SKILL.md` per skill at the package root. There is no manifest field for skills; discovery is file-based (see "Bundled Skills"). Declaring `"skills"` in the entry's `capabilities` is a recommended signal but not required for discovery.
- `peerDependencies` for the `@cline/*` package your plugin imports -- the host already provides it. Marking it optional lets you typecheck in isolation.
- `dependencies` -- any npm package your plugin imports at runtime. These get installed into `node_modules` adjacent to your entry file, and the plugin loader walks up from the entry to resolve them.

### Local Dev Loop

You don't have to `cline plugin install` on every edit. Two iteration patterns:

```bash
# 1. Install your deps once
cd my-cline-plugin
npm install
```

Then point the SDK at the directory directly:

```typescript
await host.start({
  config: {
    // ...provider/model
    pluginPaths: ["./my-cline-plugin"],
  },
  prompt: "...",
})
```

`pluginPaths` accepts either an entry file or a package directory (`resolveConfiguredPluginModulePaths` in `@cline/shared/storage`). When it gets a directory it reads `package.json`, follows the `cline.plugins` paths, and loads each entry. Edit `index.ts`, restart, repeat -- no install step.

`cline plugin install` is the right tool for distribution, not for iteration. See "Distributing" below.

### Distributing

`cline plugin install <source>` handles the whole pipeline for recipients: it stages your plugin into `~/.cline/plugins/_installed/<source-type>/`, strips host-provided `@cline/*` deps from `package.json`, runs `npm install --omit=dev --omit=peer` inside the install path, and writes a wrapper manifest that points at your entry file. The end user never runs `npm install` themselves.

Three distribution channels, same install command:

```bash
cline plugin install --git github.com/your-org/my-cline-plugin
cline plugin install npm:@your-org/my-cline-plugin
cline plugin install /local/path/to/my-cline-plugin
```

Local installs copy the directory (skipping `.git` and `node_modules`) and then run `npm install` in the copy, so your local dev `node_modules` is not what runs in production.

### Bundling Assets

Resolve asset paths with `import.meta.url`, not `process.cwd()`:

```typescript
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { readFileSync, existsSync } from "node:fs"

const MODULE_DIR = dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = join(MODULE_DIR, "assets", "templates")

function loadTemplate(name: string): string | undefined {
  const path = join(TEMPLATES_DIR, `${name}.md`)
  return existsSync(path) ? readFileSync(path, "utf8") : undefined
}
```

This is the only place `import.meta.url` is appropriate in a plugin -- locating files inside the plugin package. For workspace paths, always use `ctx.workspaceInfo?.rootPath`.

### The Override Pattern (Bundled / Global / Project)

A package can ship default assets and let users override them. The convention is a three-tier lookup, last write wins by `name`:

1. bundled -- files inside the plugin package (defaults shipped with the plugin).
2. global -- files under `~/.cline/data/settings/<kind>/` (user overrides).
3. project -- files under `<workspace>/.cline/<kind>/` (project overrides).

### Multiple Plugin Entries

If your package exposes more than one plugin, list each in `cline.plugins`:

```json
"cline": {
  "plugins": [
    { "paths": ["./tools-plugin.ts"], "capabilities": ["tools"] },
    { "paths": ["./hooks-plugin.ts"], "capabilities": ["hooks"] }
  ]
}
```

Each entry file should `export default` its own plugin object.

## Testing Your Plugin

### Unit Tests

The plugin object is plain data. Drive `setup()` against a minimal context and exercise tools directly:

```typescript
import plugin from "../my-plugin"

const tools: unknown[] = []
type PluginSetup = NonNullable<typeof plugin.setup>

const api: Parameters<PluginSetup>[0] = {
  registerTool: (t: unknown) => tools.push(t),
  registerCommand: () => {},
  registerRule: () => {},
  registerMcpServer: () => {},
  registerMessageBuilder: () => {},
  registerProvider: () => {},
  registerAutomationEventType: () => {},
}
await plugin.setup?.(api, {
  workspaceInfo: { rootPath: "/tmp/fake-workspace" },
})

// Now `tools` contains the registered tools -- call tool.execute(input, ctx)
```

### End-to-End with runDemo()

Add a `runDemo()` in your plugin file (see the single-file template above) that boots a real `ClineCore` session:

```bash
ANTHROPIC_API_KEY=sk-... bun run my-plugin.ts
```

### CLI Smoke Test

```bash
mkdir -p .cline/plugins
cp my-plugin.ts .cline/plugins/
cline -i "trigger something that exercises the plugin"
```

For packages:

```bash
cline plugin install ./my-cline-plugin
cline -i "..."
```

If the plugin fails validation or setup, the CLI prints a clear error and continues without it.

## Common Gotchas

- "capabilities must be a non-empty array" -- you forgot `manifest.capabilities`, or it's `[]`.
- "registerRule requires the 'rules' capability" -- capability/handler drift. Add `"rules"` to capabilities, or stop calling `registerRule`.
- "registerAutomationEventType requires the 'automationEvents' capability" -- add `"automationEvents"` to capabilities, or stop registering automation event types.
- Plugin tool not visible to the model -- check that the plugin declares `"tools"` before calling `api.registerTool()`, that the plugin loaded successfully, and that global tool settings have not disabled the tool. `enableTools` controls the default built-in suite, not whether plugin tools can be registered.
- MCP server tools not appearing -- declare `"mcp"` before calling `api.registerMcpServer()`, confirm the transport command/url is correct, and verify any `required` env values resolve (an unmet `required` value skips the server). For OAuth servers, confirm authorization completed during `cline plugin install`.
- Bundled skill not discovered -- bundled skills require the **package shape**; a single-file plugin in `.cline/plugins/` cannot ship them. Confirm files are at `<package>/skills/<name>/SKILL.md` (named `SKILL.md`, not `<name>.md`), the package `package.json` declares the entry in `cline.plugins`, and the frontmatter has a non-empty `name`. There is no `registerSkill` call to add.
- `ctx.workspaceInfo` is undefined in unit tests -- your test did not pass setup context. In ClineCore sessions, pass `cwd` or `workspaceRoot` so core can derive workspace metadata.
- State leaking across sessions -- module-level variables are shared across sessions in the same process. Key by `ctx.session?.sessionId` if your host runs multiple sessions concurrently.
- `afterRun` firing on aborts -- guard with `if (result.status !== "completed") return`.
- Heavy work in `setup()` -- `setup()` blocks session start. Defer expensive work into the first tool call or `beforeRun`.
- Importing host internals -- import public SDK APIs from `@cline/sdk` or `@cline/core`. Reaching into host-specific packages, such as CLI internals, will break in non-CLI hosts.
- Sandboxed plugins and `telemetry` -- telemetry is process-local. Feature-detect `ctx.telemetry` and expect it to be undefined in sandboxed plugin processes.
- Resolving bundled assets -- use `import.meta.url` + `fileURLToPath` to find files inside your package; never `process.cwd()`. For workspace paths, do the opposite: use `ctx.workspaceInfo?.rootPath`, never `import.meta.url`.
- Plugin name collisions -- `name` must be unique within a session. If two plugins share a name, validation fails. Namespace by package (`my-org-redactor`, not `redactor`).
- `Cannot find module 'xxx'` from a single-file plugin -- you reached for an npm dep from a `.ts` dropped in `.cline/plugins/`. Single-file plugins can only import Node builtins and `@cline/*`. Convert to a package: make a directory, add `package.json` with `dependencies`, `npm install`, then point `pluginPaths` at the directory (or `cline plugin install` it).

## Decision Guide -- Which Extension Point?

| You want to... | Use |
|----------------|-----|
| Give the model a new capability | `registerTool` |
| Expose an MCP server's tools | `registerMcpServer` (declare `"mcp"`) |
| Ship reusable instructions users invoke as `/commands` | Bundle `skills/<name>/SKILL.md` (no API call) |
| Add a slash command in chat surfaces | `registerCommand` |
| Submit a follow-up prompt from a command | `registerCommand` handler returning `{ submitPrompt }` |
| Inject text into the system prompt | `registerRule` |
| Rewrite messages before they hit the provider | `registerMessageBuilder` |
| Add provider contribution metadata | `registerProvider` |
| Emit normalized cron/webhook events | `registerAutomationEventType` + `ctx.automation` |
| Observe or steer the agent loop | `hooks.*` |
| Block a dangerous tool call | `hooks.beforeTool` returning `{ stop: true }` |
| Notify on completion | `hooks.afterRun` (gate on `status === "completed"`) |
| Tweak each model request | `hooks.beforeModel` |
| Stream events to a UI | `hooks.onEvent` |
| Ship reusable templates with the plugin | Bundle assets next to `index.ts`, resolve via `import.meta.url` |
| Let users override defaults globally or per-project | Three-tier lookup: bundled / global / project |

## Pre-Ship Checklist

- `manifest.capabilities` is a non-empty array.
- Every `api.register*` call has a matching capability declared (`registerMcpServer` needs `"mcp"`).
- If `hooks` is present, `"hooks"` is in `capabilities`.
- (Bundled skills) Skills live at `<package>/skills/<name>/SKILL.md` with non-empty `name`/`description` frontmatter; the package shape is used (single-file plugins cannot bundle skills). Declaring `"skills"` is recommended but not required.
- (MCP) Secrets are resolved via `env` `{ fromEnv }`, not hardcoded; `required` is set on values the server cannot run without.
- `ctx.workspaceInfo?.rootPath` is used for workspace paths (not `process.cwd()`).
- Optional `ctx` fields are feature-detected.
- Tool names are snake_case verbs; descriptions are written for the model.
- Tool inputs have JSON Schema with `required` set.
- `afterRun` handlers gate on `result.status === "completed"` if they only want successes.
- State that must not leak between concurrent sessions is keyed by `ctx.session?.sessionId`.
- (Package) `package.json` has `type: "module"`, `cline.plugins`, and whichever `@cline/*` package you import as an optional peer dependency.
- (Package) Bundled assets resolved via `import.meta.url`, not `process.cwd()`.
- Smoke test: drop the plugin into `.cline/plugins/` (or `cline plugin install`), run `cline -i "..."`, watch it work.

## Plugin Examples from SDK

The SDK repo includes these example plugins:

| Plugin | Description |
|--------|-------------|
| `weather-metrics.ts` | Tool registration + lifecycle metrics |
| `mac-notify.ts` | macOS Notification Center alerts |
| `custom-compaction.ts` | Custom message compaction via message builders |
| `background-terminal.ts` | Detached shell job management |
| `automation-events.ts` | Plugin-emitted automation events |
| `gitignore-read-files-guard.ts` | File access policy enforcement via beforeTool |
| `web-search.ts` | Web search via Exa API |
| `typescript-lsp/` | TypeScript Language Service tools (plugin package) |
| `agents-squad/` | Multi-agent team orchestration (plugin package) |

## See Also

- `../tools/REFERENCE.md` - Tool creation
- `../events/REFERENCE.md` - Event system
- `../agent/REFERENCE.md` - Using plugins with Agent
- `../clinecore/REFERENCE.md` - Using plugins with ClineCore
