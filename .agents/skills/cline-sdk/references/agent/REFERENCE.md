# Agent Runtime

The `Agent` class is the lightweight in-memory agent loop. It is implemented in `@cline/agents` and re-exported by `@cline/sdk` through `@cline/core`. It sends messages to an LLM, executes tool calls, collects results, and repeats until the task is done.

## When to Use Agent

| Use Agent when... | Use ClineCore instead when... |
|---|---|
| You want a simple agent with custom tools | You need built-in tools (`run_commands`, `editor`, etc.) |
| You want minimal dependencies | You need session persistence |
| You need browser compatibility through `@cline/agents` | You need config discovery from `.cline/` |
| You manage persistence yourself | You need multi-process session sharing |
| You want full control over the runtime | You want batteries-included setup |

## Quick Start

```typescript
import { Agent } from "@cline/sdk"

const agent = new Agent({
  providerId: "anthropic",
  modelId: "claude-sonnet-4-6",
  apiKey: process.env.ANTHROPIC_API_KEY,
  systemPrompt: "You are a helpful assistant.",
  tools: [],
})

const result = await agent.run("What is the capital of France?")
console.log(result.outputText)
```

## Core Concepts

The Agent operates in a loop:
1. Accept user input (string, message, or array of messages)
2. Build turn context (system prompt, messages, tools)
3. Call the LLM provider
4. If the model returns tool calls, execute them and loop back to step 3
5. If the model returns text without tool calls, the run completes
6. Emit events throughout for streaming

The agent does not persist anything to disk. Conversation history is held in memory and can be accessed via `snapshot()`.

## Key APIs

- `new Agent(config)` - Create an agent from `@cline/sdk`
- `createAgentRuntime(config)` - Factory re-exported by `@cline/sdk`
- `AgentRuntime` and `createAgent(config)` - Lower-level exports from `@cline/agents`
- `agent.run(input)` - Start a run with user input
- `agent.continue(input?)` - Continue an existing conversation
- `agent.abort(reason?)` - Cancel an active run
- `agent.subscribe(listener)` - Listen to streaming events
- `agent.snapshot()` - Get current runtime state
- `agent.restore(messages)` - Replace message history

See `api.md` for full API details.

## Multi-Turn Conversations

```typescript
const agent = new Agent({
  providerId: "anthropic",
  modelId: "claude-sonnet-4-6",
  systemPrompt: "You are a helpful assistant.",
  tools: [],
})

const first = await agent.run("What is 2 + 2?")
console.log(first.outputText)

const second = await agent.continue("Now multiply that by 3")
console.log(second.outputText)
```

There is no `agent.hasRun` property. Keep your own conversation state, or inspect `agent.snapshot().messages.length` if you need to decide whether to pass new user input.

## Event Streaming

Use `agent.subscribe()` to stream events in real time. Register the listener before calling `run()` to avoid missing early events.

There is no top-level `onEvent` field on the Agent config. For an async alternative, use `hooks.onEvent` (see `api.md` and `gotchas.md`).

```typescript
const agent = new Agent({
  providerId: "anthropic",
  modelId: "claude-sonnet-4-6",
  systemPrompt: "You are a helpful assistant.",
  tools: [],
})

agent.subscribe((event) => {
  if (event.type === "assistant-text-delta") {
    process.stdout.write(event.text)
  }
})

const result = await agent.run("What is the capital of France?")
```

See `events/REFERENCE.md` for the full event type catalog.

## Next Steps

- `api.md` - Full Agent API reference
- `patterns.md` - Common patterns and best practices
- `gotchas.md` - Pitfalls and debugging
- `../tools/REFERENCE.md` - Creating custom tools
- `../events/REFERENCE.md` - Event system details
- `../providers/REFERENCE.md` - Provider configuration
